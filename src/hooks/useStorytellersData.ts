import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchStorytellers,
  fetchMedia,
  fetchShifts,
  fetchQuotes,
  Storyteller,
  Media,
  Shift,
  Quote,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching all data needed for the Storytellers page
 * Fetches storytellers, media, shifts, and quotes in parallel
 */
export function useStorytellersData(options: FetchOptions = {}) {
  // Individual data hooks
  const storytellers = useFetch<Storyteller[]>(() => fetchStorytellers(options), [], [options]);
  const media = useFetch<Media[]>(() => fetchMedia(options), [], [options]);
  const shifts = useFetch<Shift[]>(() => fetchShifts(options), [], [options]);
  const quotes = useFetch<Quote[]>(() => fetchQuotes(options), [], [options]);
  
  // Calculate aggregated loading and error states
  const isLoading = storytellers.isLoading || media.isLoading || shifts.isLoading || quotes.isLoading;
  
  const error = storytellers.error || media.error || shifts.error || quotes.error;
  
  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      storytellers.refetch(),
      media.refetch(),
      shifts.refetch(),
      quotes.refetch()
    ]);
  };
  
  // Get media items for a specific storyteller
  const getStorytellersMedia = (storytellerId: string) => {
    if (!media.data) return [];
    
    return media.data.filter(item => {
      const storytellersList = Array.isArray(item.Storytellers) ? item.Storytellers : 
                               Array.isArray(item.storytellers) ? item.storytellers : [];
      return storytellersList.includes(storytellerId);
    });
  };
  
  // Get quotes for a specific storyteller
  const getStorytellersQuotes = (storytellerId: string) => {
    if (!quotes.data) return [];
    
    return quotes.data.filter(item => {
      const storytellersList = Array.isArray(item.Storytellers) ? item.Storytellers : [];
      return storytellersList.includes(storytellerId);
    });
  };
  
  return {
    storytellers: storytellers.data || [],
    media: media.data || [],
    shifts: shifts.data || [],
    quotes: quotes.data || [],
    isLoading,
    error,
    refetchAll,
    // Utility functions
    getStorytellersMedia,
    getStorytellersQuotes,
    // Individual refetch functions
    refetchStorytellers: storytellers.refetch,
    refetchMedia: media.refetch,
    refetchShifts: shifts.refetch,
    refetchQuotes: quotes.refetch
  };
}

export default useStorytellersData;