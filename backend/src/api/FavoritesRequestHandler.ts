import { Request, Response } from 'express';
import { buildFavoritesWhere } from "../data/QueryBuilder";
import Database from "../data/Database";
import MemoryCache from "../data/MemoryCache";
import { FAVORITES_COUNT_KEY, FAVORITES_KEY, FAVORITES_USER_COUNTS_KEY, ITEMS_PER_PAGE, SORT_FAVORITES, SORT_RECENT } from "../constants";
import RequestValidator from "./RequestValidator";

class FavoritesRequestHandler {
  constructor(
    private readonly db: Database,
    private readonly cache: MemoryCache,
    private readonly validation: RequestValidator,
  ) { }

  public async handleRequest(req: Request, res: Response) {
    await this.validation.validate(req, res);
    if (res.headersSent) return;

    const cachedData = this.cache.getRes(FAVORITES_KEY, req.params, req.query);
    if (cachedData) return res.json(cachedData);

    try {
      const { serverId, userId } = req.params;
      const { sort = SORT_FAVORITES, page = 1, limit } = req.query;
      const orderBy = sort === SORT_RECENT
        ? { timestamp: 'desc' }  // TODO: Find some way to sort by favorites timestamp
        : [{ favoritesCount: 'desc' }, { timestamp: 'desc' }];
      const itemsPerPage = Number(limit) || ITEMS_PER_PAGE;
      const offset = (Number(page) - 1) * itemsPerPage;

      const whereClause = buildFavoritesWhere(serverId, userId, req.query);
      const records = await this.db.getFavoritesItems(whereClause, orderBy, offset, itemsPerPage);
      const userCounts = await this.getFavoritesUserCounts(whereClause);
      const totalRecords = await this.getFavoritesCount(whereClause);
      const totalPages = Math.ceil(totalRecords / itemsPerPage);

      const result = {
        totalRecords,
        totalPages,
        currentPage: Number(page),
        userCounts,
        records
      }
      this.cache.setRes(FAVORITES_KEY, req.params, req.query, result);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async getFavoritesCount(where: any): Promise<number> {
    const cache = this.cache.getChainRequest(FAVORITES_COUNT_KEY, where);
    if (cache) return cache;
    const count = await this.db.getCount(where);
    this.cache.setChainRequest(FAVORITES_COUNT_KEY, where, count);
    return count;
  }

  async getFavoritesUserCounts(where: any): Promise<any> {
    const cache = this.cache.getChainRequest(FAVORITES_USER_COUNTS_KEY, where);
    if (cache) return cache;
    const counts = await this.db.getUsersCounts(where);
    this.cache.setChainRequest(FAVORITES_USER_COUNTS_KEY, where, counts);
    return counts;
  }
}

export default FavoritesRequestHandler;