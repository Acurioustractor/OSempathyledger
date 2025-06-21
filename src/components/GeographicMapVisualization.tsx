import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useColorModeValue,
  Button,
  ButtonGroup,
  Flex,
  Badge,
  Tooltip,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  FormControl,
  FormLabel,
  Select,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Story, Media, Storyteller } from '../types';
import AppleCard from './AppleCard';
import { 
  GlobeIcon, 
  ZoomInIcon, 
  ZoomOutIcon, 
  ScreenFullIcon,
  LocationIcon,
  PackageIcon,
} from '@primer/octicons-react';
import { performanceMonitor } from '../utils/performanceMonitor';

interface GeographicMapProps {
  stories: Story[];
  media: Media[];
  storytellers: Storyteller[];
  onLocationClick?: (location: string, items: Array<Story | Media>) => void;
  height?: number;
}

interface LocationCluster {
  location: string;
  coordinates: [number, number];
  stories: Story[];
  media: Media[];
  totalCount: number;
}

const MotionBox = motion(Box);

// Sample coordinates for Australian cities (would need real geocoding in production)
const LOCATION_COORDINATES: Record<string, [number, number]> = {
  'Brisbane': [153.0251, -27.4698],
  'Sydney': [151.2093, -33.8688],
  'Melbourne': [144.9631, -37.8136],
  'Perth': [115.8605, -31.9505],
  'Adelaide': [138.6007, -34.9285],
  'Gold Coast': [153.4000, -28.0167],
  'Cairns': [145.7781, -16.9186],
  'Darwin': [130.8456, -12.4634],
  'Hobart': [147.3272, -42.8821],
  'Canberra': [149.1300, -35.2809],
};

const GeographicMapVisualization: React.FC<GeographicMapProps> = ({
  stories,
  media,
  storytellers,
  onLocationClick,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [clusterSize, setClusterSize] = useState(50);
  const [mapStyle, setMapStyle] = useState<'satellite' | 'street' | 'terrain'>('terrain');

  const bgColor = useColorModeValue('white', 'gray.800');
  const clusterColor = useColorModeValue('#FF6B35', '#FFA500');
  const textColor = useColorModeValue('#2D3748', '#E2E8F0');
  const hoverColor = useColorModeValue('#FF8C57', '#FFB84D');

  // Process location clusters
  const locationClusters = useMemo(() => {
    performanceMonitor.startMeasure('map-clustering');
    
    const clusters = new Map<string, LocationCluster>();
    
    // Process stories
    stories.forEach(story => {
      const locations = story['Location (from Media)'] || [];
      locations.forEach(location => {
        if (!clusters.has(location)) {
          clusters.set(location, {
            location,
            coordinates: LOCATION_COORDINATES[location] || [
              150 + Math.random() * 10,
              -30 + Math.random() * 10
            ],
            stories: [],
            media: [],
            totalCount: 0,
          });
        }
        const cluster = clusters.get(location)!;
        cluster.stories.push(story);
        cluster.totalCount++;
      });
    });
    
    // Process media
    media.forEach(item => {
      if (item.Location) {
        if (!clusters.has(item.Location)) {
          clusters.set(item.Location, {
            location: item.Location,
            coordinates: LOCATION_COORDINATES[item.Location] || [
              150 + Math.random() * 10,
              -30 + Math.random() * 10
            ],
            stories: [],
            media: [],
            totalCount: 0,
          });
        }
        const cluster = clusters.get(item.Location)!;
        cluster.media.push(item);
        cluster.totalCount++;
      }
    });
    
    const clusterTime = performanceMonitor.endMeasure('map-clustering');
    console.log(`Map clustering completed in ${clusterTime.toFixed(2)}ms for ${clusters.size} locations`);
    
    return Array.from(clusters.values());
  }, [stories, media]);

  // Update dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      const { width } = containerRef.current!.getBoundingClientRect();
      setDimensions({ width, height });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [height]);

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || locationClusters.length === 0) return;

    performanceMonitor.startMeasure('map-render');

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = dimensions.width;
    const height = dimensions.height;

    // Create projection for Australia
    const projection = d3.geoMercator()
      .center([133, -27])
      .scale(width * 0.8)
      .translate([width / 2, height / 2]);

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 8])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    const g = svg.append('g');

    // Add map background (simplified for demo)
    g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', useColorModeValue('#E6F4EA', '#1A365D'))
      .attr('opacity', 0.1);

    // Create cluster groups
    const clusters = g.selectAll('.cluster')
      .data(locationClusters)
      .enter()
      .append('g')
      .attr('class', 'cluster')
      .attr('transform', d => {
        const coords = projection(d.coordinates);
        return coords ? `translate(${coords[0]},${coords[1]})` : '';
      })
      .style('cursor', 'pointer');

    // Add cluster circles
    clusters.append('circle')
      .attr('r', d => Math.sqrt(d.totalCount) * clusterSize / 10)
      .attr('fill', clusterColor)
      .attr('fill-opacity', 0.6)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', hoverColor)
          .attr('r', d => Math.sqrt(d.totalCount) * clusterSize / 10 + 5);
        setSelectedLocation(d.location);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', clusterColor)
          .attr('r', d => Math.sqrt(d.totalCount) * clusterSize / 10);
        setSelectedLocation(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        if (onLocationClick) {
          onLocationClick(d.location, [...d.stories, ...d.media]);
        }
      });

    // Add cluster labels
    clusters.append('text')
      .text(d => d.totalCount.toString())
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => Math.min(16, Math.sqrt(d.totalCount) * 4))
      .attr('font-weight', 'bold')
      .attr('fill', '#fff')
      .attr('pointer-events', 'none');

    // Add location names
    clusters.append('text')
      .text(d => d.location)
      .attr('text-anchor', 'middle')
      .attr('dy', d => Math.sqrt(d.totalCount) * clusterSize / 10 + 20)
      .attr('font-size', '12px')
      .attr('fill', textColor)
      .attr('pointer-events', 'none')
      .style('display', d => d.totalCount > 5 ? 'block' : 'none');

    // Add connection lines between frequently connected locations
    const connections: Array<{source: LocationCluster, target: LocationCluster, strength: number}> = [];
    
    // Find connections based on shared stories/storytellers
    locationClusters.forEach((source, i) => {
      locationClusters.slice(i + 1).forEach(target => {
        const sharedStories = source.stories.filter(s => 
          target.stories.some(t => t.id === s.id)
        ).length;
        
        if (sharedStories > 0) {
          connections.push({ source, target, strength: sharedStories });
        }
      });
    });

    // Draw connection lines
    g.selectAll('.connection')
      .data(connections)
      .enter()
      .insert('line', '.cluster')
      .attr('class', 'connection')
      .attr('x1', d => projection(d.source.coordinates)?.[0] || 0)
      .attr('y1', d => projection(d.source.coordinates)?.[1] || 0)
      .attr('x2', d => projection(d.target.coordinates)?.[0] || 0)
      .attr('y2', d => projection(d.target.coordinates)?.[1] || 0)
      .attr('stroke', useColorModeValue('#CBD5E0', '#4A5568'))
      .attr('stroke-width', d => Math.sqrt(d.strength))
      .attr('stroke-opacity', 0.3)
      .attr('stroke-dasharray', '2,2');

    // Zoom controls
    const handleZoomIn = () => {
      svg.transition().duration(300).call(zoomBehavior.scaleBy, 1.3);
    };

    const handleZoomOut = () => {
      svg.transition().duration(300).call(zoomBehavior.scaleBy, 0.7);
    };

    const handleZoomReset = () => {
      svg.transition().duration(300).call(zoomBehavior.transform, d3.zoomIdentity);
    };

    // Store handlers for external use
    (window as any).__mapVizHandlers = { handleZoomIn, handleZoomOut, handleZoomReset };

    const renderTime = performanceMonitor.endMeasure('map-render');
    console.log(`Map render took ${renderTime.toFixed(2)}ms`);

    return () => {
      delete (window as any).__mapVizHandlers;
    };
  }, [locationClusters, dimensions, clusterSize, clusterColor, textColor, hoverColor, onLocationClick]);

  const handleZoomIn = () => {
    if ((window as any).__mapVizHandlers) {
      (window as any).__mapVizHandlers.handleZoomIn();
    }
  };

  const handleZoomOut = () => {
    if ((window as any).__mapVizHandlers) {
      (window as any).__mapVizHandlers.handleZoomOut();
    }
  };

  const handleZoomReset = () => {
    if ((window as any).__mapVizHandlers) {
      (window as any).__mapVizHandlers.handleZoomReset();
    }
  };

  const selectedCluster = selectedLocation 
    ? locationClusters.find(c => c.location === selectedLocation)
    : null;

  return (
    <AppleCard variant="elevated" p={0} overflow="hidden">
      <VStack align="stretch" spacing={0}>
        <Flex justify="space-between" align="center" p={4} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <VStack align="start" spacing={1}>
            <Heading size="md">Geographic Distribution</Heading>
            <Text fontSize="sm" color="gray.500">
              {locationClusters.length} locations with content
            </Text>
          </VStack>
          
          <HStack spacing={4}>
            <FormControl display="flex" alignItems="center" maxW="150px">
              <FormLabel fontSize="sm" mb="0" mr={2}>Style:</FormLabel>
              <Select 
                size="sm" 
                value={mapStyle} 
                onChange={(e) => setMapStyle(e.target.value as any)}
              >
                <option value="terrain">Terrain</option>
                <option value="satellite">Satellite</option>
                <option value="street">Street</option>
              </Select>
            </FormControl>
            
            <ButtonGroup size="sm" isAttached variant="outline">
              <Tooltip label="Zoom In">
                <IconButton
                  aria-label="Zoom in"
                  icon={<ZoomInIcon />}
                  onClick={handleZoomIn}
                />
              </Tooltip>
              <Tooltip label="Zoom Out">
                <IconButton
                  aria-label="Zoom out"
                  icon={<ZoomOutIcon />}
                  onClick={handleZoomOut}
                />
              </Tooltip>
              <Tooltip label="Reset View">
                <IconButton
                  aria-label="Reset view"
                  icon={<ScreenFullIcon />}
                  onClick={handleZoomReset}
                />
              </Tooltip>
            </ButtonGroup>
            
            <Badge colorScheme="gray">
              {Math.round(zoom * 100)}%
            </Badge>
          </HStack>
        </Flex>

        <Box p={4} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <FormControl>
            <FormLabel fontSize="sm">Cluster Size: {clusterSize}</FormLabel>
            <Slider
              value={clusterSize}
              onChange={setClusterSize}
              min={20}
              max={100}
              step={10}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
            </Slider>
          </FormControl>
        </Box>

        <Box ref={containerRef} position="relative" bg={bgColor}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ cursor: 'grab' }}
          />
          
          <AnimatePresence>
            {selectedCluster && (
              <MotionBox
                position="absolute"
                bottom={4}
                left={4}
                bg={useColorModeValue('white', 'gray.800')}
                p={4}
                borderRadius="md"
                shadow="lg"
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                maxW="300px"
              >
                <VStack align="start" spacing={2}>
                  <HStack>
                    <Icon as={LocationIcon} color="orange.500" />
                    <Heading size="sm">{selectedCluster.location}</Heading>
                  </HStack>
                  
                  <HStack spacing={4} fontSize="sm">
                    <HStack spacing={1}>
                      <Icon as={PackageIcon} />
                      <Text>{selectedCluster.stories.length} stories</Text>
                    </HStack>
                    <HStack spacing={1}>
                      <Icon as={GlobeIcon} />
                      <Text>{selectedCluster.media.length} media items</Text>
                    </HStack>
                  </HStack>
                  
                  {onLocationClick && (
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={() => onLocationClick(
                        selectedCluster.location,
                        [...selectedCluster.stories, ...selectedCluster.media]
                      )}
                    >
                      Explore Location
                    </Button>
                  )}
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </VStack>
    </AppleCard>
  );
};

export default GeographicMapVisualization;