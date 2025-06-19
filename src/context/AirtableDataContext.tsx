import React, { createContext, useContext, useMemo } from 'react';
import useFetch from '../hooks/useFetch';
import {
  fetchThemes,
  fetchStorytellers,
  fetchMedia,
  fetchShifts
} from '../services/dataService';
import {
  Theme,
  Storyteller,
  Media,
  Shift,
  FetchOptions // Import FetchOptions if needed, maybe not for context
} from '../services/airtable';

interface AirtableDataContextProps {
  themes: Theme[];
  storytellers: Storyteller[];
  media: Media[];
  shifts: Shift[];
  isLoadingThemes: boolean;
  isLoadingStorytellers: boolean;
  isLoadingMedia: boolean;
  isLoadingShifts: boolean;
  errorThemes: Error | null;
  errorStorytellers: Error | null;
  errorMedia: Error | null;
  errorShifts: Error | null;
  refetchThemes: () => Promise<void>;
  refetchStorytellers: () => Promise<void>;
  refetchMedia: () => Promise<void>;
  refetchShifts: () => Promise<void>;
}

const AirtableDataContext = createContext<AirtableDataContextProps | undefined>(undefined);

export const AirtableDataProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  // Fetch common data with caching
  const themesData = useFetch<Theme[]>(
    () => fetchThemes({ pageSize: 100 }), // Airtable max pageSize is 100
    [], [], { cacheKey: 'global_themes', cacheDuration: 30 * 60 * 1000 } // Cache 30 mins
  );

  const storytellersData = useFetch<Storyteller[]>(
    () => fetchStorytellers({ pageSize: 100 }), // Airtable max pageSize is 100
    [], [], { cacheKey: 'global_storytellers', cacheDuration: 30 * 60 * 1000 } // Cache 30 mins
  );

  const mediaData = useFetch<Media[]>(
    () => fetchMedia({ pageSize: 100 }), // Airtable max pageSize is 100
    [], [], { cacheKey: 'global_media', cacheDuration: 15 * 60 * 1000 } // Cache 15 mins
  );

  const shiftsData = useFetch<Shift[]>(
    () => fetchShifts({ pageSize: 100 }), // Airtable max pageSize is 100
    [], [], { cacheKey: 'global_shifts', cacheDuration: 30 * 60 * 1000 } // Cache 30 mins
  );

  const value = useMemo(() => ({
    themes: themesData.data || [],
    storytellers: storytellersData.data || [],
    media: mediaData.data || [],
    shifts: shiftsData.data || [],
    isLoadingThemes: themesData.isLoading,
    isLoadingStorytellers: storytellersData.isLoading,
    isLoadingMedia: mediaData.isLoading,
    isLoadingShifts: shiftsData.isLoading,
    errorThemes: themesData.error,
    errorStorytellers: storytellersData.error,
    errorMedia: mediaData.error,
    errorShifts: shiftsData.error,
    refetchThemes: themesData.refetch,
    refetchStorytellers: storytellersData.refetch,
    refetchMedia: mediaData.refetch,
    refetchShifts: shiftsData.refetch,
  }), [themesData, storytellersData, mediaData, shiftsData]);

  return (
    <AirtableDataContext.Provider value={value}>
      {children}
    </AirtableDataContext.Provider>
  );
};

export const useAirtableData = (): AirtableDataContextProps => {
  const context = useContext(AirtableDataContext);
  if (context === undefined) {
    throw new Error('useAirtableData must be used within an AirtableDataProvider');
  }
  return context;
}; 