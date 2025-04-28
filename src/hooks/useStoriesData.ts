import { useMemo } from 'react';
import useFetch from './useFetch';
import {
  fetchStories,
  fetchThemes,
  fetchTags,
  fetchStorytellers,
  fetchShifts,
  Story,
  Theme,
  Tag,
  Storyteller,
  Shift,
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
    storytellers: `storytellers_${Date.now()}`, // Don't cache storytellers based on options
    shifts: `shifts_${Date.now()}` // Don't cache shifts based on options
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

  // Fetch shifts data for location information
  const shifts = useFetch<Shift[]>(
    () => fetchShifts({ pageSize: 100 }),
    [],
    [],
    {
      maxRetries: 3,
      cacheKey: cacheKeys.shifts,
      cacheDuration: 10 * 60 * 1000 // 10 minutes for reference data
    }
  );
  
  // Process stories to include location data for mapping
  const storiesWithLocation = useMemo(() => {
    if (!stories.data || !shifts.data) return [];
    
    console.log('Raw stories data received:', stories.data.slice(0, 3).map(story => ({
      id: story.id,
      title: story.Title,
      location: story.Location,
      hasGeocode: !!story.Geocode,
      geocode: story.Geocode,
      coordinate_fields: Object.keys(story).filter(key => 
        key.toLowerCase().includes('lat') || 
        key.toLowerCase().includes('long') ||
        key.toLowerCase().includes('coord') ||
        key.toLowerCase().includes('geo')
      )
    })));
    
    return stories.data.map(story => {
      // Look for any field that might contain coordinates
      const locationFieldNames = Object.keys(story).filter(key => 
        key.toLowerCase().includes('lat') || 
        key.toLowerCase().includes('long') ||
        key.toLowerCase().includes('coord') ||
        key.toLowerCase().includes('geo')
      );
      
      if (locationFieldNames.length > 0) {
        console.log('Story has location fields:', story.id, story.Title, locationFieldNames.map(key => ({ 
          key, 
          value: (story as any)[key] 
        })));
      }
      
      // Parse Geocode field if it exists (comma-separated "latitude,longitude" format)
      if (story.Geocode && typeof story.Geocode === 'string') {
        console.log('Processing Geocode field:', story.id, story.Title, story.Geocode);
        const [latitude, longitude] = story.Geocode.split(',').map(s => parseFloat(s.trim()));
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
          console.log('Successfully extracted coordinates from Geocode:', latitude, longitude);
          return {
            ...story,
            Latitude: latitude,
            Longitude: longitude
          };
        } else {
          console.log('Failed to parse Geocode:', story.Geocode);
        }
      }
      
      // If story already has lat/long, use it
      if (story.Latitude && story.Longitude) {
        console.log('Story has direct Latitude/Longitude:', story.id, story.Latitude, story.Longitude);
        return story;
      }
      
      // Try to find a linked shift
      const linkedShift = shifts.data.find(shift => 
        shift.id === story.Shift || 
        (story.Location && shift.Name === story.Location)
      );
      
      // If we found a shift with location data, merge it
      if (linkedShift && linkedShift.latitude && linkedShift.longitude) {
        console.log('Found linked shift with coordinates:', story.id, linkedShift.id, linkedShift.latitude, linkedShift.longitude);
        return {
          ...story,
          Latitude: story.Latitude || linkedShift.latitude,
          Longitude: story.Longitude || linkedShift.longitude,
          // Save shift details
          ShiftDetails: linkedShift
        };
      }
      
      // Check if we have an address field we could potentially geocode
      if (story.Location && !story.Latitude && !story.Longitude) {
        // We have an address but no coordinates - just include it
        // for now (could add geocoding service later)
        console.log('Story has Location but no coordinates:', story.id, story.Location);
        return {
          ...story,
          address: story.Location
        };
      }
      
      return story;
    });
  }, [stories.data, shifts.data]);
  
  // Calculate aggregated loading and error states
  const isLoading = stories.isLoading || themes.isLoading || tags.isLoading || 
                    storytellers.isLoading || shifts.isLoading;
  
  // Prioritize stories errors as they're most important for this page
  const error = stories.error 
    ? stories.error.message 
    : themes.error || tags.error || storytellers.error || shifts.error
      ? "Error loading reference data" 
      : null;
  
  // Refetch all data with forced refresh for the primary data
  const refetchAll = async () => {
    await Promise.all([
      stories.refetch(true), // Force refresh stories
      themes.refetch(),
      tags.refetch(),
      storytellers.refetch(),
      shifts.refetch()
    ]);
  };
  
  // Function to clear caches if needed
  const clearCaches = () => {
    stories.invalidateCache();
    themes.invalidateCache();
    tags.invalidateCache();
    storytellers.invalidateCache();
    shifts.invalidateCache();
  };
  
  return {
    stories: storiesWithLocation || [],
    rawStories: stories.data || [], // Original stories without location processing
    themes: themes.data || [],
    tags: tags.data || [],
    storytellers: storytellers.data || [],
    shifts: shifts.data || [],
    isLoading,
    error,
    refetchAll,
    refetchStories: stories.refetch,
    refetchThemes: themes.refetch,
    refetchTags: tags.refetch,
    refetchStorytellers: storytellers.refetch,
    refetchShifts: shifts.refetch,
    clearCaches
  };
}

export default useStoriesData; 