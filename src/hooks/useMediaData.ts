import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchMedia,
  fetchThemes,
  fetchTags,
  fetchStorytellers,
  Media,
  Theme,
  Tag,
  Storyteller,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching all data needed for the Media page
 * Fetches media, themes, tags, and storytellers in parallel
 */
export function useMediaData(options: FetchOptions = {}) {
  // Individual data hooks
  const media = useFetch<Media[]>(() => fetchMedia(options), [], [options]);
  const themes = useFetch<Theme[]>(() => fetchThemes(options), [], [options]);
  const tags = useFetch<Tag[]>(() => fetchTags(options), [], [options]);
  const storytellers = useFetch<Storyteller[]>(() => fetchStorytellers(options), [], [options]);
  
  // Calculate aggregated loading and error states
  const isLoading = media.isLoading || themes.isLoading || tags.isLoading || storytellers.isLoading;
  
  const error = media.error || themes.error || tags.error || storytellers.error;
  
  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      media.refetch(),
      themes.refetch(),
      tags.refetch(),
      storytellers.refetch()
    ]);
  };
  
  return {
    media: media.data || [],
    themes: themes.data || [],
    tags: tags.data || [],
    storytellers: storytellers.data || [],
    isLoading,
    error,
    refetchAll,
    // Individual refetch functions for more targeted refreshes
    refetchMedia: media.refetch,
    refetchThemes: themes.refetch,
    refetchTags: tags.refetch,
    refetchStorytellers: storytellers.refetch
  };
}

export default useMediaData; 