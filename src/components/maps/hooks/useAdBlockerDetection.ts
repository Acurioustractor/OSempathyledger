import { useState, useEffect } from 'react';
import { testGoogleMapsBlocker, isGoogleMapsLoaded } from '../utils/adBlockerDetection';

export interface UseAdBlockerDetectionOptions {
  /**
   * Whether to run detection on mount
   * @default true
   */
  detectOnMount?: boolean;
  
  /**
   * Whether to skip detection if Google Maps is already loaded
   * @default true
   */
  skipIfMapsLoaded?: boolean;
  
  /**
   * Debug mode logs detection results
   * @default false
   */
  debug?: boolean;
}

export interface UseAdBlockerDetectionResult {
  /**
   * Whether an ad blocker is detected that might impact Google Maps
   */
  isDetected: boolean;
  
  /**
   * Reason why the ad blocker was detected (if available)
   */
  reason?: string;
  
  /**
   * Whether detection is currently running
   */
  isDetecting: boolean;
  
  /**
   * Run the detection manually
   */
  detectAdBlocker: () => Promise<{ isDetected: boolean; reason?: string }>;
  
  /**
   * Whether the detection has completed at least once
   */
  hasDetected: boolean;
}

/**
 * Hook to detect ad blockers that might impact Google Maps
 * Currently disabled to avoid false positives
 */
export function useAdBlockerDetection(options: UseAdBlockerDetectionOptions = {}): UseAdBlockerDetectionResult {
  // Always return not detected to bypass the warnings
  return {
    isDetected: false,
    reason: undefined,
    isDetecting: false,
    detectAdBlocker: async () => ({ isDetected: false }),
    hasDetected: true
  };

  /* Original implementation disabled
  const { 
    detectOnMount = true,
    skipIfMapsLoaded = true,
    debug = false
  } = options;
  
  const [isDetected, setIsDetected] = useState(false);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const [isDetecting, setIsDetecting] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);
  
  const detectAdBlocker = async () => {
    // Skip if Google Maps is already loaded and skipIfMapsLoaded is true
    if (skipIfMapsLoaded && isGoogleMapsLoaded()) {
      if (debug) {
        console.log('[AdBlockerDetection] Skipping detection - Google Maps already loaded');
      }
      return { isDetected: false };
    }
    
    setIsDetecting(true);
    
    try {
      const result = await testGoogleMapsBlocker();
      
      if (debug) {
        console.log('[AdBlockerDetection] Detection result:', result);
      }
      
      setIsDetected(result.blocked);
      setReason(result.reason);
      setHasDetected(true);
      
      return { 
        isDetected: result.blocked,
        reason: result.reason
      };
    } catch (error) {
      console.error('[AdBlockerDetection] Error during detection:', error);
      return { isDetected: false };
    } finally {
      setIsDetecting(false);
    }
  };
  
  useEffect(() => {
    if (detectOnMount) {
      detectAdBlocker();
    }
  }, [detectOnMount]);
  
  return {
    isDetected,
    reason,
    isDetecting,
    detectAdBlocker,
    hasDetected
  };
  */
}

// Add type definition for the global callback
declare global {
  interface Window {
    testGoogleMapsCallback: () => void;
  }
} 