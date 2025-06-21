/**
 * Enhanced Airtable Service with Progressive Loading and Caching
 */

import { cacheService, useProgressiveData } from './progressiveCacheService';
import {
  fetchStories,
  fetchStorytellers,
  fetchThemes,
  fetchMedia,
  fetchQuotes,
  fetchShifts,
  fetchTags,
  fetchGalleries,
} from './airtable';
import {
  Story,
  Storyteller,
  Theme,
  Media,
  Quote,
  Shift,
  Tag,
  Gallery,
} from '../types';

interface PaginationOptions {
  page?: number;
  pageSize?: number;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  filter?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalPages: number;
  totalRecords: number;
  hasMore: boolean;
}

class EnhancedAirtableService {
  private batchSize = 100;
  private maxRetries = 3;
  private retryDelay = 1000;

  /**
   * Fetch stories with progressive loading
   */
  async fetchStoriesProgressive(options: PaginationOptions = {}): Promise<PaginatedResponse<Story>> {
    const { page = 1, pageSize = 50, sort, filter } = options;
    
    const cacheKey = `stories:${JSON.stringify(options)}`;
    
    return cacheService.loadPaginated(
      cacheKey,
      async (p, ps) => {
        const allStories = await fetchStories();
        
        // Apply filtering
        let filteredStories = allStories;
        if (filter) {
          filteredStories = allStories.filter(story => 
            story.Title.toLowerCase().includes(filter.toLowerCase()) ||
            story['Story copy']?.toLowerCase().includes(filter.toLowerCase())
          );
        }
        
        // Apply sorting
        if (sort) {
          filteredStories.sort((a, b) => {
            for (const sortRule of sort) {
              const aVal = a[sortRule.field as keyof Story];
              const bVal = b[sortRule.field as keyof Story];
              
              if (aVal !== bVal) {
                const comparison = aVal > bVal ? 1 : -1;
                return sortRule.direction === 'asc' ? comparison : -comparison;
              }
            }
            return 0;
          });
        }
        
        // Paginate
        const startIndex = (p - 1) * ps;
        const endIndex = startIndex + ps;
        const paginatedData = filteredStories.slice(startIndex, endIndex);
        
        return {
          data: paginatedData,
          hasMore: endIndex < filteredStories.length,
        };
      },
      page,
      pageSize
    ).then(result => ({
      data: result.data,
      page,
      pageSize,
      totalPages: Math.ceil(result.data.length / pageSize),
      totalRecords: result.data.length,
      hasMore: result.hasMore,
    }));
  }

  /**
   * Batch fetch multiple resource types
   */
  async batchFetch<T extends Record<string, any>>(
    fetchMap: Record<string, () => Promise<any[]>>
  ): Promise<T> {
    const keys = Object.keys(fetchMap);
    const promises = keys.map(key => 
      cacheService.progressiveLoad(
        `batch:${key}`,
        fetchMap[key],
        { cacheStrategy: 'cache-first' }
      )
    );
    
    const results = await Promise.all(promises);
    
    return keys.reduce((acc, key, index) => {
      acc[key as keyof T] = results[index];
      return acc;
    }, {} as T);
  }

  /**
   * Fetch all data with optimal caching
   */
  async fetchAllData() {
    return this.batchFetch({
      stories: fetchStories,
      storytellers: fetchStorytellers,
      themes: fetchThemes,
      media: fetchMedia,
      quotes: fetchQuotes,
      shifts: fetchShifts,
      tags: fetchTags,
      galleries: fetchGalleries,
    });
  }

  /**
   * Prefetch related data based on current view
   */
  async prefetchRelatedData(type: string, ids: string[]) {
    switch (type) {
      case 'story':
        // Prefetch storytellers and themes for these stories
        const stories = await cacheService.progressiveLoad(
          `stories:${ids.join(',')}`,
          async () => {
            const allStories = await fetchStories();
            return allStories.filter(s => ids.includes(s.id));
          },
          { cacheStrategy: 'cache-first' }
        );
        
        const storytellerIds = new Set<string>();
        const themeIds = new Set<string>();
        
        stories.forEach(story => {
          story.Storytellers?.forEach(id => storytellerIds.add(id));
          story.Themes?.forEach(id => themeIds.add(id));
        });
        
        await Promise.all([
          cacheService.prefetchRelated('storyteller', Array.from(storytellerIds)),
          cacheService.prefetchRelated('theme', Array.from(themeIds)),
        ]);
        break;
        
      case 'theme':
        // Prefetch stories for these themes
        await cacheService.prefetchRelated('story', ids);
        break;
        
      case 'storyteller':
        // Prefetch stories for these storytellers
        await cacheService.prefetchRelated('story', ids);
        break;
    }
  }

  /**
   * Search across multiple content types
   */
  async searchContent(query: string, types: string[] = ['stories', 'themes', 'storytellers']) {
    const searchPromises = [];
    
    if (types.includes('stories')) {
      searchPromises.push(
        cacheService.progressiveLoad(
          `search:stories:${query}`,
          async () => {
            const stories = await fetchStories();
            return stories.filter(story =>
              story.Title.toLowerCase().includes(query.toLowerCase()) ||
              story['Story copy']?.toLowerCase().includes(query.toLowerCase())
            );
          },
          { cacheStrategy: 'network-first' }
        )
      );
    }
    
    if (types.includes('themes')) {
      searchPromises.push(
        cacheService.progressiveLoad(
          `search:themes:${query}`,
          async () => {
            const themes = await fetchThemes();
            return themes.filter(theme =>
              theme['Theme Name'].toLowerCase().includes(query.toLowerCase())
            );
          },
          { cacheStrategy: 'network-first' }
        )
      );
    }
    
    if (types.includes('storytellers')) {
      searchPromises.push(
        cacheService.progressiveLoad(
          `search:storytellers:${query}`,
          async () => {
            const storytellers = await fetchStorytellers();
            return storytellers.filter(teller =>
              teller.Name.toLowerCase().includes(query.toLowerCase())
            );
          },
          { cacheStrategy: 'network-first' }
        )
      );
    }
    
    const results = await Promise.all(searchPromises);
    
    return {
      stories: types.includes('stories') ? results[types.indexOf('stories')] : [],
      themes: types.includes('themes') ? results[types.indexOf('themes')] : [],
      storytellers: types.includes('storytellers') ? results[types.indexOf('storytellers')] : [],
    };
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return cacheService.getCacheStats();
  }

  /**
   * Clear all caches
   */
  async clearCache() {
    await cacheService.clearCache();
  }

  /**
   * Retry failed requests with exponential backoff
   */
  private async retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        this.retryDelay *= 2; // Exponential backoff
        return this.retryWithBackoff(fn, retries - 1);
      }
      throw error;
    }
  }
}

// Export singleton instance
export const enhancedAirtableService = new EnhancedAirtableService();

// React hooks for enhanced data fetching
export function useEnhancedStories(options?: PaginationOptions) {
  return useProgressiveData(
    `stories:${JSON.stringify(options || {})}`,
    () => enhancedAirtableService.fetchStoriesProgressive(options).then(r => r.data),
    { cacheStrategy: 'cache-first', prefetchNext: true }
  );
}

export function useEnhancedStorytellers() {
  return useProgressiveData(
    'storytellers',
    fetchStorytellers,
    { cacheStrategy: 'cache-first' }
  );
}

export function useEnhancedThemes() {
  return useProgressiveData(
    'themes',
    fetchThemes,
    { cacheStrategy: 'cache-first' }
  );
}

export function useEnhancedMedia() {
  return useProgressiveData(
    'media',
    fetchMedia,
    { cacheStrategy: 'cache-first' }
  );
}

export function useAllData() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    enhancedAirtableService.fetchAllData()
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}