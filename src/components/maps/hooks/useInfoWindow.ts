import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Shift, ShiftLocation } from '../../../types/shifts';
import { Story } from '../../../types/stories';

export interface InfoWindowContentProps {
  shift: Shift;
  stories?: Story[];
  onClose?: () => void;
  onViewAllStories?: () => void;
}

export interface UseInfoWindowProps {
  mapInstance: google.maps.Map | null;
  selectedShift: Shift | null;
  stories?: Story[];
  onClose?: () => void;
  onViewAllStories?: () => void;
  renderInfoContent?: (props: InfoWindowContentProps) => React.ReactNode;
}

export interface UseInfoWindowResult {
  infoWindow: google.maps.InfoWindow | null;
  infoWindowRef: React.RefObject<HTMLDivElement>;
  infoWindowContent: React.ReactPortal | null;
  openInfoWindow: (shift: Shift, position?: google.maps.LatLng) => void;
  closeInfoWindow: () => void;
}

/**
 * Custom hook for managing Google Maps info windows with React components
 *
 * This hook manages the lifecycle of an info window and renders React components
 * inside it using portals. It handles opening, closing, and positioning the info window
 * based on the selected shift.
 */
export function useInfoWindow({
  mapInstance,
  selectedShift,
  stories = [],
  onClose,
  onViewAllStories,
  renderInfoContent,
}: UseInfoWindowProps): UseInfoWindowResult {
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [infoWindowContent, setInfoWindowContent] = useState<React.ReactNode | null>(null);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  // Create portal root once on mount
  useEffect(() => {
    // Check if the portal root already exists
    const existingRoot = document.getElementById('info-window-portal-root');
    
    if (existingRoot) {
      portalRootRef.current = existingRoot as HTMLDivElement;
    } else {
      // Create a new portal root
      const portalRoot = document.createElement('div');
      portalRoot.id = 'info-window-portal-root';
      portalRoot.style.position = 'absolute';
      portalRoot.style.top = '0';
      portalRoot.style.left = '0';
      portalRoot.style.pointerEvents = 'none';
      portalRoot.style.zIndex = '-1';
      document.body.appendChild(portalRoot);
      portalRootRef.current = portalRoot;
    }

    // Create content div for info window
    contentRef.current = document.createElement('div');
    contentRef.current.className = 'gm-info-window-content';

    return () => {
      // Clean up the portal root if we created it
      if (portalRootRef.current && portalRootRef.current.id === 'info-window-portal-root') {
        document.body.removeChild(portalRootRef.current);
      }
    };
  }, []);

  // Initialize the info window
  useEffect(() => {
    if (typeof google === 'undefined' || typeof google.maps === 'undefined' || infoWindowRef.current) return;
    
    const newInfoWindow = new google.maps.InfoWindow({
      maxWidth: 300,
    });
    
    // Save references to info window
    infoWindowRef.current = newInfoWindow;
    setInfoWindow(newInfoWindow);
    
    // Set up event listeners
    google.maps.event.addListener(newInfoWindow, 'closeclick', () => {
      setInfoWindowContent(null);
      if (onClose) onClose();
    });
    
    // Clean up on unmount
    return () => {
      if (infoWindowRef.current) {
        google.maps.event.clearInstanceListeners(infoWindowRef.current);
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
    };
  }, [onClose]);

  // Get shift coordinates safely
  const getShiftPosition = useCallback((shift: Shift): google.maps.LatLngLiteral | null => {
    // Try the direct latitude/longitude properties first
    if (typeof shift.latitude === 'number' && typeof shift.longitude === 'number') {
      return { 
        lat: shift.latitude, 
        lng: shift.longitude 
      };
    }
    
    // Try PascalCase variations
    if (typeof shift.Latitude === 'number' && typeof shift.Longitude === 'number') {
      return { 
        lat: shift.Latitude, 
        lng: shift.Longitude 
      };
    }
    
    // Try the location object if it exists
    if (shift.location && typeof shift.location.latitude !== 'undefined' && 
        typeof shift.location.longitude !== 'undefined') {
      return {
        lat: typeof shift.location.latitude === 'string' 
          ? parseFloat(shift.location.latitude) 
          : shift.location.latitude,
        lng: typeof shift.location.longitude === 'string' 
          ? parseFloat(shift.location.longitude) 
          : shift.location.longitude
      };
    }
    
    // Try PascalCase location
    if (shift.Location && typeof shift.Location.latitude !== 'undefined' && 
        typeof shift.Location.longitude !== 'undefined') {
      return {
        lat: typeof shift.Location.latitude === 'string' 
          ? parseFloat(shift.Location.latitude) 
          : shift.Location.latitude,
        lng: typeof shift.Location.longitude === 'string' 
          ? parseFloat(shift.Location.longitude) 
          : shift.Location.longitude
      };
    }
    
    // No valid coordinates found
    return null;
  }, []);

  // Update info window when selectedShift changes
  useEffect(() => {
    if (!mapInstance || !infoWindowRef.current || !contentRef.current || !selectedShift) {
      // Close info window if no shift is selected
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        setInfoWindowContent(null);
      }
      return;
    }

    // Get shift coordinates safely
    const position = getShiftPosition(selectedShift);
    
    if (!position) {
      console.warn('Selected shift is missing coordinates', selectedShift);
      return;
    }

    // Filter stories for this shift
    const shiftStories = stories.filter(story => {
      if (typeof story.shiftId === 'string') return story.shiftId === selectedShift.id;
      if (typeof story.ShiftId === 'string') return story.ShiftId === selectedShift.id;
      return false;
    });

    // Create content props
    const contentProps: InfoWindowContentProps = {
      shift: selectedShift,
      stories: shiftStories,
      onClose: () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        setInfoWindowContent(null);
        if (onClose) onClose();
      },
      onViewAllStories
    };

    // Set content
    if (renderInfoContent) {
      setInfoWindowContent(renderInfoContent(contentProps));
    } else {
      // Fallback to basic content if no renderer is provided
      const shiftName = selectedShift.name || selectedShift.Name || 'Unnamed Location';
      const shiftAddress = selectedShift.address || selectedShift.Address || '';
      
      const defaultContent = `
        <div style="padding:10px; max-width:280px;">
          <h3 style="margin:0 0 8px; font-weight:600;">${shiftName}</h3>
          ${shiftAddress ? `<p style="margin:0 0 8px;">${shiftAddress}</p>` : ''}
          <p style="margin:0 0 5px;">Stories: ${shiftStories.length}</p>
        </div>
      `;
      if (contentRef.current) {
        contentRef.current.innerHTML = defaultContent;
      }
    }

    // Set content and open
    infoWindowRef.current.setContent(contentRef.current);
    infoWindowRef.current.setPosition(position);
    infoWindowRef.current.open(mapInstance);
    
    // Center map on the selected shift
    mapInstance.panTo(position);
  }, [mapInstance, selectedShift, stories, onClose, onViewAllStories, renderInfoContent, getShiftPosition]);

  // Open info window programmatically
  const openInfoWindow = useCallback((shift: Shift, position?: google.maps.LatLng) => {
    if (!mapInstance || !infoWindowRef.current || !contentRef.current) return;
    
    // Get marker position from shift if not provided
    let markerPosition: google.maps.LatLngLiteral | google.maps.LatLng | null = null;
    
    if (position) {
      markerPosition = position;
    } else {
      const shiftPosition = getShiftPosition(shift);
      if (shiftPosition) {
        markerPosition = shiftPosition;
      }
    }
    
    if (!markerPosition) {
      console.warn('Cannot open info window: Invalid position', shift);
      return;
    }
    
    // Filter stories for this shift
    const shiftStories = stories.filter(story => {
      if (typeof story.shiftId === 'string') return story.shiftId === shift.id;
      if (typeof story.ShiftId === 'string') return story.ShiftId === shift.id;
      return false;
    });
    
    // Create content props
    const contentProps: InfoWindowContentProps = {
      shift,
      stories: shiftStories,
      onClose: () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close();
        }
        setInfoWindowContent(null);
        if (onClose) onClose();
      },
      onViewAllStories
    };
    
    // Set content with renderer or fallback
    if (renderInfoContent) {
      setInfoWindowContent(renderInfoContent(contentProps));
    } else {
      const shiftName = shift.name || shift.Name || 'Unnamed Location';
      const shiftAddress = shift.address || shift.Address || '';
      
      const defaultContent = `
        <div style="padding:10px; max-width:280px;">
          <h3 style="margin:0 0 8px; font-weight:600;">${shiftName}</h3>
          ${shiftAddress ? `<p style="margin:0 0 8px;">${shiftAddress}</p>` : ''}
          <p style="margin:0 0 5px;">Stories: ${shiftStories.length}</p>
        </div>
      `;
      if (contentRef.current) {
        contentRef.current.innerHTML = defaultContent;
      }
    }
    
    // Open info window
    infoWindowRef.current.setContent(contentRef.current);
    infoWindowRef.current.setPosition(markerPosition);
    infoWindowRef.current.open(mapInstance);
    
    // Center map on the position
    mapInstance.panTo(markerPosition);
  }, [mapInstance, stories, onClose, onViewAllStories, renderInfoContent, getShiftPosition]);
  
  // Close info window programmatically
  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      setInfoWindowContent(null);
      if (onClose) onClose();
    }
  }, [onClose]);
  
  // The actual portal content to render in the component
  const infoWindowPortal = infoWindowContent && portalRootRef.current
    ? createPortal(infoWindowContent, portalRootRef.current)
    : null;
  
  return {
    infoWindow: infoWindowRef.current,
    infoWindowRef: contentRef,
    infoWindowContent: infoWindowPortal,
    openInfoWindow,
    closeInfoWindow
  };
} 