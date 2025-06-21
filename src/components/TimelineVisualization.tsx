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
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Story, Media } from '../types';
import AppleCard from './AppleCard';
import { CalendarIcon, LocationIcon, ZoomInIcon, ZoomOutIcon, PlayIcon } from '@primer/octicons-react';
import { performanceMonitor, debounce } from '../utils/performanceMonitor';

interface TimelineVisualizationProps {
  stories: Story[];
  media: Media[];
  onStoryClick?: (storyId: string) => void;
  height?: number;
}

interface TimelineEvent {
  id: string;
  title: string;
  date: Date;
  location?: string;
  mediaCount: number;
  type: 'story' | 'media';
}

const MotionBox = motion(Box);

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({
  stories,
  media,
  onStoryClick,
  height = 400,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [timeRange, setTimeRange] = useState<[number, number]>([0, 100]);
  const [viewMode, setViewMode] = useState<'month' | 'year' | 'all'>('year');
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);

  const bgColor = useColorModeValue('white', 'gray.800');
  const lineColor = useColorModeValue('#CBD5E0', '#4A5568');
  const eventColor = useColorModeValue('#FF6B35', '#FFA500');
  const textColor = useColorModeValue('#2D3748', '#E2E8F0');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');

  // Process timeline events
  const { events, dateExtent } = useMemo(() => {
    performanceMonitor.startMeasure('timeline-process');
    
    const events: TimelineEvent[] = [];
    
    // Add stories to timeline
    stories.forEach(story => {
      const storyDate = story['Publication date'] || story.Created;
      if (storyDate) {
        events.push({
          id: story.id,
          title: story.Title,
          date: new Date(storyDate),
          location: story['Location (from Media)']?.[0],
          mediaCount: story.Media?.length || 0,
          type: 'story',
        });
      }
    });

    // Add media to timeline if they have dates
    media.forEach(item => {
      if (item['Date created']) {
        events.push({
          id: item.id,
          title: item.Name || 'Untitled Media',
          date: new Date(item['Date created']),
          location: item.Location,
          mediaCount: 1,
          type: 'media',
        });
      }
    });

    // Sort by date
    events.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Calculate date extent
    const dates = events.map(e => e.date);
    const dateExtent = dates.length > 0 
      ? [d3.min(dates)!, d3.max(dates)!]
      : [new Date(), new Date()];

    const renderTime = performanceMonitor.endMeasure('timeline-process');
    console.log(`Timeline processing took ${renderTime.toFixed(2)}ms for ${events.length} events`);

    return { events, dateExtent };
  }, [stories, media]);

  // Filter events based on time range
  const filteredEvents = useMemo(() => {
    const [start, end] = timeRange;
    const timeScale = d3.scaleTime()
      .domain(dateExtent)
      .range([0, 100]);
    
    const startDate = timeScale.invert(start);
    const endDate = timeScale.invert(end);
    
    return events.filter(event => 
      event.date >= startDate && event.date <= endDate
    );
  }, [events, dateExtent, timeRange]);

  // Update dimensions
  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      const { width } = containerRef.current!.getBoundingClientRect();
      setDimensions({ width, height });
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(debounce(updateDimensions, 300));
    resizeObserver.observe(containerRef.current);
    
    return () => resizeObserver.disconnect();
  }, [height]);

  // Main visualization effect
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0 || filteredEvents.length === 0) return;

    performanceMonitor.startMeasure('timeline-render');

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(filteredEvents, d => d.date) as [Date, Date])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, 1])
      .range([height, 0]);

    // Create time axis with appropriate ticks based on view mode
    const xAxis = d3.axisBottom(xScale);
    
    switch (viewMode) {
      case 'month':
        xAxis.ticks(d3.timeMonth.every(1));
        break;
      case 'year':
        xAxis.ticks(d3.timeYear.every(1));
        break;
      default:
        xAxis.ticks(10);
    }

    // Add grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis
        .tickSize(-height)
        .tickFormat(() => '')
      )
      .style('stroke-dasharray', '3,3')
      .style('opacity', 0.3)
      .style('stroke', gridColor);

    // Add x axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('fill', textColor)
      .style('text-anchor', 'end')
      .attr('dx', '-.8em')
      .attr('dy', '.15em')
      .attr('transform', 'rotate(-45)');

    // Add timeline line
    g.append('line')
      .attr('x1', 0)
      .attr('x2', width)
      .attr('y1', height / 2)
      .attr('y2', height / 2)
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);

    // Group events by date for stacking
    const eventsByDate = d3.group(filteredEvents, d => d.date.toISOString());
    const stackedEvents: Array<TimelineEvent & { stackIndex: number }> = [];
    
    eventsByDate.forEach((eventsOnDate, date) => {
      eventsOnDate.forEach((event, index) => {
        stackedEvents.push({
          ...event,
          stackIndex: index,
        });
      });
    });

    // Add events with optimized rendering
    const eventGroups = g.selectAll('.event')
      .data(stackedEvents, d => d.id)
      .enter()
      .append('g')
      .attr('class', 'event')
      .attr('transform', d => `translate(${xScale(d.date)},${height / 2 - d.stackIndex * 30})`)
      .style('cursor', 'pointer');

    // Add event circles
    eventGroups.append('circle')
      .attr('r', d => d.type === 'story' ? 8 : 6)
      .attr('fill', eventColor)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseenter', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.type === 'story' ? 12 : 9);
        setHoveredEvent(d.id);
      })
      .on('mouseleave', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.type === 'story' ? 8 : 6);
        setHoveredEvent(null);
      })
      .on('click', (event, d) => {
        event.stopPropagation();
        setSelectedEvent(d.id);
        if (d.type === 'story' && onStoryClick) {
          onStoryClick(d.id);
        }
      });

    // Add connecting lines
    eventGroups.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', d => d.stackIndex * 30)
      .attr('stroke', lineColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,2');

    // Add labels for larger events
    if (filteredEvents.length < 50) {
      eventGroups.append('text')
        .text(d => d.title.substring(0, 20) + (d.title.length > 20 ? '...' : ''))
        .attr('x', 10)
        .attr('y', 5)
        .attr('font-size', '12px')
        .attr('fill', textColor)
        .style('pointer-events', 'none');
    }

    const renderTime = performanceMonitor.endMeasure('timeline-render');
    console.log(`Timeline render took ${renderTime.toFixed(2)}ms`);

  }, [filteredEvents, dimensions, viewMode, eventColor, lineColor, textColor, gridColor, onStoryClick]);

  const selectedEventData = selectedEvent 
    ? events.find(e => e.id === selectedEvent) 
    : null;

  const hoveredEventData = hoveredEvent 
    ? events.find(e => e.id === hoveredEvent) 
    : null;

  const handleRangeChange = useCallback((values: number[]) => {
    setTimeRange([values[0], values[1]]);
  }, []);

  return (
    <AppleCard variant="elevated" p={0} overflow="hidden">
      <VStack align="stretch" spacing={0}>
        <Flex justify="space-between" align="center" p={4} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <VStack align="start" spacing={1}>
            <Heading size="md">Timeline</Heading>
            <Text fontSize="sm" color="gray.500">
              {filteredEvents.length} of {events.length} events shown
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                onClick={() => setViewMode('month')}
                isActive={viewMode === 'month'}
              >
                Month
              </Button>
              <Button
                onClick={() => setViewMode('year')}
                isActive={viewMode === 'year'}
              >
                Year
              </Button>
              <Button
                onClick={() => setViewMode('all')}
                isActive={viewMode === 'all'}
              >
                All
              </Button>
            </ButtonGroup>
          </HStack>
        </Flex>

        <Box p={4} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <Text fontSize="sm" mb={2}>Time Range</Text>
          <RangeSlider
            defaultValue={[0, 100]}
            value={timeRange}
            onChange={handleRangeChange}
            min={0}
            max={100}
            step={1}
          >
            <RangeSliderTrack>
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>
        </Box>

        <Box ref={containerRef} position="relative" bg={bgColor}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
          />
          
          <AnimatePresence>
            {hoveredEventData && (
              <MotionBox
                position="absolute"
                top={4}
                right={4}
                bg={useColorModeValue('white', 'gray.800')}
                p={3}
                borderRadius="md"
                shadow="md"
                borderWidth="1px"
                borderColor={useColorModeValue('gray.200', 'gray.700')}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
                maxW="250px"
              >
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                    {hoveredEventData.title}
                  </Text>
                  <HStack spacing={2} fontSize="xs" color="gray.500">
                    <HStack spacing={1}>
                      <Icon as={CalendarIcon} />
                      <Text>{hoveredEventData.date.toLocaleDateString()}</Text>
                    </HStack>
                    {hoveredEventData.location && (
                      <HStack spacing={1}>
                        <Icon as={LocationIcon} />
                        <Text>{hoveredEventData.location}</Text>
                      </HStack>
                    )}
                  </HStack>
                  <Badge colorScheme={hoveredEventData.type === 'story' ? 'blue' : 'green'} size="sm">
                    {hoveredEventData.type}
                  </Badge>
                </VStack>
              </MotionBox>
            )}
          </AnimatePresence>
        </Box>
      </VStack>
    </AppleCard>
  );
};

export default TimelineVisualization;