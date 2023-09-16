import { listToHash } from "../Utils";

const MINUTE: number = 1 * 60 * 1000;
const REQUEST_TTL: number = 2 * MINUTE;
const CHAIN_REQUEST_TTL: number = 10 * MINUTE;
const VALIDATION_TTL: number = 30 * MINUTE;

class MemoryCache {
  static instance: MemoryCache;

  private cache: Map<string, { value: any; expiry: number }>;

  constructor() {
    this.cache = new Map();
  }

  public static getInstance(): MemoryCache {
    if (!MemoryCache.instance) {
      MemoryCache.instance = new MemoryCache();
    }
    return MemoryCache.instance;
  }

  set(key: string, value: any, ttl: number = 1 * MINUTE): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  get(key: string): any {
    const data = this.cache.get(key);
    if (!data) return null;
    if (Date.now() > data.expiry) {
      this.cache.delete(key);
      return null;
    }
    return data.value;
  }

  getRes(feature: string, params: any, query: any): any {
    return this.get(this.generateResCacheKey(feature, params, query));
  }
  setRes(feature: string, params: any, query: any, response: any): void {
    this.set(this.generateResCacheKey(feature, params, query), response, REQUEST_TTL);
  }
  private generateResCacheKey(feature: string, params: any, query: any): string {
    const inputData = { ...params, ...query };
    const inputString = JSON.stringify(inputData);
    return `${feature}:${inputString}`
  }

  getChainRequest(feature: string, where: any): any {
    return this.get(this.generateChainRequestCacheKey(feature, where));
  }
  setChainRequest(feature: string, where: any, response: any): void {
    this.set(this.generateChainRequestCacheKey(feature, where), response, CHAIN_REQUEST_TTL);
  }
  private generateChainRequestCacheKey(feature: string, where: any): string {
    const whereString = JSON.stringify(where);
    return `${feature}:${whereString}`;
  }


  setServerIds(serverIds: string[]): void {
    this.set('serverIds', listToHash(serverIds), VALIDATION_TTL);
  }
  getServerId(serverId: string): boolean {
    const serverIds = this.get('serverIds');
    if (!serverIds) return false;
    return serverIds[serverId] || false;
  }

  setUserIds(userIds: string[]): void {
    this.set('userIds', listToHash(userIds), 30 * MINUTE);
  }
  getUserId(userId: string): boolean {
    const userIds = this.get('userIds');
    if (!userIds) return false;
    return userIds[userId] || false;
  }

  idsCacheExpiredOrEmpty(): boolean {
    const serverIds = this.get('serverIds');
    if (!serverIds || Object.keys(serverIds).length === 0) return true;
    const userIds = this.get('userIds');
    if (!userIds || Object.keys(userIds).length === 0) return true;
    return false;
  }
}

export default MemoryCache;
