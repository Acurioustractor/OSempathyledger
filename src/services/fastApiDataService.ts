import axios from 'axios';
import { Story, Storyteller, Theme, Media, Shift, Gallery, Quote, Tag } from './airtable';

// FastAPI configuration
const FASTAPI_BASE_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: FASTAPI_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    console.error('[FastAPI] Request failed:', error);
    if (error.response) {
      // Server responded with error
      throw new Error(`FastAPI Error: ${error.response.status} - ${error.response.data?.detail || error.message}`);
    } else if (error.request) {
      // No response received
      throw new Error('FastAPI server not responding. Make sure the FastAPI server is running.');
    } else {
      // Request setup error
      throw error;
    }
  }
);

// Fetch stories from FastAPI
export async function fetchStoriesFromFastAPI(): Promise<Story[]> {
  try {
    console.log('[FastAPI] Fetching stories...');
    const response = await apiClient.get('/stories');
    
    // Transform the data to match the Story interface
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `story-${item.Title}`,
      Title: item.Title || item.title || 'Untitled',
      'Story copy': item['Story copy'] || item.story_copy || item.content || '',
      Storytellers: item.Storytellers || item.storytellers || [],
      Themes: item.Themes || item.themes || [],
      Created: item.Created || item.created || new Date().toISOString(),
      'Location (from Media)': item['Location (from Media)'] || item.location || [],
      Status: item.Status || item.status || 'Published',
      Media: item.Media || item.media || [],
      'Story Transcript': item['Story Transcript'] || item.transcript || '',
      'Video Story Link': item['Video Story Link'] || item.video_link || '',
      'Video Embed Code': item['Video Embed Code'] || item.video_embed || '',
      Shifts: item.Shifts || item.shifts || [],
      'Link (from Galleries) (from Media)': item['Link (from Galleries) (from Media)'] || [],
      'Story ID': item['Story ID'] || item.story_id || item.id,
      'Story Image': item['Story Image'] || item.image || [],
      'Transcript (from Media)': item['Transcript (from Media)'] || [],
      Gender: item.Gender || item.gender,
      'Age Range': item['Age Range'] || item.age_range
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch stories:', error);
    throw error;
  }
}

// Fetch storytellers from FastAPI
export async function fetchStorytellersFromFastAPI(): Promise<Storyteller[]> {
  try {
    console.log('[FastAPI] Fetching storytellers...');
    const response = await apiClient.get('/storytellers');
    
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `teller-${item.Name}`,
      Name: item.Name || item.name || 'Unknown',
      'File Profile Image': item['File Profile Image'] || item.profile_image || [],
      Stories: item.Stories || item.stories || [],
      'Unique Code': item['Unique Code'] || item.unique_code || '',
      Gender: item.Gender || item.gender,
      'Rough Age Group': item['Rough Age Group'] || item.age_group
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch storytellers:', error);
    throw error;
  }
}

// Fetch themes from FastAPI
export async function fetchThemesFromFastAPI(): Promise<Theme[]> {
  try {
    console.log('[FastAPI] Fetching themes...');
    const response = await apiClient.get('/themes');
    
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `theme-${item.Name}`,
      Name: item.Name || item.name || 'Unknown Theme',
      Description: item.Description || item.description || '',
      Stories: item.Stories || item.stories || [],
      'Story Count': item['Story Count'] || item.story_count || 0
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch themes:', error);
    throw error;
  }
}

// Fetch media from FastAPI
export async function fetchMediaFromFastAPI(): Promise<Media[]> {
  try {
    console.log('[FastAPI] Fetching media...');
    const response = await apiClient.get('/media');
    
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `media-${Date.now()}`,
      Name: item.Name || item.name || 'Untitled Media',
      'Media Type': item['Media Type'] || item.media_type || 'Image',
      URL: item.URL || item.url || '',
      Description: item.Description || item.description || '',
      'Date Created': item['Date Created'] || item.date_created || new Date().toISOString(),
      Location: item.Location || item.location || '',
      Tags: item.Tags || item.tags || [],
      'Story Link': item['Story Link'] || item.story_link || [],
      'Upload Status': item['Upload Status'] || item.upload_status || 'Complete'
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch media:', error);
    throw error;
  }
}

// Fetch shifts from FastAPI
export async function fetchShiftsFromFastAPI(): Promise<Shift[]> {
  try {
    console.log('[FastAPI] Fetching shifts...');
    const response = await apiClient.get('/shifts');
    
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `shift-${item.Name}`,
      Name: item.Name || item.name || 'Unknown Location',
      name: item.name || item.Name || 'Unknown Location',
      latitude: item.latitude || item.Latitude || -35.2809,
      longitude: item.longitude || item.Longitude || 149.1300,
      address: item.address || item.Address || '',
      createdAt: item.createdAt || item.created_at || new Date().toISOString(),
      updatedAt: item.updatedAt || item.updated_at || new Date().toISOString()
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch shifts:', error);
    throw error;
  }
}

// Fetch galleries from FastAPI
export async function fetchGalleriesFromFastAPI(): Promise<Gallery[]> {
  try {
    console.log('[FastAPI] Fetching galleries...');
    const response = await apiClient.get('/galleries');
    
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `gallery-${item.Name}`,
      Name: item.Name || item.name || 'Untitled Gallery',
      Description: item.Description || item.description || '',
      Media: item.Media || item.media || [],
      'Cover Image': item['Cover Image'] || item.cover_image || [],
      'Created Date': item['Created Date'] || item.created_date || new Date().toISOString(),
      'Is Public': item['Is Public'] !== undefined ? item['Is Public'] : true
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch galleries:', error);
    throw error;
  }
}

// Fetch quotes from FastAPI
export async function fetchQuotesFromFastAPI(): Promise<Quote[]> {
  try {
    console.log('[FastAPI] Fetching quotes...');
    const response = await apiClient.get('/quotes');
    
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `quote-${Date.now()}`,
      Quote: item.Quote || item.quote || '',
      Author: item.Author || item.author || 'Anonymous',
      Source: item.Source || item.source || '',
      'Date Added': item['Date Added'] || item.date_added || new Date().toISOString(),
      Tags: item.Tags || item.tags || []
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch quotes:', error);
    throw error;
  }
}

// Fetch tags from FastAPI
export async function fetchTagsFromFastAPI(): Promise<Tag[]> {
  try {
    console.log('[FastAPI] Fetching tags...');
    const response = await apiClient.get('/tags');
    
    return response.data.map((item: any) => ({
      id: item.id || item.ID || `tag-${item.Name}`,
      Name: item.Name || item.name || 'Untitled Tag',
      Description: item.Description || item.description || '',
      Color: item.Color || item.color || '#999999',
      'Usage Count': item['Usage Count'] || item.usage_count || 0
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to fetch tags:', error);
    throw error;
  }
}

// Advanced FastAPI features

// Search stories
export async function searchStoriesFromFastAPI(query: string): Promise<Story[]> {
  try {
    console.log('[FastAPI] Searching stories with query:', query);
    const response = await apiClient.get('/stories/search', {
      params: { q: query }
    });
    
    return response.data.map((item: any) => ({
      // Same transformation as fetchStoriesFromFastAPI
      id: item.id || item.ID || `story-${item.Title}`,
      Title: item.Title || item.title || 'Untitled',
      'Story copy': item['Story copy'] || item.story_copy || item.content || '',
      // ... rest of the transformation
    }));
  } catch (error) {
    console.error('[FastAPI] Failed to search stories:', error);
    throw error;
  }
}

// Get story analytics
export async function getStoryAnalyticsFromFastAPI() {
  try {
    console.log('[FastAPI] Fetching story analytics...');
    const response = await apiClient.get('/analytics/stories');
    return response.data;
  } catch (error) {
    console.error('[FastAPI] Failed to fetch story analytics:', error);
    throw error;
  }
}

// Health check
export async function checkFastAPIHealth(): Promise<boolean> {
  try {
    const response = await apiClient.get('/health');
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('[FastAPI] Health check failed:', error);
    return false;
  }
}