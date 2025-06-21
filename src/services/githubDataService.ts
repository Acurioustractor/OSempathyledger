import axios from 'axios';
import { Story, Storyteller, Theme, Media, Shift, Gallery, Quote, Tag } from './airtable';

const GITHUB_API_BASE_URL =
  'https://raw.githubusercontent.com/Acurioustractor/empathy-ledger-public-data/main';

/**
 * Fetches a JSON file from the GitHub repository.
 * @param filePath The path to the file in the repo (e.g., 'Stories.json')
 * @returns The parsed JSON data.
 */
async function fetchFromGitHub<T>(filePath: string): Promise<T> {
  const url = `${GITHUB_API_BASE_URL}/${filePath}`;
  console.log(`[GitHub] Fetching ${filePath}`);
  try {
    const response = await axios.get<T>(url);
    return response.data;
  } catch (error: any) {
    console.error(`[GitHub] Error fetching ${filePath}:`, error);
    throw new Error(`Failed to fetch data from GitHub: ${error.message}`);
  }
}

// Fetch stories from GitHub
export async function fetchStoriesFromGitHub(): Promise<Story[]> {
  try {
    const data = await fetchFromGitHub<any[]>('Stories.json');
    
    // Transform the data to match the Story interface
    return data.map(item => {
      // Handle nested fields structure from GitHub export
      const fields = item.fields || item;
      
      return {
        id: item.id || item.ID || `story-${fields.Title}`,
        Title: fields.Title || fields.title || 'Untitled',
        'Story copy': fields['Story copy'] || fields.story_copy || fields.content || '',
        Storytellers: fields.Storytellers || fields.storytellers || [],
        Themes: fields.Themes || fields.themes || [],
        Created: fields.Created || fields.created || new Date().toISOString(),
        'Location (from Media)': fields['Location (from Media)'] || fields.location || [],
        Status: fields.Status || fields.status || 'Published',
        Media: fields.Media || fields.media || [],
        'Story Transcript': fields['Story Transcript'] || fields.transcript || '',
        'Video Story Link': fields['Video Story Link'] || fields.video_link || '',
        'Video Embed Code': fields['Video Embed Code'] || fields.video_embed || '',
        Shifts: fields.Shifts || fields.shifts || [],
        'Link (from Galleries) (from Media)': fields['Link (from Galleries) (from Media)'] || [],
        'Story ID': fields['Story ID'] || fields.story_id || item.id,
        'Story Image': fields['Story Image'] || fields.image || [],
        'Transcript (from Media)': fields['Transcript (from Media)'] || [],
        Gender: fields.Gender || fields.gender,
        'Age Range': fields['Age Range'] || fields.age_range
      };
    });
  } catch (error) {
    console.error('[GitHub] Failed to fetch stories:', error);
    return [];
  }
}

// Fetch storytellers from GitHub
export async function fetchStorytellersFromGitHub(): Promise<Storyteller[]> {
  try {
    const data = await fetchFromGitHub<any[]>('Storytellers.json');
    
    return data.map(item => {
      // Handle nested fields structure from GitHub export
      const fields = item.fields || item;
      
      return {
        id: item.id || item.ID || `teller-${fields.Name}`,
        Name: fields.Name || fields.name || 'Unknown',
        'File Profile Image': fields['File Profile Image'] || fields.profile_image || [],
        Stories: fields.Stories || fields.stories || [],
        'Unique Code': fields['Unique Code'] || fields.unique_code || '',
        Gender: fields.Gender || fields.gender,
        'Rough Age Group': fields['Rough Age Group'] || fields.age_group
      };
    });
  } catch (error) {
    console.error('[GitHub] Failed to fetch storytellers:', error);
    return [];
  }
}

// Fetch themes from GitHub
export async function fetchThemesFromGitHub(): Promise<Theme[]> {
  try {
    const data = await fetchFromGitHub<any[]>('Themes.json');
    
    return data.map(item => {
      // Handle nested fields structure from GitHub export
      const fields = item.fields || item;
      
      return {
        id: item.id || item.ID || `theme-${fields.Name}`,
        'Theme Name': fields['Theme Name'] || fields.Name || fields.name || 'Unknown Theme',
        Description: fields.Description || fields.description || '',
        Stories: fields.Stories || fields.stories || [],
        'Story Count': fields['Story Count'] || fields.story_count || 0
      };
    });
  } catch (error) {
    console.error('[GitHub] Failed to fetch themes:', error);
    return [];
  }
}

// Fetch media from GitHub
export async function fetchMediaFromGitHub(): Promise<Media[]> {
  try {
    const data = await fetchFromGitHub<any[]>('Media.json');
    
    return data.map(item => {
      // Handle nested fields structure from GitHub export
      const fields = item.fields || item;
      
      return {
        id: item.id || item.ID || `media-${Date.now()}`,
        'File Name': fields['File Name'] || fields.Name || fields.name || 'Untitled Media',
        type: fields.type || fields['Media Type'] || fields.media_type || 'Image',
        File: fields.File || fields.file || [],
        Transcript: fields.Transcript || fields.transcript || '',
        'Date Created': fields['Date Created'] || fields.date_created || new Date().toISOString(),
        Location: fields.Location || fields.location || '',
        Shift: fields.Shift || fields.shift || '',
        Project: fields.Project || fields.project || '',
        Storytellers: fields.Storytellers || fields.storytellers || [],
        Stories: fields.Stories || fields.stories || [],
        'Upload Status': fields['Upload Status'] || fields.upload_status || 'Complete'
      };
    });
  } catch (error) {
    console.error('[GitHub] Failed to fetch media:', error);
    return [];
  }
}

// Fetch shifts from GitHub
export async function fetchShiftsFromGitHub(): Promise<Shift[]> {
  try {
    const data = await fetchFromGitHub<any[]>('shifts.json');
    
    return data.map(item => ({
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
    console.error('[GitHub] Failed to fetch shifts:', error);
    // Return default Canberra locations
    return [
      {
        id: 'default-1',
        Name: 'Canberra City',
        name: 'Canberra City',
        latitude: -35.2809,
        longitude: 149.1300,
        address: 'Canberra, ACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'default-2',
        Name: 'Dickson',
        name: 'Dickson',
        latitude: -35.2507,
        longitude: 149.1339,
        address: 'Dickson, ACT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
  }
}

// Fetch galleries from GitHub
export async function fetchGalleriesFromGitHub(): Promise<Gallery[]> {
  try {
    const data = await fetchFromGitHub<any[]>('Galleries.json');
    
    return data.map(item => ({
      id: item.id || item.ID || `gallery-${item.Name}`,
      Name: item.Name || item.name || 'Untitled Gallery',
      Description: item.Description || item.description || '',
      Media: item.Media || item.media || [],
      'Cover Image': item['Cover Image'] || item.cover_image || [],
      'Created Date': item['Created Date'] || item.created_date || new Date().toISOString(),
      'Is Public': item['Is Public'] !== undefined ? item['Is Public'] : true
    }));
  } catch (error) {
    console.error('[GitHub] Failed to fetch galleries:', error);
    return [];
  }
}

// Fetch quotes from GitHub
export async function fetchQuotesFromGitHub(): Promise<Quote[]> {
  try {
    const data = await fetchFromGitHub<any[]>('Quotes.json');
    
    return data.map(item => {
      // Handle nested fields structure from GitHub export
      const fields = item.fields || item;
      
      return {
        id: item.id || item.ID || `quote-${Date.now()}`,
        'Quote Text': fields['Quote Text'] || fields.Quote || fields.quote || '',
        attribution: fields.attribution || fields.Author || fields.author || 'Anonymous',
        Storytellers: fields.Storytellers || fields.storytellers || [],
        Media: fields.Media || fields.media || [],
        Theme: fields.Theme || fields.theme || '',
        'Created At': fields['Created At'] || fields.created_at || new Date().toISOString(),
        'Transcript Reference': fields['Transcript Reference'] || fields.transcript_reference || []
      };
    });
  } catch (error) {
    console.error('[GitHub] Failed to fetch quotes:', error);
    return [];
  }
}

// Fetch tags from GitHub
export async function fetchTagsFromGitHub(): Promise<Tag[]> {
  try {
    const data = await fetchFromGitHub<any[]>('Tags.json');
    
    return data.map(item => ({
      id: item.id || item.ID || `tag-${item.Name}`,
      Name: item.Name || item.name || 'Untitled Tag',
      Description: item.Description || item.description || '',
      Color: item.Color || item.color || '#999999',
      'Usage Count': item['Usage Count'] || item.usage_count || 0
    }));
  } catch (error) {
    console.error('[GitHub] Failed to fetch tags:', error);
    return [];
  }
}

// Clear the cache
export function clearGitHubCache() {
  console.log('[GitHub] Cache cleared');
}