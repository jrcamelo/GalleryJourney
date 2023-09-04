class SimpleCache {
  cache: Map<string, { value: any; expiry: number }>;
  constructor() {
    this.cache = new Map();
  }
  
  set = (key: string, value: any) => {
    const expiry = Date.now() + (1 * 60 * 1000); // 1 minute
    this.cache.set(key, { value, expiry });
  };
  
  get = (key: string) => {
    const data = this.cache.get(key);
    if (!data) return null;
    if (Date.now() > data.expiry) {
      this.cache.delete(key);
      return null;
    }
    return data.value;
  };

  getRes = (key: string, sql: string, params: any[]) => {
    const cacheKey = `${key}:${sql}:${params.join(',')}`;
    return this.get(cacheKey);
  }

  setRes = (key: string, sql: string, params: any[], value: any) => {
    const cacheKey = `${key}:${sql}:${params.join(',')}`;
    return this.set(cacheKey, value);
  }
}

export default SimpleCache;
