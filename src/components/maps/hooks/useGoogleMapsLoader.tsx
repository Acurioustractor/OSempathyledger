import { useState, useEffect } from 'react';
import { isGoogleMapsApiKeyAvailable, getMissingApiKeyMessage, checkForGoogleMapsBlocker, GOOGLE_MAPS_API_KEY } from '../../../config/maps';

export interface GoogleMapsLoadingState {
  isLoaded: boolean;
  isLoading: boolean;
  loadError: Error | null;
  isBlocked: boolean;
}

export const useGoogleMapsLoader = (): GoogleMapsLoadingState => {
  const [loadingState, setLoadingState] = useState<GoogleMapsLoadingState>({
    isLoaded: false,
    isLoading: true,
    loadError: null,
    isBlocked: false,
  });

  useEffect(() => {
    if (!isGoogleMapsApiKeyAvailable()) {
      setLoadingState({
        isLoaded: false,
        isLoading: false,
        loadError: new Error(getMissingApiKeyMessage()),
        isBlocked: false,
      });
      return;
    }

    const loadGoogleMaps = async () => {
      try {
        // Check if Google Maps is blocked by an ad blocker
        const isBlocked = await checkForGoogleMapsBlocker();
        
        if (isBlocked) {
          setLoadingState({
            isLoaded: false,
            isLoading: false,
            loadError: null,
            isBlocked: true,
          });
          return;
        }

        // If Google Maps API is already loaded
        if (window.google && window.google.maps) {
          setLoadingState({
            isLoaded: true,
            isLoading: false,
            loadError: null,
            isBlocked: false,
          });
          return;
        }

        // Load Google Maps API
        const googleMapsApiKey = GOOGLE_MAPS_API_KEY;
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setLoadingState({
            isLoaded: true,
            isLoading: false,
            loadError: null,
            isBlocked: false,
          });
        };
        
        script.onerror = () => {
          setLoadingState({
            isLoaded: false,
            isLoading: false,
            loadError: new Error('Failed to load Google Maps API'),
            isBlocked: false,
          });
        };
        
        document.head.appendChild(script);
      } catch (error) {
        setLoadingState({
          isLoaded: false,
          isLoading: false,
          loadError: error instanceof Error ? error : new Error('Unknown error loading Google Maps'),
          isBlocked: false,
        });
      }
    };

    loadGoogleMaps();
  }, []);

  return loadingState;
}; 