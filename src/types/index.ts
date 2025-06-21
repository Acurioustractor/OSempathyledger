/**
 * Type definitions index
 * Re-exports all type definitions for easy importing
 */

// Re-export all types from airtable service
export type {
  Story,
  Storyteller,
  Theme,
  Media,
  Shift,
  Gallery,
  Quote,
  Tag,
  FetchOptions,
  FetchPaginatedOptions,
  // Add any other types that might be needed
} from '../services/airtable';

// Re-export shift types
export * from './shifts';

// Re-export story types
export * from './stories';

export interface Media {
  id: string;
  [key: string]: any;
}

export interface Story {
  id: string;
  [key: string]: any;
}

export interface Storyteller {
  id: string;
  Name: string;
  [key: string]: any;
}

export interface Theme {
  id: string;
  'Theme Name': string;
  [key:string]: any;
}

export interface Tag {
  id: string;
  [key: string]: any;
}

export interface Quote {
  id: string;
  [key: string]: any;
}

export interface FetchOptions {
  filterByFormula?: string;
  maxRecords?: number;
  sort?: { field: string; direction: 'asc' | 'desc' }[];
  view?: string;
}