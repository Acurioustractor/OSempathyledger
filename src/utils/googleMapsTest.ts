/**
 * Google Maps API Test Utility
 * 
 * This script tests if the Google Maps API is accessible and the API key is valid.
 * Run this function from any component or the console to verify Google Maps connectivity.
 */

import googleMapsLoader from '../services/googleMapsLoader';

// Get API key from environment variables
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/**
 * Test if the Google Maps API is accessible and the API key is valid
 */
export async function testGoogleMapsAPI(): Promise<{
  success: boolean;
  error?: string;
  details?: Record<string, any>;
}> {
  console.log('Testing Google Maps API accessibility...');
  
  // Check if API key exists
  if (!GOOGLE_MAPS_API_KEY) {
    console.error('Google Maps API key is missing');
    return {
      success: false,
      error: 'API key is missing. Please set VITE_GOOGLE_MAPS_API_KEY in your environment variables.'
    };
  }
  
  // Log masked API key for debugging (showing only first and last 4 chars)
  const maskedKey = GOOGLE_MAPS_API_KEY.length > 8 
    ? `${GOOGLE_MAPS_API_KEY.substring(0, 4)}...${GOOGLE_MAPS_API_KEY.substring(GOOGLE_MAPS_API_KEY.length - 4)}`
    : '********';
  console.log(`Using API key: ${maskedKey}`);
  
  try {
    // Test a simple geocoding request to validate the API key and access
    const testAddress = 'Sydney, Australia';
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${GOOGLE_MAPS_API_KEY}`;
    
    console.log(`Sending test request to Google Maps Geocoding API...`);
    const response = await fetch(geocodeUrl);
    const data = await response.json();
    
    if (data.status === 'OK') {
      console.log('✅ Google Maps API is accessible and API key is valid!');
      return {
        success: true,
        details: {
          message: 'Google Maps API is accessible and API key is valid',
          apiStatus: data.status
        }
      };
    } else if (data.status === 'REQUEST_DENIED' && data.error_message?.includes('API key')) {
      console.error('❌ API key is invalid or restricted:', data.error_message);
      return {
        success: false,
        error: 'API key is invalid or has restrictions',
        details: {
          apiStatus: data.status,
          errorMessage: data.error_message
        }
      };
    } else {
      console.error('❌ Google Maps API returned an error:', data);
      return {
        success: false,
        error: `Google Maps API returned an error: ${data.status}`,
        details: {
          apiStatus: data.status,
          errorMessage: data.error_message
        }
      };
    }
  } catch (error) {
    console.error('❌ Error accessing Google Maps API:', error);
    return {
      success: false,
      error: `Network error when accessing Google Maps API: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

/**
 * Test if the Google Maps JavaScript API is accessible using the global loader
 */
export async function testGoogleMapsJsAPI(): Promise<{
  success: boolean;
  error?: string;
}> {
  console.log('Testing Google Maps JavaScript API accessibility...');
  
  try {
    // Use the global loader instead of creating a new script
    await googleMapsLoader.load();
    
    // If we get here, the API has loaded successfully
    if (window.google && window.google.maps) {
      console.log('✅ Google Maps JavaScript API loaded successfully!');
      return {
        success: true
      };
    } else {
      console.error('❌ Google Maps object not found on window');
      return {
        success: false,
        error: 'Google Maps object not found on window after script loaded'
      };
    }
  } catch (error) {
    console.error('❌ Error loading Google Maps JavaScript API:', error);
    return {
      success: false,
      error: `Error: ${error instanceof Error ? error.message : String(error)}`
    };
  }
}

// Export a function to run both tests
export async function runGoogleMapsTests() {
  console.group('🗺️ Google Maps API Tests');
  
  // Test REST API
  const restResult = await testGoogleMapsAPI();
  
  // Test JavaScript API
  const jsResult = await testGoogleMapsJsAPI();
  
  console.log('Results summary:');
  console.log(`- REST API: ${restResult.success ? '✅ Accessible' : '❌ Failed'}`);
  console.log(`- JavaScript API: ${jsResult.success ? '✅ Accessible' : '❌ Failed'}`);
  
  console.groupEnd();
  
  return {
    restApiTest: restResult,
    jsApiTest: jsResult,
    allTestsPassed: restResult.success && jsResult.success
  };
}

// If this file is imported directly, export the test functions
export default runGoogleMapsTests; 