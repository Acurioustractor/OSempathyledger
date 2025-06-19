import axios from 'axios'
import Airtable from 'airtable'

// Constants for API access
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

// Initialize Airtable conditionally
let base: Airtable.Base | null = null;

function initializeAirtable() {
  if (!base && API_KEY && BASE_ID) {
    base = new Airtable({ apiKey: API_KEY }).base(BASE_ID);
  }
  return base;
}

// --- New Rate Limiting Logic ---
const MAX_CONCURRENT_REQUESTS = 3; // Reduced from 4
const MIN_REQUEST_INTERVAL_MS = 1000 / MAX_CONCURRENT_REQUESTS + 100; // ~433ms + buffer (Increased buffer)

let activeRequests = 0;
let lastRequestStartTime = 0;
const requestQueue: Array<{ task: () => Promise<any>; resolve: (value: any) => void; reject: (reason?: any) => void }> = [];

async function processQueue() {
  if (activeRequests >= MAX_CONCURRENT_REQUESTS || requestQueue.length === 0) {
    return; // Wait if max concurrency reached or queue is empty
  }

  const now = Date.now();
  const timeSinceLastStart = now - lastRequestStartTime;
  const delayNeeded = Math.max(0, MIN_REQUEST_INTERVAL_MS - timeSinceLastStart);

  const { task, resolve, reject } = requestQueue.shift()!;

  const executeTask = async () => {
    activeRequests++;
    lastRequestStartTime = Date.now();
    console.log(`[RateLimiter] Starting request. Active: ${activeRequests}, Queue: ${requestQueue.length}`);

    try {
      const result = await task();
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      activeRequests--;
      console.log(`[RateLimiter] Finished request. Active: ${activeRequests}, Queue: ${requestQueue.length}`);
      // Immediately try to process the next item if possible
      setTimeout(processQueue, 0); 
    }
  };

  if (delayNeeded > 0) {
     console.log(`[RateLimiter] Delaying next request by ${delayNeeded}ms`);
     setTimeout(executeTask, delayNeeded);
  } else {
     // Use setTimeout 0 to yield to the event loop before starting the next task immediately
     setTimeout(executeTask, 0); 
  }
}

// Function to schedule an Airtable request
function scheduleRequest<T>(task: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    requestQueue.push({ task, resolve, reject });
    console.log(`[RateLimiter] Queued request. Queue size: ${requestQueue.length}`);
    // Attempt to process the queue immediately if slots are free and no delay needed
    processQueue(); 
  });
}
// --- End of New Rate Limiting Logic ---

// Log configuration for debugging (remove in production)
console.log(`API_KEY: ${API_KEY ? '******' + API_KEY.slice(-4) : 'missing'}`);
console.log(`BASE_ID: ${BASE_ID || 'missing'}`);

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
  fields?: string[];
}

// Base types and interfaces
export interface BaseRecord {
  id: string;
  createdTime?: string;
}

export interface Media extends BaseRecord {
  'File Name': string;
  type?: 'image' | 'video' | string;
  Type?: 'image' | 'video' | string;
  description?: string;
  themes?: string[];
  Themes?: string[];
  tags?: string[];
  Tags?: string[];
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
  // Additional properties for compatibility
  title?: string;
  url?: string;
}

export interface Theme extends BaseRecord {
  'Theme Name': string;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
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
  Status?: string;
  Created?: string;
  'Story copy'?: string;
  Media?: string[];
  'Story Transcript'?: string;
  'Video Story Link'?: string;
  'Video Embed Code'?: string;
  'Location (from Media)'?: string;
  Shifts?: string[];
  'Link (from Galleries) (from Media)'?: string[];
  'Story ID'?: number;
  'Story Image'?: AirtableAttachment[];
  'Transcript (from Media)'?: string[];
  ShiftDetails?: Shift; // Added during processing in useStoriesData
  Storytellers?: string[]; // Added for story-storyteller relationships
  Themes?: string[]; // Added for story-theme relationships
}

export interface Tag extends BaseRecord {
  'Tag Name': string;
  name?: string;
  description?: string;
  Description?: string;
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
  latitude?: number;
  longitude?: number;
  Latitude?: number;
  Longitude?: number;
  Location?: string;
  Address?: string;
  address?: string;
  State?: string;
  Geocode?: string;
  // Additional properties that might be accessed
  name?: string;
  themes?: string[];
  Themes?: string[];
  stories?: Story[];
  Stories?: Story[];
  color?: string; // For map markers
  // Timestamps for compatibility with types/shifts.ts
  createdAt?: string;
  updatedAt?: string;
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
    (record.Status === undefined || typeof record.Status === 'string') &&
    (record.Created === undefined || typeof record.Created === 'string') &&
    (record['Story copy'] === undefined || typeof record['Story copy'] === 'string') &&
    (record.Media === undefined || Array.isArray(record.Media))
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
    (typeof record.Name === 'string' || typeof record.name === 'string')
  );
}

// Custom error class for Airtable-specific errors
export class AirtableError extends Error {
  status: number;
  
  constructor(message: string, status: number = 500) {
    super(message);
    this.name = 'AirtableError';
    this.status = status;
  }
}

// Base fetching function with Pagination Handling
export const fetchFromTable = async <T>(tableName: string, options: FetchOptions = {}): Promise<T[]> => {
  const fetchTask = async (): Promise<T[]> => {
    const airtableBase = initializeAirtable();
    if (!airtableBase) {
      console.warn('Airtable not initialized, returning empty array');
      return [];
    }
    
    let allRecordsInternal: T[] = [];
    try {
      const selectOptions: Record<string, any> = {};
      // Apply options carefully - Airtable SDK might mutate the options object
      const safeOptions = { ...options }; 
      if (safeOptions.maxRecords) selectOptions.maxRecords = safeOptions.maxRecords;
      if (safeOptions.pageSize) selectOptions.pageSize = safeOptions.pageSize;
      if (safeOptions.view) selectOptions.view = safeOptions.view;
      if (safeOptions.fields && Array.isArray(safeOptions.fields)) selectOptions.fields = safeOptions.fields;
      if (safeOptions.filterByFormula) selectOptions.filterByFormula = safeOptions.filterByFormula;
      if (safeOptions.sort && Array.isArray(safeOptions.sort)) {
        selectOptions.sort = safeOptions.sort;
      } else if (safeOptions.sortField && safeOptions.sortDirection) {
        selectOptions.sort = [{ field: safeOptions.sortField, direction: safeOptions.sortDirection }];
      }

      const query = airtableBase(tableName).select(selectOptions);
      // .all() handles pagination internally and returns all matching records (up to maxRecords if specified)
      const response = await query.all(); 

      console.log(`[fetchFromTable] Fetched ${response.length} raw records from ${tableName}`);

      allRecordsInternal = response.map((record: any) => ({
          id: record.id,
          createdTime: record.createdTime,
          ...record.fields
      })) as T[];

      console.log(`[fetchFromTable] Completed fetch from ${tableName}, returning ${allRecordsInternal.length} records`);
      return allRecordsInternal;

    } catch (error) {
      console.error(`[fetchFromTable] Error during Airtable fetch for ${tableName}:`, error);
      if ((error as any).statusCode === 404) {
         throw new Error(`Table '${tableName}' not found or query invalid.`);
      }
      // Let the rate limiter handle retries if needed, just throw for other errors
      throw new Error(`Failed to fetch records from ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  // Schedule the entire fetch operation using the rate limiter
  return scheduleRequest(fetchTask);
};

// Create a new record
export async function createRecord<T extends BaseRecord>(tableName: string, data: Omit<T, 'id' | 'createdTime'>): Promise<T> {
  const airtableBase = initializeAirtable();
  if (!airtableBase) throw new AirtableError('Airtable base is not initialized', 500);

  const createTask = async (): Promise<T> => {
    try {
      const response = await airtableBase(tableName).create([{ fields: data as any }]);
      if (!response || response.length === 0) {
         throw new Error('No record created or invalid response from Airtable.');
      }
      // Ensure fields are included in the return value
      const createdRecord = response[0] as any;
      return {
        id: createdRecord.id,
        createdTime: createdRecord.createdTime,
        ...createdRecord.fields 
      } as T;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      throw new Error(`Failed to create record in ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return scheduleRequest(createTask);
}

// Update an existing record
export async function updateRecord<T extends BaseRecord>(tableName: string, id: string, data: Partial<Omit<T, 'id' | 'createdTime'>>): Promise<T> {
  const airtableBase = initializeAirtable();
  if (!airtableBase) throw new AirtableError('Airtable base is not initialized', 500);

  const updateTask = async (): Promise<T> => {
    try {
      // Use `update` which expects an array of objects with id and fields
      const response = await airtableBase(tableName).update([{ id, fields: data as any }]);
       if (!response || response.length === 0) {
         throw new Error(`No record updated or invalid response for ID ${id} in ${tableName}.`);
       }
      // Ensure fields are included in the return value
      const updatedRecord = response[0] as any;
      return {
        id: updatedRecord.id,
        ...updatedRecord.fields 
      } as T;
    } catch (error) {
      console.error(`Error updating record ${id} in ${tableName}:`, error);
      throw new Error(`Failed to update record ${id} in ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  return scheduleRequest(updateTask);
}

// Delete a record
export async function deleteRecord(tableName: string, id: string): Promise<{ id: string, deleted: boolean }> {
  const airtableBase = initializeAirtable();
  if (!airtableBase) throw new AirtableError('Airtable base is not initialized', 500);

  const deleteTask = async (): Promise<{ id: string, deleted: boolean }> => {
    try {
      const response = await airtableBase(tableName).destroy([id]);
      if (!response || response.length === 0) {
         throw new Error(`No record deleted or invalid response for ID ${id} in ${tableName}.`);
      }
      return {
        id: (response[0] as any).id,
        deleted: (response[0] as any).deleted
      };
    } catch (error) {
      console.error(`Error deleting record ${id} from ${tableName}:`, error);
      throw new Error(`Failed to delete record ${id} from ${tableName}: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  return scheduleRequest(deleteTask);
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
    const fieldsToFetch = [
      'Title',
      'Status',
      'Created',
      'Story copy',
      'Media',
      'Story Transcript',
      'Video Story Link',
      'Video Embed Code',
      'Location (from Media)',
      'Shifts',
      'Link (from Galleries) (from Media)',
      'Story ID',
      'Story Image',
      'Transcript (from Media)'
    ];

    console.log(`[fetchStories] Attempting to fetch with fields:`, fieldsToFetch);

    const records = await fetchFromTable<Story>('Stories', { fields: fieldsToFetch });
    
    if (records && records.length > 0) {
      console.log('[fetchStories] First record fields:', Object.keys(records[0]));
      console.log('[fetchStories] Shifts data:', records[0].Shifts);
    }

    return records.filter(isStory);

  } catch (error) {
    if (error instanceof Error) {
      console.error('[fetchStories] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
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
      
      // Provide default shift data if no data is found in Airtable
      console.log('Creating default location data for demo purposes');
      return [
        {
          id: 'default-1',
          Name: 'Canberra City',
          latitude: -35.2809,
          longitude: 149.1300,
          address: 'Canberra, ACT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'default-2',
          Name: 'Dickson',
          latitude: -35.2507,
          longitude: 149.1339,
          address: 'Dickson, ACT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'default-3',
          Name: 'Gungahlin',
          latitude: -35.1869,
          longitude: 149.1339,
          address: 'Gungahlin, ACT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    } else {
      console.log(`✅ Using '${usedTable}' table for shifts with ${records.length} records`);
      
      // Log coordinates for debugging
      const shiftsWithCoordinates = records.filter(shift => {
        const hasCoords = 
          (typeof shift.latitude === 'number' && typeof shift.longitude === 'number') ||
          (typeof shift.Latitude === 'number' && typeof shift.Longitude === 'number');
        return hasCoords;
      });
      
      console.log(`Found ${shiftsWithCoordinates.length} shifts with coordinates out of ${records.length} total shifts`);
      console.log('First few shift records with coordinates:', shiftsWithCoordinates.slice(0, 3));
      
      // Process records to normalize coordinate format
      const processedRecords = records.map(shift => {
        // If latitude/longitude are strings, try to convert them to numbers
        if (typeof shift.latitude === 'string') {
          shift.latitude = parseFloat(shift.latitude);
        }
        if (typeof shift.longitude === 'string') {
          shift.longitude = parseFloat(shift.longitude);
        }
        if (typeof shift.Latitude === 'string') {
          shift.Latitude = parseFloat(shift.Latitude);
        }
        if (typeof shift.Longitude === 'string') {
          shift.Longitude = parseFloat(shift.Longitude);
        }
        
        // Ensure lowercase coordinates are set
        if (typeof shift.latitude !== 'number' && typeof shift.Latitude === 'number') {
          shift.latitude = shift.Latitude;
        }
        if (typeof shift.longitude !== 'number' && typeof shift.Longitude === 'number') {
          shift.longitude = shift.Longitude;
        }
        
        // Set default coordinates for Canberra if none are provided
        // (remove in production, just for demo)
        if (typeof shift.latitude !== 'number' || typeof shift.longitude !== 'number') {
          console.log(`Setting default coordinates for shift: ${shift.Name}`);
          shift.latitude = -35.2809 + (Math.random() - 0.5) * 0.1; // Random offset around Canberra
          shift.longitude = 149.1300 + (Math.random() - 0.5) * 0.1;
        }
        
        return shift;
      });
      
      return processedRecords.filter(isShift);
    }
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
export async function deleteMedia(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Media', id);
}

export async function deleteTheme(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Themes', id);
}

export async function deleteQuote(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Quotes', id);
}

export async function deleteGallery(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Galleries', id);
}

export async function deleteStory(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Stories', id);
}

export async function deleteTag(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Manual Tags', id);
}

export async function deleteStoryteller(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Storytellers', id);
}

export async function deleteShift(id: string): Promise<{ id: string, deleted: boolean }> {
  return deleteRecord('Shifts', id);
}