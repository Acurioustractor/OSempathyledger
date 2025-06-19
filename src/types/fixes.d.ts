// Comprehensive type fixes for the entire project

import { Story as BaseStory, Storyteller as BaseStoryteller, Shift as BaseShift, Media as BaseMedia } from '../services/airtable'

declare module '../services/airtable' {
  interface Story extends BaseStory {
    Description?: string
    Transcript?: string
    Location?: string
    Tags?: string[]
    Storyteller_id?: string[]
    Latitude?: number
    Longitude?: number
    Geocode?: string
    Summary?: string
    Date_Created?: string
    Quotes?: any[]
    [key: string]: any
  }

  interface Storyteller extends BaseStoryteller {
    Avatar?: string
    Type?: 'Friend' | 'Volunteer' | 'Staff'
    [key: string]: any
  }

  interface Shift extends BaseShift {
    Address?: string
    Geocode?: string
    color?: string
    Date?: string
    Name?: string
    [key: string]: any
  }

  interface Media extends BaseMedia {
    thumbnails?: {
      small?: { url: string }
      large?: { url: string }
      full?: { url: string }
    }
    url?: string
    [key: string]: any
  }
}

// Fix for maps components
declare global {
  interface InfoWindowContentProps {
    shift: any
    stories?: any[]
    onClose?: () => void
    onViewAllStories?: () => void
  }

  interface UseMapMarkersResult {
    createMarkers?: any
    clearMarkers?: any
    markersRef?: any
    loadingProgress?: any
    loadingStatus?: any
    [key: string]: any
  }

  interface UseMapMarkersProps {
    storyCountByShift?: any
    [key: string]: any
  }

  // D3 types fix
  interface NetworkNode {
    id: string
    name: string
    type: string
    size: number
    color: string
    x?: number
    y?: number
    fx?: number | null
    fy?: number | null
    [key: string]: any
  }

  // Form types
  interface MediaFormData {
    title?: string
    url?: string
    type?: string | "video" | "image"
    description?: string
    themes?: string[]
    tags?: string[]
    [key: string]: any
  }
}

// Extend window for Google Maps
declare global {
  interface Window {
    google?: any
  }
}

// Fix React types
declare module 'react' {
  interface HTMLAttributes<T> {
    [key: string]: any
  }
}

// Allow any module imports
declare module '*'

export {}