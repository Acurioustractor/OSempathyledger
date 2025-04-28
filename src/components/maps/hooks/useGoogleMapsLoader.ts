import { useState, useEffect, useCallback } from 'react';
import googleMapsLoader from '../../../services/googleMapsLoader';

/**
 * Custom hook for loading the Google Maps API
 * This separates the Google Maps loading logic from the component
 */
export function useGoogleMapsLoader() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadAttempts, setLoadAttempts] = useState(0);

  // Function to retry loading
  const retryLoading = useCallback(() => {
    console.log('Retrying Google Maps loading...');
    setLoadError(null);
    setLoadAttempts(prev => prev + 1);
    googleMapsLoader.retry()
      .then(() => {
        console.log('Google Maps retry succeeded');
        setIsLoaded(true);
      })
      .catch(error => {
        console.error('Google Maps retry failed:', error);
        setLoadError(error.message || 'Failed to load Google Maps API');
      });
  }, []);

  useEffect(() => {
    // Use our global loader instead of loading directly
    let isMounted = true;
    
    // Get current status
    const status = googleMapsLoader.getStatus();
    console.log('Google Maps loader status:', status);
    
    // If already loaded, update state immediately
    if (status.isLoaded) {
      setIsLoaded(true);
      return;
    }
    
    // If there's an error, set it
    if (status.error) {
      setLoadError(status.error);
      return;
    }
    
    // Start loading if not already loading
    googleMapsLoader.load()
      .then(() => {
        if (isMounted) {
          console.log('Google Maps loaded via global loader');
          setIsLoaded(true);
        }
      })
      .catch(error => {
        if (isMounted) {
          console.error('Failed to load Google Maps:', error);
          setLoadError(error.message || 'Failed to load Google Maps API');
        }
      });
    
    // Also register a callback to handle asynchronous loading that might happen later
    googleMapsLoader.registerCallback(() => {
      if (isMounted) {
        console.log('Google Maps callback fired');
        setIsLoaded(true);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [loadAttempts]);

  return { isLoaded, loadError, retryLoading };
} 