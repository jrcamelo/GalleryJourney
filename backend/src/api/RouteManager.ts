import { Application } from 'express';
import Database from "../data/Database";
import MemoryCache from "../data/MemoryCache";
import RequestValidator from "./RequestValidator";
import GalleryRequestHandler from "./GalleryRequestHandler";
import FavoritesRequestHandler from "./FavoritesRequestHandler";

class RouteManager {
  private readonly validator: RequestValidator;
  private readonly gallery: GalleryRequestHandler;
  private readonly favorites: FavoritesRequestHandler;

  constructor(
    private readonly app: Application,
    private readonly db: Database,
    private readonly cache: MemoryCache
  ) {
    this.validator = new RequestValidator(this.db, this.cache);
    this.gallery = new GalleryRequestHandler(this.db, this.cache, this.validator);
    this.favorites = new FavoritesRequestHandler(this.db, this.cache, this.validator);
  }

  public registerRoutes(): void {
    this.app.get(
      '/gallery/:serverId',
      this.validator.validateQueryParams,
      this.gallery.handleRequest.bind(this.gallery)
    );
    this.app.get(
      '/gallery/:serverId/favorites/:userId',
      this.validator.validateQueryParams,
      this.favorites.handleRequest.bind(this.favorites)
    );
  }
}

export default RouteManager;