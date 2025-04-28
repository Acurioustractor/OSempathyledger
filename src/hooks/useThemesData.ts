import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchThemes,
  fetchStories,
  fetchMedia,
  Theme,
  Story,
  Media,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching all data needed for the Themes page
 * Fetches themes, stories, and media in parallel
 */
export function useThemesData(options: FetchOptions = {}) {
  // Individual data hooks
  const themes = useFetch<Theme[]>(() => fetchThemes(options), [], [options]);
  const stories = useFetch<Story[]>(() => fetchStories(options), [], [options]);
  const media = useFetch<Media[]>(() => fetchMedia(options), [], [options]);
  
  // Calculate aggregated loading and error states
  const isLoading = themes.isLoading || stories.isLoading || media.isLoading;
  const error = themes.error || stories.error || media.error;
  
  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      themes.refetch(),
      stories.refetch(),
      media.refetch()
    ]);
  };
  
  return {
    themes: themes.data || [],
    stories: stories.data || [],
    media: media.data || [],
    isLoading,
    error,
    refetchAll,
    // Individual refetch functions
    refetchThemes: themes.refetch,
    refetchStories: stories.refetch,
    refetchMedia: media.refetch
  };
}

export default useThemesData; 