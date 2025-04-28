/**
 * Type definitions for shifts and related entities
 */

import { Story } from './stories';

/**
 * Represents a full story with complete details
 */
export interface StoryDetail {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Represents a location for a shift
 */
export interface ShiftLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

/**
 * Represents a shift in the application
 * Handles both camelCase and PascalCase property variations
 * from different data sources
 */
export interface Shift {
  // Required identifiers
  id: string;
  Id?: string;
  
  // Main properties
  name: string;
  Name?: string;
  description?: string;
  Description?: string;
  
  // Location properties
  address?: string;
  Address?: string;
  latitude?: number;
  Latitude?: number;
  longitude?: number;
  Longitude?: number;
  location?: ShiftLocation;
  Location?: ShiftLocation;
  
  // Temporal properties
  date?: string;
  Date?: string;
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  
  // Relationships
  organizerId?: string;
  OrganizerId?: string;
  storytellers?: string[];
  Storytellers?: string[];
  
  // Metadata
  themes?: string[];
  Themes?: string[];
  
  // Timestamps
  createdAt: string;
  CreatedAt?: string;
  updatedAt: string;
  UpdatedAt?: string;
  
  // Related stories
  stories?: Story[] | StoryDetail[];
  Stories?: Story[] | StoryDetail[];
} 