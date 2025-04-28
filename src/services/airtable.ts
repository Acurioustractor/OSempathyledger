import axios from 'axios'

// Constants for API access
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

// Initialize Airtable base with proper headers
const base = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Log configuration for debugging (remove in production)
console.log('Airtable Config:', {
  baseId: BASE_ID,
  apiKeyLength: API_KEY?.length || 0,
  baseUrl: BASE_URL,
  tableName: TABLE_NAME
});

// Fetch options interface
export interface FetchOptions {
  maxRecords?: number;
  view?: string;
  pageSize?: number;
  page?: string;
  filterByFormula?: string;
  sort?: Array<{field: string, direction: 'asc' | 'desc'}>;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
}

// Base types and interfaces
export interface BaseRecord {
  id: string;
  createdTime: string;
}

export interface Media extends BaseRecord {
  'File Name': string;
  type?: 'image' | 'video' | string;
  description?: string;
  themes?: string[];
  tags?: string[];
  Summary?: string;
  Transcript?: string;
  Storytellers?: string[];
  Quotes?: string[];
  'Video draft link'?: string;
  Shift?: string;
  File?: AirtableAttachment[];
  Location?: string;
  Project?: string;
  'Created At'?: string;
}

export interface Theme extends BaseRecord {
  'Theme Name': string;
  Description?: string;
  'Related Media'?: string[];
  'Quotes (from Related Media)'?: string[];
}

export interface Quote extends BaseRecord {
  'Quote Text': string;
  attribution?: string;
  Storytellers?: string[];
  Media?: string[];
  Theme?: string;
  'Created At'?: string;
  'Transcript Reference'?: string[];
}

export interface Gallery extends BaseRecord {
  'Gallery Name': string;
  description?: string;
  media?: string[];
}

export interface Story extends BaseRecord {
  Title: string;
  'Story ID'?: number | string;
  Storytellers?: string[];
  Media?: string[];
  Watermark?: string;
  Permissions?: string;
  'Story Image'?: AirtableAttachment[];
  Status?: string;
  Created?: string;
  'Video Story Link'?: string;
  'Video Embed Code'?: string;
  'Story Transcript'?: string;
  'Story copy'?: string;
  Themes?: string[];
  Quotes?: string[];
  'Theme Links'?: string[];
}

export interface Tag extends BaseRecord {
  'Tag Name': string;
  description?: string;
}

export interface AirtableAttachment {
  id?: string;
  url?: string;
  filename?: string;
  size?: number;
  type?: string;
  width?: number;
  height?: number;
  thumbnails?: {
    small?: { url: string; width?: number; height?: number };
    large?: { url: string; width?: number; height?: number };
    full?: { url: string; width?: number; height?: number };
  };
  // Additional fields that might exist in Airtable's file field
  name?: string;
  file?: string;
  imgUrl?: string;
  path?: string;
  src?: string;
  source?: string;
  [key: string]: any; // Allow any other possible properties
}

export interface Storyteller extends BaseRecord {
  Name: string;
  Project?: string;
  'File Profile Image'?: AirtableAttachment[];
  Media?: string[];
  Themes?: string[];
  Location?: string;
  Summary?: string;
  Quotes?: string[];
  Transcript?: string[];
  Tag?: string;
  Role?: string;
  'Shifts (from Media)'?: string[];
}

export interface Shift extends BaseRecord {
  Name: string;
  Description?: string;
}

// Type guards
export function isMedia(record: any): record is Media {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record['File Name'] === 'string'
  );
}

export function isTheme(record: any): record is Theme {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record['Theme Name'] === 'string'
  );
}

export function isQuote(record: any): record is Quote {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record['Quote Text'] === 'string'
  );
}

export function isGallery(record: any): record is Gallery {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record['Gallery Name'] === 'string'
  );
}

export function isStory(record: any): record is Story {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record.Title === 'string' &&
    (record['Video Embed Code'] === undefined || typeof record['Video Embed Code'] === 'string') &&
    (record['Story copy'] === undefined || typeof record['Story copy'] === 'string') &&
    (record.Quotes === undefined || Array.isArray(record.Quotes)) &&
    (record.Themes === undefined || Array.isArray(record.Themes))
  );
}

export function isTag(record: any): record is Tag {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record['Tag Name'] === 'string'
  );
}

export function isStoryteller(record: any): record is Storyteller {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record.Name === 'string' &&
    (!record['File Profile Image'] || (
      Array.isArray(record['File Profile Image']) && 
      (record['File Profile Image'].length === 0 || 
        (typeof record['File Profile Image'][0] === 'object' && ('url' in record['File Profile Image'][0] || 'thumbnails' in record['File Profile Image'][0]))
      )
    ))
  );
}

export function isShift(record: any): record is Shift {
  return (
    record &&
    typeof record === 'object' &&
    typeof record.id === 'string' &&
    typeof record.Name === 'string'
  );
}

// Custom error class for Airtable-specific errors
export class AirtableError extends Error {
  status?: number;
  details?: any;
  
  constructor(message: string, status?: number, details?: any) {
    super(message);
    this.name = 'AirtableError';
    this.status = status;
    this.details = details;
  }
}

// Base fetching function with Pagination Handling
export const fetchFromTable = async <T>(tableName: string, options: FetchOptions = {}): Promise<T[]> => {
  let allRecords: T[] = [];
  let offset: string | undefined = undefined;
  const maxRecords = options.maxRecords; // User-defined limit, if any
  const view = options.view;
  const filterByFormula = options.filterByFormula;
  const sort = options.sort;

  console.log(`Fetching ALL records from ${tableName} (handling pagination)...`);

  try {
    do {
      const queryParams = new URLSearchParams();
      // Add view, pageSize, filterByFormula, sort to params
      if (view) queryParams.append('view', view);
      if (filterByFormula) queryParams.append('filterByFormula', filterByFormula);
      if (sort && sort.length > 0) {
        sort.forEach((sortOption, index) => {
          queryParams.append(`sort[${index}][field]`, sortOption.field);
          queryParams.append(`sort[${index}][direction]`, sortOption.direction);
        });
      }
      // Add offset if it exists from the previous request
      if (offset) {
        // Let URLSearchParams handle encoding automatically
        queryParams.append('offset', offset);
      }
      // Use pageSize=100 (API default/max per page) unless overridden by user
      queryParams.append('pageSize', (options.pageSize || 100).toString());

      let url = `${tableName}`;
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      console.log(` -> Fetching page from ${tableName} with URL: ${url}`);
      const response = await base.get(url);

      if (!response.data) {
        console.error('Invalid response format (no data):', response);
        throw new Error('Invalid response format from Airtable');
      }
      
      const records = response.data.records || [];
      const mappedRecords = records.map((record: any) => ({
        id: record.id,
        createdTime: record.createdTime,
        ...record.fields
      }));
      
      allRecords = allRecords.concat(mappedRecords);
      offset = response.data.offset; // Get offset for the next potential request

      console.log(` -> Fetched ${mappedRecords.length} records this page. Total so far: ${allRecords.length}. Offset for next page: ${offset}`);

      // Stop if we've reached the user-defined maxRecords limit
      if (maxRecords && allRecords.length >= maxRecords) {
         console.log(` -> Reached maxRecords limit (${maxRecords}).`);
         allRecords = allRecords.slice(0, maxRecords); // Trim excess
         offset = undefined; // Stop fetching
      }

    } while (offset); // Continue as long as Airtable provides an offset

    console.log(`Finished fetching from ${tableName}. Total records retrieved: ${allRecords.length}`);
    return allRecords;

  } catch (error) {
    // Keep existing detailed error handling
    if (axios.isAxiosError(error)) {
      console.error('Airtable API Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      
      throw new AirtableError(
        `Failed to fetch from ${tableName}: ${error.response?.data?.error?.message || error.message}`,
        error.response?.status,
        error.response?.data
      );
    }
    console.error('Unknown error during Airtable fetch:', error);
    throw new AirtableError(`Failed to fetch from ${tableName}: Unknown error`, undefined, error);
  }
};

// Create a new record
export async function createRecord<T extends BaseRecord>(tableName: string, data: Omit<T, 'id' | 'createdTime'>): Promise<T> {
  try {
    const response = await base.post(`${tableName}`, { 
      fields: data 
    });
    
    return {
      id: response.data.id,
      createdTime: response.data.createdTime,
      ...data
    } as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Airtable API Error during create:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      throw new AirtableError(
        `Failed to create record in ${tableName}: ${error.response?.data?.error?.message || error.message}`,
        error.response?.status,
        error.response?.data
      );
    }
    console.error('Unknown error during record creation:', error);
    throw new AirtableError(`Failed to create record in ${tableName}: Unknown error`, undefined, error);
  }
}

// Update an existing record
export async function updateRecord<T extends BaseRecord>(tableName: string, id: string, data: Partial<Omit<T, 'id' | 'createdTime'>>): Promise<T> {
  try {
    const response = await base.patch(`${tableName}/${id}`, {
      fields: data
    });
    
    return response.data as T;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Airtable API Error during update:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        recordId: id
      });
      
      throw new AirtableError(
        `Failed to update record in ${tableName}: ${error.response?.data?.error?.message || error.message}`,
        error.response?.status,
        error.response?.data
      );
    }
    console.error('Unknown error during record update:', error);
    throw new AirtableError(`Failed to update record in ${tableName}: Unknown error`, undefined, error);
  }
}

// Delete a record
export async function deleteRecord(tableName: string, id: string): Promise<void> {
  try {
    await base.delete(`${tableName}/${id}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Airtable API Error during delete:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
        recordId: id
      });
      
      throw new AirtableError(
        `Failed to delete record from ${tableName}: ${error.response?.data?.error?.message || error.message}`,
        error.response?.status,
        error.response?.data
      );
    }
    console.error('Unknown error during record deletion:', error);
    throw new AirtableError(`Failed to delete record from ${tableName}: Unknown error`, undefined, error);
  }
}

// Update fetchMedia return type and logic
export const fetchMedia = async (options: FetchOptions = {}): Promise<Media[]> => {
  const defaultOptions: FetchOptions = {
    // No view or maxRecords defaults here anymore
  };
  const mergedOptions = { ...defaultOptions, ...options };

  // Sorting logic remains the same
  if (!mergedOptions.sort && mergedOptions.sortField && mergedOptions.sortDirection) {
    mergedOptions.sort = [
      { field: mergedOptions.sortField, direction: mergedOptions.sortDirection }
    ];
  }

  try {
    // fetchFromTable now fetches ALL records respecting mergedOptions.maxRecords if provided
    const allMatchingRecords = await fetchFromTable<Media>('Media', mergedOptions);
    const validRecords = allMatchingRecords.filter(isMedia);
    
    console.log(`fetchMedia: Returning ${validRecords.length} valid media records.`);

    // Return the array of records directly
    return validRecords; 
  } catch (error) {
    console.error('Error fetching media:', error);
    throw error;
  }
};

export async function fetchThemes(): Promise<Theme[]> {
  try {
    // Fetch from the base table, ignoring any specific view filters
    console.log("Fetching all themes from base table (no view specified)");
    const records = await fetchFromTable<Theme>('Themes', { view: undefined }); 
    console.log(`Fetched ${records.length} raw theme records before filtering.`);
    // Return only valid themes based on the type guard
    const validThemes = records.filter(isTheme); 
    console.log(`Returning ${validThemes.length} valid themes after filtering.`);
    return validThemes;
  } catch (error) {
    console.error('Error fetching themes:', error);
    throw error;
  }
}

export async function fetchQuotes(): Promise<Quote[]> {
  try {
    const records = await fetchFromTable<Quote>('Quotes');
    return records.filter(isQuote);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    throw error;
  }
}

export async function fetchGalleries(): Promise<Gallery[]> {
  try {
    const records = await fetchFromTable<Gallery>('Galleries');
    return records.filter(isGallery);
  } catch (error) {
    console.error('Error fetching galleries:', error);
    throw error;
  }
}

export async function fetchStories(): Promise<Story[]> {
  try {
    // Fetch all stories (Reverted from debug filter)
    const records = await fetchFromTable<Story>('Stories');
    
    // Add detailed logging for each record's theme field
    console.log('[fetchStories] Examining records for theme fields:');
    records.slice(0, 3).forEach((record, index) => {
      console.log(`[fetchStories] Record #${index} titled "${record.Title}":`);
      console.log('  -> Has Themes:', !!record.Themes);
      if (record.Themes) {
        console.log('  -> Themes field value:', JSON.stringify(record.Themes));
      }
      // Check for alternative field names that might contain themes
      const allFields = Object.keys(record);
      const possibleThemeFields = allFields.filter(field => 
        field.includes('Theme') || field.includes('theme')
      );
      if (possibleThemeFields.length > 0) {
        console.log('  -> Possible theme fields:', possibleThemeFields);
        possibleThemeFields.forEach(field => {
          console.log(`  -> ${field} value:`, JSON.stringify((record as any)[field]));
        });
      }
    });
    
    // Keep the detailed logging
    console.log('[fetchStories] Raw records fetched:', records.length, records.map((r: Story) => ({ id: r.id, Title: r.Title })) ); 
    
    // Filter valid stories but also fix theme field if needed
    const validStories = records.filter(record => {
        const isValid = isStory(record);
        
        if (!isValid) {
            console.warn('[fetchStories] Filtering out invalid story record:', (record as Story).id, (record as Story).Title, record); 
        }
        return isValid;
    }).map(story => {
        // If the data is coming in with a different field name, fix it
        // This maps potential alternate field names to the correct Themes field
        const storyRecord = story as any;
        
        // Check for alternative field names
        if (!story.Themes) {
            // Look for possible alternate field names
            const alternateFields = [
                'themes', // lowercase
                'Theme', // singular
                'theme', // singular lowercase
                'theme_ids', // Snake case
                'themeIds', // camelCase
                'ThemeIds', // PascalCase
                'Theme Ids', // Space separated
                'Theme_Ids', // underscore separated
                'Theme IDs', // With caps
            ];
            
            for (const field of alternateFields) {
                if (storyRecord[field] && Array.isArray(storyRecord[field])) {
                    console.log(`[fetchStories] Found themes in alternate field "${field}" for story "${story.Title}":`, storyRecord[field]);
                    story.Themes = storyRecord[field];
                    break;
                }
            }
        }
        
        // If there's a Theme Links field coming from Airtable, use it
        if (storyRecord['Theme Links'] && Array.isArray(storyRecord['Theme Links'])) {
            console.log(`[fetchStories] Found themes in 'Theme Links' field for story "${story.Title}":`, storyRecord['Theme Links']);
            story.Themes = storyRecord['Theme Links'];
        }
        
        return story;
    });
    
    console.log('[fetchStories] Returning valid stories:', validStories.length, validStories.map((r: Story) => ({ 
        id: r.id, 
        Title: r.Title,
        hasThemes: !!r.Themes, 
        themesCount: r.Themes?.length || 0
    }))); 
    
    return validStories;

  } catch (error) {
    console.error('Error fetching stories:', error);
    throw error;
  }
}

export async function fetchTags(): Promise<Tag[]> {
  try {
    const records = await fetchFromTable<Tag>('Manual Tags');
    return records.filter(isTag);
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
}

export async function fetchStorytellers(): Promise<Storyteller[]> {
  try {
    const records = await fetchFromTable<Storyteller>('Storytellers');
    return records.filter(isStoryteller);
  } catch (error) {
    console.error('Error fetching storytellers:', error);
    throw error;
  }
}

export async function fetchShifts(): Promise<Shift[]> {
  try {
    // Try multiple potential table names for the Shifts data
    console.log('Attempting to fetch shifts from different possible table names...');
    
    // List of possible table names based on the screenshot
    const possibleTableNames = [
      'Shifts',             // Default name
      'Shift',              // Singular
      'Locations',          // Could be named by what they represent
      'Shift Locations',    // Combined
      'Assignment Table',   // From the column header in screenshot
      'Name',               // Name of the first column in screenshot
    ];
    
    let records: Shift[] = [];
    let usedTable = '';
    
    // Try each possible table name until we find one that works
    for (const tableName of possibleTableNames) {
      try {
        console.log(`Attempting to fetch from '${tableName}' table...`);
        const result = await fetchFromTable<Shift>(tableName);
        if (result.length > 0) {
          console.log(`Successfully fetched ${result.length} records from '${tableName}' table!`);
          records = result;
          usedTable = tableName;
          break;
        } else {
          console.log(`No records found in '${tableName}' table.`);
        }
      } catch (err) {
        console.log(`Error fetching from '${tableName}' table:`, err instanceof Error ? err.message : 'Unknown error');
      }
    }
    
    if (records.length === 0) {
      console.warn('⚠️ Could not find shifts in any of the attempted tables');
    } else {
      console.log(`✅ Using '${usedTable}' table for shifts with ${records.length} records`);
      console.log('First few shift records:', records.slice(0, 3));
    }
    
    return records.filter(isShift);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    throw error;
  }
}

// Type-specific create functions for better type safety
export async function createMedia(data: Omit<Media, 'id' | 'createdTime'>): Promise<Media> {
  return createRecord<Media>('Media', data);
}

export async function createTheme(data: Omit<Theme, 'id' | 'createdTime'>): Promise<Theme> {
  return createRecord<Theme>('Themes', data);
}

export async function createQuote(data: Omit<Quote, 'id' | 'createdTime'>): Promise<Quote> {
  return createRecord<Quote>('Quotes', data);
}

export async function createGallery(data: Omit<Gallery, 'id' | 'createdTime'>): Promise<Gallery> {
  return createRecord<Gallery>('Galleries', data);
}

export async function createStory(data: Omit<Story, 'id' | 'createdTime'>): Promise<Story> {
  return createRecord<Story>('Stories', data);
}

export async function createTag(data: Omit<Tag, 'id' | 'createdTime'>): Promise<Tag> {
  return createRecord<Tag>('Manual Tags', data);
}

export async function createStoryteller(data: Omit<Storyteller, 'id' | 'createdTime'>): Promise<Storyteller> {
  return createRecord<Storyteller>('Storytellers', data);
}

export async function createShift(data: Omit<Shift, 'id' | 'createdTime'>): Promise<Shift> {
  return createRecord<Shift>('Shifts', data);
}

// Type-specific update functions for better type safety
export async function updateMedia(id: string, data: Partial<Omit<Media, 'id' | 'createdTime'>>): Promise<Media> {
  return updateRecord<Media>('Media', id, data);
}

export async function updateTheme(id: string, data: Partial<Omit<Theme, 'id' | 'createdTime'>>): Promise<Theme> {
  return updateRecord<Theme>('Themes', id, data);
}

export async function updateQuote(id: string, data: Partial<Omit<Quote, 'id' | 'createdTime'>>): Promise<Quote> {
  return updateRecord<Quote>('Quotes', id, data);
}

export async function updateGallery(id: string, data: Partial<Omit<Gallery, 'id' | 'createdTime'>>): Promise<Gallery> {
  return updateRecord<Gallery>('Galleries', id, data);
}

export async function updateStory(id: string, data: Partial<Omit<Story, 'id' | 'createdTime'>>): Promise<Story> {
  return updateRecord<Story>('Stories', id, data);
}

export async function updateTag(id: string, data: Partial<Omit<Tag, 'id' | 'createdTime'>>): Promise<Tag> {
  return updateRecord<Tag>('Manual Tags', id, data);
}

export async function updateStoryteller(id: string, data: Partial<Omit<Storyteller, 'id' | 'createdTime'>>): Promise<Storyteller> {
  return updateRecord<Storyteller>('Storytellers', id, data);
}

export async function updateShift(id: string, data: Partial<Omit<Shift, 'id' | 'createdTime'>>): Promise<Shift> {
  return updateRecord<Shift>('Shifts', id, data);
}

// Type-specific delete functions for better type safety
export async function deleteMedia(id: string): Promise<void> {
  return deleteRecord('Media', id);
}

export async function deleteTheme(id: string): Promise<void> {
  return deleteRecord('Themes', id);
}

export async function deleteQuote(id: string): Promise<void> {
  return deleteRecord('Quotes', id);
}

export async function deleteGallery(id: string): Promise<void> {
  return deleteRecord('Galleries', id);
}

export async function deleteStory(id: string): Promise<void> {
  return deleteRecord('Stories', id);
}

export async function deleteTag(id: string): Promise<void> {
  return deleteRecord('Manual Tags', id);
}

export async function deleteStoryteller(id: string): Promise<void> {
  return deleteRecord('Storytellers', id);
}

export async function deleteShift(id: string): Promise<void> {
  return deleteRecord('Shifts', id);
}