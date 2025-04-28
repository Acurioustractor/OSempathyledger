/**
 * Story types for the Empathy Ledger application
 */

import { Shift } from './shifts';

/**
 * Represents a story in the application
 * Handles both camelCase and PascalCase property variations
 */
export interface Story {
  // Required properties
  id: string;
  
  // Content properties (various naming conventions)
  title?: string;
  Title?: string;
  content?: string;
  Content?: string;
  
  // Author properties
  author?: string;
  authorId?: string;
  AuthorId?: string;
  
  // Shift relationships
  shiftId?: string;
  ShiftId?: string;
  shift?: Shift;
  shifts?: string | string[];
  
  // Timestamp properties
  createdAt?: string;
  CreatedAt?: string;
  updatedAt?: string;
  UpdatedAt?: string;
  
  // Categorization
  tags?: string[];
  Tags?: string[];
  
  // Location data
  location?: StoryLocation;
  
  // Media attachments
  images?: string[];
  audio?: string;
  
  // Status
  approved?: boolean;
  
  // Allow additional properties with limited type safety
  // This prevents excessive type errors with API data
  [key: string]: string | number | boolean | object | undefined | null | Array<any>;
}

/**
 * Location data for a story
 */
export interface StoryLocation {
  latitude: number | string;
  longitude: number | string;
  address?: string;
}

/**
 * State management interface for stories
 */
export interface StoriesState {
  stories: Story[];
  selectedStory: Story | null;
  loading: boolean;
  error: string | null;
}

/**
 * Form data for creating/editing a story
 */
export interface StoryFormData {
  title: string;
  content: string;
  shiftId?: string;
  tags?: string[];
  location?: StoryLocation;
} 