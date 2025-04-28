import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchStories,
  fetchThemes,
  fetchTags,
  fetchStorytellers,
  Story,
  Theme,
  Tag,
  Storyteller,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching all data needed for the Stories page
 * Uses caching and retry for rate limit handling
 */
export function useStoriesData(options: FetchOptions = {}) {
  // Generate unique cache keys for each resource
  const cacheKeys = useMemo(() => ({
    stories: `stories_${JSON.stringify(options)}`,
    themes: `themes_${Date.now()}`, // Don't cache themes based on options
    tags: `tags_${Date.now()}`,     // Don't cache tags based on options
    storytellers: `storytellers_${Date.now()}` // Don't cache storytellers based on options
  }), [options]);

  // Individual data hooks with caching and retry enabled
  const stories = useFetch<Story[]>(
    () => fetchStories(options), 
    [], 
    [options],
    {
      maxRetries: 3,
      cacheKey: cacheKeys.stories,
      cacheDuration: 2 * 60 * 1000 // 2 minutes
    }
  );
  
  const themes = useFetch<Theme[]>(
    () => fetchThemes({ pageSize: 100 }), // Limit to reduce API calls 
    [], 
    [], 
    {
      maxRetries: 3,
      cacheKey: cacheKeys.themes,
      cacheDuration: 10 * 60 * 1000 // 10 minutes for reference data
    }
  );
  
  const tags = useFetch<Tag[]>(
    () => fetchTags({ pageSize: 100 }), // Limit to reduce API calls
    [], 
    [], 
    {
      maxRetries: 3,
      cacheKey: cacheKeys.tags,
      cacheDuration: 10 * 60 * 1000 // 10 minutes for reference data
    }
  );
  
  const storytellers = useFetch<Storyteller[]>(
    () => fetchStorytellers({ pageSize: 100 }), // Limit to reduce API calls
    [], 
    [], 
    {
      maxRetries: 3,
      cacheKey: cacheKeys.storytellers,
      cacheDuration: 10 * 60 * 1000 // 10 minutes for reference data
    }
  );
  
  // Calculate aggregated loading and error states
  const isLoading = stories.isLoading || themes.isLoading || tags.isLoading || storytellers.isLoading;
  
  // Prioritize stories errors as they're most important for this page
  const error = stories.error 
    ? stories.error.message 
    : themes.error || tags.error || storytellers.error 
      ? "Error loading reference data" 
      : null;
  
  // Refetch all data with forced refresh for the primary data
  const refetchAll = async () => {
    await Promise.all([
      stories.refetch(true), // Force refresh stories
      themes.refetch(),
      tags.refetch(),
      storytellers.refetch()
    ]);
  };
  
  // Function to clear caches if needed
  const clearCaches = () => {
    stories.invalidateCache();
    themes.invalidateCache();
    tags.invalidateCache();
    storytellers.invalidateCache();
  };
  
  return {
    stories: stories.data || [],
    themes: themes.data || [],
    tags: tags.data || [],
    storytellers: storytellers.data || [],
    isLoading,
    error,
    refetchAll,
    refetchStories: stories.refetch,
    refetchThemes: themes.refetch,
    refetchTags: tags.refetch,
    refetchStorytellers: storytellers.refetch,
    clearCaches
  };
}

export default useStoriesData; 