# Empathy Ledger

A platform for authentic storytelling, impact measurement, and community engagement. Empathy Ledger helps organizations collect, visualize, and analyze stories of impact in their communities.

## Features

- **Interactive Maps**: Advanced Google Maps integration with clustering, custom markers, and optimized performance
- **Storyteller Dashboard**: Create, manage, and organize stories with rich media support
- **Story Visualization**: View stories by location, theme, tags, and other metrics
- **Search and Filter**: Find stories using various criteria including location-based search
- **Responsive Design**: Works on desktop and mobile devices
- **Performance Optimized**: Fast loading and rendering even with large datasets
- **Error Resilient**: Graceful error handling and recovery mechanisms
- **Analytics Dashboard**: Measure impact and gain insights from story data

## Interactive Maps

Our map implementation includes:

- **Marker Clustering**: Efficiently handle large numbers of locations
- **Custom Markers**: Color-coded and sized based on story count
- **Interactive Info Windows**: View story details and navigate to full content
- **Performance Optimizations**: Batch processing for smooth rendering
- **Responsive Controls**: Mobile-friendly interface
- **Error Handling**: Detect ad blockers and network issues with fallback options
- **Location Caching**: Reduce API calls for better performance

## Tech Stack

- React 18 with TypeScript
- Vite for fast development and optimized builds
- Chakra UI for responsive component library
- Google Maps API for location visualization
- Airtable for data storage and management

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Google Maps API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Acurioustractor/OSempathyledger.git
   cd OSempathyledger
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Google Maps API key:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000/

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
src/
  ├── components/    # Reusable UI components including maps
  │   ├── BasicMap.tsx             # Simple map implementation
  │   ├── MapView.tsx              # Location listing with map integration
  │   ├── ShiftsMapComponent.tsx   # Advanced map with clustering and optimizations
  │   └── ...
  ├── pages/         # Page components
  ├── services/      # API services and data management
  │   ├── airtable.ts             # Data service for Airtable integration
  │   ├── googleMapsLoader.ts     # Google Maps API loader with error handling
  │   └── ...
  ├── hooks/         # Custom React hooks
  ├── utils/         # Utility functions
  └── main.tsx       # Application entry point
```

## Map Component Usage

```tsx
// Basic usage of the enhanced map component
import { ShiftsMapComponent } from '../components/ShiftsMapComponent';

function MyLocationPage() {
  return (
    <ShiftsMapComponent 
      shifts={myLocations} 
      onShiftSelect={handleLocationSelect}
      selectedShiftId={selectedLocation}
      storyCountByShift={storyCountData}
      onShowStoryDetail={handleShowStoryDetail}
      stories={stories}
    />
  );
}
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details. 