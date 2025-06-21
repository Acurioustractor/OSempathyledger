// Note: MCP tools are provided by Claude and not available as npm imports
// This service will use mock data for testing
import { logError } from './logger';
import { Media, Story, Storyteller, Theme, Tag, Quote, FetchOptions } from '../types';

// Re-export mock functions for now
export * from './mockAirtableService';

// --- ERROR HANDLING ---
export class AirtableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AirtableError';
  }
}

// The rest of this file is temporarily disabled while using mock data
/*

// --- ENVIRONMENT & MCP CONFIG ---
const BASE_ID = process.env.AIRTABLE_BASE_ID!;
const MEDIA_TABLE_ID = process.env.AIRTABLE_TABLE_ID_MEDIA!;
const STORIES_TABLE_ID = process.env.AIRTABLE_TABLE_ID_STORIES!;
const STORYTELLERS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_STORYTELLERS!;
const THEMES_TABLE_ID = process.env.AIRTABLE_TABLE_ID_THEMES!;
const TAGS_TABLE_ID = process.env.AIRTABLE_TABLE_ID_TAGS!;
const QUOTES_TABLE_ID = process.env.AIRTABLE_TABLE_ID_QUOTES!;


// --- GENERIC MCP WRAPPERS ---
async function listRecords<T>(tableId: string, options: FetchOptions = {}): Promise<T[]> {
  try {
    const result = await mcp_airtable_list_records({ baseId: BASE_ID, tableId, ...options });
    return result.records.map((rec: any) => ({ id: rec.id, ...rec.fields })) as T[];
  } catch (error) {
    logError(`MCP: Failed to fetch from Airtable table ID: ${tableId}`, error);
    throw new AirtableError(`MCP: Failed to list records from table ${tableId}.`);
  }
}

async function mcpCreateRecord<T>(tableId: string, fields: any): Promise<T> {
  try {
    const result = await mcp_airtable_create_record({ baseId: BASE_ID, tableId, fields });
    return { id: result.id, ...result.fields } as T;
  } catch (error) {
    logError(`MCP: Failed to create record in Airtable table ID: ${tableId}`, error);
    throw new AirtableError(`MCP: Failed to create record in table ${tableId}.`);
  }
}

async function mcpUpdateRecord(tableId: string, recordId: string, fields: any): Promise<void> {
  try {
    await mcp_airtable_update_records({
      baseId: BASE_ID,
      tableId,
      records: [{ id: recordId, fields }],
    });
  } catch (error) {
    logError(`MCP: Failed to update record ${recordId} in Airtable table ID: ${tableId}`, error);
    throw new AirtableError(`MCP: Failed to update record in table ${tableId}.`);
  }
}

async function mcpDeleteRecord(tableId: string, recordId: string): Promise<void> {
  try {
    await mcp_airtable_delete_records({
      baseId: BASE_ID,
      tableId,
      recordIds: [recordId],
    });
  } catch (error) {
    logError(`MCP: Failed to delete record ${recordId} in Airtable table ID: ${tableId}`, error);
    throw new AirtableError(`MCP: Failed to delete record in table ${tableId}.`);
  }
}

function getTableIdFromName(tableName: string): string {
  switch (tableName) {
    case 'Media': return MEDIA_TABLE_ID;
    case 'Stories': return STORIES_TABLE_ID;
    case 'Storytellers': return STORYTELLERS_TABLE_ID;
    case 'Themes': return THEMES_TABLE_ID;
    case 'Tags': return TAGS_TABLE_ID;
    case 'Quotes': return QUOTES_TABLE_ID;
    default:
      logError(`Unknown table name provided: ${tableName}`, new Error(`Unknown table name`));
      throw new Error(`Unknown table name: ${tableName}`);
  }
}

// --- PUBLIC API ---

export const fetchMedia = (options?: FetchOptions): Promise<Media[]> => listRecords<Media>(MEDIA_TABLE_ID, options);
export const fetchStories = (options?: FetchOptions): Promise<Story[]> => listRecords<Story>(STORIES_TABLE_ID, options);
export const fetchStorytellers = (options?: FetchOptions): Promise<Storyteller[]> => listRecords<Storyteller>(STORYTELLERS_TABLE_ID, options);
export const fetchThemes = (options?: FetchOptions): Promise<Theme[]> => listRecords<Theme>(THEMES_TABLE_ID, options);
export const fetchTags = (options?: FetchOptions): Promise<Tag[]> => listRecords<Tag>(TAGS_TABLE_ID, options);
export const fetchQuotes = (options?: FetchOptions): Promise<Quote[]> => listRecords<Quote>(QUOTES_TABLE_ID, options);*/
