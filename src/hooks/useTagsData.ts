import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchTags,
  fetchMedia,
  Tag,
  Media,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching all data needed for the Tags page
 * Fetches tags and media in parallel
 */
export function useTagsData(options: FetchOptions = {}) {
  // Individual data hooks
  const tags = useFetch<Tag[]>(() => fetchTags(options), [], [options]);
  const media = useFetch<Media[]>(() => fetchMedia(options), [], [options]);
  
  // Calculate aggregated loading and error states
  const isLoading = tags.isLoading || media.isLoading;
  const error = tags.error || media.error;
  
  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      tags.refetch(),
      media.refetch()
    ]);
  };
  
  // Get media items with a specific tag
  const getMediaByTag = (tagId: string) => {
    if (!media.data) return [];
    
    return media.data.filter(item => {
      return Array.isArray(item.tags) && item.tags.includes(tagId);
    });
  };
  
  // Count media items per tag
  const getTagCounts = () => {
    if (!tags.data || !media.data) return new Map<string, number>();
    
    const counts = new Map<string, number>();
    tags.data.forEach(tag => counts.set(tag.id, 0));
    
    media.data.forEach(item => {
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tagId => {
          if (counts.has(tagId)) {
            counts.set(tagId, (counts.get(tagId) || 0) + 1);
          }
        });
      }
    });
    
    return counts;
  };
  
  return {
    tags: tags.data || [],
    media: media.data || [],
    isLoading,
    error,
    refetchAll,
    // Utility functions
    getMediaByTag,
    getTagCounts,
    // Individual refetch functions
    refetchTags: tags.refetch,
    refetchMedia: media.refetch
  };
}

export default useTagsData; 