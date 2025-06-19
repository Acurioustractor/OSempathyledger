// Data service that switches between Airtable, GitHub, and FastAPI data sources
import * as airtableService from './airtable';
import * as githubService from './githubDataService';
import * as fastApiService from './fastApiDataService';

// Error wrapper for better error handling
function createErrorHandler(serviceName: string, methodName: string) {
  return async (...args: any[]) => {
    try {
      const service = getDataService();
      const method = (service as any)[methodName];
      if (!method) {
        throw new Error(`Method ${methodName} not found in ${serviceName} service`);
      }
      return await method(...args);
    } catch (error) {
      console.error(`[DataService] Error in ${serviceName}.${methodName}:`, error);
      
      // Check for network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(`Network error: Unable to connect to ${serviceName}. Please ensure the server is running.`);
      }
      
      // Check for CORS errors
      if (error instanceof Error && error.message.includes('CORS')) {
        throw new Error(`CORS error: Check server configuration for ${serviceName}.`);
      }
      
      // Re-throw with more context
      throw error;
    }
  };
}

// Check which data provider to use
const DATA_PROVIDER = import.meta.env.VITE_DATA_PROVIDER || 'airtable';
const DATA_SOURCE = import.meta.env.VITE_DATA_SOURCE || 'github';

console.log('[DataService] Configuration:', { DATA_PROVIDER, DATA_SOURCE });

// Helper to get the appropriate service based on configuration
function getDataService() {
  if (DATA_PROVIDER === 'empathy-ledger') {
    if (DATA_SOURCE === 'fastapi') {
      console.log('[DataService] Using FastAPI data source');
      return fastApiService;
    } else {
      console.log('[DataService] Using GitHub data source');
      return githubService;
    }
  } else {
    console.log('[DataService] Using Airtable data source');
    return airtableService;
  }
}

// Get the selected service
const dataService = getDataService();

// Export the appropriate functions based on the data provider
export const fetchStories = DATA_PROVIDER === 'empathy-ledger' 
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchStoriesFromFastAPI : githubService.fetchStoriesFromGitHub)
  : airtableService.fetchStories;

export const fetchStorytellers = DATA_PROVIDER === 'empathy-ledger'
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchStorytellersFromFastAPI : githubService.fetchStorytellersFromGitHub)
  : airtableService.fetchStorytellers;

export const fetchThemes = DATA_PROVIDER === 'empathy-ledger'
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchThemesFromFastAPI : githubService.fetchThemesFromGitHub)
  : airtableService.fetchThemes;

export const fetchMedia = DATA_PROVIDER === 'empathy-ledger'
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchMediaFromFastAPI : githubService.fetchMediaFromGitHub)
  : airtableService.fetchMedia;

export const fetchShifts = DATA_PROVIDER === 'empathy-ledger'
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchShiftsFromFastAPI : githubService.fetchShiftsFromGitHub)
  : airtableService.fetchShifts;

export const fetchGalleries = DATA_PROVIDER === 'empathy-ledger'
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchGalleriesFromFastAPI : githubService.fetchGalleriesFromGitHub)
  : airtableService.fetchGalleries;

export const fetchQuotes = DATA_PROVIDER === 'empathy-ledger'
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchQuotesFromFastAPI : githubService.fetchQuotesFromGitHub)
  : airtableService.fetchQuotes;

export const fetchTags = DATA_PROVIDER === 'empathy-ledger'
  ? (DATA_SOURCE === 'fastapi' ? fastApiService.fetchTagsFromFastAPI : githubService.fetchTagsFromGitHub)
  : airtableService.fetchTags;

// For create/update/delete operations, only use Airtable
export const createRecord = airtableService.createRecord;
export const updateRecord = airtableService.updateRecord;
export const deleteRecord = airtableService.deleteRecord;

// Export advanced features from FastAPI if available
export const searchStories = DATA_PROVIDER === 'empathy-ledger' && DATA_SOURCE === 'fastapi'
  ? fastApiService.searchStoriesFromFastAPI
  : undefined;

export const getStoryAnalytics = DATA_PROVIDER === 'empathy-ledger' && DATA_SOURCE === 'fastapi'
  ? fastApiService.getStoryAnalyticsFromFastAPI
  : undefined;

// Re-export types
export * from './airtable';