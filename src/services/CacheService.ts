// Simple cache service to store and retrieve data
class CacheService {
  private static instance: CacheService;
  private cache: Map<string, any>;
  private imageCache: Map<string, string>;

  private constructor() {
    this.cache = new Map();
    this.imageCache = new Map();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Store a value in the cache with a key
  public set(key: string, value: any): void {
    this.cache.set(key, value);
  }

  // Get a value from the cache by key
  public get<T>(key: string): T | null {
    return this.cache.has(key) ? (this.cache.get(key) as T) : null;
  }

  // Store an image URL in the cache
  public setImage(name: string, url: string): void {
    this.imageCache.set(name, url);
  }

  // Get an image URL from the cache
  public getImage(name: string): string | null {
    return this.imageCache.has(name) ? this.imageCache.get(name) as string : null;
  }

  // Clear the entire cache
  public clear(): void {
    this.cache.clear();
    this.imageCache.clear();
  }
}

export default CacheService.getInstance(); 