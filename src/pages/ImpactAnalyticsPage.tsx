import React, { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Progress,
  Badge,
  Flex,
  HStack,
  Icon,
  Tooltip,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from '@chakra-ui/react'
import { 
  FiUsers, 
  FiMessageCircle, 
  FiTrendingUp, 
  FiMapPin, 
  FiCalendar,
  FiHeart,
  FiShare2,
  FiBarChart2 
} from 'react-icons/fi'
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts'
import { useNavigate } from 'react-router-dom'
import { fetchStories, fetchStorytellers } from '../services/dataService'
import { useAirtableData } from '../context/AirtableDataContext'

const ImpactAnalyticsPage = () => {
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const highlightColor = useColorModeValue('orange.600', 'orange.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  // Use context data
  const { themes, shifts, storytellers, isLoadingThemes, isLoadingShifts, isLoadingStorytellers } = useAirtableData()
  
  // Local state for stories
  const [stories, setStories] = useState([])
  const [storiesLoading, setStoriesLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const loadStories = async () => {
      try {
        setStoriesLoading(true)
        
        // Check if Airtable is configured
        const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
        
        if (!apiKey || apiKey === 'your_airtable_api_key_here' || !baseId || baseId === 'your_airtable_base_id_here') {
          setError('Airtable not configured. Please add your API key and Base ID to the .env file.')
          setStoriesLoading(false)
          return
        }
        
        const data = await fetchStories({ 
          pageSize: 100,
          fields: ['Title', 'Story Content', 'Storyteller', 'Themes', 'Date Captured', 'Location', 'Gender', 'Age Range']
        })
        setStories(data)
      } catch (err) {
        console.error('Failed to fetch stories:', err)
        setError('Failed to load stories. Please check your Airtable configuration.')
      } finally {
        setStoriesLoading(false)
      }
    }
    
    loadStories()
  }, [])
  
  const isLoading = storiesLoading || isLoadingThemes || isLoadingShifts || isLoadingStorytellers
  
  // Calculate analytics
  const analytics = useMemo(() => {
    if (!stories.length) return null
    
    // Demographics analysis
    const genderBreakdown = stories.reduce((acc, story) => {
      const gender = story.fields['Gender'] || 'Unknown'
      acc[gender] = (acc[gender] || 0) + 1
      return acc
    }, {})
    
    const ageBreakdown = stories.reduce((acc, story) => {
      const ageRange = story.fields['Age Range'] || 'Unknown'
      acc[ageRange] = (acc[ageRange] || 0) + 1
      return acc
    }, {})
    
    // Theme analysis
    const themeFrequency = stories.reduce((acc, story) => {
      const storyThemes = story.fields['Themes'] || []
      storyThemes.forEach(themeId => {
        const theme = themes.find(t => t.id === themeId)
        if (theme) {
          acc[theme.fields.Name] = (acc[theme.fields.Name] || 0) + 1
        }
      })
      return acc
    }, {})
    
    // Location analysis
    const locationBreakdown = stories.reduce((acc, story) => {
      const location = story.fields['Location'] || 'Unknown'
      acc[location] = (acc[location] || 0) + 1
      return acc
    }, {})
    
    // Time series data
    const storiesByMonth = stories.reduce((acc, story) => {
      const date = new Date(story.fields['Date Captured'])
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      acc[monthKey] = (acc[monthKey] || 0) + 1
      return acc
    }, {})
    
    // Calculate engagement metrics
    const totalWords = stories.reduce((sum, story) => {
      const content = story.fields['Story Content'] || ''
      return sum + content.split(' ').length
    }, 0)
    
    const avgWordsPerStory = Math.round(totalWords / stories.length)
    
    // Storyteller engagement
    const storytellerEngagement = storytellers.map(teller => {
      const tellerStories = stories.filter(s => s.fields['Storyteller']?.[0] === teller.id)
      return {
        name: teller.fields.Name,
        stories: tellerStories.length,
        avgWords: tellerStories.length > 0 
          ? Math.round(tellerStories.reduce((sum, s) => sum + (s.fields['Story Content'] || '').split(' ').length, 0) / tellerStories.length)
          : 0
      }
    }).filter(t => t.stories > 0).sort((a, b) => b.stories - a.stories)
    
    return {
      totalStories: stories.length,
      totalStorytellers: new Set(stories.map(s => s.fields['Storyteller']?.[0]).filter(Boolean)).size,
      totalThemesUsed: Object.keys(themeFrequency).length,
      totalLocations: Object.keys(locationBreakdown).length,
      avgWordsPerStory,
      totalWords,
      genderData: Object.entries(genderBreakdown).map(([name, value]) => ({ name, value })),
      ageData: Object.entries(ageBreakdown).map(([name, value]) => ({ name, value })),
      themeData: Object.entries(themeFrequency)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
      locationData: Object.entries(locationBreakdown)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({ name, value })),
      timeSeriesData: Object.entries(storiesByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([month, count]) => ({
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
          stories: count
        })),
      storytellerEngagement: storytellerEngagement.slice(0, 10)
    }
  }, [stories, themes, storytellers])
  
  // Colors for charts
  const COLORS = ['#ED8936', '#48BB78', '#4299E1', '#9F7AEA', '#ED64A6', '#38B2AC']
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <VStack spacing={4} align="start">
            <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
              Analytics Dashboard
            </Badge>
            <Heading size="2xl" color={highlightColor}>
              Impact Analytics
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Deep insights into listening patterns and voice distribution
            </Text>
          </VStack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">{error}</Text>
              {error.includes('Airtable not configured') && (
                <Box mt={2}>
                  <Text fontSize="sm">To connect to Airtable:</Text>
                  <Text fontSize="sm">1. Copy .env.example to .env</Text>
                  <Text fontSize="sm">2. Get your API key from: https://airtable.com/account</Text>
                  <Text fontSize="sm">3. Get your Base ID from your Airtable base API docs</Text>
                  <Text fontSize="sm">4. Update the values in your .env file</Text>
                  <Text fontSize="sm">5. Restart the development server</Text>
                </Box>
              )}
            </Box>
          </Alert>
        )}

        {/* Key Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Stories</StatLabel>
                <StatNumber color={highlightColor}>
                  {isLoading ? <Spinner size="sm" /> : analytics?.totalStories || 0}
                </StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  Voices captured
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Active Storytellers</StatLabel>
                <StatNumber>
                  {isLoading ? <Spinner size="sm" /> : analytics?.totalStorytellers || 0}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiUsers} mr={1} />
                  Unique contributors
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Avg Story Length</StatLabel>
                <StatNumber>
                  {isLoading ? <Spinner size="sm" /> : analytics?.avgWordsPerStory || 0}
                </StatNumber>
                <StatHelpText>
                  Words per story
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Themes</StatLabel>
                <StatNumber>
                  {isLoading ? <Spinner size="sm" /> : analytics?.totalThemesUsed || 0}
                </StatNumber>
                <StatHelpText>
                  <Icon as={FiHeart} mr={1} />
                  Topics explored
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Charts Grid */}
        {isLoading ? (
          <Flex justify="center" py={10}>
            <Spinner size="xl" color={highlightColor} />
          </Flex>
        ) : analytics ? (
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Gender Distribution */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Gender Distribution</Heading>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Top Themes */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Top Themes</Heading>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.themeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill={highlightColor} />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Stories Over Time */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Stories Over Time</Heading>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip />
                    <Line type="monotone" dataKey="stories" stroke={highlightColor} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>

            {/* Location Distribution */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardHeader>
                <Heading size="md">Top Locations</Heading>
              </CardHeader>
              <CardBody>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.locationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#4299E1" />
                  </BarChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </SimpleGrid>
        ) : null}

        {/* Storyteller Engagement Table */}
        {!isLoading && analytics && (
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Top Storyteller Engagement</Heading>
            </CardHeader>
            <CardBody>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Storyteller</Th>
                      <Th isNumeric>Stories</Th>
                      <Th isNumeric>Avg Words</Th>
                      <Th isNumeric>Total Impact</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {analytics.storytellerEngagement.map((teller, index) => (
                      <Tr key={index}>
                        <Td fontWeight="medium">{teller.name}</Td>
                        <Td isNumeric>{teller.stories}</Td>
                        <Td isNumeric>{teller.avgWords}</Td>
                        <Td isNumeric>
                          <Badge colorScheme="orange">
                            {teller.stories * teller.avgWords}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </CardBody>
          </Card>
        )}

        {/* Actions */}
        <HStack spacing={4} justify="center">
          <Button
            leftIcon={<FiShare2 />}
            onClick={() => window.print()}
          >
            Export Report
          </Button>
          <Button
            leftIcon={<FiBarChart2 />}
            onClick={() => navigate('/visualization')}
            variant="outline"
          >
            Advanced Visualizations
          </Button>
        </HStack>
      </VStack>
    </Container>
  )
}

export default ImpactAnalyticsPage