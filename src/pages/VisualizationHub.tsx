import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Badge,
  Icon,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { useState, useEffect } from 'react'
import { 
  FiMap, 
  FiShare2, 
  FiBarChart, 
  FiSearch,
  FiFilter,
  FiDownload,
  FiMaximize,
  FiSettings
} from 'react-icons/fi'
import StoryMap from '../components/StoryMap'
import StoryNetworkGraph from '../components/StoryNetworkGraph'
import ImpactDashboard from '../components/ImpactDashboard'
import { fetchStories } from '../services/dataService'
import { Story } from '../services/airtable'

type VisualizationType = 'map' | 'network' | 'analytics' | 'all'
type FilterType = 'all' | 'stories' | 'themes' | 'storytellers' | 'locations'

const VisualizationHub = () => {
  const [activeView, setActiveView] = useState<VisualizationType>('all')
  const [selectedStoryId, setSelectedStoryId] = useState<string | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Load stories for selection
  useEffect(() => {
    const loadStories = async () => {
      try {
        const storiesData = await fetchStories()
        setStories(storiesData)
      } catch (error) {
        console.error('Error loading stories:', error)
      } finally {
        setLoading(false)
      }
    }
    loadStories()
  }, [])

  const handleStorySelect = (story: Story) => {
    setSelectedStoryId(story.id)
  }

  const handleExportData = () => {
    // In a real app, this would export visualization data
    console.log('Exporting visualization data...')
  }

  const filteredStories = stories.filter(story =>
    story.Title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const visualizationTabs = [
    {
      id: 'map',
      label: 'Story Map',
      icon: FiMap,
      description: 'Geographic visualization of stories and impact locations'
    },
    {
      id: 'network',
      label: 'Connections',
      icon: FiShare2,
      description: 'Network graph showing relationships between stories, people, and themes'
    },
    {
      id: 'analytics',
      label: 'Impact Analytics',
      icon: FiBarChart,
      description: 'Comprehensive dashboard of storytelling impact and metrics'
    }
  ]

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color="orangeSky.primary">
            Story Visualization Hub
          </Heading>
          <Text color="gray.600">
            Interactive visualizations and analytics for Orange Sky's storytelling data
          </Text>
        </Box>

        {/* Controls Bar */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Flex wrap="wrap" gap={4} align="center">
              {/* Search */}
              <InputGroup maxW="300px">
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                />
              </InputGroup>

              {/* Filter */}
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as FilterType)}
                size="sm"
                maxW="150px"
              >
                <option value="all">All Types</option>
                <option value="stories">Stories</option>
                <option value="themes">Themes</option>
                <option value="storytellers">Storytellers</option>
                <option value="locations">Locations</option>
              </Select>

              {/* Story Selector */}
              <Select
                placeholder="Select a story to highlight"
                value={selectedStoryId || ''}
                onChange={(e) => setSelectedStoryId(e.target.value || undefined)}
                size="sm"
                maxW="250px"
              >
                {filteredStories.map(story => (
                  <option key={story.id} value={story.id}>
                    {story.Title.length > 30 ? story.Title.substring(0, 30) + '...' : story.Title}
                  </option>
                ))}
              </Select>

              <Spacer />

              {/* Action Buttons */}
              <ButtonGroup size="sm">
                <Button leftIcon={<Icon as={FiDownload} />} variant="outline">
                  Export
                </Button>
                <Button leftIcon={<Icon as={FiMaximize} />} variant="outline">
                  Fullscreen
                </Button>
                <Button leftIcon={<Icon as={FiSettings} />} variant="outline">
                  Settings
                </Button>
              </ButtonGroup>
            </Flex>

            {selectedStoryId && (
              <Box mt={3} p={2} bg="orange.50" borderRadius="md">
                <HStack>
                  <Badge colorScheme="orange" size="sm">Highlighted Story</Badge>
                  <Text fontSize="sm">
                    {stories.find(s => s.id === selectedStoryId)?.Title}
                  </Text>
                  <Button size="xs" variant="ghost" onClick={() => setSelectedStoryId(undefined)}>
                    Clear
                  </Button>
                </HStack>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Visualization Tabs */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody p={0}>
            <Tabs colorScheme="brand" variant="line">
              <Box px={6} pt={4}>
                <TabList>
                  {visualizationTabs.map(tab => (
                    <Tab key={tab.id}>
                      <HStack spacing={2}>
                        <Icon as={tab.icon} />
                        <Text>{tab.label}</Text>
                      </HStack>
                    </Tab>
                  ))}
                </TabList>
              </Box>

              <TabPanels>
                {/* Story Map Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Heading size="md" mb={2}>Interactive Story Map</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Explore stories geographically and see the reach of Orange Sky's impact across communities
                      </Text>
                    </Box>
                    <StoryMap
                      height="600px"
                      selectedStoryId={selectedStoryId}
                      onStorySelect={handleStorySelect}
                    />
                  </VStack>
                </TabPanel>

                {/* Network Graph Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Heading size="md" mb={2}>Story Connections Network</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Visualize relationships and connections between stories, storytellers, themes, and locations
                      </Text>
                    </Box>
                    
                    {/* Network Filter Controls */}
                    <HStack spacing={4} wrap="wrap">
                      <Text fontSize="sm" fontWeight="medium">Show:</Text>
                      {(['all', 'stories', 'themes', 'storytellers', 'locations'] as FilterType[]).map(type => (
                        <Button
                          key={type}
                          size="xs"
                          variant={filterType === type ? 'solid' : 'ghost'}
                          colorScheme="brand"
                          onClick={() => setFilterType(type)}
                          textTransform="capitalize"
                        >
                          {type}
                        </Button>
                      ))}
                    </HStack>

                    <StoryNetworkGraph
                      height={600}
                      selectedStoryId={selectedStoryId}
                      onNodeClick={(node) => {
                        if (node.type === 'story') {
                          setSelectedStoryId(node.id.replace('story-', ''))
                        }
                      }}
                      filterType={filterType}
                    />
                  </VStack>
                </TabPanel>

                {/* Analytics Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Heading size="md" mb={2}>Impact Analytics Dashboard</Heading>
                      <Text color="gray.600" fontSize="sm">
                        Comprehensive metrics and insights about Orange Sky's storytelling impact and reach
                      </Text>
                    </Box>
                    <ImpactDashboard />
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>

        {/* Quick Stats */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" size="sm">
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orangeSky.primary">
                {stories.length}
              </Text>
              <Text fontSize="sm" color="gray.600">Stories Mapped</Text>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" size="sm">
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {new Set(stories.flatMap(s => s.Shifts || [])).size}
              </Text>
              <Text fontSize="sm" color="gray.600">Active Locations</Text>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" size="sm">
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {stories.filter(s => s.Themes && s.Themes.length > 0).length}
              </Text>
              <Text fontSize="sm" color="gray.600">Tagged Stories</Text>
            </CardBody>
          </Card>
          
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" size="sm">
            <CardBody textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                {Math.round((stories.filter(s => s.Media && s.Media.length > 0).length / stories.length) * 100)}%
              </Text>
              <Text fontSize="sm" color="gray.600">Media Coverage</Text>
            </CardBody>
          </Card>
        </Grid>

        {/* Help & Tips */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Heading size="sm" mb={3}>Visualization Tips</Heading>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4} fontSize="sm">
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FiMap} color="orangeSky.primary" />
                  <Text fontWeight="medium">Story Map</Text>
                </HStack>
                <Text color="gray.600">
                  Click markers to view story details. Use zoom controls to explore different areas.
                  Color coding indicates story engagement levels.
                </Text>
              </VStack>
              
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FiShare2} color="green.500" />
                  <Text fontWeight="medium">Network Graph</Text>
                </HStack>
                <Text color="gray.600">
                  Drag nodes to rearrange. Click to select. Use filters to focus on specific 
                  relationship types and reduce visual complexity.
                </Text>
              </VStack>
              
              <VStack align="start" spacing={2}>
                <HStack>
                  <Icon as={FiBarChart} color="blue.500" />
                  <Text fontWeight="medium">Analytics</Text>
                </HStack>
                <Text color="gray.600">
                  Interactive charts show trends over time. Hover for details. Use timeframe 
                  controls to focus on specific periods.
                </Text>
              </VStack>
            </Grid>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default VisualizationHub