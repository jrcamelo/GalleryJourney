import { query, validationResult } from "express-validator";
import { Request, Response } from 'express';
import Database from "../data/Database";
import MemoryCache from "../data/MemoryCache";
import { SORT_FAVORITES, SORT_RECENT } from "../Constants";

class RequestValidator {
  constructor(
    private readonly db: Database,
    private readonly cache: MemoryCache
  ) { }

  validateQueryParams = [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be an integer greater than 0'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be an integer between 1 and 50'),
    query('sort').optional().isIn([SORT_RECENT, SORT_FAVORITES]).withMessage('Sort must be either "recent" or "favorites"'),
    query('includeUser').optional().isString().withMessage('includeUser must be a string'),
    query('excludeUser').optional().isString().withMessage('excludeUser must be a string'),
    query('search').optional().isString().withMessage('Search must be a string')
  ];

  public async validate(req: Request, res: Response): Promise<boolean> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return false;
    }
    const { serverId, userId = undefined } = req.params;
    if (!(await this.idsExistOnCache(serverId, userId))) {
      res.status(400).json({ error: 'Invalid ID' });
      return false;
    }
    return true;
  }

  private async idsExistOnCache(serverId: string, userId: string | undefined): Promise<boolean> {
    if (this.cache.idsCacheExpiredOrEmpty()) await this.updateIdsCache();
    let serverExists = this.cache.getServerId(serverId);
    if (userId === undefined) return serverExists;
    let userExists = this.cache.getUserId(userId);
    return serverExists && userExists;
  }

  private async updateIdsCache(): Promise<void> {
    const serverIds = await this.db.getDistinctServerIds();
    this.cache.setServerIds(serverIds);
    const userIds = await this.db.getDistinctUserIds();
    this.cache.setUserIds(userIds);
  }
}

export default RequestValidator;