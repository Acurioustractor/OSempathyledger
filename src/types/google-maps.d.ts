/// <reference types="@types/google.maps" />

declare global {
  interface Window {
    google: typeof google;
  }
}

/**
 * Enhanced Google Maps Type Definitions
 * These declarations extend the @types/google.maps package with additional types
 * needed for our application.
 */

declare namespace google.maps {
  /**
   * Extended interfaces for better type checking
   */
  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    mapTypeId?: string | MapTypeId;
    draggable?: boolean;
    scrollwheel?: boolean;
    disableDoubleClickZoom?: boolean;
    streetViewControl?: boolean;
    mapTypeControl?: boolean;
    fullscreenControl?: boolean;
    zoomControl?: boolean;
    gestureHandling?: 'cooperative' | 'greedy' | 'none' | 'auto';
    styles?: MapTypeStyle[];
    clickableIcons?: boolean;
  }

  /**
   * Extended Marker interface for our application
   */
  interface MarkerOptions {
    position: LatLng | LatLngLiteral;
    map?: Map | null;
    title?: string;
    icon?: string | Icon | Symbol;
    label?: string | MarkerLabel;
    draggable?: boolean;
    clickable?: boolean;
    visible?: boolean;
    zIndex?: number;
    animation?: Animation;
    optimized?: boolean;
  }

  /**
   * Extended InfoWindow options
   */
  interface InfoWindowOptions {
    content?: string | Node;
    disableAutoPan?: boolean;
    maxWidth?: number;
    pixelOffset?: Size;
    position?: LatLng | LatLngLiteral;
    zIndex?: number;
  }

  /**
   * Extended Map interface for event listeners
   */
  interface Map {
    addListener(eventName: string, handler: Function): MapsEventListener;
    data: {
      addGeoJson(geoJson: object): Feature[];
      setStyle(style: object | ((feature: Feature) => object)): void;
    };
  }

  /**
   * Extended Event interface for event data
   */
  interface MapsEventListener {
    remove(): void;
  }

  /**
   * Cluster renderer interface for marker clustering
   */
  interface ClusterRenderer {
    render: (options: {
      count: number;
      position: LatLng | LatLngLiteral;
      markers: any[];
    }) => Marker;
  }
}

/**
 * Window with Google Maps API
 */
interface Window {
  google?: {
    maps: typeof google.maps;
  };
}

/**
 * MarkerClusterer from @googlemaps/markerclusterer package
 */
declare module '@googlemaps/markerclusterer' {
  export class MarkerClusterer {
    constructor(options: {
      map: google.maps.Map;
      markers: google.maps.Marker[];
      algorithm?: any;
      renderer?: google.maps.ClusterRenderer;
    });
    
    addMarker(marker: google.maps.Marker, noDraw?: boolean): void;
    addMarkers(markers: google.maps.Marker[], noDraw?: boolean): void;
    removeMarker(marker: google.maps.Marker, noDraw?: boolean): boolean;
    removeMarkers(markers: google.maps.Marker[], noDraw?: boolean): boolean;
    clearMarkers(): void;
    static GridAlgorithm: any;
  }
} 