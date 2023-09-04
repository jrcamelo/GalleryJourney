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

const buildGalleryWhereClause = (serverId: string, q?: string, includeUser?: string, excludeUser?: string) => {
  let whereClauses = [`images.server_id = ?`];
  let params = [serverId];
  
  if (q) {
    whereClauses.push(`images.prompt LIKE ?`);
    params.push(`%${q}%`);
  }
  
  if (includeUser) {
    whereClauses.push(`images.user_id = ?`);
    params.push(includeUser);
  }
  
  if (excludeUser) {
    whereClauses.push(`images.user_id != ?`);
    params.push(excludeUser);
  }
  
  return { whereClause: whereClauses.join(' AND '), params };
};

// Gallery endpoint
app.get('/gallery/:serverId', validateQueryParams, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { serverId } = req.params;
  const { q, page = 1, sort = 'favorites', includeUser, excludeUser } = req.query;
  
  const { whereClause, params } = buildGalleryWhereClause(serverId, q as string, includeUser as string, excludeUser as string);
  const orderBy = sort === 'recent' ? 'timestamp DESC' : 'favorites_count DESC';
  const offset = (Number(page) - 1) * ITEMS_PER_PAGE;
  params.push(`${offset}`);
  
  const sql = `SELECT * FROM images WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ${ITEMS_PER_PAGE} OFFSET ?`;
  
  await runQuery(sql, params, res, whereClause);
});

const runQuery = async (sql: string, params: any[], res: Response, whereClause: string): Promise<void> => {
  const cachedData = dbCache.getRes('GALLERY', sql, params);
  if (cachedData) {
    res.json(cachedData);
    return;
  }

  try {
    const total = await getGalleryCount(whereClause, params);
    const userCounts = await getGalleryUserCounts(whereClause, params);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE) + 1;
    const rows = await db.all(sql, params);

    const result = {
      totalRecords: total,
      totalPages,
      currentPage: Number(params.slice(-1)[0] / ITEMS_PER_PAGE) + 1,
      userCounts,
      records: rows
    }
    dbCache.setRes('GALLERY', sql, params, result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const validateFavoritesQueryParams = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0')
];

const getGalleryCount = async (whereClause: string, params: any[]): Promise<number> => {
  const cachedData = dbCache.getRes('GALLERY_COUNT', whereClause, params);
  if (cachedData) {
    return cachedData;
  }
  
  const { total } = await db.get(`SELECT COUNT(*) as total FROM images WHERE ${whereClause}`, params.slice(0, -1));
  dbCache.setRes('GALLERY_COUNT', whereClause, params, total);
  return total;
};

const getGalleryUserCounts = async (whereClause: string, params: any[]): Promise<any[]> => {
  const cacheKey = 'GALLERY_USER_COUNTS';
  const paramsWithoutOffset = params.slice(0, -1);
  const cachedData = dbCache.getRes(cacheKey, whereClause, paramsWithoutOffset);
  if (cachedData) {
    return cachedData;
  }


  const sql = `
    SELECT users.*, COUNT(images.message_id) as image_count 
    FROM users 
    INNER JOIN images ON users.user_id = images.user_id AND users.server_id = images.server_id
    WHERE ${whereClause} 
    GROUP BY users.user_id, users.server_id
    ORDER BY image_count DESC`;
  
  const rows = await db.all(sql, paramsWithoutOffset);
  dbCache.setRes(cacheKey, whereClause, paramsWithoutOffset, rows);
  
  return rows;
};


// Favorites endpoint
const buildFavoritesWhereClause = (serverId: string, userId: string, q?: string, includeUser?: string, excludeUser?: string) => {
  let whereClauses = [`favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?`];
  let params = [userId, serverId];
  
  if (q) {
    whereClauses.push(`prompt LIKE ?`);
    params.push(`%${q}%`);
  }
  
  if (includeUser) {
    whereClauses.push(`images.user_id = ?`);
    params.push(includeUser);
  }
  
  if (excludeUser) {
    whereClauses.push(`images.user_id != ?`);
    params.push(excludeUser);
  }
  
  return { whereClause: whereClauses.join(' AND '), params };
};

app.get('/gallery/:serverId/favorites/:userId', validateQueryParams, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { serverId, userId } = req.params;
  const { q, page = 1, sort = 'recent', includeUser, excludeUser } = req.query;
  
  const { whereClause, params } = buildFavoritesWhereClause(serverId, userId, q as string, includeUser as string, excludeUser as string);
  const orderBy = sort === 'recent' ? 'favorites.timestamp DESC' : 'favorites_count DESC';
  const offset = (Number(page) - 1) * ITEMS_PER_PAGE;
  params.push(`${offset}`);
  
  const sql = `
  SELECT images.*, favorites.timestamp as favorite_timestamp
  FROM images
  INNER JOIN favorites ON images.message_id = favorites.message_id
  WHERE ${whereClause}
  ORDER BY ${orderBy}
  LIMIT ${ITEMS_PER_PAGE} OFFSET ?`;

  await runFavoritesQuery(sql, params, res, userId, serverId);
});

const runFavoritesQuery = async (sql: string, params: any[], res: Response, userId: string, serverId: string): Promise<void> => {
  const cacheKey = 'FAVORITES';
  const cachedData = dbCache.getRes(cacheKey, sql, params);
  if (cachedData) {
    res.json(cachedData);
    return;
  }

  try {
    const total = await getFavoritesCount(userId, serverId);
    const userCounts = await getFavoritesUserCounts(userId, serverId);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    
    const rows = await db.all(sql, params);
    
    const result = {
      totalRecords: total,
      totalPages,
      currentPage: Number(params.slice(-1)[0] / ITEMS_PER_PAGE) + 1,
      userCounts,
      records: rows
    }
    dbCache.setRes(cacheKey, sql, params, result);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

const getFavoritesCount = async (userId: string, serverId: string): Promise<number> => {
  const cacheKey = 'FAVORITES_COUNTS';
  const cachedData = dbCache.getRes(cacheKey, '', [userId, serverId]);
  if (cachedData) {
    return cachedData;
  }
  
  const countSql = `
  SELECT COUNT(*) as total 
  FROM images 
  INNER JOIN favorites ON images.message_id = favorites.message_id
  WHERE favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?`;

  const { total } = await db.get(countSql, [userId, serverId]);
  dbCache.setRes(cacheKey, '', [userId, serverId], total);
  return total;
};

const getFavoritesUserCounts = async (userId: string, serverId: string): Promise<any[]> => {
  const cacheKey = 'FAVORITES_USER_COUNTS';
  const cachedData = dbCache.getRes(cacheKey, '', [userId, serverId]);
  if (cachedData) {
    return cachedData;
  }
  
  const sql = `
    SELECT users.*, COUNT(images.message_id) as image_count
    FROM users
    INNER JOIN images ON users.user_id = images.user_id AND users.server_id = images.server_id
    INNER JOIN favorites ON images.message_id = favorites.message_id
    WHERE favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?
    GROUP BY users.user_id, users.server_id
    ORDER BY image_count DESC`;

  const rows = await db.all(sql, [userId, serverId]);
  dbCache.setRes(cacheKey, '', [userId, serverId], rows);
  return rows;
};

// Initialize server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
