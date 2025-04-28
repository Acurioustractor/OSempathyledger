/**
 * Ad Blocker Detection Utilities
 * Tools to help detect and diagnose ad blockers that might block Google Maps
 */

/**
 * Result interface for ad blocker tests
 */
export interface AdBlockerTestResult {
  blocked: boolean;
  reason?: string;
}

/**
 * Test if Google Maps API is likely to be blocked by ad blockers
 * @returns Promise that resolves to AdBlockerTestResult
 */
export async function testGoogleMapsBlocker(): Promise<AdBlockerTestResult> {
  try {
    // Method 1: Test ad-like element (works with basic ad blockers)
    const adResult = await testAdBlockElement();
    if (adResult.blocked) {
      return { blocked: true, reason: 'Ad-like element was hidden' };
    }
    
    // Method 2: Test Google Analytics access (often blocked alongside Maps)
    const analyticsResult = await testGoogleAnalyticsAccess();
    if (analyticsResult.blocked) {
      return { blocked: true, reason: 'Google Analytics domain is blocked' };
    }
    
    // Method 3: Test direct Maps API access
    const apiResult = await testGoogleMapsApiAccess();
    if (apiResult.blocked) {
      return { blocked: true, reason: 'Google Maps API domain is blocked' };
    }
    
    // Method 4: Test script element load
    const scriptResult = await testScriptElementLoad();
    if (scriptResult.blocked) {
      return { blocked: true, reason: 'Script element from Google domains was blocked' };
    }
    
    return { blocked: false };
  } catch (e) {
    console.error('Error during ad blocker detection:', e);
    return { blocked: false };
  }
}

/**
 * Test for ad blockers using an ad-like element
 */
async function testAdBlockElement(): Promise<AdBlockerTestResult> {
  return new Promise(resolve => {
    const testAd = document.createElement('div');
    testAd.innerHTML = '&nbsp;';
    testAd.className = 'adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text-ads text-ad-links google-ad';
    testAd.style.position = 'absolute';
    testAd.style.opacity = '0';
    testAd.style.pointerEvents = 'none';
    document.body.appendChild(testAd);
    
    setTimeout(() => {
      const isHidden = testAd.offsetHeight === 0 || !testAd.offsetParent;
      document.body.removeChild(testAd);
      resolve({ blocked: isHidden });
    }, 100);
  });
}

/**
 * Test if Google Analytics domain is blocked
 */
async function testGoogleAnalyticsAccess(): Promise<AdBlockerTestResult> {
  return new Promise(resolve => {
    const img = new Image();
    
    let handled = false;
    
    // Set a timeout to handle potential hangs
    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true;
        resolve({ blocked: false });
      }
    }, 1000);
    
    img.onload = () => {
      if (!handled) {
        handled = true;
        clearTimeout(timeoutId);
        resolve({ blocked: false });
      }
    };
    
    img.onerror = () => {
      if (!handled) {
        handled = true;
        clearTimeout(timeoutId);
        resolve({ blocked: true });
      }
    };
    
    // Try to load a tiny image from Google Analytics
    img.src = 'https://www.google-analytics.com/collect?v=1&t=event&tid=UA-XXXXX-Y&cid=555&ec=test&ea=test';
  });
}

/**
 * Test if Google Maps API domain is accessible
 */
async function testGoogleMapsApiAccess(): Promise<AdBlockerTestResult> {
  return new Promise(resolve => {
    let handled = false;
    
    // Set timeout to handle potential hangs
    const timeoutId = setTimeout(() => {
      if (!handled) {
        handled = true;
        resolve({ blocked: false });
      }
    }, 1000);

    try {
      fetch('https://maps.googleapis.com/maps/api/js?check=1', { 
        mode: 'no-cors',
        cache: 'no-cache' 
      })
        .then(() => {
          if (!handled) {
            handled = true;
            clearTimeout(timeoutId);
            resolve({ blocked: false });
          }
        })
        .catch(() => {
          if (!handled) {
            handled = true;
            clearTimeout(timeoutId);
            resolve({ blocked: true });
          }
        });
    } catch (e) {
      if (!handled) {
        handled = true;
        clearTimeout(timeoutId);
        resolve({ blocked: true });
      }
    }
  });
}

/**
 * Test if script elements from Google domains are blocked
 */
async function testScriptElementLoad(): Promise<AdBlockerTestResult> {
  return new Promise(resolve => {
    const testScript = document.createElement('script');
    testScript.src = 'https://maps.googleapis.com/maps/api/js?key=test&callback=testGoogleMapsCallback';
    
    // Set up a global callback function
    const callbackName = 'testGoogleMapsCallback_' + Date.now();
    (window as GoogleMapsWindow)[callbackName] = () => {
      cleanup();
      resolve({ blocked: false });
    };
    
    // Set a timeout to check if the callback was blocked
    const startTime = Date.now();
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve({ blocked: false });
    }, 1000);
    
    // Error handler will fire quickly if blocked
    testScript.onerror = () => {
      // Ad blockers typically block instantly
      // Real API errors would normally take longer
      const isLikelyAdBlocker = Date.now() - startTime < 100;
      cleanup();
      resolve({ blocked: isLikelyAdBlocker });
    };
    
    // Clean up function
    const cleanup = () => {
      clearTimeout(timeoutId);
      delete (window as GoogleMapsWindow)[callbackName];
      try {
        document.head.removeChild(testScript);
      } catch (e) {
        // Ignore cleanup errors
      }
    };
    
    document.head.appendChild(testScript);
  });
}

/**
 * Check if Google Maps is already loaded in the window
 */
export function isGoogleMapsLoaded(): boolean {
  return typeof window !== 'undefined' && 
    typeof window.google !== 'undefined' && 
    typeof window.google.maps !== 'undefined';
}

/**
 * Diagnostics tools for mapping applications
 */
interface MapDiagnostics {
  runAdBlockerDiagnostics: () => void;
  testGoogleMapsBlocker: () => Promise<AdBlockerTestResult>;
  isGoogleMapsLoaded: () => boolean;
}

/**
 * Helper function for advanced diagnostics
 * This can be called from the console to help diagnose blocking issues
 */
export function runAdBlockerDiagnostics(): void {
  console.group('Ad Blocker Diagnostics for Google Maps');
  
  testAdBlockElement()
    .then(result => console.log('Ad Blocker Element Test:', result.blocked ? '❌ Blocked' : '✅ Not blocked'));
  
  testGoogleAnalyticsAccess()
    .then(result => console.log('Google Analytics Access Test:', result.blocked ? '❌ Blocked' : '✅ Not blocked'));
  
  testGoogleMapsApiAccess()
    .then(result => console.log('Google Maps API Access Test:', result.blocked ? '❌ Blocked' : '✅ Not blocked'));
  
  testScriptElementLoad()
    .then(result => console.log('Script Element Load Test:', result.blocked ? '❌ Blocked' : '✅ Not blocked'));
  
  // Check if Google Maps is already loaded
  console.log('Is Google Maps Loaded:', isGoogleMapsLoaded() ? '✅ Yes' : '❌ No');
  
  console.groupEnd();
}

// Make diagnostics available on the window for debugging
if (typeof window !== 'undefined') {
  (window as GoogleMapsWindow)['mapDiagnostics'] = {
    runAdBlockerDiagnostics,
    testGoogleMapsBlocker,
    isGoogleMapsLoaded
  };
}

// Add type definition for the global window object
interface GoogleMapsWindow extends Window {
  google?: {
    maps?: any;
  };
  mapDiagnostics?: MapDiagnostics;
  [callbackName: string]: unknown;
} 