/**
 * Google Maps Loader Service
 * 
 * A singleton service that ensures Google Maps is loaded only once in the application.
 * All components that need Google Maps should use this service rather than loading it directly.
 */

// API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

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

  private constructor() {
    this.debug('GoogleMapsLoader instance created');
    
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
    try {
      const available = Boolean(
        window.google && 
        window.google.maps && 
        typeof window.google.maps.Map === 'function'
      );
      this.debug(`Google Maps available check: ${available}`);
      return available;
    } catch (e) {
      console.error('Error checking Google Maps availability:', e);
      return false;
    }
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

    // Double-check if Google Maps is available on window
    if (this.isGoogleMapsAvailable()) {
      this.debug('Google Maps found on window, marking as loaded');
      this.isLoaded = true;
      return Promise.resolve();
    }

    // If API key is missing
    if (!GOOGLE_MAPS_API_KEY) {
      this.loadError = 'Google Maps API key is missing';
      console.error(this.loadError);
      return Promise.reject(new Error(this.loadError));
    }

    // Start loading
    this.isLoading = true;
    this.loadStartTime = Date.now();
    this.debug('Starting Google Maps load process');
    
    // Log API key (masked)
    const maskedKey = GOOGLE_MAPS_API_KEY.length > 8 
      ? `${GOOGLE_MAPS_API_KEY.substring(0, 4)}...${GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 4)}`
      : '********';
    this.debug(`Using API key: ${maskedKey}`);

    // Create and return the load promise
    this.loadPromise = new Promise<void>((resolve, reject) => {
      // Define a unique callback name
      const callbackName = `googleMapsCallback_${Date.now()}`;
      this.debug(`Created callback name: ${callbackName}`);

      // Set the callback function
      window[callbackName] = () => {
        this.debug('Google Maps callback triggered');
        
        // Ensure Google Maps is available
        if (window.google && window.google.maps) {
          const loadTime = Date.now() - this.loadStartTime;
          this.debug(`Google Maps loaded successfully in ${loadTime}ms`);
          this.isLoaded = true;
          this.isLoading = false;
          
          // Execute any registered callbacks
          this.debug(`Executing ${this.callbacks.length} registered callbacks`);
          this.callbacks.forEach(callback => {
            try {
              callback();
            } catch (e) {
              console.error('Error in Google Maps callback:', e);
            }
          });
          
          // Clean up the callback
          try {
            this.debug('Cleaning up callback function');
            delete window[callbackName];
          } catch (e) {
            window[callbackName] = undefined;
          }
          
          resolve();
        } else {
          const error = new Error('Google Maps API loaded but not available on window');
          console.error(error);
          this.loadError = error.message;
          this.isLoading = false;
          
          // Clean up the callback
          try {
            delete window[callbackName];
          } catch (e) {
            window[callbackName] = undefined;
          }
          
          reject(error);
        }
      };

      // Create the script element
      this.debug('Creating script element');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=${callbackName}&v=weekly`;
      script.async = true;
      script.defer = true;
      
      // Handle script load error
      script.onerror = (e) => {
        const error = new Error('Failed to load Google Maps script');
        console.error(error, e);
        this.loadError = error.message;
        this.isLoading = false;
        
        // Clean up the callback
        try {
          delete window[callbackName];
        } catch (err) {
          window[callbackName] = undefined;
        }
        
        reject(error);
      };
      
      // Add script to document
      this.debug('Appending script to document head');
      document.head.appendChild(script);
      
      // Set intermediate check
      setTimeout(() => {
        if (!this.isLoaded && this.isLoading) {
          this.debug('Intermediate check: Google Maps still loading after 2 seconds');
          // Check for script element in DOM
          const scriptElements = document.querySelectorAll(`script[src*="maps.googleapis.com"]`);
          this.debug(`Found ${scriptElements.length} Google Maps script elements in the DOM`);
        }
      }, 2000);
      
      // Set a safety timeout
      const TIMEOUT = 15000; // 15 seconds
      setTimeout(() => {
        if (!this.isLoaded) {
          this.debug(`Safety timeout reached after ${TIMEOUT}ms`);
          
          // Check if Google Maps loaded but callback wasn't triggered
          if (this.isGoogleMapsAvailable()) {
            this.debug('Google Maps detected via safety timeout - it loaded but callback was not triggered');
            this.isLoaded = true;
            this.isLoading = false;
            
            // Execute callbacks
            this.callbacks.forEach(callback => {
              try {
                callback();
              } catch (e) {
                console.error('Error in Google Maps timeout callback:', e);
              }
            });
            
            resolve();
          } else if (this.isLoading) {
            const error = new Error(`Google Maps failed to load within ${TIMEOUT}ms timeout period`);
            console.error(error);
            this.loadError = error.message;
            this.isLoading = false;
            reject(error);
          }
          
          // Clean up the callback either way
          try {
            delete window[callbackName];
          } catch (e) {
            window[callbackName] = undefined;
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
}

// Export the singleton instance
export default GoogleMapsLoader.getInstance(); 