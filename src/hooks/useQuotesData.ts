import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchQuotes,
  fetchStorytellers,
  fetchThemes,
  fetchMedia,
  Quote,
  Storyteller,
  Theme,
  Media,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching all data needed for the Quotes page
 * Fetches quotes, storytellers, themes, and media in parallel
 */
export function useQuotesData(options: FetchOptions = {}) {
  // Individual data hooks
  const quotes = useFetch<Quote[]>(() => fetchQuotes(options), [], [options]);
  const storytellers = useFetch<Storyteller[]>(() => fetchStorytellers(options), [], [options]);
  const themes = useFetch<Theme[]>(() => fetchThemes(options), [], [options]);
  const media = useFetch<Media[]>(() => fetchMedia(options), [], [options]);
  
  // Calculate aggregated loading and error states
  const isLoading = quotes.isLoading || storytellers.isLoading || themes.isLoading || media.isLoading;
  const error = quotes.error || storytellers.error || themes.error || media.error;
  
  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      quotes.refetch(),
      storytellers.refetch(),
      themes.refetch(),
      media.refetch()
    ]);
  };
  
  // Get storytellers for a specific quote
  const getQuoteStorytellers = (quote: Quote) => {
    if (!storytellers.data || !quote.Storytellers) return [];
    
    return storytellers.data.filter(storyteller => 
      Array.isArray(quote.Storytellers) && quote.Storytellers.includes(storyteller.id)
    );
  };
  
  // Get theme for a specific quote
  const getQuoteTheme = (quote: Quote) => {
    if (!themes.data || !quote.Theme) return null;
    
    return themes.data.find(theme => theme.id === quote.Theme);
  };
  
  // Get media for a specific quote
  const getQuoteMedia = (quote: Quote) => {
    if (!media.data || !quote.Media) return [];
    
    return media.data.filter(item => 
      Array.isArray(quote.Media) && quote.Media.includes(item.id)
    );
  };
  
  return {
    quotes: quotes.data || [],
    storytellers: storytellers.data || [],
    themes: themes.data || [],
    media: media.data || [],
    isLoading,
    error,
    refetchAll,
    // Utility functions
    getQuoteStorytellers,
    getQuoteTheme,
    getQuoteMedia,
    // Individual refetch functions
    refetchQuotes: quotes.refetch,
    refetchStorytellers: storytellers.refetch,
    refetchThemes: themes.refetch,
    refetchMedia: media.refetch
  };
}

export default useQuotesData; 