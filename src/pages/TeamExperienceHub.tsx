import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Badge,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Icon,
  Divider,
  Progress,
  Flex,
  Avatar,
  AvatarGroup,
  Tooltip,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FiUsers, FiMessageCircle, FiCalendar, FiTrendingUp, FiHeart, FiAward } from 'react-icons/fi'
import { fetchStories, fetchStorytellers, fetchShifts, fetchThemes } from '../services/dataService'
import { useAirtableData } from '../context/AirtableDataContext'

const TeamExperienceHub = () => {
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const highlightColor = useColorModeValue('orange.600', 'orange.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  // Use context data for frequently accessed data
  const { storytellers, themes, shifts, isLoadingStorytellers, isLoadingThemes, isLoadingShifts } = useAirtableData()
  
  // Local state for stories (fetched separately for performance)
  const [stories, setStories] = useState([])
  const [storiesLoading, setStoriesLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Fetch stories with pagination for performance
  useEffect(() => {
    const loadStories = async () => {
      try {
        setStoriesLoading(true)
        
        // Check data provider
        const dataProvider = import.meta.env.VITE_DATA_PROVIDER || 'airtable'
        
        // Only check Airtable config if using Airtable
        if (dataProvider === 'airtable') {
          const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY
          const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
          
          if (!apiKey || apiKey === 'your_airtable_api_key_here' || !baseId || baseId === 'your_airtable_base_id_here') {
            setError('Airtable not configured. Please add your API key and Base ID to the .env file.')
            setStoriesLoading(false)
            return
          }
        }
        
        // Fetch stories
        console.log('[TeamExperienceHub] Starting fetchStories with provider:', dataProvider)
        const data = await fetchStories()
        console.log('[TeamExperienceHub] fetchStories returned:', data)
        setStories(data)
      } catch (err) {
        console.error('Failed to fetch stories:', err)
        setError('Failed to load stories. Check the console for details.')
      } finally {
        setStoriesLoading(false)
      }
    }
    
    loadStories()
  }, [])
  
  // Calculate statistics
  const stats = {
    totalStories: stories.length,
    activeStorytellers: new Set(stories.map(s => s.Storytellers?.[0] || s['Storytellers']?.[0]).filter(Boolean)).size,
    totalShifts: shifts.length,
    uniqueThemes: themes.length,
    avgStoriesPerMonth: Math.round(stories.length / 6),
    completionRate: 100 // Pilot complete
  }
  
  // Get recent stories
  const recentStories = stories
    .sort((a, b) => {
      const dateA = new Date(b.Created || b['Created'] || 0)
      const dateB = new Date(a.Created || a['Created'] || 0)
      return dateA - dateB
    })
    .slice(0, 3)
  
  // Get top contributors
  const storyCountByTeller = stories.reduce((acc, story) => {
    const tellerId = story.Storytellers?.[0] || story['Storytellers']?.[0]
    if (tellerId) {
      acc[tellerId] = (acc[tellerId] || 0) + 1
    }
    return acc
  }, {})
  
  const topContributors = Object.entries(storyCountByTeller)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([id, count]) => {
      const teller = storytellers.find(st => st.id === id)
      return { id, name: teller?.fields?.Name || 'Unknown', count }
    })

  const isLoading = storiesLoading || isLoadingStorytellers || isLoadingThemes || isLoadingShifts

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <VStack spacing={4} align="start">
              <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
                Pilot Complete ✓
              </Badge>
              <Heading size="2xl" color={highlightColor}>
                Orange Sky Team Experience Hub
              </Heading>
              <Text fontSize="xl" color="gray.600">
                6 months of stories, connections, and community impact
              </Text>
              
              <HStack spacing={4} pt={2}>
                <Button 
                  colorScheme="orange" 
                  size="lg"
                  onClick={() => navigate('/stories')}
                >
                  Explore All Stories
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/wiki')}
                >
                  Project Documentation
                </Button>
              </HStack>
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

          {/* Stats Grid */}
          <SimpleGrid columns={{ base: 1, md: 3, lg: 6 }} spacing={4}>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Stories</StatLabel>
                  <StatNumber color={highlightColor}>
                    {isLoading ? <Spinner size="sm" /> : stats.totalStories}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiMessageCircle} mr={1} />
                    Captured
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Storytellers</StatLabel>
                  <StatNumber>
                    {isLoading ? <Spinner size="sm" /> : stats.activeStorytellers}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiUsers} mr={1} />
                    Contributors
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Total Shifts</StatLabel>
                  <StatNumber>
                    {isLoading ? <Spinner size="sm" /> : stats.totalShifts}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiCalendar} mr={1} />
                    Completed
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Themes</StatLabel>
                  <StatNumber>
                    {isLoading ? <Spinner size="sm" /> : stats.uniqueThemes}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiHeart} mr={1} />
                    Identified
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Avg/Month</StatLabel>
                  <StatNumber>
                    {isLoading ? <Spinner size="sm" /> : stats.avgStoriesPerMonth}
                  </StatNumber>
                  <StatHelpText>
                    <Icon as={FiTrendingUp} mr={1} />
                    Stories
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <Stat>
                  <StatLabel>Progress</StatLabel>
                  <StatNumber>{stats.completionRate}%</StatNumber>
                  <StatHelpText>
                    <Icon as={FiAward} mr={1} />
                    Complete
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Main Content Grid */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {/* Recent Stories */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Recent Stories</Heading>
                  {isLoading ? (
                    <Spinner />
                  ) : recentStories.length > 0 ? (
                    recentStories.map((story) => (
                      <Box 
                        key={story.id} 
                        p={4} 
                        borderWidth="1px" 
                        borderRadius="md"
                        borderColor={borderColor}
                        cursor="pointer"
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                        onClick={() => navigate(`/stories/${story.id}`)}
                      >
                        <Text fontWeight="bold" noOfLines={1}>
                          {story.Title || story['Title'] || 'Untitled Story'}
                        </Text>
                        <Text fontSize="sm" color="gray.500" noOfLines={2}>
                          {story['Story copy'] || story['Story Content'] || ''}
                        </Text>
                        <Text fontSize="xs" color="gray.400" mt={2}>
                          {story.Created ? new Date(story.Created).toLocaleDateString() : 'No date'}
                        </Text>
                      </Box>
                    ))
                  ) : (
                    <Text color="gray.500">No stories yet</Text>
                  )}
                  <Button 
                    variant="link" 
                    colorScheme="orange" 
                    onClick={() => navigate('/stories')}
                  >
                    View all stories →
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Top Contributors */}
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
              <CardBody>
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Top Contributors</Heading>
                  {isLoading ? (
                    <Spinner />
                  ) : topContributors.length > 0 ? (
                    <>
                      {topContributors.map((contributor, index) => (
                        <Flex key={contributor.id} justify="space-between" align="center">
                          <HStack>
                            <Avatar size="sm" name={contributor.name} />
                            <Text fontWeight="medium">{contributor.name}</Text>
                          </HStack>
                          <Badge colorScheme="orange">{contributor.count} stories</Badge>
                        </Flex>
                      ))}
                      <Divider />
                      <AvatarGroup size="sm" max={5}>
                        {storytellers.slice(0, 8).map(st => (
                          <Tooltip key={st.id} label={st.fields.Name}>
                            <Avatar name={st.fields.Name} />
                          </Tooltip>
                        ))}
                      </AvatarGroup>
                    </>
                  ) : (
                    <Text color="gray.500">No contributors yet</Text>
                  )}
                  <Button 
                    variant="link" 
                    colorScheme="orange" 
                    onClick={() => navigate('/storytellers')}
                  >
                    View all storytellers →
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Journey Progress */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Heading size="md">6-Month Journey Progress</Heading>
                <Progress value={100} colorScheme="green" size="lg" hasStripe />
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color={highlightColor}>Jan</Text>
                    <Text fontSize="sm">Pilot Launch</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold">Mar</Text>
                    <Text fontSize="sm">Mid-point Review</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold">May</Text>
                    <Text fontSize="sm">Final Sprint</Text>
                  </Box>
                  <Box textAlign="center">
                    <Text fontSize="2xl" fontWeight="bold" color="green.500">Jun</Text>
                    <Text fontSize="sm">Complete! 🎉</Text>
                  </Box>
                </SimpleGrid>
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <Button
              size="lg"
              leftIcon={<FiMessageCircle />}
              onClick={() => navigate('/capture')}
              variant="outline"
            >
              Capture New Story
            </Button>
            <Button
              size="lg"
              leftIcon={<FiTrendingUp />}
              onClick={() => navigate('/impact')}
              variant="outline"
            >
              View Impact Analytics
            </Button>
            <Button
              size="lg"
              leftIcon={<FiAward />}
              onClick={() => navigate('/vision')}
              variant="outline"
            >
              Future Vision
            </Button>
          </SimpleGrid>
        </VStack>
      </Container>
    </Box>
  )
}

export default TeamExperienceHub