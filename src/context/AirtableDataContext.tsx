import React, { createContext, useContext, useEffect, useState } from 'react';
import { cachedDataService as dataService } from '../services/cachedDataService';
import {
  Theme,
  Storyteller,
  Media,
  Story,
  Quote,
  Tag
} from '../types';

interface AllData {
  media: Media[];
  stories: Story[];
  storytellers: Storyteller[];
  themes: Theme[];
  tags: Tag[];
  quotes: Quote[];
}

interface AirtableDataContextProps {
  data: AllData | null;
  isLoading: boolean;
  error: Error | null;
}

const AirtableDataContext = createContext<AirtableDataContextProps | undefined>(undefined);

export const AirtableDataProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [data, setData] = useState<AllData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        await dataService.initialize();
        setData(dataService.getData());
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Failed to load data'));
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  const value = {
    data,
    isLoading,
    error,
  };

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