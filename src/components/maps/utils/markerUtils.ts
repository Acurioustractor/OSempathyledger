/**
 * Utility functions for working with Google Maps markers
 */

/**
 * Get marker color based on story count
 */
export function getMarkerColor(storyCount: number): string {
  if (storyCount > 5) return '#38A169'; // Green for many stories
  if (storyCount > 0) return '#DD6B20'; // Orange for some stories
  return '#A0AEC0'; // Gray for no stories
}

/**
 * Default locations for known shifts
 */
export const DEFAULT_LOCATIONS: Record<string, { lat: number, lng: number }> = {
  "James St": { lat: -35.2809, lng: 149.1300 },
  "Foothills": { lat: -35.2410, lng: 149.0756 },
  "TOMNET": { lat: -35.3055, lng: 149.1255 },
  "Doveton": { lat: -35.2665, lng: 149.1190 },
  "Blue Door Pod": { lat: -35.2956, lng: 149.1233 },
  "Dickson Place": { lat: -35.2507, lng: 149.1339 },
  "St Benedicts at Annies": { lat: -35.3456, lng: 149.0936 },
  "Early Morning Centre": { lat: -35.2764, lng: 149.1300 },
  "Vinnies Oaks Estate": { lat: -35.3376, lng: 149.2243 },
  "Kanangra Court": { lat: -35.2378, lng: 149.0451 },
  "Communities at Work Gungahlin": { lat: -35.1869, lng: 149.1339 }
};

/**
 * Default markers when no shifts data is available
 */
export const DEFAULT_MARKERS = [
  {
    id: 'default-1',
    name: 'Canberra City',
    position: { lat: -35.2809, lng: 149.1300 },
    address: 'Canberra, ACT',
    storyCount: 0
  },
  {
    id: 'default-2',
    name: 'Dickson',
    position: { lat: -35.2507, lng: 149.1339 },
    address: 'Dickson, ACT',
    storyCount: 0
  },
  {
    id: 'default-3',
    name: 'Gungahlin',
    position: { lat: -35.1869, lng: 149.1339 },
    address: 'Gungahlin, ACT',
    storyCount: 0
  }
]; 