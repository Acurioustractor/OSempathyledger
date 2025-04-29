/**
 * Google Maps Loader Service
 * 
 * A singleton service that ensures Google Maps is loaded only once in the application.
 * All components that need Google Maps should use this service rather than loading it directly.
 */

import { 
  GOOGLE_MAPS_API_KEY as DEFAULT_API_KEY, 
  getGoogleMapsApiUrl as getDefaultGoogleMapsApiUrl, 
  isGoogleMapsApiKeyAvailable as defaultIsGoogleMapsApiKeyAvailable,
  getMaskedApiKey as defaultGetMaskedApiKey
} from '../config/maps';

// Interface for the GoogleMaps window object
// More specific type to potentially resolve linter error
/*
declare global {
  interface Window {
    google?: {
      maps?: typeof google.maps; // Declare maps as optional
    };
  }
}
*/

// Singleton pattern to ensure there's only one loader instance
class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;
  private isLoading = false;
  private loadError: string | null = null;
  private callbacks: (() => void)[] = [];
  private loadStartTime: number = 0;
  private debugMode: boolean = true; // Enable for verbose logging
  private currentApiKey: string;

  private constructor() {
    this.debug('GoogleMapsLoader instance created');
    
    // Initialize with the default API key
    this.currentApiKey = DEFAULT_API_KEY;
    
    // Check if Maps is already loaded
    if (this.isGoogleMapsAvailable()) {
      this.debug('Google Maps already available at initialization');
      this.isLoaded = true;
    }
  }

  public static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  /**
   * Output debug logs if debug mode is enabled
   */
  private debug(message: string, ...args: any[]): void {
    if (this.debugMode) {
      console.log(`[GoogleMapsLoader] ${message}`, ...args);
    }
  }

  /**
   * Check if Google Maps is already loaded in the window
   */
  private isGoogleMapsAvailable(): boolean {
    return !!window.google && !!window.google.maps;
  }

  /**
   * Get Google Maps
   */
  public async getGoogleMaps(): Promise<any> {
    if (this.isGoogleMapsAvailable()) {
      console.debug('Google Maps is already loaded');
      return window.google.maps;
    }

    await this.load();
    return window.google.maps;
  }

  /**
   * Get the current API key being used
   */
  public getApiKey(): string {
    return this.currentApiKey;
  }

  /**
   * Set a new API key and optionally reload the Maps API
   * @param apiKey The new API key to use
   * @param reload Whether to immediately reload the Maps API with the new key
   * @returns Promise that resolves when the Maps API is reloaded (if reload=true)
   */
  public setApiKey(apiKey: string, reload: boolean = false): Promise<void> {
    this.debug(`Setting new API key: ${this.getMaskedApiKey(apiKey)}`);
    this.currentApiKey = apiKey;
    
    if (reload) {
      return this.reloadWithNewKey();
    }
    return Promise.resolve();
  }

  /**
   * Mask the API key for security in logs
   */
  private getMaskedApiKey(apiKey: string = this.currentApiKey): string {
    if (!apiKey || apiKey.length === 0) {
      return '[API KEY MISSING]';
    }
    
    if (apiKey.length <= 8) {
      return '********';
    }
    
    return apiKey.substring(0, 4) + '...' + apiKey.substring(apiKey.length - 4);
  }

  /**
   * Check if the current API key is available
   */
  private isApiKeyAvailable(): boolean {
    const hasKey = Boolean(this.currentApiKey && this.currentApiKey.length > 0);
    if (!hasKey) {
      console.error('Google Maps API key is missing. Please set a valid API key.');
    }
    return hasKey;
  }

  /**
   * Get the Google Maps API URL with the current API key
   */
  private getGoogleMapsApiUrl(): string {
    return `https://maps.googleapis.com/maps/api/js?key=${this.currentApiKey}&libraries=places,geometry`;
  }

  /**
   * Reload the Maps API with the current API key
   * This will:
   * 1. Remove any existing script
   * 2. Reset the loader state
   * 3. Load Google Maps again with the new key
   */
  public reloadWithNewKey(): Promise<void> {
    this.debug('Reloading Google Maps with new API key');
    
    // First, reset the state
    this.reset();
    
    // Remove any existing Google Maps script tags
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
    existingScripts.forEach(script => {
      this.debug('Removing existing Google Maps script');
      script.parentNode?.removeChild(script);
    });
    
    // Also remove any Google Maps-related objects from window
    if (window.google && window.google.maps) {
      this.debug('Cleaning up window.google.maps');
      try {
        // @ts-ignore - We need to delete this property
        delete window.google.maps;
        if (Object.keys(window.google).length === 0) {
          // @ts-ignore - We need to delete this property if empty
          delete window.google;
        }
      } catch (e) {
        this.debug('Error cleaning up window.google.maps:', e);
      }
    }
    
    // Load with the new key
    return this.load();
  }

  /**
   * Load Google Maps API
   */
  public load(): Promise<void> {
    this.debug('Load method called. Current state:', { 
      isLoaded: this.isLoaded, 
      isLoading: this.isLoading 
    });
    
    // If already loaded, resolve immediately
    if (this.isLoaded) {
      this.debug('Google Maps already loaded, resolving immediately');
      return Promise.resolve();
    }

    // If currently loading, return the existing promise
    if (this.isLoading && this.loadPromise) {
      this.debug('Google Maps loading in progress, returning existing promise');
      return this.loadPromise;
    }

    // If API key is missing
    if (!this.isApiKeyAvailable()) {
      this.loadError = 'Google Maps API key is missing';
      console.error(this.loadError);
      return Promise.reject(new Error(this.loadError));
    }

    // Start loading
    this.isLoading = true;
    this.loadStartTime = Date.now();
    this.debug('Starting Google Maps load process');
    
    // Log API key (masked)
    this.debug(`Using API key: ${this.getMaskedApiKey()}`);

    // Create and return the load promise
    this.loadPromise = new Promise<void>((resolve, reject) => {
      // Create the script element
      this.debug('Creating script element');
      const script = document.createElement('script');
      const apiUrl = this.getGoogleMapsApiUrl(); // Load without callback parameter
      script.src = apiUrl;
      script.async = true;
      script.defer = true;
      
      // Handle script load error
      script.onerror = (e) => {
        const error = new Error('Failed to load Google Maps script');
        console.error(error, e);
        this.loadError = error.message;
        this.isLoading = false;
        reject(error);
      };
      
      // Add script to document
      this.debug('Appending script to document head');
      document.head.appendChild(script);
      
      // Set a safety timeout
      const TIMEOUT = 15000; // 15 seconds
      setTimeout(() => {
        if (!this.isLoaded && this.isLoading) { // Only act if still loading
          this.debug(`Safety timeout reached after ${TIMEOUT}ms while still loading`);
          
          // Double-check if it loaded *just* before the timeout fired but onload didn't
          if (this.isGoogleMapsAvailable()) {
            this.debug('Google Maps detected via safety timeout after loading state - resolving');
            this.isLoaded = true; // Mark as loaded
            this.isLoading = false;
            
            this.callbacks.forEach(callback => { // Still run callbacks
              try { callback(); } catch (e) { console.error('Error in Google Maps timeout callback:', e); }
            });
            resolve(); // Resolve the promise
          } else { 
            // If really not loaded, reject
            const error = new Error(`Google Maps failed to load within ${TIMEOUT}ms timeout period`);
            console.error(error);
            this.loadError = error.message;
            this.isLoading = false;
            reject(error);
          }
        }
      }, TIMEOUT);
    });

    return this.loadPromise;
  }

  /**
   * Clear any previous errors and try loading again
   */
  public retry(): Promise<void> {
    this.debug('Retrying Google Maps load');
    this.loadError = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.loadPromise = null;
    return this.load();
  }

  /**
   * Get the current status of Google Maps loading
   */
  public getStatus(): { isLoaded: boolean; isLoading: boolean; error: string | null; loadStartTime: number } {
    return {
      isLoaded: this.isLoaded,
      isLoading: this.isLoading,
      error: this.loadError,
      loadStartTime: this.loadStartTime
    };
  }

  /**
   * Register a callback to be executed when Google Maps loads
   */
  public registerCallback(callback: () => void): void {
    this.debug('Callback registered');
    if (this.isLoaded) {
      // Execute immediately if already loaded
      this.debug('Maps already loaded, executing callback immediately');
      callback();
    } else {
      // Store for later execution
      this.debug('Maps not loaded yet, storing callback for later');
      this.callbacks.push(callback);
    }
  }

  // Reset loader - useful for testing or recovery from errors
  public reset(): void {
    this.loadPromise = null;
    this.isLoaded = false;
    this.isLoading = false;
    this.loadError = null;
    this.callbacks = [];
    this.debug('Google Maps Loader has been reset');
  }
}

// Export the singleton instance
export default GoogleMapsLoader.getInstance(); 