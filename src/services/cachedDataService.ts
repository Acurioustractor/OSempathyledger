/**
 * Cached Data Service
 * Wraps the regular data service with caching functionality
 */

import enhancedCache from './enhancedCacheService';
import * as dataService from './dataService';
import { Story, Storyteller, Theme, Media, Quote, Shift, Gallery, Tag } from '../types';

// Cache configuration
const CACHE_OPTIONS = {
  ttl: 5 * 60 * 1000, // 5 minutes
  useLocalStorage: true
};

// Table names for cache keys
const CACHE_KEYS = {
  STORIES: 'stories',
  STORYTELLERS: 'storytellers',
  THEMES: 'themes',
  MEDIA: 'media',
  QUOTES: 'quotes',
  SHIFTS: 'shifts',
  GALLERIES: 'galleries',
  TAGS: 'tags'
} as const;

/**
 * Fetch stories with caching
 */
export const fetchStories = async (): Promise<Story[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.STORIES,
    dataService.fetchStories,
    CACHE_OPTIONS
  );
};

/**
 * Fetch storytellers with caching
 */
export const fetchStorytellers = async (): Promise<Storyteller[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.STORYTELLERS,
    dataService.fetchStorytellers,
    CACHE_OPTIONS
  );
};

/**
 * Fetch themes with caching
 */
export const fetchThemes = async (): Promise<Theme[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.THEMES,
    dataService.fetchThemes,
    CACHE_OPTIONS
  );
};

/**
 * Fetch media with caching
 */
export const fetchMedia = async (): Promise<Media[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.MEDIA,
    dataService.fetchMedia,
    CACHE_OPTIONS
  );
};

/**
 * Fetch quotes with caching
 */
export const fetchQuotes = async (): Promise<Quote[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.QUOTES,
    dataService.fetchQuotes,
    CACHE_OPTIONS
  );
};

/**
 * Fetch shifts with caching
 */
export const fetchShifts = async (): Promise<Shift[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.SHIFTS,
    dataService.fetchShifts,
    CACHE_OPTIONS
  );
};

/**
 * Fetch galleries with caching
 */
export const fetchGalleries = async (): Promise<Gallery[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.GALLERIES,
    dataService.fetchGalleries,
    CACHE_OPTIONS
  );
};

/**
 * Fetch tags with caching
 */
export const fetchTags = async (): Promise<Tag[]> => {
  return enhancedCache.getTableData(
    CACHE_KEYS.TAGS,
    dataService.fetchTags,
    CACHE_OPTIONS
  );
};

/**
 * Batch fetch multiple tables with caching
 */
export const batchFetch = async () => {
  return enhancedCache.batchFetch({
    stories: fetchStories,
    storytellers: fetchStorytellers,
    themes: fetchThemes,
    media: fetchMedia,
    quotes: fetchQuotes
  });
};

/**
 * Clear specific cache
 */
export const clearCache = (key?: keyof typeof CACHE_KEYS) => {
  if (key) {
    enhancedCache.remove(CACHE_KEYS[key]);
  } else {
    enhancedCache.clear();
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
  return enhancedCache.getStats();
};

/**
 * Invalidate cache and fetch fresh data
 */
export const refreshData = async (key: keyof typeof CACHE_KEYS) => {
  enhancedCache.remove(CACHE_KEYS[key]);
  
  switch (key) {
    case 'STORIES':
      return fetchStories();
    case 'STORYTELLERS':
      return fetchStorytellers();
    case 'THEMES':
      return fetchThemes();
    case 'MEDIA':
      return fetchMedia();
    case 'QUOTES':
      return fetchQuotes();
    case 'SHIFTS':
      return fetchShifts();
    case 'GALLERIES':
      return fetchGalleries();
    case 'TAGS':
      return fetchTags();
  }
};

// Re-export non-cached operations
export const createRecord = dataService.createRecord;
export const updateRecord = dataService.updateRecord;
export const deleteRecord = dataService.deleteRecord;

// Re-export search if available
export const searchStories = dataService.searchStories;
export const getStoryAnalytics = dataService.getStoryAnalytics;

// Re-export types
export * from '../types';