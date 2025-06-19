import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Image,
  Icon,
} from '@chakra-ui/react'
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api'
import { useState, useEffect, useMemo } from 'react'
import { FiMapPin, FiUsers, FiCamera, FiHeart } from 'react-icons/fi'
import { fetchStories, fetchShifts, fetchMedia, fetchStorytellers } from '../services/dataService'
import { Story, Shift, Media, Storyteller } from '../services/airtable'

interface StoryMapProps {
  height?: string
  showControls?: boolean
  selectedStoryId?: string
  onStorySelect?: (story: Story) => void
}

interface StoryMarker {
  story: Story
  shift: Shift
  position: { lat: number; lng: number }
  storytellers: Storyteller[]
  media: Media[]
}

const StoryMap = ({ 
  height = '500px', 
  showControls = true,
  selectedStoryId,
  onStorySelect 
}: StoryMapProps) => {
  const [stories, setStories] = useState<Story[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMarker, setSelectedMarker] = useState<StoryMarker | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: -35.2809, lng: 149.1300 }) // Canberra default

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [storiesData, shiftsData, mediaData, storytellersData] = await Promise.all([
          fetchStories(),
          fetchShifts(),
          fetchMedia(),
          fetchStorytellers()
        ])
        
        setStories(storiesData)
        setShifts(shiftsData)
        setMedia(mediaData)
        setStorytellers(storytellersData)
      } catch (error) {
        console.error('Error loading map data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Create story markers with geographic data
  const storyMarkers = useMemo<StoryMarker[]>(() => {
    if (!stories.length || !shifts.length) return []

    const markers: StoryMarker[] = []

    stories.forEach(story => {
      // Find associated shift
      const shiftId = story.Shifts?.[0]
      if (!shiftId) return

      const shift = shifts.find(s => s.id === shiftId)
      if (!shift || typeof shift.latitude !== 'number' || typeof shift.longitude !== 'number') {
        return
      }

      // Find associated storytellers through media
      const storyMedia = story.Media ? 
        story.Media.map(mediaId => media.find(m => m.id === mediaId)).filter(Boolean) as Media[] : 
        []

      const storytellerIds = new Set<string>()
      storyMedia.forEach(m => {
        if (m.Storytellers) {
          m.Storytellers.forEach(id => storytellerIds.add(id))
        }
      })

      const storyStorytellers = Array.from(storytellerIds)
        .map(id => storytellers.find(s => s.id === id))
        .filter(Boolean) as Storyteller[]

      markers.push({
        story,
        shift,
        position: { lat: shift.latitude, lng: shift.longitude },
        storytellers: storyStorytellers,
        media: storyMedia
      })
    })

    return markers
  }, [stories, shifts, media, storytellers])

  // Update map center when markers are available
  useEffect(() => {
    if (storyMarkers.length > 0) {
      // Calculate center of all markers
      const totalLat = storyMarkers.reduce((sum, marker) => sum + marker.position.lat, 0)
      const totalLng = storyMarkers.reduce((sum, marker) => sum + marker.position.lng, 0)
      setMapCenter({
        lat: totalLat / storyMarkers.length,
        lng: totalLng / storyMarkers.length
      })
    }
  }, [storyMarkers])

  const handleMarkerClick = (marker: StoryMarker) => {
    setSelectedMarker(marker)
    if (onStorySelect) {
      onStorySelect(marker.story)
    }
  }

  const getMarkerIcon = (marker: StoryMarker) => {
    // Color based on story themes or media count
    const mediaCount = marker.media.length
    const storytellerCount = marker.storytellers.length
    
    if (storytellerCount > 2) return '#ff6b0a' // Orange for high engagement
    if (mediaCount > 3) return '#38bdf8' // Blue for media-rich stories
    return '#22c55e' // Green for standard stories
  }

  const mapContainerStyle = {
    width: '100%',
    height: height
  }

  const mapOptions = {
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }]
      }
    ]
  }

  if (loading) {
    return (
      <Box height={height} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="lg" color="orangeSky.primary" />
          <Text>Loading story locations...</Text>
        </VStack>
      </Box>
    )
  }

  if (!import.meta.env.VITE_GOOGLE_MAPS_API_KEY) {
    return (
      <Alert status="warning">
        <AlertIcon />
        <Box>
          <Text fontWeight="medium">Google Maps API Key Required</Text>
          <Text fontSize="sm">Please add your Google Maps API key to environment variables.</Text>
        </Box>
      </Alert>
    )
  }

  return (
    <Box>
      {showControls && (
        <VStack spacing={4} mb={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="md">Story Locations</Heading>
              <Text color="gray.600" fontSize="sm">
                {storyMarkers.length} stories mapped across {new Set(storyMarkers.map(m => m.shift.Name)).size} locations
              </Text>
            </Box>
            <HStack spacing={2}>
              <Badge colorScheme="green">Standard</Badge>
              <Badge colorScheme="blue">Media Rich</Badge>
              <Badge colorScheme="orange">High Engagement</Badge>
            </HStack>
          </Flex>
        </VStack>
      )}

      <Box position="relative" borderRadius="lg" overflow="hidden" border="1px" borderColor={borderColor}>
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={mapCenter}
            zoom={12}
            options={mapOptions}
          >
            {storyMarkers.map((marker, index) => (
              <Marker
                key={`${marker.story.id}-${index}`}
                position={marker.position}
                onClick={() => handleMarkerClick(marker)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: getMarkerIcon(marker),
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 2,
                  scale: 8
                }}
              />
            ))}

            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <Box p={2} maxW="300px">
                  <VStack spacing={3} align="stretch">
                    {/* Story Title */}
                    <Box>
                      <Text fontWeight="bold" fontSize="md" color="gray.800">
                        {selectedMarker.story.Title}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        <Icon as={FiMapPin} mr={1} />
                        {selectedMarker.shift.Name}
                      </Text>
                    </Box>

                    {/* Story Image if available */}
                    {selectedMarker.story['Story Image']?.[0]?.url && (
                      <Box>
                        <Image
                          src={selectedMarker.story['Story Image'][0].url}
                          alt={selectedMarker.story.Title}
                          borderRadius="md"
                          maxH="120px"
                          objectFit="cover"
                          w="100%"
                        />
                      </Box>
                    )}

                    {/* Story summary */}
                    {selectedMarker.story['Story copy'] && (
                      <Text fontSize="sm" color="gray.700" noOfLines={3}>
                        {selectedMarker.story['Story copy']}
                      </Text>
                    )}

                    {/* Metrics */}
                    <HStack spacing={4} fontSize="xs">
                      <HStack>
                        <Icon as={FiUsers} />
                        <Text>{selectedMarker.storytellers.length} storytellers</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiCamera} />
                        <Text>{selectedMarker.media.length} media</Text>
                      </HStack>
                    </HStack>

                    {/* View button */}
                    <Button
                      size="sm"
                      colorScheme="brand"
                      onClick={() => {
                        if (onStorySelect) {
                          onStorySelect(selectedMarker.story)
                        }
                        setSelectedMarker(null)
                      }}
                    >
                      View Full Story
                    </Button>
                  </VStack>
                </Box>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </Box>

      {showControls && (
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" mt={4}>
          <CardBody>
            <Heading size="sm" mb={3}>Map Statistics</Heading>
            <HStack spacing={6} fontSize="sm">
              <VStack spacing={1}>
                <Text fontWeight="medium">{storyMarkers.length}</Text>
                <Text color="gray.600">Total Stories</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontWeight="medium">{new Set(storyMarkers.map(m => m.shift.Name)).size}</Text>
                <Text color="gray.600">Locations</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontWeight="medium">
                  {storyMarkers.reduce((sum, m) => sum + m.storytellers.length, 0)}
                </Text>
                <Text color="gray.600">Storytellers</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontWeight="medium">
                  {storyMarkers.reduce((sum, m) => sum + m.media.length, 0)}
                </Text>
                <Text color="gray.600">Media Items</Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      )}
    </Box>
  )
}

export default StoryMap