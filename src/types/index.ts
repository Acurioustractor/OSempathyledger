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