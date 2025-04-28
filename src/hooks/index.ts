// Export the base fetch hook
export { default as useFetch } from './useFetch';

// Export Airtable data hooks
export { 
  useThemes,
  useMedia,
  useStories,
  useStorytellers,
  useShifts,
  useQuotes,
  useGalleries,
  useTags,
  useAnalysisData
} from './useAirtableData';

// Export page-specific data hooks
export { default as useStoriesData } from './useStoriesData';
export { default as useMediaData } from './useMediaData';
export { default as useThemesData } from './useThemesData';
export { default as useStorytellersData } from './useStorytellersData';
export { default as useTagsData } from './useTagsData';
export { default as useQuotesData } from './useQuotesData';
export { default as useVisualisationData } from './useVisualisationData';

// This index file makes it easy to import hooks like:
// import { useStoriesData, useMediaData } from '../hooks';
// instead of:
// import useStoriesData from '../hooks/useStoriesData';
// import useMediaData from '../hooks/useMediaData'; 