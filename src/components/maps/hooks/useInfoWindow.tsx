import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Shift } from '../../../types/shifts';

export interface InfoWindowContentProps {
  shift: Shift;
}

export interface UseInfoWindowProps {
  mapInstance: google.maps.Map | null;
  selectedShift: Shift | null;
  renderInfoContent?: (shift: Shift) => React.ReactNode;
}

export const useInfoWindow = ({
  mapInstance,
  selectedShift,
  renderInfoContent,
}: UseInfoWindowProps) => {
  const [infoWindow, setInfoWindow] = useState<google.maps.InfoWindow | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const infoWindowPortalRef = useRef<HTMLDivElement | null>(null);
  const [infoWindowContent, setInfoWindowContent] = useState<React.ReactNode | null>(null);
  
  // Initialize the info window once when the map instance is available
  useEffect(() => {
    if (!mapInstance) return;
    
    // Create info window instance if it doesn't exist
    if (!infoWindow) {
      const newInfoWindow = new google.maps.InfoWindow({
        maxWidth: 300,
      });
      
      // Create a container for React content
      if (!contentRef.current) {
        contentRef.current = document.createElement('div');
        contentRef.current.className = 'info-window-content-container';
      }
      
      // Create a portal container for React rendering
      if (!infoWindowPortalRef.current) {
        infoWindowPortalRef.current = document.createElement('div');
        infoWindowPortalRef.current.id = 'info-window-portal';
        infoWindowPortalRef.current.style.display = 'none';
        document.body.appendChild(infoWindowPortalRef.current);
      }
      
      // Store the info window instance
      setInfoWindow(newInfoWindow);
      
      // Set up close event listener
      newInfoWindow.addListener('closeclick', () => {
        setInfoWindowContent(null);
      });
    }
    
    // Clean up on unmount
    return () => {
      if (infoWindow) {
        infoWindow.close();
        google.maps.event.clearInstanceListeners(infoWindow);
      }
      
      if (infoWindowPortalRef.current) {
        document.body.removeChild(infoWindowPortalRef.current);
      }
    };
  }, [mapInstance, infoWindow]);
  
  // Open info window when a shift is selected
  useEffect(() => {
    if (!mapInstance || !infoWindow || !selectedShift) {
      // Close info window if there's no selected shift
      if (infoWindow) {
        infoWindow.close();
        setInfoWindowContent(null);
      }
      return;
    }
    
    // Check if the shift has coordinates
    const latitude = selectedShift.latitude ?? selectedShift.location?.latitude;
    const longitude = selectedShift.longitude ?? selectedShift.location?.longitude;
    
    if (!latitude || !longitude) {
      console.warn('Selected shift has no valid coordinates', selectedShift);
      return;
    }
    
    // Create position object
    const position = { 
      lat: typeof latitude === 'string' ? parseFloat(latitude) : latitude,
      lng: typeof longitude === 'string' ? parseFloat(longitude) : longitude
    };
    
    // Prepare content for the info window
    if (renderInfoContent && contentRef.current) {
      // Generate content using the provided render function
      const content = renderInfoContent(selectedShift);
      setInfoWindowContent(content);
      
      // Set the content div as the info window content
      infoWindow.setContent(contentRef.current);
    } else {
      // Fallback to simple content if no render function provided
      const defaultContent = `
        <div style="padding: 8px;">
          <h3 style="margin: 0 0 8px; font-weight: bold;">${selectedShift.name || 'Unnamed Location'}</h3>
          ${selectedShift.address ? `<p>${selectedShift.address}</p>` : ''}
        </div>
      `;
      infoWindow.setContent(defaultContent);
    }
    
    // Open the info window at the marker position
    infoWindow.setPosition(position);
    infoWindow.open(mapInstance);
    
    // Center map on the selected marker
    mapInstance.panTo(position);
  }, [mapInstance, infoWindow, selectedShift, renderInfoContent]);
  
  // Close info window programmatically
  const closeInfoWindow = useCallback(() => {
    if (infoWindow) {
      infoWindow.close();
      setInfoWindowContent(null);
    }
  }, [infoWindow]);
  
  // Open info window programmatically
  const openInfoWindow = useCallback((shift: Shift, position?: google.maps.LatLng) => {
    if (!infoWindow || !mapInstance) return;
    
    // Get position from shift if not provided
    const markerPosition = position || new google.maps.LatLng(
      shift.latitude || shift.location?.latitude || 0,
      shift.longitude || shift.location?.longitude || 0
    );
    
    // Set content and open
    if (renderInfoContent && contentRef.current) {
      const content = renderInfoContent(shift);
      setInfoWindowContent(content);
      infoWindow.setContent(contentRef.current);
    }
    
    infoWindow.setPosition(markerPosition);
    infoWindow.open(mapInstance);
  }, [infoWindow, mapInstance, renderInfoContent]);
  
  // Render the actual React content into the portal
  const infoWindowPortal = infoWindowContent && infoWindowPortalRef.current
    ? createPortal(infoWindowContent, infoWindowPortalRef.current)
    : null;
  
  return {
    infoWindow,
    infoWindowRef: contentRef,
    infoWindowContent: infoWindowPortal,
    openInfoWindow,
    closeInfoWindow
  };
}; 