/**
 * Google Maps configuration
 * 
 * This file centralizes all Google Maps related configuration and utilities.
 * It provides consistent access to the API key and common map settings.
 */

// API key from environment variables
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Default map settings
export const DEFAULT_MAP_CENTER = { lat: -35.2809, lng: 149.1300 }; // Canberra, Australia
export const DEFAULT_MAP_ZOOM = 10;

// Map styles for a cleaner appearance
export const MAP_STYLES = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] }
];

// Default Map Options
export const DEFAULT_MAP_OPTIONS: google.maps.MapOptions = {
  center: { lat: -35.2809, lng: 149.1300 }, // Canberra, Australia
  zoom: 10,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  zoomControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }],
    },
  ],
};

/**
 * Check if the Google Maps API key is available
 */
export function isGoogleMapsApiKeyAvailable(): boolean {
  const hasKey = Boolean(GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY.length > 0);
  if (!hasKey) {
    console.error('Google Maps API key is missing. Set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
  }
  return hasKey;
}

/**
 * Get user-friendly message when API key is missing
 */
export function getMissingApiKeyMessage(): string {
  return 'Google Maps API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.';
}

/**
 * Get a masked version of the API key for logging (security)
 */
export function getMaskedApiKey(): string {
  if (!isGoogleMapsApiKeyAvailable()) {
    return '[API KEY MISSING]';
  }
  
  const key = GOOGLE_MAPS_API_KEY;
  if (key.length <= 8) {
    return '********';
  }
  
  return key.substring(0, 4) + '...' + key.substring(key.length - 4);
}

/**
 * Get the Google Maps API URL with the API key
 */
export function getGoogleMapsApiUrl(): string {
  return `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places,geometry`;
}

/**
 * Get the Geocoding API URL for the given address
 */
export function getGeocodingApiUrl(address: string): string {
  return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
}

/**
 * Check if Google Maps is blocked by ad blockers
 * Returns a promise that resolves to true if blocked, false otherwise
 */
export function checkForGoogleMapsBlocker(): Promise<boolean> {
  return new Promise((resolve) => {
    // Create a test script element
    const testScript = document.createElement('script');
    testScript.src = 'https://maps.googleapis.com/maps/api/js?key=test&callback=testGoogleMapsCallback';
    
    // Set up timeout to detect blocking
    const timeoutId = setTimeout(() => {
      // If callback wasn't called, assume not blocked
      resolve(false);
      cleanup();
    }, 1000);
    
    // Define test callback
    window.testGoogleMapsCallback = () => {
      // This should never be called with an invalid API key
      // If it is called, it means the request wasn't blocked
      resolve(false);
      cleanup();
    };
    
    // Error handler - if error happens quickly, likely blocked
    testScript.onerror = () => {
      // Short delay to ensure this is a true block and not a network error
      setTimeout(() => {
        resolve(true);
        cleanup();
      }, 100);
    };
    
    // Clean up function
    const cleanup = () => {
      clearTimeout(timeoutId);
      try {
        document.head.removeChild(testScript);
        delete window.testGoogleMapsCallback;
      } catch (error) {
        // Ignore cleanup errors
      }
    };
    
    // Append the test script
    document.head.appendChild(testScript);
  });
} 