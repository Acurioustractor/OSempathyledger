import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, Storyteller, Tag } from '../types';

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

export interface FilterState {
  searchTerm: string;
  themes: string[];
  storytellers: string[];
  locations: string[];
  tags: string[];
  mediaTypes: string[];
  dateRange: DateRange;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  showOrangeSkyOnly: boolean;
}

interface FilterContextType {
  filters: FilterState;
  updateFilter: <K extends keyof FilterState>(key: K, value: FilterState[K]) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  resetFilter: (key: keyof FilterState) => void;
  activeFilterCount: number;
}

const defaultFilters: FilterState = {
  searchTerm: '',
  themes: [],
  storytellers: [],
  locations: [],
  tags: [],
  mediaTypes: [],
  dateRange: { start: null, end: null },
  sortBy: 'date',
  sortDirection: 'desc',
  showOrangeSkyOnly: false,
};

const FilterContext = createContext<FilterContextType | undefined>(undefined);

const STORAGE_KEY = 'empathy-ledger-filters';

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load filters from localStorage on mount
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        if (parsed.dateRange) {
          parsed.dateRange.start = parsed.dateRange.start ? new Date(parsed.dateRange.start) : null;
          parsed.dateRange.end = parsed.dateRange.end ? new Date(parsed.dateRange.end) : null;
        }
        return { ...defaultFilters, ...parsed };
      }
    } catch (error) {
      console.error('Error loading filters from localStorage:', error);
    }
    return defaultFilters;
  });

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters to localStorage:', error);
    }
  }, [filters]);

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const updateFilters = (updates: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...updates }));
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
  };

  const resetFilter = (key: keyof FilterState) => {
    setFilters(prev => ({ ...prev, [key]: defaultFilters[key] }));
  };

  const activeFilterCount = Object.entries(filters).reduce((count, [key, value]) => {
    if (key === 'sortBy' || key === 'sortDirection') return count;
    
    if (key === 'searchTerm' && value) return count + 1;
    if (key === 'dateRange' && (value.start || value.end)) return count + 1;
    if (key === 'showOrangeSkyOnly' && value) return count + 1;
    if (Array.isArray(value) && value.length > 0) return count + 1;
    
    return count;
  }, 0);

  const contextValue: FilterContextType = {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    resetFilter,
    activeFilterCount,
  };

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilters = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Helper hook for applying filters to data
export function useFilteredData<T>(
  data: T[],
  filterFn: (item: T, filters: FilterState) => boolean
): T[] {
  const { filters } = useFilters();
  
  return React.useMemo(() => {
    return data.filter(item => filterFn(item, filters));
  }, [data, filters, filterFn]);
}

// Common filter functions
export const filterUtils = {
  matchesSearch: (text: string, searchTerm: string): boolean => {
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  },
  
  matchesDateRange: (date: Date | string, range: DateRange): boolean => {
    if (!range.start && !range.end) return true;
    
    const itemDate = typeof date === 'string' ? new Date(date) : date;
    
    if (range.start && itemDate < range.start) return false;
    if (range.end && itemDate > range.end) return false;
    
    return true;
  },
  
  matchesArray: (itemValues: string[] | undefined, filterValues: string[]): boolean => {
    if (!filterValues.length) return true;
    if (!itemValues || !itemValues.length) return false;
    
    return filterValues.some(filterValue => itemValues.includes(filterValue));
  },
  
  matchesValue: (itemValue: string | undefined, filterValues: string[]): boolean => {
    if (!filterValues.length) return true;
    if (!itemValue) return false;
    
    return filterValues.includes(itemValue);
  },
};