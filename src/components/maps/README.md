# Map Component Library

This directory contains a standardized set of components and hooks for displaying Google Maps in the Empathy Ledger application.

## Overview

The map component library provides a consistent interface for displaying shifts and stories on Google Maps. It includes:

- **Main components** - Ready-to-use map implementations
- **Hooks** - Reusable logic for maps, markers, and info windows
- **UI Components** - Smaller UI elements used by the main components
- **Utilities** - Helper functions for markers and other map features

## Components

### `MapView`

**The recommended component for most use cases.** Displays a map with a searchable list of shifts.

```tsx
import { MapView } from '../components/maps';

<MapView 
  shifts={shiftsData}
  selectedShiftId={selectedId}
  onShiftSelect={handleSelectShift}
/>
```

### `GoogleMap`

A simpler map component without the list view. Use this when you need more control over the map display.

```tsx
import { GoogleMap } from '../components/maps';

<GoogleMap 
  shifts={shiftsData}
  selectedShiftId={selectedId}
  onMarkerClick={(shift) => handleSelectShift(shift.id)}
  renderInfoContent={customRenderFunction}
/>
```

### `ShiftsMap`

Advanced map component with additional features. Use this for more complex map implementations.

## Hooks

### `useGoogleMapsLoader`

Handles loading the Google Maps API with error handling for missing API keys and ad blockers.

```tsx
const { isLoaded, isLoading, loadError, isBlocked } = useGoogleMapsLoader();
```

### `useMapMarkers`

Creates and manages map markers with clustering for better performance.

```tsx
const { markers, clusterer, isLoading } = useMapMarkers({
  mapInstance,
  shifts,
  selectedShiftId,
  onMarkerClick,
});
```

### `useInfoWindow`

Handles displaying and updating info windows for selected shifts.

```tsx
useInfoWindow({
  mapInstance,
  selectedShift,
  renderInfoContent,
});
```

## Standardization Benefits

1. **Consistent API**: All map functionality follows the same patterns
2. **Improved Maintainability**: Changes to map functionality happen in one place
3. **Better Performance**: Shared hooks optimize resource usage
4. **Clearer Code Organization**: Logical structure for all map-related code

## Migrating from Legacy Map Components

The following components are deprecated and should be replaced with the new standardized components:

- `BasicMap.tsx` → Use `GoogleMap` instead
- `ShiftsMapComponent.tsx` → Use `MapView` or `ShiftsMap` instead

Example of migrating from BasicMap:

```tsx
// Before
import BasicMap from '../components/BasicMap';

<BasicMap 
  shifts={shifts}
  selectedShiftId={selectedId}
  onShiftSelect={handleShiftSelect}
/>

// After
import { GoogleMap } from '../components/maps';

<GoogleMap 
  shifts={shifts}
  selectedShiftId={selectedId}
  onMarkerClick={(shift) => handleShiftSelect(shift.id)}
/>
```

## Example Page

Visit `/map-examples` to see a demonstration of the different map components.

## Key Features

### Dynamic API Key Management

A key feature of our Google Maps implementation is the ability to change the API key at runtime without requiring a page refresh. This is particularly useful for:

- Letting users input their own API key when the default one hits quota limits
- Testing different API keys during development
- Switching between development and production API keys

### Components

- **ShiftsMapComponent**: The main map component that displays shifts on a Google Map
- **MapContainer**: A container component that ensures the map element is properly mounted
- **GoogleMapsKeyManager**: UI for managing the Google Maps API key at runtime
- **GoogleMapsTest**: A component for testing Google Maps API connectivity

### Services

- **googleMapsLoader**: A singleton service that ensures Google Maps is loaded only once

## Usage

### Basic Map Usage

```jsx
import { ShiftsMapComponent } from './components/maps';

function MyComponent() {
  return (
    <ShiftsMapComponent 
      shifts={myShifts}
      onShiftSelect={handleShiftSelect}
      selectedShiftId={selectedId}
      storyCountByShift={storyCountMap}
      stories={stories}
    />
  );
}
```

### API Key Manager

To add the API key manager to your component:

```jsx
import { GoogleMapsKeyManager } from './components/maps';

function MyComponent() {
  return (
    <div>
      {/* Compact version */}
      <GoogleMapsKeyManager 
        compact={true}
        onKeyChanged={(newKey) => {
          console.log('API key changed to:', newKey);
        }}
      />
      
      {/* Or full version */}
      <GoogleMapsKeyManager />
    </div>
  );
}
```

### Testing Google Maps API

```jsx
import { GoogleMapsTest } from './components/maps';

function TestPage() {
  return <GoogleMapsTest />;
}
```

### Directly Using the Loader

```js
import { googleMapsLoader } from './components/maps';

// Get the current API key
const currentKey = googleMapsLoader.getApiKey();

// Set a new API key without reloading
await googleMapsLoader.setApiKey('your-new-api-key');

// Set a new API key and reload Google Maps
await googleMapsLoader.setApiKey('your-new-api-key', true);

// Access Google Maps after it's loaded
const googleMaps = await googleMapsLoader.getGoogleMaps();

// Register a callback to be executed when Google Maps loads
googleMapsLoader.registerCallback(() => {
  console.log('Google Maps has loaded!');
});
```

## API Key Configuration

The default API key is loaded from environment variables:

```
VITE_GOOGLE_MAPS_API_KEY=your-api-key-here
```

When using the API key manager, the new key is stored in memory and will reset on page refresh. 
For persistent storage, you would need to store the key in localStorage or another persistent storage. 