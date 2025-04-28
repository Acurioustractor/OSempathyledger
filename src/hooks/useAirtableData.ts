import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchThemes,
  fetchMedia,
  fetchStories,
  fetchStorytellers,
  fetchShifts,
  fetchQuotes,
  fetchGalleries,
  fetchTags,
  Theme,
  Media,
  Story,
  Storyteller,
  Shift,
  Quote,
  Gallery,
  Tag,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching Themes data
 */
export function useThemes(options: FetchOptions = {}, mockData: Theme[] | null = null) {
  const fetchFn = useMemo(() => () => fetchThemes(), []);
  return useFetch<Theme[]>(fetchFn, [], [], { mockData });
}

/**
 * Standardized hook for fetching Media data
 */
export function useMedia(options: FetchOptions = {}, mockData: Media[] | null = null) {
  const fetchFn = useMemo(() => () => fetchMedia(options), [options]);
  return useFetch<Media[]>(fetchFn, [], [options], { mockData });
}

/**
 * Standardized hook for fetching Stories data
 */
export function useStories(options: FetchOptions = {}, mockData: Story[] | null = null) {
  const fetchFn = useMemo(() => () => fetchStories(), []);
  return useFetch<Story[]>(fetchFn, [], [], { mockData });
}

/**
 * Standardized hook for fetching Storytellers data
 */
export function useStorytellers(options: FetchOptions = {}, mockData: Storyteller[] | null = null) {
  const fetchFn = useMemo(() => () => fetchStorytellers(), []);
  return useFetch<Storyteller[]>(fetchFn, [], [], { mockData });
}

/**
 * Standardized hook for fetching Shifts data
 */
export function useShifts(options: FetchOptions = {}, mockData: Shift[] | null = null) {
  const fetchFn = useMemo(() => () => fetchShifts(), []);
  return useFetch<Shift[]>(fetchFn, [], [], { mockData });
}

/**
 * Standardized hook for fetching Quotes data
 */
export function useQuotes(options: FetchOptions = {}, mockData: Quote[] | null = null) {
  const fetchFn = useMemo(() => () => fetchQuotes(), []);
  return useFetch<Quote[]>(fetchFn, [], [], { mockData });
}

/**
 * Standardized hook for fetching Galleries data
 */
export function useGalleries(options: FetchOptions = {}, mockData: Gallery[] | null = null) {
  const fetchFn = useMemo(() => () => fetchGalleries(), []);
  return useFetch<Gallery[]>(fetchFn, [], [], { mockData });
}

/**
 * Standardized hook for fetching Tags data
 */
export function useTags(options: FetchOptions = {}, mockData: Tag[] | null = null) {
  const fetchFn = useMemo(() => () => fetchTags(), []);
  return useFetch<Tag[]>(fetchFn, [], [], { mockData });
}

/**
 * Standardized hook for fetching all analysis data (themes and media)
 * Used in the Analysis Dashboard
 */
export function useAnalysisData(mockThemes: Theme[] | null = null, mockMedia: Media[] | null = null) {
  const themes = useThemes({}, mockThemes);
  const media = useMedia({}, mockMedia);
  
  const isLoading = themes.isLoading || media.isLoading;
  const error = themes.error || media.error;
  const isUsingMockData = themes.isUsingMockData || media.isUsingMockData;
  
  const refetch = async () => {
    await Promise.all([themes.refetch(), media.refetch()]);
  };
  
  return {
    themes: themes.data || [],
    media: media.data || [],
    isLoading,
    error,
    refetch,
    isUsingMockData
  };
}

export default {
  useThemes,
  useMedia,
  useStories,
  useStorytellers,
  useShifts,
  useQuotes,
  useGalleries,
  useTags,
  useAnalysisData
}; 