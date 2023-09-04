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

const buildSimpleWhereClause = (serverId: string, q?: string, includeUser?: string, excludeUser?: string) => {
  let whereClauses = [`server_id = ?`];
  let params = [serverId];
  
  if (q) {
    whereClauses.push(`prompt LIKE ?`);
    params.push(`%${q}%`);
  }
  
  if (includeUser) {
    whereClauses.push(`user_id = ?`);
    params.push(includeUser);
  }
  
  if (excludeUser) {
    whereClauses.push(`user_id != ?`);
    params.push(excludeUser);
  }
  
  return { whereClause: whereClauses.join(' AND '), params };
};

const validateQueryParams = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
  query('sort').optional().isIn(['recent', 'favorites']).withMessage('Sort must be either "recent" or "favorites"'),
  query('includeUser').optional().isString().withMessage('includeUser must be a string'),
  query('excludeUser').optional().isString().withMessage('excludeUser must be a string'),
  query('q').optional().isString().withMessage('Query must be a string')
];

// Gallery endpoint
app.get('/gallery/:serverId', validateQueryParams, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { serverId } = req.params;
  const { q, page = 1, sort = 'favorites', includeUser, excludeUser } = req.query;
  
  const { whereClause, params } = buildSimpleWhereClause(serverId, q as string, includeUser as string, excludeUser as string);
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
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE) + 1;
    const rows = await db.all(sql, params);

    const result = {
      totalRecords: total,
      totalPages,
      currentPage: Number(params.slice(-1)[0] / ITEMS_PER_PAGE) + 1,
      records: rows
    }
    dbCache.setRes('GALLERY', sql, params, result);
    res.json(result);
  } catch (err) {
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


// Favorites endpoint
app.get('/gallery/:serverId/favorites/:userId', validateFavoritesQueryParams, async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { serverId, userId } = req.params;
  const { page = 1 } = req.query;
  
  const offset = (Number(page) - 1) * ITEMS_PER_PAGE;
  
  const sql = `
  SELECT images.*, favorites.timestamp as favorite_timestamp
  FROM images
  INNER JOIN favorites ON images.message_id = favorites.message_id
  WHERE favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?
  ORDER BY favorites.timestamp DESC
  LIMIT ${ITEMS_PER_PAGE} OFFSET ?`;	
  
  const params = [userId, serverId, offset];
  
  await runFavoritesQuery(sql, params, res, userId, serverId);
});

const runFavoritesQuery = async (sql: string, params: any[], res: Response, userId: string, serverId: string): Promise<void> => {
  const cachedData = dbCache.getRes('FAVORITES', sql, params);
  if (cachedData) {
    res.json(cachedData);
    return;
  }

  try {
    const total = await getFavoritesCount(userId, serverId);
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    
    const rows = await db.all(sql, params);
    
    const result = {
      totalRecords: total,
      totalPages,
      currentPage: Number(params.slice(-1)[0] / ITEMS_PER_PAGE) + 1,
      records: rows
    }
    dbCache.setRes('FAVORITES', sql, params, result);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

const getFavoritesCount = async (userId: string, serverId: string): Promise<number> => {
  const cachedData = dbCache.getRes('FAVORITES_COUNT', '', [userId, serverId]);
  if (cachedData) {
    return cachedData;
  }
  
  const countSql = `
  SELECT COUNT(*) as total 
  FROM images 
  INNER JOIN favorites ON images.message_id = favorites.message_id
  WHERE favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?`;
  const { total } = await db.get(countSql, [userId, serverId]);
  dbCache.setRes('FAVORITES_COUNT', '', [userId, serverId], total);
  return total;
};

// Initialize server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
