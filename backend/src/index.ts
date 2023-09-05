import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request, Response } from 'express';
import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { validationResult, query } from 'express-validator';

import Cache from './cache';

const ITEMS_PER_PAGE = 50;

const app = express();
app.use(cors());
app.use(express.json());

const dbCache = new Cache();
let db: Database
const initDb = async () => {
  db = await open({
    filename: process.env.DATABASE_PATH || '',
    driver: sqlite3.Database
  });
  console.log('Connected to the SQLite database.');
};
initDb();

const validateQueryParams = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
  query('sort').optional().isIn(['recent', 'favorites']).withMessage('Sort must be either "recent" or "favorites"'),
  query('includeUser').optional().isString().withMessage('includeUser must be a string'),
  query('excludeUser').optional().isString().withMessage('excludeUser must be a string'),
  query('q').optional().isString().withMessage('Query must be a string')
];

type QueryOptions = {
  serverId: string,
  userId?: string,
  q?: string,
  includeUser?: string,
  excludeUser?: string,
  featureType: 'GALLERY' | 'FAVORITES'
};

//! GALLERY ENDPOINT
app.get('/gallery/:serverId', validateQueryParams, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { serverId } = req.params;
  const { q, page = 1, sort = 'favorites', includeUser, excludeUser } = req.query;
  const orderBy = sort === 'recent' ? 'timestamp DESC' : 'favorites_count DESC';
  const offset = (Number(page) - 1) * ITEMS_PER_PAGE;

  const { whereClause, params } = buildWhereClause({
    serverId, q: q as string, includeUser: includeUser as string, excludeUser: excludeUser as string, featureType: 'GALLERY'
  });
  params.push(`${offset}`);

  const sql = `SELECT * FROM images WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ${ITEMS_PER_PAGE} OFFSET ?`;
  await runQuery(sql, whereClause, params, res, 'GALLERY');
});

//! FAVORITES ENDPOINT
app.get('/gallery/:serverId/favorites/:userId', validateQueryParams, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { serverId, userId } = req.params;
  const { q, page = 1, sort = 'favorites', includeUser, excludeUser } = req.query;
  const orderBy = sort === 'recent' ? 'favorites.timestamp DESC' : 'favorites_count DESC';
  const offset = (Number(page) - 1) * ITEMS_PER_PAGE;

  const { whereClause, params } = buildWhereClause({
    serverId, userId, q: q as string, includeUser: includeUser as string, excludeUser: excludeUser as string, featureType: 'FAVORITES'
  });
  params.push(`${offset}`);

  const sql = `
  SELECT images.*, favorites.timestamp as favorite_timestamp
  FROM images
  INNER JOIN favorites ON images.message_id = favorites.message_id
  WHERE ${whereClause}
  ORDER BY ${orderBy}
  LIMIT ${ITEMS_PER_PAGE} OFFSET ?`;
  await runQuery(sql, whereClause, params, res, 'FAVORITES');
});

const buildWhereClause = ({ serverId, userId, q, includeUser, excludeUser, featureType }: QueryOptions) => {
  let whereClauses: string[] = [];
  let params: any[] = [];

  // Common conditions for both features
  if (featureType === 'GALLERY') {
    whereClauses.push('images.server_id = ?');
    params.push(serverId);
  } else if (featureType === 'FAVORITES') {
    whereClauses.push('favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?');
    params.push(userId, serverId);
  }

  if (q) {
    whereClauses.push('prompt LIKE ?');
    params.push(`%${q}%`);
  }

  if (includeUser) {
    const includedUsers = includeUser.split(',');
    whereClauses.push(`images.user_id IN (${includedUsers.map(() => '?').join(',')})`);
    params.push(...includedUsers);
  }

  if (excludeUser) {
    const excludedUsers = excludeUser.split(',');
    whereClauses.push(`images.user_id NOT IN (${excludedUsers.map(() => '?').join(',')})`);
    params.push(...excludedUsers);
  }
  
  return { whereClause: whereClauses.join(' AND '), params };
};

const runQuery = async (sql: string, whereClause: string, params: any[], res: Response, featureType: string): Promise<void> => {
  const cachedData = dbCache.getRes(featureType, sql, params);
  if (cachedData) {
    res.json(cachedData);
    return;
  }
  
  try {
    const total = await getTotalCount(featureType, whereClause, params);
    const userCounts = await getUserCounts(featureType, whereClause, params);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    
    const rows = await db.all(sql, params);
    
    const result = {
      totalRecords: total,
      totalPages,
      currentPage: Number(params.slice(-1)[0] / ITEMS_PER_PAGE) + 1,
      userCounts,
      records: rows
    }
    dbCache.setRes(featureType, sql, params, result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getTotalCount = async (featureType: string, whereClause: string, params: any[]): Promise<number> => {
  const cachedData = dbCache.getRes(`${featureType}_COUNT`, whereClause, params);
  if (cachedData) {
    return cachedData;
  }
  
  let extraJoin = ''
  if (featureType === 'FAVORITES') {
    extraJoin = "INNER JOIN favorites ON images.message_id = favorites.message_id"
  }
  const sql = `SELECT COUNT(*) as total FROM images ${extraJoin} WHERE ${whereClause}`;

  const { total } = await db.get(sql, params.slice(0, -1));
  dbCache.setRes(`${featureType}_COUNT`, whereClause, params, total);
  return total;
};

const getUserCounts = async (featureType: string, whereClause: string, params: any[]): Promise<any[]> => {
  const paramsWithoutOffset = params.slice(0, -1);
  const cachedData = dbCache.getRes(`${featureType}_USER_COUNTS`, whereClause, paramsWithoutOffset);
  if (cachedData) {
    return cachedData;
  }

  let extraJoin = ''
  if (featureType === 'FAVORITES') {
    extraJoin = "INNER JOIN favorites ON images.message_id = favorites.message_id"
  }
  const sql = `
    SELECT users.*, COUNT(images.message_id) as image_count 
    FROM users 
    INNER JOIN images ON users.user_id = images.user_id AND users.server_id = images.server_id
    ${extraJoin}
    WHERE ${whereClause} 
    GROUP BY users.user_id, users.server_id
    ORDER BY image_count DESC`;
  
  const rows = await db.all(sql, paramsWithoutOffset);
  dbCache.setRes(`${featureType}_USER_COUNTS`, whereClause, paramsWithoutOffset, rows);
  return rows;
};

// Initialize server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
