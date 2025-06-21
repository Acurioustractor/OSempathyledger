import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  useColorModeValue,
  Button,
  Flex,
  Badge,
  Tooltip,
  IconButton,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3';
import { Theme, Story } from '../types';
import AppleCard from './AppleCard';
import { ZoomInIcon, ZoomOutIcon, ScreenFullIcon } from '@primer/octicons-react';

interface ThemeVisualizationProps {
  themes: Theme[];
  stories: Story[];
  onThemeClick?: (themeId: string) => void;
  height?: number;
}

interface ThemeNode {
  id: string;
  name: string;
  count: number;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
}

interface ThemeLink {
  source: string;
  target: string;
  strength: number;
}

const MotionBox = motion(Box);

const ThemeVisualization: React.FC<ThemeVisualizationProps> = ({
  themes,
  stories,
  onThemeClick,
  height = 600,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  const bgColor = useColorModeValue('white', 'gray.800');
  const nodeColor = useColorModeValue('#FF6B35', '#FFA500');
  const linkColor = useColorModeValue('#E2E8F0', '#2D3748');
  const textColor = useColorModeValue('#2D3748', '#E2E8F0');
  const hoverColor = useColorModeValue('#FF8C57', '#FFB84D');

  // Calculate theme connections
  const calculateThemeConnections = (): { nodes: ThemeNode[], links: ThemeLink[] } => {
    const nodes: ThemeNode[] = themes
      .filter(theme => theme['Story Count'] > 0)
      .map(theme => ({
        id: theme.id,
        name: theme['Theme Name'],
        count: theme['Story Count'] || 0,
      }));

    const links: ThemeLink[] = [];
    const themeCooccurrence = new Map<string, number>();

    // Find themes that appear together in stories
    stories.forEach(story => {
      if (story.Themes && story.Themes.length > 1) {
        for (let i = 0; i < story.Themes.length; i++) {
          for (let j = i + 1; j < story.Themes.length; j++) {
            const key = [story.Themes[i], story.Themes[j]].sort().join('-');
            themeCooccurrence.set(key, (themeCooccurrence.get(key) || 0) + 1);
          }
        }
      }
    });

    // Create links from co-occurrences
    themeCooccurrence.forEach((count, key) => {
      const [source, target] = key.split('-');
      if (nodes.find(n => n.id === source) && nodes.find(n => n.id === target)) {
        links.push({
          source,
          target,
          strength: count,
        });
      }
    });

    return { nodes, links };
  };

  useEffect(() => {
    if (!containerRef.current) return;
    
    const updateDimensions = () => {
      const { width } = containerRef.current!.getBoundingClientRect();
      setDimensions({ width, height });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { nodes, links } = calculateThemeConnections();
    if (nodes.length === 0) return;

    const width = dimensions.width;
    const height = dimensions.height;

    // Create zoom behavior
    const zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
        setZoom(event.transform.k);
      });

    svg.call(zoomBehavior);

    const g = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation<ThemeNode>(nodes)
      .force('link', d3.forceLink<ThemeNode, ThemeLink>(links)
        .id(d => d.id)
        .strength(d => d.strength / 10))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(d => Math.sqrt(d.count) * 8 + 20));

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', linkColor)
      .attr('stroke-opacity', 0.3)
      .attr('stroke-width', d => Math.sqrt(d.strength));

    // Create node groups
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .call(d3.drag<SVGGElement, ThemeNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => Math.sqrt(d.count) * 5 + 10)
      .attr('fill', nodeColor)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', hoverColor)
          .attr('r', d => Math.sqrt(d.count) * 5 + 15);
        setSelectedTheme(d.id);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', nodeColor)
          .attr('r', d => Math.sqrt(d.count) * 5 + 10);
        setSelectedTheme(null);
      })
      .on('click', (event, d) => {
        if (onThemeClick) {
          onThemeClick(d.id);
        }
      });

    // Add labels to nodes
    node.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .attr('font-size', d => Math.min(14, Math.sqrt(d.count) * 3 + 8))
      .attr('font-weight', 'medium')
      .attr('fill', textColor)
      .attr('pointer-events', 'none')
      .style('user-select', 'none');

    // Add count badges
    node.append('text')
      .text(d => d.count)
      .attr('text-anchor', 'middle')
      .attr('dy', d => Math.sqrt(d.count) * 5 + 25)
      .attr('font-size', '12px')
      .attr('fill', textColor)
      .attr('opacity', 0.7)
      .attr('pointer-events', 'none');

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any, d: ThemeNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: ThemeNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: ThemeNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

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
    (window as any).__themeVizHandlers = { handleZoomIn, handleZoomOut, handleZoomReset };

    return () => {
      simulation.stop();
      delete (window as any).__themeVizHandlers;
    };
  }, [themes, stories, dimensions, nodeColor, linkColor, textColor, hoverColor, onThemeClick]);

  const handleZoomIn = () => {
    if ((window as any).__themeVizHandlers) {
      (window as any).__themeVizHandlers.handleZoomIn();
    }
  };

  const handleZoomOut = () => {
    if ((window as any).__themeVizHandlers) {
      (window as any).__themeVizHandlers.handleZoomOut();
    }
  };

  const handleZoomReset = () => {
    if ((window as any).__themeVizHandlers) {
      (window as any).__themeVizHandlers.handleZoomReset();
    }
  };

  const selectedThemeData = selectedTheme ? themes.find(t => t.id === selectedTheme) : null;

  return (
    <AppleCard variant="elevated" p={0} overflow="hidden">
      <VStack align="stretch" spacing={0}>
        <Flex justify="space-between" align="center" p={4} borderBottom="1px" borderColor={useColorModeValue('gray.200', 'gray.700')}>
          <VStack align="start" spacing={1}>
            <Heading size="md">Theme Network</Heading>
            <Text fontSize="sm" color="gray.500">
              Explore connections between themes
            </Text>
          </VStack>
          
          <HStack spacing={2}>
            <Tooltip label="Zoom In">
              <IconButton
                aria-label="Zoom in"
                icon={<ZoomInIcon />}
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
              />
            </Tooltip>
            <Tooltip label="Zoom Out">
              <IconButton
                aria-label="Zoom out"
                icon={<ZoomOutIcon />}
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
              />
            </Tooltip>
            <Tooltip label="Reset View">
              <IconButton
                aria-label="Reset view"
                icon={<ScreenFullIcon />}
                size="sm"
                variant="ghost"
                onClick={handleZoomReset}
              />
            </Tooltip>
            <Badge colorScheme="gray" ml={2}>
              {Math.round(zoom * 100)}%
            </Badge>
          </HStack>
        </Flex>

        <Box ref={containerRef} position="relative" bg={bgColor}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ cursor: 'grab' }}
          />
          
          <AnimatePresence>
            {selectedThemeData && (
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
              >
                <VStack align="start" spacing={2}>
                  <Heading size="sm">{selectedThemeData['Theme Name']}</Heading>
                  <HStack spacing={4}>
                    <Text fontSize="sm">
                      <strong>{selectedThemeData['Story Count']}</strong> stories
                    </Text>
                    {selectedThemeData['Quote Count'] > 0 && (
                      <Text fontSize="sm">
                        <strong>{selectedThemeData['Quote Count']}</strong> quotes
                      </Text>
                    )}
                  </HStack>
                  {onThemeClick && (
                    <Button
                      size="sm"
                      colorScheme="orange"
                      onClick={() => onThemeClick(selectedThemeData.id)}
                    >
                      Explore Theme
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

export default ThemeVisualization;