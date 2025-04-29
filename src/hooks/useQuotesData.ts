import { useMemo } from 'react';
import useFetch from './useFetch';
import { 
  fetchQuotes, 
  // Remove imports for data now coming from context
  // fetchThemes,
  // fetchStorytellers, 
  // fetchMedia, 
  Quote, 
  Theme, 
  Storyteller, 
  Media, 
  FetchOptions 
} from '../services/airtable';
import { useAirtableData } from '../context/AirtableDataContext'; // Import the context hook

/**
 * Standardized hook for fetching quotes and accessing related global data
 */
export function useQuotesData(options: FetchOptions = {}) {
  // Get common data from context
  const {
    themes,
    storytellers,
    media,
    isLoadingThemes,
    isLoadingStorytellers,
    isLoadingMedia,
    errorThemes,
    errorStorytellers,
    errorMedia,
    refetchThemes,
    refetchStorytellers,
    refetchMedia
  } = useAirtableData();

  // Generate unique cache key for quotes fetch
  const quotesCacheKey = useMemo(() => `quotes_${JSON.stringify(options)}`, [options]);

  // Fetch only quotes using useFetch
  const quotesFetch = useFetch<Quote[]>(
    () => fetchQuotes(options), 
    [], 
    [options], // Depends only on options
    {
      maxRetries: 3,
      cacheKey: quotesCacheKey,
      cacheDuration: 5 * 60 * 1000 // Cache quotes for 5 minutes
    }
  );

  // Calculate aggregated loading state
  const isLoading = quotesFetch.isLoading || isLoadingThemes || isLoadingStorytellers || isLoadingMedia;

  // Combine error states (prioritize quotes error)
  const error = quotesFetch.error 
    ? quotesFetch.error.message 
    : errorThemes || errorStorytellers || errorMedia
      ? "Error loading related context data" 
      : null;

  // Combined refetch function if needed
  const refetchAll = async () => {
    await Promise.all([
      quotesFetch.refetch(true), // Force refresh quotes
      refetchThemes(),
      refetchStorytellers(),
      refetchMedia()
    ]);
  };

  // Simplified cache invalidation
  const clearCaches = () => {
    quotesFetch.invalidateCache();
    // Context handles its own caching
  };

  return {
    // Provide data from context and the specific quotes fetch
    quotes: quotesFetch.data || [],
    themes: themes || [],
    storytellers: storytellers || [],
    media: media || [],
    isLoading,
    error,
    refetchAll,
    refetchQuotes: quotesFetch.refetch, // Specific refetch for quotes
    // Expose context refetches if direct control is desired
    refetchThemes,
    refetchStorytellers,
    refetchMedia,
    clearCaches
  };
}

export default useQuotesData; 