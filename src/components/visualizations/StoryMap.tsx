import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from '@christopherpickering/react-leaflet-markercluster';
import '@christopherpickering/react-leaflet-markercluster/dist/styles.min.css';
import { Story, Media } from '../../types';
import { cachedDataService } from '../../services/cachedDataService';
import { useFilterStore } from '../../store/filterStore';
import { Box } from '@chakra-ui/react';

// Fix for default icon issue with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

type LocationPoint = (Story | Media) & {
    Latitude: number;
    Longitude: number;
};

const StoryMap: React.FC = () => {
    const { selectedThemes, selectedStorytellers, dateRange } = useFilterStore();

    const locations = useMemo(() => {
        let stories = cachedDataService.getAllStoriesSync();
        let media = cachedDataService.getAllMediaSync();

        if (selectedThemes.length > 0) {
            const selectedThemeIds = new Set(selectedThemes.map(t => t.id));
            stories = stories.filter(story =>
                story['Themes']?.some(themeId => selectedThemeIds.has(themeId))
            );
            media = media.filter(m => {
                const story = cachedDataService.getStoryByIdSync(m['StoryID']?.[0]);
                return story && story['Themes']?.some(themeId => selectedThemeIds.has(themeId));
            });
        }

        if (selectedStorytellers.length > 0) {
            const selectedStorytellerIds = new Set(selectedStorytellers.map(st => st.id));
            stories = stories.filter(story =>
                story['All Storytellers']?.some(storytellerId => selectedStorytellerIds.has(storytellerId))
            );
            media = media.filter(m => {
                const story = cachedDataService.getStoryByIdSync(m['StoryID']?.[0]);
                return story && story['All Storytellers']?.some(storytellerId => selectedStorytellerIds.has(storytellerId));
            });
        }

        if (dateRange.startDate && dateRange.endDate) {
            stories = stories.filter(story => {
                if (!story['Date']) return false;
                const storyDate = new Date(story['Date']);
                return storyDate >= dateRange.startDate! && storyDate <= dateRange.endDate!;
            });
            media = media.filter(m => {
                const story = cachedDataService.getStoryByIdSync(m['StoryID']?.[0]);
                if (!story || !story['Date']) return false;
                const storyDate = new Date(story['Date']);
                return storyDate >= dateRange.startDate! && storyDate <= dateRange.endDate!;
            });
        }

        const allItems = [...stories, ...media];

        return allItems.filter(
            (item): item is LocationPoint =>
              item.Latitude != null && item.Longitude != null
          );

    }, [selectedThemes, selectedStorytellers, dateRange]);


  if (locations.length === 0) {
    return <Box>No locations match the current filters.</Box>;
  }

  const center: [number, number] = [
    locations[0].Latitude,
    locations[0].Longitude,
  ];

  return (
    <Box height="500px" width="100%">
      <MapContainer center={center} zoom={6} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MarkerClusterGroup>
            {locations.map((item) => (
              <Marker key={item.id} position={[item.Latitude, item.Longitude]}>
                <Popup>
                  {item.Title} <br />
                  {'Type' in item ? `(${item.Type})` : ''}
                </Popup>
              </Marker>
            ))}
        </MarkerClusterGroup>
      </MapContainer>
    </Box>
  );
};

export default StoryMap; 