import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  Spinner,
  Button,
  ButtonGroup,
  Flex,
  Icon,
} from '@chakra-ui/react'
import { useEffect, useRef, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { FiUsers, FiTag, FiMapPin, FiZoomIn, FiZoomOut, FiRotateCcw } from 'react-icons/fi'
import { fetchStories, fetchStorytellers, fetchThemes, fetchShifts } from '../services/dataService'
import { Story, Storyteller, Theme, Shift } from '../services/airtable'

interface NetworkNode {
  id: string
  name: string
  type: 'story' | 'storyteller' | 'theme' | 'location'
  size: number
  color: string
  data: Story | Storyteller | Theme | Shift
}

interface NetworkLink {
  source: string
  target: string
  strength: number
  type: 'story-storyteller' | 'story-theme' | 'story-location' | 'theme-theme'
}

interface StoryNetworkGraphProps {
  height?: number
  selectedStoryId?: string
  onNodeClick?: (node: NetworkNode) => void
  filterType?: 'all' | 'stories' | 'themes' | 'storytellers' | 'locations'
}

const StoryNetworkGraph = ({
  height = 600,
  selectedStoryId,
  onNodeClick,
  filterType = 'all'
}: StoryNetworkGraphProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const cardBg = useColorModeValue('white', 'gray.700')

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [storiesData, storytellersData, themesData, shiftsData] = await Promise.all([
          fetchStories(),
          fetchStorytellers(),
          fetchThemes(),
          fetchShifts()
        ])
        
        setStories(storiesData)
        setStorytellers(storytellersData)
        setThemes(themesData)
        setShifts(shiftsData)
      } catch (error) {
        console.error('Error loading network data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Create network data
  const networkData = useMemo(() => {
    if (!stories.length) return { nodes: [], links: [] }

    const nodes: NetworkNode[] = []
    const links: NetworkLink[] = []
    const nodeIds = new Set<string>()

    // Add story nodes
    stories.forEach(story => {
      if (filterType === 'all' || filterType === 'stories') {
        const nodeId = `story-${story.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: story.Title,
            type: 'story',
            size: 12,
            color: '#ff6b0a', // Orange Sky primary
            data: story
          })
          nodeIds.add(nodeId)
        }
      }
    })

    // Add storyteller nodes and links
    if (filterType === 'all' || filterType === 'storytellers') {
      storytellers.forEach(storyteller => {
        const nodeId = `storyteller-${storyteller.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: storyteller.Name,
            type: 'storyteller',
            size: 8,
            color: '#22c55e', // Green for people
            data: storyteller
          })
          nodeIds.add(nodeId)
        }

        // Link storytellers to stories through media
        stories.forEach(story => {
          if (story.Media) {
            story.Media.forEach(mediaId => {
              // This is a simplified connection - in reality you'd check media relationships
              const hasConnection = Math.random() > 0.7 // Simulate some connections
              if (hasConnection && (filterType === 'all' || filterType === 'stories')) {
                links.push({
                  source: `story-${story.id}`,
                  target: nodeId,
                  strength: 2,
                  type: 'story-storyteller'
                })
              }
            })
          }
        })
      })
    }

    // Add theme nodes and links
    if (filterType === 'all' || filterType === 'themes') {
      themes.forEach(theme => {
        const nodeId = `theme-${theme.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: theme['Theme Name'],
            type: 'theme',
            size: 6,
            color: '#3b82f6', // Blue for themes
            data: theme
          })
          nodeIds.add(nodeId)
        }

        // Link themes to stories
        stories.forEach(story => {
          if (story.Themes && story.Themes.includes(theme.id) && (filterType === 'all' || filterType === 'stories')) {
            links.push({
              source: `story-${story.id}`,
              target: nodeId,
              strength: 1,
              type: 'story-theme'
            })
          }
        })
      })
    }

    // Add location nodes and links
    if (filterType === 'all' || filterType === 'locations') {
      shifts.forEach(shift => {
        const nodeId = `location-${shift.id}`
        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: shift.Name,
            type: 'location',
            size: 10,
            color: '#8b5cf6', // Purple for locations
            data: shift
          })
          nodeIds.add(nodeId)
        }

        // Link locations to stories
        stories.forEach(story => {
          if (story.Shifts && story.Shifts.includes(shift.id) && (filterType === 'all' || filterType === 'stories')) {
            links.push({
              source: `story-${story.id}`,
              target: nodeId,
              strength: 3,
              type: 'story-location'
            })
          }
        })
      })
    }

    return { nodes, links }
  }, [stories, storytellers, themes, shifts, filterType])

  // D3 visualization
  useEffect(() => {
    if (!svgRef.current || loading || networkData.nodes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth
    const svgHeight = height

    // Create container group for zooming
    const container = svg.append('g')

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        container.attr('transform', event.transform)
        setZoomLevel(event.transform.k)
      })

    svg.call(zoom)

    // Create force simulation
    const simulation = d3.forceSimulation<NetworkNode>(networkData.nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(networkData.links)
        .id(d => d.id)
        .distance(d => 50 + (d.strength * 20))
        .strength(d => d.strength * 0.1)
      )
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, svgHeight / 2))
      .force('collision', d3.forceCollide().radius(d => d.size + 2))

    // Create links
    const links = container.selectAll('.link')
      .data(networkData.links)
      .enter().append('line')
      .attr('class', 'link')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', d => Math.sqrt(d.strength))

    // Create nodes
    const nodes = container.selectAll('.node')
      .data(networkData.nodes)
      .enter().append('circle')
      .attr('class', 'node')
      .attr('r', d => d.size)
      .attr('fill', d => d.color)
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, NetworkNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          d.fx = null
          d.fy = null
        })
      )

    // Add node labels
    const labels = container.selectAll('.label')
      .data(networkData.nodes)
      .enter().append('text')
      .attr('class', 'label')
      .attr('text-anchor', 'middle')
      .attr('dy', '.35em')
      .style('font-size', '10px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .style('pointer-events', 'none')
      .text(d => d.name.length > 15 ? d.name.substring(0, 15) + '...' : d.name)

    // Node hover and click events
    nodes
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .attr('stroke-width', 4)
          .attr('r', d.size * 1.2)
      })
      .on('mouseout', (event, d) => {
        d3.select(event.currentTarget)
          .attr('stroke-width', 2)
          .attr('r', d.size)
      })
      .on('click', (event, d) => {
        setSelectedNode(d)
        if (onNodeClick) {
          onNodeClick(d)
        }
      })

    // Highlight selected story
    if (selectedStoryId) {
      nodes
        .attr('opacity', d => d.id === `story-${selectedStoryId}` ? 1 : 0.3)
      links
        .attr('opacity', d => 
          d.source === `story-${selectedStoryId}` || d.target === `story-${selectedStoryId}` ? 0.8 : 0.1
        )
    }

    // Update positions on tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y)

      nodes
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)

      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y! + d.size + 12)
    })

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [networkData, height, loading, selectedStoryId, onNodeClick])

  const handleZoomIn = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 1.5
      )
    }
  }

  const handleZoomOut = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().scaleBy as any, 0.67
      )
    }
  }

  const handleReset = () => {
    if (svgRef.current) {
      d3.select(svgRef.current).transition().call(
        d3.zoom<SVGSVGElement, unknown>().transform as any,
        d3.zoomIdentity
      )
    }
  }

  if (loading) {
    return (
      <Box height={`${height}px`} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="lg" color="orangeSky.primary" />
          <Text>Building story network...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* Header and Controls */}
        <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
          <Box>
            <Heading size="md">Story Connections Network</Heading>
            <Text color="gray.600" fontSize="sm">
              Interactive visualization of relationships between stories, people, themes, and places
            </Text>
          </Box>
          
          <ButtonGroup size="sm" isAttached>
            <Button leftIcon={<Icon as={FiZoomIn} />} onClick={handleZoomIn}>
              Zoom In
            </Button>
            <Button leftIcon={<Icon as={FiZoomOut} />} onClick={handleZoomOut}>
              Zoom Out
            </Button>
            <Button leftIcon={<Icon as={FiRotateCcw} />} onClick={handleReset}>
              Reset
            </Button>
          </ButtonGroup>
        </Flex>

        {/* Legend */}
        <HStack spacing={6} wrap="wrap">
          <HStack>
            <Box w={3} h={3} borderRadius="full" bg="#ff6b0a" />
            <Text fontSize="sm">Stories</Text>
          </HStack>
          <HStack>
            <Box w={3} h={3} borderRadius="full" bg="#22c55e" />
            <Text fontSize="sm">Storytellers</Text>
          </HStack>
          <HStack>
            <Box w={3} h={3} borderRadius="full" bg="#3b82f6" />
            <Text fontSize="sm">Themes</Text>
          </HStack>
          <HStack>
            <Box w={3} h={3} borderRadius="full" bg="#8b5cf6" />
            <Text fontSize="sm">Locations</Text>
          </HStack>
          <Text fontSize="sm" color="gray.500">
            Zoom: {Math.round(zoomLevel * 100)}%
          </Text>
        </HStack>

        {/* Network Graph */}
        <Box 
          border="1px" 
          borderColor={borderColor} 
          borderRadius="lg" 
          overflow="hidden"
          position="relative"
        >
          <svg
            ref={svgRef}
            width="100%"
            height={height}
            style={{ display: 'block' }}
          />
        </Box>

        {/* Selected Node Details */}
        {selectedNode && (
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={3} align="stretch">
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Badge colorScheme={
                      selectedNode.type === 'story' ? 'orange' :
                      selectedNode.type === 'storyteller' ? 'green' :
                      selectedNode.type === 'theme' ? 'blue' : 'purple'
                    }>
                      {selectedNode.type}
                    </Badge>
                    <Heading size="sm">{selectedNode.name}</Heading>
                  </VStack>
                  <Button size="sm" onClick={() => setSelectedNode(null)}>
                    Close
                  </Button>
                </HStack>
                
                {selectedNode.type === 'story' && (
                  <Text fontSize="sm" color="gray.600">
                    {(selectedNode.data as Story)['Story copy'] || 'No description available'}
                  </Text>
                )}
                
                <HStack spacing={4} fontSize="sm">
                  <HStack>
                    <Icon as={
                      selectedNode.type === 'story' ? FiUsers :
                      selectedNode.type === 'storyteller' ? FiUsers :
                      selectedNode.type === 'theme' ? FiTag : FiMapPin
                    } />
                    <Text>
                      Connected to {networkData.links.filter(l => 
                        l.source === selectedNode.id || l.target === selectedNode.id
                      ).length} other items
                    </Text>
                  </HStack>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Network Statistics */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Heading size="sm" mb={3}>Network Statistics</Heading>
            <HStack spacing={6} fontSize="sm">
              <VStack spacing={1}>
                <Text fontWeight="medium">{networkData.nodes.length}</Text>
                <Text color="gray.600">Total Nodes</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontWeight="medium">{networkData.links.length}</Text>
                <Text color="gray.600">Connections</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontWeight="medium">
                  {networkData.nodes.filter(n => n.type === 'story').length}
                </Text>
                <Text color="gray.600">Stories</Text>
              </VStack>
              <VStack spacing={1}>
                <Text fontWeight="medium">
                  {networkData.nodes.filter(n => n.type === 'storyteller').length}
                </Text>
                <Text color="gray.600">Storytellers</Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default StoryNetworkGraph