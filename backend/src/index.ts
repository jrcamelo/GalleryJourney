import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import { validationResult, query } from 'express-validator';

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database(process.env.DATABASE_PATH || '', (err) => {
	console.log(`Opening the database at: ${process.env.DATABASE_PATH}`);
	if (err) {
		console.error(err.message);
	}
	console.log('Connected to the SQLite database.');
});

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
app.get('/gallery/:serverId', validateQueryParams, (req: any, res: any) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
	const { serverId } = req.params;
	const { q, page = 1, sort = 'favorites', includeUser, excludeUser } = req.query;
	
	const { whereClause, params } = buildSimpleWhereClause(serverId, q as string, includeUser as string, excludeUser as string);
	const orderBy = sort === 'recent' ? 'timestamp DESC' : 'favorites_count DESC';
	const offset = (Number(page) - 1) * 50;
	params.push(`${offset}`);
	
	const sql = `SELECT * FROM images WHERE ${whereClause} ORDER BY ${orderBy} LIMIT 50 OFFSET ?`;
	
	runQuery(sql, params, res, whereClause);
});

const runQuery = (sql: string, params: any[], res: express.Response, whereClause: string) => {
	// Count total records for pagination metadata
	const countSql = `SELECT COUNT(*) as total FROM images WHERE ${whereClause}`;
	db.get(countSql, params.slice(0, -1), (err, row: any) => {
		if (err) {
			return res.status(500).json({ error: 'Database error while counting records' });
		}
		
		const totalRecords = row.total;
		const totalPages = Math.ceil(totalRecords / 50) + 1;
		
		// Fetch records
		db.all(sql, params, (err, rows) => {
			if (err) {
				return res.status(500).json({ error: 'Database error while fetching records' });
			}
			
			res.json({
				totalRecords,
				totalPages,
				currentPage: Number(params.slice(-1)[0] / 50) + 1,
				records: rows
			});
		});
	});
};

const validateFavoritesQueryParams = [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0')
];

// Favorites endpoint
app.get('/gallery/:serverId/favorites/:userId', validateFavoritesQueryParams, (req: any, res: any) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(400).json({ errors: errors.array() });
	}
	
	const { serverId, userId } = req.params;
	const { page = 1 } = req.query;
	
	const offset = (Number(page) - 1) * 50;
	
	const sql = `
	SELECT images.*, favorites.timestamp as favorite_timestamp
	FROM images
	INNER JOIN favorites ON images.message_id = favorites.message_id
	WHERE favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?
	ORDER BY favorites.timestamp DESC
	LIMIT 50 OFFSET ?`;	
	
	const params = [userId, serverId, offset];
	
	runFavoritesQuery(sql, params, res, userId, serverId);
});

const runFavoritesQuery = (sql: string, params: any[], res: express.Response, userId: string, serverId: string) => {
	// Count total records for pagination metadata
	const countSql = `
	SELECT COUNT(*) as total 
	FROM images 
	INNER JOIN favorites ON images.message_id = favorites.message_id
	WHERE favorites.user_id = ? AND favorites.status = 1 AND images.server_id = ?`;	
	db.get(countSql, [userId, serverId], (err, row: any) => {
		if (err) {
			return res.status(500).json({ error: 'Database error while counting records' });
		}
		
		const totalRecords = row.total;
		const totalPages = Math.ceil(totalRecords / 50);
		
		// Fetch records
		db.all(sql, params, (err, rows) => {
			if (err) {
				return res.status(500).json({ error: 'Database error while fetching records' });
			}
			
			res.json({
				totalRecords,
				totalPages,
				currentPage: Number(params.slice(-1)[0] / 50) + 1,
				records: rows
			});
		});
	});
};

// Initialize server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
