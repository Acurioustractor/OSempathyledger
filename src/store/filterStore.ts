import { create } from 'zustand';
import { Storyteller, Theme } from '../types';

export interface FilterState {
  selectedThemes: Theme[];
  selectedStorytellers: Storyteller[];
  dateRange: {
    startDate: Date | null;
    endDate: Date | null;
  };
}

export interface FilterActions {
  setSelectedThemes: (themes: Theme[]) => void;
  setSelectedStorytellers: (storytellers: Storyteller[]) => void;
  setDateRange: (range: { startDate: Date | null; endDate: Date | null }) => void;
  clearFilters: () => void;
}

const initialState: FilterState = {
  selectedThemes: [],
  selectedStorytellers: [],
  dateRange: {
    startDate: null,
    endDate: null,
  },
};

export const useFilterStore = create<FilterState & FilterActions>((set) => ({
  ...initialState,
  setSelectedThemes: (themes) => set({ selectedThemes: themes }),
  setSelectedStorytellers: (storytellers) => set({ selectedStorytellers: storytellers }),
  setDateRange: (range) => set({ dateRange: range }),
  clearFilters: () => set(initialState),
})); 