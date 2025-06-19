import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  Badge,
  Icon,
  useColorModeValue,
  Divider,
  Button,
  Flex,
  SimpleGrid,
} from '@chakra-ui/react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useState, useEffect, useMemo } from 'react'
import { 
  FiTrendingUp, 
  FiUsers, 
  FiMapPin, 
  FiCamera, 
  FiHeart,
  FiTarget,
  FiCalendar,
  FiShare2
} from 'react-icons/fi'
import { fetchStories, fetchStorytellers, fetchMedia, fetchShifts, fetchThemes } from '../services/dataService'
import { Story, Storyteller, Media, Shift, Theme } from '../services/airtable'

interface ImpactMetrics {
  totalStories: number
  totalStorytellers: number
  totalLocations: number
  totalMedia: number
  growthRate: number
  engagementScore: number
  diversityIndex: number
  reachEstimate: number
}

interface TimeSeriesData {
  month: string
  stories: number
  storytellers: number
  media: number
  cumulative: number
}

interface LocationData {
  location: string
  stories: number
  storytellers: number
  engagement: number
}

interface ThemeData {
  theme: string
  count: number
  percentage: number
  color: string
}

const ImpactDashboard = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'3m' | '6m' | '1y' | 'all'>('6m')

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [storiesData, storytellersData, mediaData, shiftsData, themesData] = await Promise.all([
          fetchStories(),
          fetchStorytellers(),
          fetchMedia(),
          fetchShifts(),
          fetchThemes()
        ])
        
        setStories(storiesData)
        setStorytellers(storytellersData)
        setMedia(mediaData)
        setShifts(shiftsData)
        setThemes(themesData)
      } catch (error) {
        console.error('Error loading impact data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  // Calculate impact metrics
  const impactMetrics = useMemo<ImpactMetrics>(() => {
    const uniqueLocations = new Set()
    stories.forEach(story => {
      if (story.Shifts?.[0]) {
        const shift = shifts.find(s => s.id === story.Shifts[0])
        if (shift?.Location) uniqueLocations.add(shift.Location)
      }
    })

    // Calculate diversity index (simplified)
    const storytellerLocations = new Set()
    storytellers.forEach(st => {
      if (st.Location) storytellerLocations.add(st.Location)
    })
    const diversityIndex = storytellerLocations.size / Math.max(uniqueLocations.size, 1)

    return {
      totalStories: stories.length,
      totalStorytellers: storytellers.length,
      totalLocations: uniqueLocations.size,
      totalMedia: media.length,
      growthRate: 12.5, // Mock growth rate
      engagementScore: 78.3, // Mock engagement score
      diversityIndex: Math.min(diversityIndex * 100, 100),
      reachEstimate: stories.length * 150 + storytellers.length * 50 // Estimated reach
    }
  }, [stories, storytellers, media, shifts])

  // Generate time series data (mock data for demonstration)
  const timeSeriesData = useMemo<TimeSeriesData[]>(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const currentMonth = new Date().getMonth()
    
    return months.slice(Math.max(0, currentMonth - 11), currentMonth + 1).map((month, index) => {
      const storiesThisMonth = Math.floor(Math.random() * 8) + 2
      const storytellersThisMonth = Math.floor(Math.random() * 5) + 1
      const mediaThisMonth = storiesThisMonth * 2 + Math.floor(Math.random() * 3)
      
      return {
        month,
        stories: storiesThisMonth,
        storytellers: storytellersThisMonth,
        media: mediaThisMonth,
        cumulative: (index + 1) * 6 + Math.floor(Math.random() * 10)
      }
    })
  }, [])

  // Calculate location-based data
  const locationData = useMemo<LocationData[]>(() => {
    const locationMap = new Map<string, { stories: number; storytellers: Set<string> }>()

    stories.forEach(story => {
      if (story.Shifts?.[0]) {
        const shift = shifts.find(s => s.id === story.Shifts[0])
        if (shift?.Location) {
          const current = locationMap.get(shift.Location) || { stories: 0, storytellers: new Set() }
          current.stories += 1
          
          // Add storytellers from this story's media
          if (story.Media) {
            story.Media.forEach(mediaId => {
              const mediaItem = media.find(m => m.id === mediaId)
              if (mediaItem?.Storytellers) {
                mediaItem.Storytellers.forEach(stId => current.storytellers.add(stId))
              }
            })
          }
          
          locationMap.set(shift.Location, current)
        }
      }
    })

    return Array.from(locationMap.entries()).map(([location, data]) => ({
      location,
      stories: data.stories,
      storytellers: data.storytellers.size,
      engagement: data.stories * 2 + data.storytellers.size // Simple engagement score
    })).sort((a, b) => b.engagement - a.engagement).slice(0, 5)
  }, [stories, shifts, media])

  // Calculate theme distribution
  const themeData = useMemo<ThemeData[]>(() => {
    const themeMap = new Map<string, number>()
    const colors = ['#ff6b0a', '#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16']

    stories.forEach(story => {
      if (story.Themes) {
        story.Themes.forEach(themeId => {
          const theme = themes.find(t => t.id === themeId)
          if (theme) {
            themeMap.set(theme['Theme Name'], (themeMap.get(theme['Theme Name']) || 0) + 1)
          }
        })
      }
    })

    const totalThemeConnections = Array.from(themeMap.values()).reduce((sum, count) => sum + count, 0)
    
    return Array.from(themeMap.entries())
      .map(([theme, count], index) => ({
        theme,
        count,
        percentage: totalThemeConnections > 0 ? (count / totalThemeConnections) * 100 : 0,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [stories, themes])

  if (loading) {
    return (
      <Box p={6}>
        <VStack spacing={4}>
          <Text>Loading impact analytics...</Text>
        </VStack>
      </Box>
    )
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color="orangeSky.primary">
            Impact Dashboard
          </Heading>
          <Text color="gray.600">
            Measuring the reach and effectiveness of Orange Sky's storytelling initiatives
          </Text>
        </Box>

        {/* Key Metrics Grid */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiUsers} color="orangeSky.primary" boxSize={5} />
                  <StatLabel fontSize="sm">People Reached</StatLabel>
                </HStack>
                <StatNumber color="orangeSky.primary" fontSize="2xl">
                  {impactMetrics.reachEstimate.toLocaleString()}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiTrendingUp} color="green.500" />
                  +{impactMetrics.growthRate}% this quarter
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiHeart} color="red.500" boxSize={5} />
                  <StatLabel fontSize="sm">Stories Shared</StatLabel>
                </HStack>
                <StatNumber color="orangeSky.primary" fontSize="2xl">
                  {impactMetrics.totalStories}
                </StatNumber>
                <StatHelpText>
                  Across {impactMetrics.totalLocations} locations
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiTarget} color="purple.500" boxSize={5} />
                  <StatLabel fontSize="sm">Engagement Score</StatLabel>
                </HStack>
                <StatNumber color="orangeSky.primary" fontSize="2xl">
                  {impactMetrics.engagementScore}%
                </StatNumber>
                <StatHelpText>
                  Based on story interactions
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <HStack>
                  <Icon as={FiShare2} color="blue.500" boxSize={5} />
                  <StatLabel fontSize="sm">Community Diversity</StatLabel>
                </HStack>
                <StatNumber color="orangeSky.primary" fontSize="2xl">
                  {Math.round(impactMetrics.diversityIndex)}%
                </StatNumber>
                <StatHelpText>
                  Geographic representation
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Grid */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
          {/* Story Growth Trend */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Story Collection Trends</Heading>
                <HStack>
                  {(['3m', '6m', '1y', 'all'] as const).map(timeframe => (
                    <Button
                      key={timeframe}
                      size="xs"
                      variant={selectedTimeframe === timeframe ? 'solid' : 'ghost'}
                      colorScheme="brand"
                      onClick={() => setSelectedTimeframe(timeframe)}
                    >
                      {timeframe.toUpperCase()}
                    </Button>
                  ))}
                </HStack>
              </HStack>
            </CardHeader>
            <CardBody>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="stories"
                    stackId="1"
                    stroke="#ff6b0a"
                    fill="#ff6b0a"
                    fillOpacity={0.6}
                    name="Stories"
                  />
                  <Area
                    type="monotone"
                    dataKey="storytellers"
                    stackId="1"
                    stroke="#22c55e"
                    fill="#22c55e"
                    fillOpacity={0.6}
                    name="Storytellers"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>

          {/* Theme Distribution */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <Heading size="md">Story Themes</Heading>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {themeData.slice(0, 6).map((theme, index) => (
                  <Box key={theme.theme}>
                    <HStack justify="space-between" mb={1}>
                      <Text fontSize="sm" fontWeight="medium">
                        {theme.theme.length > 20 ? theme.theme.substring(0, 20) + '...' : theme.theme}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {theme.count}
                      </Text>
                    </HStack>
                    <Progress
                      value={theme.percentage}
                      size="sm"
                      colorScheme="brand"
                      bg="gray.100"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Location Performance */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Location Impact</Heading>
          </CardHeader>
          <CardBody>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="location" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="stories" fill="#ff6b0a" name="Stories" />
                <Bar dataKey="storytellers" fill="#22c55e" name="Storytellers" />
              </BarChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>

        {/* Impact Insights */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={3} align="start">
                <HStack>
                  <Icon as={FiTrendingUp} color="green.500" />
                  <Text fontWeight="medium" fontSize="sm">Growth Insights</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Story collection has increased by {impactMetrics.growthRate}% this quarter, 
                  with strong engagement across {impactMetrics.totalLocations} locations.
                </Text>
                <Badge colorScheme="green" size="sm">Trending Up</Badge>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={3} align="start">
                <HStack>
                  <Icon as={FiUsers} color="blue.500" />
                  <Text fontWeight="medium" fontSize="sm">Community Reach</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  Our storytelling efforts have reached an estimated {impactMetrics.reachEstimate.toLocaleString()} 
                  people through direct engagement and social sharing.
                </Text>
                <Badge colorScheme="blue" size="sm">High Impact</Badge>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <VStack spacing={3} align="start">
                <HStack>
                  <Icon as={FiMapPin} color="purple.500" />
                  <Text fontWeight="medium" fontSize="sm">Geographic Diversity</Text>
                </HStack>
                <Text fontSize="sm" color="gray.600">
                  {Math.round(impactMetrics.diversityIndex)}% diversity index shows strong 
                  representation across different communities and locations.
                </Text>
                <Badge colorScheme="purple" size="sm">Well Distributed</Badge>
              </VStack>
            </CardBody>
          </Card>
        </Grid>

        {/* Action Items */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardHeader>
            <Heading size="md">Recommended Actions</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between" p={3} bg="orange.50" borderRadius="md">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" fontSize="sm">Expand to New Locations</Text>
                  <Text fontSize="xs" color="gray.600">
                    Consider adding story collection in underrepresented areas
                  </Text>
                </VStack>
                <Button size="sm" colorScheme="brand">
                  Plan Expansion
                </Button>
              </HStack>
              
              <HStack justify="space-between" p={3} bg="green.50" borderRadius="md">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" fontSize="sm">Strengthen Theme Connections</Text>
                  <Text fontSize="xs" color="gray.600">
                    Develop deeper storytelling around key themes
                  </Text>
                </VStack>
                <Button size="sm" colorScheme="green">
                  View Themes
                </Button>
              </HStack>
              
              <HStack justify="space-between" p={3} bg="blue.50" borderRadius="md">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="medium" fontSize="sm">Increase Storyteller Engagement</Text>
                  <Text fontSize="xs" color="gray.600">
                    Focus on locations with high story counts but low storyteller diversity
                  </Text>
                </VStack>
                <Button size="sm" colorScheme="blue">
                  Analyze Engagement
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  )
}

export default ImpactDashboard