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
  Card,
  CardBody,
  CardHeader,
  Icon,
  HStack,
  List,
  ListItem,
  ListIcon,
  Divider,
  Progress,
  Flex,
  Spinner,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { 
  FiUsers, 
  FiTarget, 
  FiTrendingUp, 
  FiGlobe, 
  FiBook,
  FiHeart,
  FiShield,
  FiDatabase,
  FiSmartphone,
  FiMic,
  FiCheckCircle,
  FiClock,
  FiZap
} from 'react-icons/fi'
import { fetchStories } from '../services/dataService'
import { useAirtableData } from '../context/AirtableDataContext'

const VisionPage = () => {
  const navigate = useNavigate()
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const highlightColor = useColorModeValue('orange.600', 'orange.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedFeature, setSelectedFeature] = useState(null)
  
  // Get context data
  const { storytellers, themes } = useAirtableData()
  
  // Local state for stories count
  const [storiesCount, setStoriesCount] = useState(0)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const loadStoriesCount = async () => {
      try {
        // Check if Airtable is configured
        const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY
        const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID
        
        if (!apiKey || apiKey === 'your_airtable_api_key_here' || !baseId || baseId === 'your_airtable_base_id_here') {
          // Use placeholder data when not configured
          setStoriesCount(0)
          setLoading(false)
          return
        }
        
        const stories = await fetchStories({ pageSize: 1 }) // Just get count
        setStoriesCount(stories.length)
      } catch (err) {
        console.error('Failed to fetch stories count:', err)
        setStoriesCount(0) // Default to 0 on error
      } finally {
        setLoading(false)
      }
    }
    
    loadStoriesCount()
  }, [])
  
  // Vision features with live data integration
  const visionFeatures = [
    {
      title: 'Training & Onboarding Hub',
      icon: FiBook,
      color: 'blue',
      status: 'planned',
      description: 'Interactive modules for new volunteers',
      impact: `Train ${storytellers.length * 10}+ volunteers annually`,
      details: [
        'Interactive listening scenarios',
        'Best practices video library',
        'Certification pathway',
        'Mobile-friendly modules'
      ]
    },
    {
      title: 'Supporter Engagement Portal',
      icon: FiHeart,
      color: 'pink',
      status: 'planned',
      description: 'Connect supporters with real impact',
      impact: `Share ${storiesCount}+ stories with supporters`,
      details: [
        'Personalized impact reports',
        'Story subscription service',
        'Donor recognition features',
        'Community engagement tools'
      ]
    },
    {
      title: 'Shift Integration System',
      icon: FiDatabase,
      color: 'green',
      status: 'in_progress',
      description: 'Seamless connection with shift management',
      impact: 'Real-time story capture during shifts',
      details: [
        'Auto-link stories to shifts',
        'Shift-based analytics',
        'Team performance insights',
        'Location-based tracking'
      ]
    },
    {
      title: 'Voice-to-Text AI',
      icon: FiMic,
      color: 'purple',
      status: 'planned',
      description: 'Record stories with voice capture',
      impact: '10x faster story capture',
      details: [
        'Real-time transcription',
        'Multi-language support',
        'Emotion detection',
        'Automatic theme tagging'
      ]
    },
    {
      title: 'Mobile App',
      icon: FiSmartphone,
      color: 'teal',
      status: 'planned',
      description: 'Capture stories on the go',
      impact: 'Enable field volunteers',
      details: [
        'Offline story capture',
        'Photo & video support',
        'GPS location tagging',
        'Quick voice notes'
      ]
    },
    {
      title: 'Advanced Analytics',
      icon: FiTrendingUp,
      color: 'orange',
      status: 'in_progress',
      description: 'Deep insights & predictions',
      impact: `Analyze ${themes.length}+ themes automatically`,
      details: [
        'Sentiment analysis',
        'Theme clustering',
        'Predictive insights',
        'Custom reports'
      ]
    }
  ]
  
  const openFeatureModal = (feature) => {
    setSelectedFeature(feature)
    onOpen()
  }
  
  const getStatusBadge = (status) => {
    switch(status) {
      case 'in_progress':
        return { color: 'yellow', text: 'In Development' }
      case 'planned':
        return { color: 'gray', text: 'Planned' }
      case 'complete':
        return { color: 'green', text: 'Complete' }
      default:
        return { color: 'gray', text: 'Future' }
    }
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <VStack spacing={4} align="start">
              <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
                Future Vision
              </Badge>
              <Heading size="2xl" color={highlightColor}>
                The Future of Empathy Ledger
              </Heading>
              <Text fontSize="xl" color="gray.600">
                Transforming how Orange Sky captures, shares, and learns from community voices
              </Text>
              
              <HStack spacing={4} pt={2}>
                <Button 
                  colorScheme="orange" 
                  size="lg"
                  onClick={() => navigate('/team-experience')}
                >
                  View Current Progress
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/impact')}
                >
                  See Current Impact
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Vision Timeline */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Development Roadmap</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <HStack justify="space-between">
                  <Text fontWeight="bold">Phase 1: Foundation (Complete)</Text>
                  <Badge colorScheme="green">100%</Badge>
                </HStack>
                <Progress value={100} colorScheme="green" />
                
                <HStack justify="space-between">
                  <Text fontWeight="bold">Phase 2: Integration (Current)</Text>
                  <Badge colorScheme="yellow">40%</Badge>
                </HStack>
                <Progress value={40} colorScheme="yellow" />
                
                <HStack justify="space-between">
                  <Text fontWeight="bold">Phase 3: Intelligence</Text>
                  <Badge>Planned</Badge>
                </HStack>
                <Progress value={0} />
                
                <HStack justify="space-between">
                  <Text fontWeight="bold">Phase 4: Scale</Text>
                  <Badge>Future</Badge>
                </HStack>
                <Progress value={0} />
              </VStack>
            </CardBody>
          </Card>

          {/* Feature Grid */}
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {visionFeatures.map((feature, index) => {
              const statusBadge = getStatusBadge(feature.status)
              return (
                <Card 
                  key={index} 
                  bg={cardBg} 
                  borderWidth="1px" 
                  borderColor={borderColor}
                  cursor="pointer"
                  _hover={{ transform: 'translateY(-4px)', shadow: 'lg' }}
                  transition="all 0.2s"
                  onClick={() => openFeatureModal(feature)}
                >
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Icon as={feature.icon} boxSize={8} color={`${feature.color}.500`} />
                        <Badge colorScheme={statusBadge.color}>{statusBadge.text}</Badge>
                      </HStack>
                      
                      <Box>
                        <Heading size="md" mb={2}>{feature.title}</Heading>
                        <Text color="gray.600" fontSize="sm">{feature.description}</Text>
                      </Box>
                      
                      <Divider />
                      
                      <HStack>
                        <Icon as={FiZap} color={highlightColor} />
                        <Text fontSize="sm" fontWeight="medium">
                          {loading ? <Spinner size="xs" /> : feature.impact}
                        </Text>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>

          {/* Key Benefits */}
          <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
            <CardHeader>
              <Heading size="md">Why This Matters</Heading>
            </CardHeader>
            <CardBody>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={FiUsers} color={highlightColor} boxSize={6} />
                    <Text fontWeight="bold">Empower Volunteers</Text>
                  </HStack>
                  <Text color="gray.600">
                    Give every volunteer the tools and training to capture meaningful stories with confidence.
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={FiTarget} color={highlightColor} boxSize={6} />
                    <Text fontWeight="bold">Measure True Impact</Text>
                  </HStack>
                  <Text color="gray.600">
                    Move beyond numbers to understand the real human impact of Orange Sky's services.
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={FiGlobe} color={highlightColor} boxSize={6} />
                    <Text fontWeight="bold">Scale Ethically</Text>
                  </HStack>
                  <Text color="gray.600">
                    Grow the platform while maintaining respect and dignity for every storyteller.
                  </Text>
                </VStack>
                
                <VStack align="start" spacing={3}>
                  <HStack>
                    <Icon as={FiShield} color={highlightColor} boxSize={6} />
                    <Text fontWeight="bold">Protect Privacy</Text>
                  </HStack>
                  <Text color="gray.600">
                    Ensure every story is shared with consent and protected with enterprise-grade security.
                  </Text>
                </VStack>
              </SimpleGrid>
            </CardBody>
          </Card>

          {/* Call to Action */}
          <Box textAlign="center" py={8}>
            <VStack spacing={4}>
              <Heading size="lg">Ready to Shape the Future?</Heading>
              <Text fontSize="lg" color="gray.600">
                Your feedback and ideas will help build the next generation of ethical storytelling
              </Text>
              <HStack spacing={4}>
                <Button size="lg" colorScheme="orange" onClick={() => navigate('/wiki#feedback')}>
                  Share Feedback
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/team-experience')}>
                  View Progress
                </Button>
              </HStack>
            </VStack>
          </Box>
        </VStack>
      </Container>

      {/* Feature Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent bg={cardBg}>
          <ModalHeader>
            <HStack>
              {selectedFeature && <Icon as={selectedFeature.icon} boxSize={6} color={`${selectedFeature.color}.500`} />}
              <Text>{selectedFeature?.title}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedFeature && (
              <VStack align="stretch" spacing={4}>
                <Text fontSize="lg" color="gray.600">{selectedFeature.description}</Text>
                
                <Box>
                  <Text fontWeight="bold" mb={2}>Key Features:</Text>
                  <List spacing={2}>
                    {selectedFeature.details.map((detail, idx) => (
                      <ListItem key={idx}>
                        <ListIcon as={FiCheckCircle} color="green.500" />
                        {detail}
                      </ListItem>
                    ))}
                  </List>
                </Box>
                
                <Divider />
                
                <HStack>
                  <Icon as={FiZap} color={highlightColor} />
                  <Text fontWeight="bold">Expected Impact:</Text>
                  <Text>{selectedFeature.impact}</Text>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="orange" mr={3} onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default VisionPage