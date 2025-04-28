import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchThemes,
  fetchStories,
  fetchMedia,
  fetchQuotes,
  fetchStorytellers,
  Theme,
  Story,
  Media,
  Quote,
  Storyteller,
  FetchOptions
} from '../services/airtable';

/**
 * Standardized hook for fetching all data needed for visualizations
 * Fetches themes, stories, media, quotes, and storytellers in parallel
 */
export function useVisualisationData(options: FetchOptions = {}) {
  // Individual data hooks
  const themes = useFetch<Theme[]>(() => fetchThemes(options), [], [options]);
  const stories = useFetch<Story[]>(() => fetchStories(options), [], [options]);
  const media = useFetch<Media[]>(() => fetchMedia(options), [], [options]);
  const quotes = useFetch<Quote[]>(() => fetchQuotes(options), [], [options]);
  const storytellers = useFetch<Storyteller[]>(() => fetchStorytellers(options), [], [options]);
  
  // Calculate aggregated loading and error states
  const isLoading = themes.isLoading || stories.isLoading || media.isLoading || 
                    quotes.isLoading || storytellers.isLoading;
  
  const error = themes.error || stories.error || media.error || 
                quotes.error || storytellers.error;
  
  // Refetch all data
  const refetchAll = async () => {
    await Promise.all([
      themes.refetch(),
      stories.refetch(),
      media.refetch(),
      quotes.refetch(),
      storytellers.refetch()
    ]);
  };
  
  // Compute theme-storyteller connections
  const getThemeStorytellersConnections = () => {
    if (!themes.data || !media.data || !storytellers.data) {
      return [];
    }
    
    const connections: {
      themeId: string;
      themeName: string;
      storytellerId: string;
      storytellerName: string;
      count: number;
    }[] = [];
    
    const connectionsMap = new Map<string, number>();
    
    // Process media to build connections
    media.data.forEach(mediaItem => {
      const mediaThemes = Array.isArray(mediaItem.themes) ? mediaItem.themes : [];
      const mediaStorytellers = Array.isArray(mediaItem.Storytellers) 
        ? mediaItem.Storytellers 
        : Array.isArray(mediaItem.storytellers) 
          ? mediaItem.storytellers 
          : [];
      
      // For each theme-storyteller pair in this media item, create a connection
      mediaThemes.forEach(themeId => {
        mediaStorytellers.forEach(storytellerId => {
          const key = `${themeId}-${storytellerId}`;
          connectionsMap.set(key, (connectionsMap.get(key) || 0) + 1);
        });
      });
    });
    
    // Convert to array with names
    const themeNames = new Map(themes.data.map(t => [t.id, t['Theme Name'] || '']));
    const storytellerNames = new Map(storytellers.data.map(s => [s.id, s.Name || '']));
    
    for (const [key, count] of connectionsMap.entries()) {
      const [themeId, storytellerId] = key.split('-');
      const themeName = themeNames.get(themeId) || 'Unknown Theme';
      const storytellerName = storytellerNames.get(storytellerId) || 'Unknown Storyteller';
      
      connections.push({
        themeId,
        themeName,
        storytellerId,
        storytellerName,
        count
      });
    }
    
    return connections;
  };
  
  return {
    themes: themes.data || [],
    stories: stories.data || [],
    media: media.data || [],
    quotes: quotes.data || [],
    storytellers: storytellers.data || [],
    isLoading,
    error,
    refetchAll,
    // Utility functions
    getThemeStorytellersConnections,
    // Individual refetch functions
    refetchThemes: themes.refetch,
    refetchStories: stories.refetch,
    refetchMedia: media.refetch,
    refetchQuotes: quotes.refetch,
    refetchStorytellers: storytellers.refetch
  };
}

export default useVisualisationData; 