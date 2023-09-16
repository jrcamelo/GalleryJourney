import { Request, Response } from 'express';
import { buildGalleryWhere } from "../data/QueryBuilder";
import Database from "../data/Database";
import MemoryCache from "../data/MemoryCache";
import RequestValidator from "./RequestValidator";
import { GALLERY_COUNT_KEY, GALLERY_KEY, GALLERY_USER_COUNTS_KEY, ITEMS_PER_PAGE, SORT_FAVORITES, SORT_RECENT } from "../constants";

class GalleryRequestHandler {
  constructor(
    private readonly db: Database,
    private readonly cache: MemoryCache,
    private readonly validation: RequestValidator
  ) { }


  public async handleRequest(req: Request, res: Response) {
    await this.validation.validate(req, res);
    if (res.headersSent) return;

    const cachedData = this.cache.getRes(GALLERY_KEY, req.params, req.query);
    if (cachedData) return res.json(cachedData);

    try {
      const { serverId } = req.params;
      const { sort = SORT_FAVORITES, page = 1, limit } = req.query;

      const orderBy = sort === SORT_RECENT
        ? { timestamp: 'desc' }
        : [{ favoritesCount: 'desc' }, { timestamp: 'desc' }];
      const itemsPerPage = Number(limit) || ITEMS_PER_PAGE;
      const offset = (Number(page) - 1) * itemsPerPage;

      const whereClause = buildGalleryWhere(serverId, req.query);
      const records = await this.db.getGalleryItems(whereClause, orderBy, offset, itemsPerPage);
      const userCounts = await this.getGalleryUserCounts(whereClause);
      const totalRecords = await this.getGalleryCount(whereClause);
      const totalPages = Math.ceil(totalRecords / itemsPerPage);

      const result = {
        totalRecords,
        totalPages,
        currentPage: Number(page),
        userCounts,
        records
      }
      this.cache.setRes(GALLERY_KEY, req.params, req.query, result);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }

  async getGalleryCount(where: any): Promise<number> {
    const cache = this.cache.getChainRequest(GALLERY_COUNT_KEY, where);
    if (cache) return cache;
    const count = await this.db.getCount(where);
    this.cache.setChainRequest(GALLERY_COUNT_KEY, where, count);
    return count;
  }

  async getGalleryUserCounts(where: any): Promise<any> {
    const cache = this.cache.getChainRequest(GALLERY_USER_COUNTS_KEY, where);
    if (cache) return cache;
    const counts = await this.db.getUsersCounts(where);
    this.cache.setChainRequest(GALLERY_USER_COUNTS_KEY, where, counts);
    return counts;
  }
}

export default GalleryRequestHandler;