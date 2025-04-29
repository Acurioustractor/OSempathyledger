import React, { useMemo } from 'react';
import useFetch from './useFetch';
import { 
  fetchStories, 
  // Remove imports for data now coming from context
  // fetchThemes,
  // fetchTags, 
  // fetchStorytellers, 
  // fetchShifts, 
  // fetchMedia, 
  Story, 
  Theme, 
  Tag, 
  Storyteller, 
  Shift, 
  Media, 
  FetchOptions 
} from '../services/airtable';
import { useAirtableData } from '../context/AirtableDataContext'; // Import the context hook

// Add missing types from Story interface if needed for full objects
export interface EnhancedStory extends Story {
  // Add properties to hold the full linked objects
  linkedStorytellers?: Storyteller[];
  linkedThemes?: Theme[];
  linkedMedia?: Media[];
  // ShiftDetails is already being added
  ShiftDetails?: Shift;
  address?: string; // For potential geocoding
}

/**
 * Standardized hook for fetching stories and accessing related global data
 */
export function useStoriesData(options: FetchOptions = {}): { 
  stories: EnhancedStory[], 
  rawStories: Story[], 
  themes: Theme[], 
  storytellers: Storyteller[], 
  shifts: Shift[], 
  media: Media[], 
  isLoading: boolean, 
  error: string | null,
  refetchAll: () => Promise<void>,
  refetchStories: (force?: boolean | undefined) => Promise<void>,
  // ... other context refetches if needed ...
  clearCaches: () => void
 } {
  // Get common data from context
  const {
    themes,
    // tags, // Assuming tags might be added to context later, or remove if unused
    storytellers,
    shifts,
    media,
    isLoadingThemes,
    isLoadingStorytellers,
    isLoadingMedia,
    isLoadingShifts,
    // Include error states if needed for combined status
    errorThemes,
    errorStorytellers,
    errorMedia,
    errorShifts,
    // Include refetch functions if needed for a combined refetch
    refetchThemes,
    refetchStorytellers,
    refetchMedia,
    refetchShifts
  } = useAirtableData();

  // Generate unique cache key for stories fetch
  const storiesCacheKey = useMemo(() => `stories_${JSON.stringify(options)}`, [options]);

  // Fetch only stories using useFetch
  const storiesFetch = useFetch<Story[]>( 
    () => fetchStories(options), 
    [], 
    [options], // Depends only on options
    {
      maxRetries: 3,
      cacheKey: storiesCacheKey,
      cacheDuration: 5 * 60 * 1000 // Cache stories for 5 minutes
    }
  );

  // Log fetched stories and shifts from context
  React.useEffect(() => {
    if (!storiesFetch.isLoading && storiesFetch.data) {
      console.log('[useStoriesData] Raw stories fetched:', storiesFetch.data.length, 'items', storiesFetch.data.slice(0, 5));
    } else if (storiesFetch.isLoading) {
      console.log('[useStoriesData] Fetching stories...');
    }
    if (storiesFetch.error) {
      console.error('[useStoriesData] Error fetching stories:', storiesFetch.error);
    }
    // Log shifts received from context only when stories are potentially processed
    if (!storiesFetch.isLoading && !isLoadingShifts) {
      console.log('[useStoriesData] Shifts received from context:', shifts?.length, 'items', shifts?.slice(0, 5));
    }
    if (!isLoadingStorytellers && storytellers) {
      console.log('[useStoriesData] Storytellers received from context:', storytellers?.length, 'items', storytellers?.slice(0, 5));
    }
    if (!isLoadingThemes && themes) {
      console.log('[useStoriesData] Themes received from context:', themes?.length, 'items', themes?.slice(0, 5));
    }
    if (!isLoadingMedia && media) {
      console.log('[useStoriesData] Media received from context:', media?.length, 'items', media?.slice(0, 5));
    }
  }, [storiesFetch.data, storiesFetch.isLoading, storiesFetch.error, shifts, isLoadingShifts, storytellers, isLoadingStorytellers, themes, isLoadingThemes, media, isLoadingMedia]);

  // Process stories to include location data using context data
  const storiesWithLocation = useMemo(() => {
    // Add logging inside memo
    console.log('[useStoriesData] Processing stories for location and linking...');
    console.log('[useStoriesData]   - Raw stories count:', storiesFetch.data?.length);
    console.log('[useStoriesData]   - Shifts from context count:', shifts?.length);
    console.log('[useStoriesData]   - Storytellers from context count:', storytellers?.length);
    console.log('[useStoriesData]   - Themes from context count:', themes?.length);
    console.log('[useStoriesData]   - Media from context count:', media?.length);

    // Ensure all necessary data is available
    if (
      !storiesFetch.data ||
      !shifts ||
      !storytellers ||
      !themes ||
      !media ||
      storiesFetch.isLoading ||
      isLoadingShifts ||
      isLoadingStorytellers ||
      isLoadingThemes ||
      isLoadingMedia
    ) {
      console.log('[useStoriesData]   - Waiting for stories or context data...');
      return [];
    }

    // Console logs remain the same as they use the data arguments
    console.log('[useStoriesData]   - First 3 raw stories for location check:', storiesFetch.data.slice(0, 3).map(story => ({
      id: story.id,
      title: story.Title,
      location: story.Location,
      hasGeocode: !!story.Geocode,
      geocode: story.Geocode,
      latitude: story.Latitude,
      longitude: story.Longitude,
      shiftId: story.Shift,
      storytellerIds: story.Storytellers,
      themeIds: story.Themes,
      mediaIds: story.Media,
      // ... other relevant fields if needed ...
    })));

    const processedStories: EnhancedStory[] = storiesFetch.data.map(story => {
      console.log(`[useStoriesData] Processing Story ID: ${story.id}, Title: "${story.Title}"`);
      let processedStory: EnhancedStory = { ...story }; // Start with original story data

      // Log relevant linking fields from the story
      console.log(`  - Story Shift Field: ${JSON.stringify(story.Shift)}`);
      console.log(`  - Story Location Field: ${story.Location}`);
      console.log(`  - Story Storytellers Field: ${JSON.stringify(story.Storytellers)}`);
      console.log(`  - Story Themes Field: ${JSON.stringify(story.Themes)}`);
      console.log(`  - Story Media Field: ${JSON.stringify(story.Media)}`);

      // --- 1. Link related objects ---
      // Link Media first, as Storytellers are linked via Media
      processedStory.linkedMedia = (story.Media || [])
        .map(mediaId => media.find(m => String(m.id) === String(mediaId)))
        .filter((m): m is Media => m !== undefined);

      // Link Themes directly from Story
      processedStory.linkedThemes = (story.Themes || [])
        .map(themeId => themes.find(t => String(t.id) === String(themeId)))
        .filter((t): t is Theme => t !== undefined);
        
      // Link Storytellers *through* the linked Media items
      const storytellerIdsFromMedia = new Set<string>();
      (processedStory.linkedMedia || []).forEach(mediaItem => {
        (mediaItem.Storytellers || []).forEach(storytellerId => {
           storytellerIdsFromMedia.add(storytellerId);
        });
      });
      processedStory.linkedStorytellers = Array.from(storytellerIdsFromMedia)
         .map(storytellerId => storytellers.find(s => String(s.id) === String(storytellerId)))
         .filter((s): s is Storyteller => s !== undefined);

      // --- Log linked data ---
      console.log(`  - Linked Storytellers Found: ${processedStory.linkedStorytellers?.length || 0} (Names: ${processedStory.linkedStorytellers?.map(s => s.Name).join(', ')})`);
      console.log(`  - Linked Themes Found: ${processedStory.linkedThemes?.length || 0} (Names: ${processedStory.linkedThemes?.map(t => t.Name).join(', ')})`);
      console.log(`  - Linked Media Found: ${processedStory.linkedMedia?.length || 0} (Types: ${processedStory.linkedMedia?.map(m => m.Type).join(', ')})`);

      // --- 2. Determine Location (as before) ---
      // Check for direct coordinates on the story
      if (story.Latitude && story.Longitude) {
        console.log(`  - Found direct coordinates on story: Lat=${story.Latitude}, Lon=${story.Longitude}`);
        // No need to modify, coords already exist
        processedStory.Latitude = story.Latitude;
        processedStory.Longitude = story.Longitude;
      }
      // Check for Geocode string to parse
      else if (story.Geocode && typeof story.Geocode === 'string') {
        console.log(`  - Trying to parse Geocode: ${story.Geocode}`);
        const [latitude, longitude] = story.Geocode.split(',').map(s => parseFloat(s.trim()));
        if (!isNaN(latitude) && !isNaN(longitude)) {
          console.log(`    - Parsed successfully: Lat=${latitude}, Lon=${longitude}`);
          processedStory.Latitude = latitude;
          processedStory.Longitude = longitude;
        } else {
          console.log('    - Failed to parse Geocode.');
        }
      }

      // If no direct coordinates found yet, try linking via Shift or Location Name
      if (typeof processedStory.Latitude !== 'number' || typeof processedStory.Longitude !== 'number') {
        console.log('  - No direct coordinates found, attempting to link to Shift...');
        // Log the value of the actual field name we are trying to use
        console.log(`  - Story Shifts Field Value (for linking): ${JSON.stringify(story.Shifts)}`);
        // Log the lookup field value used for fallback linking
        const locationFromMedia = story['Location (from Media)'];
        console.log(`  - Story Location (from Media) Field Value (for fallback linking): ${locationFromMedia}`);
        
        const linkedShift = shifts.find(shift =>
          // Check if story.Shifts (plural) is an array and compare first element
          (Array.isArray(story.Shifts) && story.Shifts.length > 0 && shift.id === story.Shifts[0]) ||
          // Fallback: Check if story['Location (from Media)'] matches shift.Name 
          (typeof locationFromMedia === 'string' && locationFromMedia.trim() !== '' && shift.Name === locationFromMedia)
        );

        if (linkedShift) {
          console.log(`    - Found linked Shift: ID=${linkedShift.id}, Name="${linkedShift.Name}", Coords=(Lat: ${linkedShift.latitude}, Lon: ${linkedShift.longitude})`);
          if (typeof linkedShift.latitude === 'number' && typeof linkedShift.longitude === 'number') {
             console.log('    - Assigning coordinates from linked Shift.');
             processedStory.Latitude = linkedShift.latitude;
             processedStory.Longitude = linkedShift.longitude;
             processedStory.ShiftDetails = linkedShift; // Store linked shift details
          } else {
             console.log('    - Linked Shift has missing/invalid coordinates.');
             // Optionally assign the shift details even without coords?
             processedStory.ShiftDetails = linkedShift;
          }
        } else {
          console.log('    - No matching Shift found via ID or Location Name.');
        }
      }

      // If still no coordinates, check if it needs an address for geocoding later
      // Use the 'Location (from Media)' field for the address fallback
      if (typeof processedStory.Latitude !== 'number' || typeof processedStory.Longitude !== 'number') {
         const locationFromMediaForAddress = story['Location (from Media)'];
         if (locationFromMediaForAddress && typeof locationFromMediaForAddress === 'string') {
            console.log(`  - No coordinates assigned, setting address field from 'Location (from Media)': "${locationFromMediaForAddress}"`);
            processedStory.address = locationFromMediaForAddress;
         } else {
            console.log('  - No coordinates assigned and no Location (from Media) field found.');
         }
      }

      return processedStory; // Return the potentially modified story
    });

    console.log('[useStoriesData] Finished processing. Processed stories count:', processedStories.length);
    console.log('[useStoriesData]   - First 3 processed stories (check Lat/Lon/Links):', processedStories.slice(0, 3).map(s => ({
        id: s.id,
        title: s.Title,
        lat: s.Latitude,
        lon: s.Longitude,
        shiftName: s.ShiftDetails?.Name,
        storytellerNames: s.linkedStorytellers?.map(st => st.Name),
        themeNames: s.linkedThemes?.map(t => t.Name),
        mediaCount: s.linkedMedia?.length,
      }))
    );

    return processedStories;
  // Dependency includes stories fetch data and shifts from context
  }, [storiesFetch.data, shifts, storytellers, themes, media, storiesFetch.isLoading, isLoadingShifts, isLoadingStorytellers, isLoadingThemes, isLoadingMedia]); 
  
  // Calculate aggregated loading state (primarily based on stories fetch + context loading states)
  const isLoading = storiesFetch.isLoading || isLoadingThemes || isLoadingStorytellers || isLoadingMedia || isLoadingShifts;
  
  // Combine error states (prioritize stories error)
  const error = storiesFetch.error 
    ? storiesFetch.error.message 
    : errorThemes || errorStorytellers || errorMedia || errorShifts
      ? "Error loading related context data" 
      : null;
  
  // Combined refetch function if needed
  const refetchAll = async () => {
    console.log('[useStoriesData] Refetching all data...');
    await Promise.all([
      storiesFetch.refetch(true), // Force refresh stories
      refetchThemes(),
      // refetchTags(), // Add if tags context is implemented
      refetchStorytellers(),
      refetchShifts(),
      refetchMedia()
    ]);
  };
  
  // Simplified cache invalidation
  const clearCaches = () => {
    console.log('[useStoriesData] Clearing caches...');
    storiesFetch.invalidateCache();
    // Potentially call context refetch/invalidate functions if needed
    // For now, context handles its own caching
  };
  
  return {
    // Provide data from context and the specific stories fetch
    stories: storiesWithLocation || [],
    rawStories: storiesFetch.data || [], 
    themes: themes || [],
    // tags: tags || [], // Provide tags if available in context
    storytellers: storytellers || [],
    shifts: shifts || [],
    media: media || [], 
    isLoading,
    error,
    refetchAll,
    refetchStories: storiesFetch.refetch, // Specific refetch for stories
    // Expose context refetches if direct control is desired
    refetchThemes, 
    // refetchTags, 
    refetchStorytellers, 
    refetchShifts, 
    refetchMedia, 
    clearCaches
  };
}

export default useStoriesData; 