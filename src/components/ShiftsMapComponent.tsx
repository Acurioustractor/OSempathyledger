/**
 * @deprecated Use MapView or GoogleMap from './maps' instead.
 * This component is maintained for backward compatibility but will be removed
 * in a future version of the application.
 * 
 * All the functionality has been migrated to modular hooks and components in the maps directory.
 * 
 * ShiftsMapComponent
 * 
 * A component that displays shifts on a Google Map.
 * 
 * IMPORTANT: This component requires a Google Maps API key to be set in the environment variables.
 * Create a .env file in the root of your project with:
 * 
 * VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
 * 
 * Never commit the API key to version control.
 */
import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Box, Text, Heading, Badge, Flex, Button, Spinner, Center, useToast, Progress } from '@chakra-ui/react';
import { createPortal } from 'react-dom';
import { Shift } from '../services/airtable';
import googleMapsLoader from '../services/googleMapsLoader';
import MapContainer from './MapContainer';
import GoogleMapsKeyManager from './GoogleMapsKeyManager';
import { 
  DEFAULT_MAP_CENTER, 
  DEFAULT_MAP_ZOOM, 
  getMissingApiKeyMessage
} from '../config/maps';

// Add type declarations for the global window object
declare global {
  interface Window {
    google: typeof google;
    markerClusterer: any;
    initMap: () => void;
    testGoogleMapsCallback: () => void;
  }
}

// Geocoding cache to avoid redundant API calls
const geocodingCache: Record<string, google.maps.LatLngLiteral> = {};

// Constants for map loading and optimization
const MAP_SCRIPT_LOAD_TIMEOUT = 10000; // 10 seconds
const MARKER_BATCH_SIZE = 20; // Process markers in batches of 20
const MARKER_BATCH_DELAY = 50; // 50ms delay between batches

interface ShiftsMapComponentProps {
  shifts: Shift[];
  onShiftSelect: (shiftId: string) => void;
  selectedShiftId: string | null;
  storyCountByShift?: Record<string, number>;
  onShowStoryDetail?: (story: any) => void;
  stories: any[];
}

interface ShiftMarker {
  id: string;
  name: string;
  position: { lat: number; lng: number };
  address: string;
  storyCount?: number;
}

// Default locations for known shifts
const DEFAULT_LOCATIONS: Record<string, { lat: number, lng: number }> = {
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

// Default markers when no shifts data is available
const DEFAULT_MARKERS: ShiftMarker[] = [
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

// Hook to load Google Maps API - improved with better error handling
function useGoogleMapsScript() {
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
          console.log('Google Maps loaded via global loader in ShiftsMapComponent');
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
        console.log('Google Maps callback fired in ShiftsMapComponent');
        setIsLoaded(true);
      }
    });
    
    return () => {
      isMounted = false;
    };
  }, [loadAttempts]);

  return { isLoaded, loadError, retryLoading };
}

// Hook to detect ad blockers that might block Google Maps
function useAdBlockerDetection() {
  const [isBlocked, setIsBlocked] = useState(false);
  
  useEffect(() => {
    // Wait for any initial page resources to load
    const startDetection = () => {
      // Method 1: Test ad-like element
      const testAd = document.createElement('div');
      testAd.innerHTML = '&nbsp;';
      testAd.className = 'adsbox google-maps-check';
      testAd.style.position = 'absolute';
      testAd.style.opacity = '0';
      testAd.style.pointerEvents = 'none';
      document.body.appendChild(testAd);
      
      setTimeout(() => {
        const isHidden = testAd.offsetHeight === 0;
        document.body.removeChild(testAd);
        
        if (isHidden) {
          console.log('Ad blocker detected that might affect Google Maps');
          setIsBlocked(true);
          return; // No need to continue testing
        }
        
        // Method 2: Check for Google Analytics blocking (often correlated with Maps blocking)
        const checkGoogleAnalyticsBlocked = () => {
          const img = new Image();
          img.onload = () => {};
          img.onerror = () => {
            console.log('Google Analytics access appears to be blocked, Maps likely affected');
            setIsBlocked(true);
          };
          img.src = 'https://www.google-analytics.com/collect?v=1&t=event&tid=UA-XXXXX-Y&cid=555&ec=test&ea=test';
        };
        
        // Safer method to test Maps API access without loading the full API
        const checkGoogleMapsBlocked = () => {
          fetch('https://maps.googleapis.com/maps/api/js?check=1')
            .then(() => {
              console.log('Google Maps API access check passed');
            })
            .catch(() => {
              console.log('Google Maps API access appears to be blocked');
              setIsBlocked(true);
            });
        };
        
        // Run both checks with a slight delay
        setTimeout(checkGoogleAnalyticsBlocked, 50);
        setTimeout(checkGoogleMapsBlocked, 100);
      }, 100);
    };
    
    // Start detection after a short delay to allow page to stabilize
    const timer = setTimeout(startDetection, 500);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
  
  return isBlocked;
}

// InfoWindowContent component for better separation of concerns
interface InfoWindowContentProps {
  name: string;
  address: string;
  storyCount: number;
  storiesForShift: any[];
  onShowStoryDetail?: (story: any) => void;
  onClose: () => void;
}

const InfoWindowContent: React.FC<InfoWindowContentProps> = ({
  name,
  address,
  storyCount,
  storiesForShift,
  onShowStoryDetail,
  onClose,
}) => {
  return (
    <Box p={3} maxW="300px">
      <Heading size="sm" mb={2}>{name}</Heading>
      {address && (
        <Text fontSize="sm" color="gray.600" mb={2}>{address}</Text>
      )}
      <Text fontWeight="bold" mb={3} color={storyCount > 0 ? "blue.500" : "gray.400"}>
        {storyCount} {storyCount === 1 ? 'story' : 'stories'}
      </Text>
      
      {storiesForShift.length > 0 && onShowStoryDetail && (
        <>
          <Heading size="xs" mb={2}>Stories at this location:</Heading>
          {storiesForShift.slice(0, 5).map(story => (
            <Button 
              key={story.id}
              size="sm"
              mb={2}
              width="100%"
              justifyContent="flex-start"
              variant="outline"
              colorScheme="blue"
              onClick={() => {
                onShowStoryDetail(story);
                onClose();
              }}
              overflow="hidden"
              textOverflow="ellipsis"
              whiteSpace="nowrap"
            >
              {story.title || "Untitled Story"}
            </Button>
          ))}
          
          {storiesForShift.length > 5 && (
            <Text fontSize="xs" color="gray.500" textAlign="center">
              +{storiesForShift.length - 5} more {storiesForShift.length - 5 === 1 ? 'story' : 'stories'}
            </Text>
          )}
        </>
      )}
    </Box>
  );
};

const ShiftsMapComponent: React.FC<ShiftsMapComponentProps> = ({ 
  shifts, 
  onShiftSelect, 
  selectedShiftId,
  storyCountByShift = {},
  onShowStoryDetail,
  stories
}) => {
  console.log('ShiftsMapComponent rendering with shifts:', shifts?.length || 0);
  
  // Use the Google Maps loading hook
  const { isLoaded, loadError, retryLoading } = useGoogleMapsScript();
  const isAdBlocked = useAdBlockerDetection();
  
  const [mapCenter, setMapCenter] = useState(DEFAULT_MAP_CENTER);
  const [mapZoom, setMapZoom] = useState(DEFAULT_MAP_ZOOM);
  const [activeMarker, setActiveMarker] = useState<string | null>(null);
  const [shiftMarkers, setShiftMarkers] = useState<ShiftMarker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState("Waiting for Google Maps...");
  const [error, setError] = useState<string | null>(null);
  const [infoWindowPortalContent, setInfoWindowPortalContent] = useState<React.ReactNode | null>(null);
  const [infoWindowPosition, setInfoWindowPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapContainer, setMapContainer] = useState<HTMLDivElement | null>(null);
  
  // Use toast for non-blocking error notifications
  const toast = useToast();
  
  // References to Google Maps objects
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const markerClustererRef = useRef<any>(null);
  const infoWindowPortalRef = useRef<HTMLDivElement | null>(null);
  const mapInitErrorRef = useRef<boolean>(false);
  
  // Get marker color based on story count
  const getMarkerColor = (storyCount: number): string => {
    if (storyCount > 5) return '#38A169'; // Green for many stories
    if (storyCount > 0) return '#DD6B20'; // Orange for some stories
    return '#A0AEC0'; // Gray for no stories
  };
  
  // Function to display toast error messages
  const showErrorToast = useCallback((message: string) => {
    toast({
      title: "Map Error",
      description: message,
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top-right"
    });
  }, [toast]);

  // Helper to safely check if Google Maps is available
  const isGoogleMapsAvailable = useCallback(() => {
    try {
      return Boolean(
        window.google && 
        window.google.maps && 
        typeof window.google.maps.Map === 'function'
      );
    } catch (e) {
      console.error('Error checking Google Maps availability:', e);
      return false;
    }
  }, []);

  // Display loading or error state based on Google Maps loading status
  useEffect(() => {
    if (loadError) {
      setError(loadError);
      setIsLoading(false);
    }
  }, [loadError]);

  // Handle marker click
  const handleMarkerClick = useCallback((markerId: string) => {
    if (!mapRef.current || !infoWindowRef.current) return;
    
    console.log('Marker clicked:', markerId);
    setActiveMarker(markerId);
    onShiftSelect(markerId);
    
    // Get marker
    const marker = markersRef.current.get(markerId);
    if (!marker) return;
    
    // Get shift info with error handling
    const shift = shifts.find(s => s.id === markerId) || DEFAULT_MARKERS.find(m => m.id === markerId);
    if (!shift) return;
    
    // Use optional chaining to safely access properties that might be named differently
    const name = shift.Name ?? shift.name ?? 'Unknown location';
    const address = shift.Address ?? shift.address ?? '';
    const storyCount = storyCountByShift[markerId] || 0;
    
    // Find stories for this shift - optimize with memoization if this becomes a performance issue
    const storiesForShift = stories.filter(story => {
      if (!story.shifts) return false;
      if (typeof story.shifts === 'string') return story.shifts === markerId;
      if (Array.isArray(story.shifts)) return story.shifts.includes(markerId);
      return false;
    });
    
    // Get marker position for positioning the InfoWindow
    const position = marker.getPosition();
    if (!position) return;
    
    setInfoWindowPosition({
      lat: position.lat(),
      lng: position.lng()
    });
    
    // Use the InfoWindowContent component for better separation of concerns
    setInfoWindowPortalContent(
      <InfoWindowContent
        name={name}
        address={address}
        storyCount={storyCount}
        storiesForShift={storiesForShift}
        onShowStoryDetail={onShowStoryDetail}
        onClose={() => {
          infoWindowRef.current?.close();
          setInfoWindowPortalContent(null);
        }}
      />
    );
    
    // Open info window on the map at marker's position
    infoWindowRef.current.open(mapRef.current, marker);
  }, [shifts, stories, onShiftSelect, onShowStoryDetail, storyCountByShift]);

  // Create markers function
  const createMarkersForMap = useCallback(() => {
    if (!mapRef.current || !shifts.length) return;

    // Clear any existing markers
    clearMarkers();
    
    // Create map markers for each shift
    shifts.forEach(shift => {
      if (!mapRef.current) return;
      
      // Handle potential property name inconsistencies with optional chaining
      const latitude = shift.latitude ?? shift.Latitude;
      const longitude = shift.longitude ?? shift.Longitude;
      
      if (!latitude || !longitude) {
        console.warn('Shift missing coordinates:', shift.id, shift);
        return;
      }
      
      // Check for stories associated with this shift
      const storyCount = storyCountByShift[shift.id] || 0;
      
      // Get marker color based on story count
      const markerColors = shift.themes ?? shift.Themes ?? ['default'];
      const markerColor = getMarkerColor(storyCount);
      
      // Create Google Maps marker
      const marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapRef.current,
        title: shift.Name ?? shift.name ?? 'Unnamed location',
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeWeight: 1,
          strokeColor: '#ffffff',
          scale: 10 + Math.min(storyCount, 5)
        },
        zIndex: storyCount ? (storyCount + 100) : 0, // Prioritize shifts with stories
        optimized: false // Fixes issues with markers not appearing
      });
      
      // Store marker reference
      markersRef.current.set(shift.id, marker);
      
      // Add click listener to marker
      marker.addListener('click', () => {
        handleMarkerClick(shift.id);
      });
    });
    
    // Update loading state
    setLoadingStatus("Map ready");
    setLoadingProgress(100);
    setIsLoading(false);
    
    // Center map on selected shift if any
    if (selectedShiftId && markersRef.current.has(selectedShiftId)) {
      const marker = markersRef.current.get(selectedShiftId);
      if (marker && marker.getPosition() && mapRef.current) {
        mapRef.current.setCenter(marker.getPosition()!);
        mapRef.current.setZoom(13);
        
        // Trigger marker click to show info window
        handleMarkerClick(selectedShiftId);
      }
    }
  }, [shifts, selectedShiftId, storyCountByShift, getMarkerColor, handleMarkerClick]);

  // Handler for when container is ready
  const handleContainerReady = useCallback((element: HTMLDivElement) => {
    console.log("Map container ready:", element);
    mapContainerRef.current = element;
    setMapContainer(element);
  }, []);

  // Initialize map once Google Maps API is loaded AND container is ready
  useEffect(() => {
    console.log("Map initialization check:", {
      isLoaded,
      mapContainer: !!mapContainer,
      mapInstance: !!mapRef.current
    });
    
    // Don't initialize if already initialized or missing dependencies
    if (!isLoaded || !mapContainer || mapRef.current) return;
    
    setLoadingStatus('Initializing map...');
    setLoadingProgress(30);
    
    try {
      // Improved error handling during map initialization
      const initMap = () => {
        try {
          // Create map with optimized settings
          const mapOptions: google.maps.MapOptions = {
            center: { lat: -35.2809, lng: 149.1300 }, // Canberra
            zoom: 10,
            minZoom: 3, // Prevent zooming out too far
            maxZoom: 18, // Prevent zooming in too far
            gestureHandling: 'cooperative', // Improved mobile experience
            clickableIcons: false, // Prevent clicking on Google landmarks
            fullscreenControl: true,
            fullscreenControlOptions: { position: google.maps.ControlPosition.RIGHT_BOTTOM },
            zoomControl: true,
            zoomControlOptions: { position: google.maps.ControlPosition.RIGHT_CENTER },
            streetViewControl: false, // Disable street view for simplicity
            mapTypeControl: false, // Disable map type options for simplicity
            backgroundColor: '#f8f9fa', // Light gray background
            restriction: {
              latLngBounds: {
                north: 85,
                south: -85,
                west: -180,
                east: 180
              },
              strictBounds: true // Keep the map within these bounds
            },
            styles: [
              // Remove POIs and transit for cleaner map
              { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
              { featureType: 'transit', stylers: [{ visibility: 'off' }] }
            ]
          };
          
          console.log('Creating map instance');
          const map = new google.maps.Map(mapContainer, mapOptions);
          mapRef.current = map;
          
          // Setup geocoder
          geocoderRef.current = new google.maps.Geocoder();
          
          // Create info window
          infoWindowRef.current = new google.maps.InfoWindow({
            maxWidth: 300,
            disableAutoPan: false
          });
          
          // Listen for InfoWindow close to cleanup
          infoWindowRef.current.addListener('closeclick', () => {
            setInfoWindowPortalContent(null);
            setActiveMarker(null);
          });
          
          // Add event listeners with performance optimizations
          // Use debounced version for frequently firing events
          const debouncedHandleZoomChange = debounce(() => {
            if (mapRef.current) {
              const newZoom = mapRef.current.getZoom();
              if (newZoom) {
                setMapZoom(newZoom);
              }
            }
          }, 150);
          
          map.addListener('zoom_changed', debouncedHandleZoomChange);
          map.addListener('idle', () => {
            setIsDragging(false);
            setMapReady(true);
          });
          map.addListener('dragstart', () => {
            setIsDragging(true);
          });
          
          // Start marker creation only after map is properly initialized
          map.addListener('tilesloaded', () => {
            if (!hasLoadedMarkersRef.current) {
              hasLoadedMarkersRef.current = true;
              setLoadingStatus('Loading markers...');
              setLoadingProgress(60);
              
              // Load MarkerClusterer script if needed
              if (typeof window.markerClusterer === 'undefined') {
                loadMarkerClusterer()
                  .then(() => {
                    createMarkersForMap();
                  })
                  .catch((err) => {
                    console.error('Error loading MarkerClusterer:', err);
                    // Continue without clustering if script fails to load
                    createMarkersForMap();
                  });
              } else {
                createMarkersForMap();
              }
            }
          });
          
          // Update loading state
          setLoadingStatus('Map created successfully');
          setLoadingProgress(50);
        } catch (error) {
          console.error('Error initializing map:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          setError(`Failed to initialize map: ${errorMessage}`);
          setIsLoading(false);
        }
      };
      
      // Initialize map with a small delay to ensure DOM is ready
      setTimeout(initMap, 10);
    } catch (error) {
      console.error('Error in map initialization:', error);
      setError(`Map initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }
    
    // Cleanup function to properly dispose of the map instance
    return () => {
      // Close and cleanup info window
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      
      // Remove all markers from the map
      markersRef.current.forEach(marker => {
        // Remove all event listeners
        google.maps.event.clearInstanceListeners(marker);
        // Remove marker from map
        marker.setMap(null);
      });
      
      // Clear marker references
      markersRef.current.clear();
      
      // Clear clusterer if exists
      if (markerClustererRef.current) {
        try {
          markerClustererRef.current.clearMarkers();
          markerClustererRef.current = null;
        } catch (e) {
          console.warn('Error clearing marker clusterer:', e);
        }
      }
      
      // Clear map instance and listeners
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
        mapRef.current = null;
      }
      
      // Reset flags
      hasLoadedMarkersRef.current = false;
    };
  }, [isLoaded, mapContainer, createMarkersForMap]);
  
  // Helper function for debouncing events
  function debounce<F extends (...args: any[]) => any>(func: F, waitMs: number): (...args: Parameters<F>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    
    return function(...args: Parameters<F>): void {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => func(...args), waitMs);
    };
  }
  
  // When shifts or selectedShiftId changes, recreate markers if map is ready
  useEffect(() => {
    // Only create markers when map is fully initialized and Google Maps is available
    if (isLoaded && mapRef.current && mapInitialized && isGoogleMapsAvailable()) {
      try {
        createMarkersForMap();
      } catch (e) {
        console.error('Error in shift/marker update effect:', e);
        // Don't set error state here to avoid disrupting the UI if it's a transient issue
      }
    }
  }, [isLoaded, shifts, selectedShiftId, createMarkersForMap, mapInitialized, isGoogleMapsAvailable]);
  
  // Handle changes to story counts separately to avoid unnecessary marker recreation
  useEffect(() => {
    if (isLoaded && mapRef.current && mapInitialized && isGoogleMapsAvailable() && markersRef.current.size > 0) {
      // Just update marker colors without full recreation
      try {
        markersRef.current.forEach((marker, shiftId) => {
          const storyCount = storyCountByShift[shiftId] || 0;
          const icon = marker.getIcon() as google.maps.Symbol;
          
          if (icon && icon.fillColor !== getMarkerColor(storyCount)) {
            const newIcon = {
              ...icon,
              fillColor: getMarkerColor(storyCount),
              strokeColor: storyCount > 0 ? '#FFFFFF' : '#A0AEC0',
              scale: Math.min(Math.max(10, 10 + storyCount * 1), 18),
            };
            
            marker.setIcon(newIcon);
            
            // Update zIndex if this is selected
            if (shiftId === selectedShiftId) {
              marker.setZIndex(1000);
            } else {
              marker.setZIndex(1);
            }
          }
        });
      } catch (e) {
        console.error('Error updating marker styles:', e);
      }
    }
  }, [storyCountByShift, getMarkerColor, selectedShiftId, isLoaded, mapInitialized, isGoogleMapsAvailable]);
  
  // Render InfoWindow content using React portal when needed
  useEffect(() => {
    // Only render if we have content and the portal container
    if (infoWindowPortalContent && infoWindowPortalRef.current && infoWindowPosition) {
      // When content changes, adjust the info window position
      if (infoWindowRef.current && mapRef.current) {
        infoWindowRef.current.setContent(infoWindowPortalRef.current);
      }
    }
  }, [infoWindowPortalContent, infoWindowPosition]);
  
  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      // Clean up markers
      try {
        if (markersRef.current) {
          markersRef.current.forEach(marker => {
            try {
              if (marker && typeof marker.setMap === 'function') {
                google.maps.event.clearInstanceListeners(marker);
                marker.setMap(null);
              }
            } catch (e) {
              console.warn('Error cleaning up marker:', e);
            }
          });
          markersRef.current.clear();
        }
      } catch (e) {
        console.warn('Error cleaning up markers:', e);
      }
      
      // Clean up MarkerClusterer
      try {
        if (markerClustererRef.current && 
            markerClustererRef.current.clearMarkers && 
            typeof markerClustererRef.current.clearMarkers === 'function') {
          markerClustererRef.current.clearMarkers();
        }
      } catch (e) {
        console.warn('Error cleaning up marker clusterer:', e);
      }
      
      // Clean up InfoWindow
      try {
        if (infoWindowRef.current && 
            typeof infoWindowRef.current.close === 'function') {
          infoWindowRef.current.close();
        }
      } catch (e) {
        console.warn('Error cleaning up info window:', e);
      }
      
      // Clean up map event listeners
      try {
        if (mapRef.current) {
          google.maps.event.clearInstanceListeners(mapRef.current);
        }
      } catch (e) {
        console.warn('Error cleaning up map event listeners:', e);
      }
      
      // Reset refs
      mapRef.current = null;
      infoWindowRef.current = null;
      geocoderRef.current = null;
      markerClustererRef.current = null;
      
      // Reset state
      setInfoWindowPortalContent(null);
      setInfoWindowPosition(null);
      setActiveMarker(null);
    };
  }, []);
  
  // Update the useEffect to use getMissingApiKeyMessage
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError(getMissingApiKeyMessage());
      setIsLoading(false);
    }
  }, []);
  
  // Use layout effect to ensure container is ready
  useLayoutEffect(() => {
    if (mapContainerRef.current && isLoaded && !mapInitialized) {
      const width = mapContainerRef.current.offsetWidth;
      const height = mapContainerRef.current.offsetHeight;
      
      console.log(`Map container dimensions in layout effect: ${width}x${height}`);
      
      // Force minimum dimensions if needed
      if (width < 300 || height < 300) {
        console.log("Container too small, forcing minimum dimensions");
        mapContainerRef.current.style.width = "100%";
        mapContainerRef.current.style.height = "500px";
        mapContainerRef.current.style.minWidth = "300px";
        mapContainerRef.current.style.minHeight = "300px";
        
        // Force reflow
        setTimeout(() => {
          if (mapContainerRef.current) {
            console.log(`Updated dimensions: ${mapContainerRef.current.offsetWidth}x${mapContainerRef.current.offsetHeight}`);
          }
        }, 0);
      }
    }
  }, [isLoaded, mapInitialized]);
  
  // If API key error, show friendly message with option to update key
  if (loadError && loadError.includes('API key')) {
    return (
      <Box p={6} textAlign="center">
        <Heading size="md" mb={4} color="red.500">Google Maps API Key Error</Heading>
        <Text mb={6}>
          {loadError}
        </Text>
        
        <GoogleMapsKeyManager 
          onKeyChanged={() => {
            // Retry loading after key change
            retryLoading();
          }}
        />
      </Box>
    );
  }
  
  // Main Return: Render the component
  if (isAdBlocked) {
    return (
      <Box 
        width="100%" 
        height="500px" 
        borderRadius="md" 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center"
        bgColor="gray.100"
        p={6}
      >
        <Box 
          bg="yellow.50" 
          p={4} 
          borderRadius="md" 
          borderWidth={1} 
          borderColor="yellow.300" 
          maxW="600px"
        >
          <Heading size="md" color="yellow.700" mb={3}>
            Ad Blocker Detected
          </Heading>
          
          <Text mb={4}>
            It looks like you have an ad blocker or privacy extension that's blocking Google Maps.
            To view the interactive map, you'll need to:
          </Text>
          
          <Box pl={4} mb={4}>
            <Text mb={2}>• Disable your ad blocker for this site</Text>
            <Text mb={2}>• Allow access to maps.googleapis.com</Text>
            <Text>• Try using a different browser</Text>
          </Box>
          
          <Flex justifyContent="space-between" mt={4}>
            <Button
              colorScheme="blue"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setIsAdBlocked(false)}
            >
              Try Loading Map Anyway
            </Button>
          </Flex>
        </Box>
        
        {/* Fallback static representation of locations */}
        <Box mt={6} width="100%" maxW="600px">
          <Heading size="sm" mb={3}>Locations (Static View)</Heading>
          <Box 
            borderWidth={1} 
            borderRadius="md" 
            p={4} 
            bg="white"
            maxH="200px"
            overflowY="auto"
          >
            {(shifts && shifts.length > 0 ? shifts : DEFAULT_MARKERS).map(shift => {
              const name = shift.Name || shift.name || '';
              const address = shift.Address || shift.address || '';
              const storyCount = storyCountByShift[shift.id] || 0;
              
              return (
                <Box 
                  key={shift.id} 
                  mb={3} 
                  p={2} 
                  borderRadius="md" 
                  bg={shift.id === selectedShiftId ? "blue.50" : "gray.50"}
                  cursor="pointer"
                  onClick={() => onShiftSelect(shift.id)}
                >
                  <Flex alignItems="center">
                    <Box 
                      w={3} 
                      h={3} 
                      borderRadius="full" 
                      bg={getMarkerColor(storyCount)} 
                      mr={2} 
                    />
                    <Text fontWeight="medium">{name}</Text>
                    {storyCount > 0 && (
                      <Badge ml={2} colorScheme="blue">{storyCount} stories</Badge>
                    )}
                  </Flex>
                  {address && (
                    <Text fontSize="sm" color="gray.600" ml={5}>{address}</Text>
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }
  
  if (error && !mapInitialized) {
    return (
      <Box 
        width="100%" 
        height="500px" 
        borderRadius="md" 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center"
        bgColor="gray.100"
        p={6}
      >
        <Text color="red.500" fontSize="lg" mb={2} fontWeight="medium">Map Error</Text>
        <Text mb={2}>{error}</Text>
        
        {error.includes('blocked') && (
          <Text fontSize="sm" color="gray.600" mb={4} textAlign="center" maxW="450px">
            Google Maps may be blocked by an ad blocker or privacy extension.
            Try disabling your ad blocker for this site or try a different browser.
          </Text>
        )}
        
        <Flex gap={3}>
          <Button 
            colorScheme="blue" 
            onClick={() => {
              console.log('User manually retrying map component');
              setError(null);
              setIsLoading(true);
              setLoadingProgress(0);
              setLoadingStatus("Initializing...");
              retryLoading(); // Use our new retry function
            }}
          >
            Reload Map
          </Button>
          
          <Button
            colorScheme="gray"
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </Flex>
        
        <Text fontSize="xs" color="gray.500" mt={5}>
          Note: Maps require an internet connection and access to Google Maps services
        </Text>
      </Box>
    );
  }
  
  if (isLoading && !mapInitialized) {
    return (
      <Box 
        width="100%" 
        height="500px" 
        borderRadius="md" 
        display="flex" 
        flexDirection="column"
        alignItems="center" 
        justifyContent="center"
        bgColor="gray.100"
        p={6}
        position="relative"
      >
        <Spinner size="xl" color="blue.500" thickness="4px" mb={4} />
        <Text mb={4} fontWeight="medium">{loadingStatus}</Text>
        <Progress 
          value={loadingProgress} 
          width="80%" 
          colorScheme="blue" 
          borderRadius="md" 
          size="sm" 
          mb={2} 
          hasStripe
          isAnimated
        />
        <Text fontSize="xs" color="gray.500" mb={2}>{loadingProgress}%</Text>
        
        {/* Stuck at 0% for more than 5 seconds */}
        {loadingProgress === 0 && (
          <Flex direction="column" alignItems="center" mt={4}>
            <Text fontSize="sm" color="gray.600" mb={2} textAlign="center">
              If the map doesn't load, it may be blocked by an ad blocker or privacy extension.
              <br />Try disabling your ad blocker for this site or refresh the page.
            </Text>
            <Flex gap={3} mt={2}>
              <Button 
                size="sm"
                colorScheme="blue" 
                onClick={() => {
                  retryLoading(); // Use our new retry function
                }}
              >
                Try Again
              </Button>
              <Button
                size="sm"
                colorScheme="gray"
                variant="outline"
                onClick={() => {
                  setError('Map loading cancelled');
                  setIsLoading(false);
                }}
              >
                Cancel
              </Button>
            </Flex>
          </Flex>
        )}
        
        {/* Button for refreshing */}
        <Button 
          size="xs"
          variant="link" 
          colorScheme="blue" 
          position="absolute"
          right={4}
          top={4}
          onClick={() => {
            console.log('User manually refreshing map component');
            retryLoading();
          }}
        >
          Refresh
        </Button>
        
        {/* Show cancel button in certain conditions */}
        {loadingProgress < 60 && loadingProgress > 0 && (
          <Button 
            size="sm" 
            variant="link" 
            colorScheme="red" 
            mt={4}
            onClick={() => {
              setError('Map loading cancelled');
              setIsLoading(false);
            }}
          >
            Cancel loading
          </Button>
        )}
      </Box>
    );
  }
  
  // Log when shifts data changes
  useEffect(() => {
    console.log(`Shifts data updated: ${shifts?.length || 0} shifts available`, {
      mapInitialized,
      isGoogleLoaded: isLoaded,
      mapRef: Boolean(mapRef.current)
    });
    
    // If we have shifts data, map is initialized, but no markers have been created yet
    if (shifts?.length > 0 && mapInitialized && isLoaded && markersRef.current.size === 0) {
      console.log('Creating markers for newly loaded shifts data');
      createMarkersForMap();
    }
  }, [shifts, mapInitialized, isLoaded, createMarkersForMap]);
  
  return (
    <Box position="relative" height="100%" width="100%">
      {/* Add compact key manager above the map */}
      <Box position="absolute" top={2} left={2} zIndex={11}>
        <GoogleMapsKeyManager 
          compact={true}
          onKeyChanged={() => {
            // Reset map when API key changes
            setTimeout(() => {
              if (mapRef.current && mapContainer) {
                console.log('Reinitializing map after API key change');
                clearMarkers();
                mapRef.current = null;
                retryLoading();
                // Wait for component to settle before initializing
                setTimeout(() => {
                  if (mapContainer) {
                    handleContainerReady(mapContainer);
                  }
                }, 500);
              }
            }, 100);
          }}
        />
      </Box>
      
      <MapContainer onContainerReady={handleContainerReady}>
        {/* Loading overlay - show when map is initializing */}
        {isLoading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            zIndex={10}
            bg="rgba(255,255,255,0.8)"
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            p={4}
          >
            <Spinner size="xl" color="blue.500" thickness="4px" mb={4} />
            <Text mb={2} fontWeight="medium">{loadingStatus}</Text>
            <Progress 
              value={loadingProgress} 
              width="80%" 
              colorScheme="blue" 
              borderRadius="md" 
              size="sm" 
              mb={2} 
              hasStripe
              isAnimated
            />
            <Text fontSize="xs" color="gray.500" mb={2}>{loadingProgress}%</Text>
          </Box>
        )}
        
        {/* Map will be rendered here by Google Maps API */}
        
        {/* Legend */}
        {!isLoading && mapInitialized && (
          <Box 
            position="absolute" 
            right={4} 
            top={4} 
            bg="white"
            boxShadow="md" 
            borderRadius="md"
            p={3}
            zIndex={10}
          >
            <Heading size="xs" mb={2}>Legend</Heading>
            <Flex align="center" mb={2}>
              <Box w={3} h={3} borderRadius="full" bg="#38A169" mr={2} />
              <Text fontSize="sm">Many stories</Text>
            </Flex>
            <Flex align="center" mb={2}>
              <Box w={3} h={3} borderRadius="full" bg="#DD6B20" mr={2} />
              <Text fontSize="sm">Some stories</Text>
            </Flex>
            <Flex align="center">
              <Box w={3} h={3} borderRadius="full" bg="#A0AEC0" mr={2} />
              <Text fontSize="sm">No stories</Text>
            </Flex>
          </Box>
        )}
        
        {/* Error overlay that appears for map errors but doesn't block the whole component */}
        {error && (
          <Box 
            position="absolute"
            bottom={4}
            left={4}
            bg="red.100"
            borderRadius="md"
            p={3}
            zIndex={100}
            boxShadow="md"
            borderWidth={1}
            borderColor="red.300"
          >
            <Text fontSize="sm" color="red.700">{error}</Text>
            <Button 
              size="sm" 
              colorScheme="red" 
              mt={2} 
              onClick={() => {
                setError(null);
                setIsLoading(true);
                retryLoading();
              }}
            >
              Reload Map
            </Button>
          </Box>
        )}
        
        {/* Ad blocker warning if detected */}
        {isAdBlocked && (
          <Box 
            position="absolute"
            top={14}
            right={4}
            zIndex={10}
            bg="yellow.100"
            p={3}
            borderRadius="md"
            boxShadow="sm"
            maxWidth="300px"
            fontSize="sm"
          >
            <Text fontWeight="bold" mb={1}>Ad Blocker Detected</Text>
            <Text>
              Your ad blocker may interfere with Google Maps. If the map doesn't load,
              try disabling your ad blocker for this site.
            </Text>
          </Box>
        )}
        
        {/* InfoWindow portal container */}
        {infoWindowPortalContent && infoWindowPortalRef.current && 
          createPortal(infoWindowPortalContent, infoWindowPortalRef.current)}
      </MapContainer>
      
      {/* Hidden container for InfoWindow portal content */}
      <div id="info-window-container" style={{ display: 'none' }} />
    </Box>
  );
};

export default ShiftsMapComponent; 