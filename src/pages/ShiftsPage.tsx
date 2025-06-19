import {
  Box,
  Heading,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Flex,
  Spacer,
} from '@chakra-ui/react'
import { 
  FiMapPin, 
  FiClock, 
  FiUsers, 
  FiDollarSign, 
  FiSearch,
  FiFilter,
  FiCalendar 
} from 'react-icons/fi'
import { useState, useEffect } from 'react'
import { fetchShifts } from '../services/dataService'
import { Shift } from '../services/airtable'

const ShiftsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [claimedShifts, setClaimedShifts] = useState<string[]>([])
  
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Load shifts data
  useEffect(() => {
    const loadShifts = async () => {
      try {
        setLoading(true)
        const shiftsData = await fetchShifts()
        setShifts(shiftsData)
      } catch (error) {
        console.error('Error loading shifts:', error)
      } finally {
        setLoading(false)
      }
    }
    loadShifts()
  }, [])

  // Transform shift data into displayable format with mock shift details
  const availableShifts = shifts.map((shift, index) => ({
    id: shift.id,
    name: shift.Name,
    date: new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Future dates
    time: ['9:00 AM - 1:00 PM', '10:00 AM - 2:00 PM', '2:00 PM - 6:00 PM'][index % 3],
    location: shift.Location || shift.Address || 'TBA',
    expectedStories: Math.floor(Math.random() * 8) + 3, // 3-10 stories
    type: ['community', 'mobile', 'event'][index % 3] as 'community' | 'mobile' | 'event',
    compensation: Math.random() > 0.5 ? 'paid' : 'volunteer' as 'paid' | 'volunteer',
    urgency: ['high', 'medium', 'low'][index % 3] as 'high' | 'medium' | 'low',
    description: shift.Description || `${shift.Name} community outreach and support service.`,
    teamLead: ['Sarah Johnson', 'Michael Chen', 'Emma Wilson', 'David Lee'][index % 4],
    contact: ['+61 400 123 456', '+61 400 789 012', '+61 400 345 678', '+61 400 567 890'][index % 4]
  })).filter(shift => 
    // Filter out claimed shifts
    !claimedShifts.includes(shift.id)
  )

  // Mock data for claimed shifts with the first shift from our data
  const myClaimedShifts = shifts.slice(0, 1).map((shift) => ({
    id: shift.id,
    name: shift.Name,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    time: '2:00 PM - 6:00 PM',
    location: shift.Location || shift.Address || 'Woden Town Centre',
    status: 'confirmed' as const,
    expectedStories: 5,
    teamLead: 'David Lee'
  }))

  const handleClaimShift = (shiftId: string) => {
    setClaimedShifts(prev => [...prev, shiftId])
    // In a real app, this would make an API call
    console.log('Claimed shift:', shiftId)
  }

  const filteredAvailableShifts = availableShifts.filter(shift => {
    const matchesSearch = shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLocation = locationFilter === 'all' || 
                           shift.location.toLowerCase().includes(locationFilter.toLowerCase())
    const matchesType = typeFilter === 'all' || shift.type === typeFilter
    
    return matchesSearch && matchesLocation && matchesType
  })

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <VStack spacing={4}>
          <Text>Loading shifts...</Text>
        </VStack>
      </Box>
    )
  }


  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'green'
      default: return 'gray'
    }
  }

  const getCompensationColor = (compensation: string) => {
    return compensation === 'paid' ? 'green' : 'blue'
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color="orangeSky.primary">
            Shift Marketplace
          </Heading>
          <Text color="gray.600">
            Browse and claim available shifts to capture community stories
          </Text>
        </Box>

        {/* Filters */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
              <InputGroup>
                <InputLeftElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search shifts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              <Select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                icon={<FiMapPin />}
              >
                <option value="all">All Locations</option>
                <option value="canberra">Canberra City</option>
                <option value="tuggeranong">Tuggeranong</option>
                <option value="belconnen">Belconnen</option>
                <option value="woden">Woden</option>
              </Select>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                icon={<FiFilter />}
              >
                <option value="all">All Types</option>
                <option value="community">Community</option>
                <option value="mobile">Mobile Service</option>
                <option value="event">Special Event</option>
              </Select>
            </Grid>
          </CardBody>
        </Card>

        {/* Tabs for Available vs Claimed Shifts */}
        <Tabs colorScheme="brand">
          <TabList>
            <Tab>Available Shifts ({filteredAvailableShifts.length})</Tab>
            <Tab>My Claimed Shifts ({myClaimedShifts.length})</Tab>
          </TabList>

          <TabPanels>
            {/* Available Shifts */}
            <TabPanel px={0}>
              <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                {filteredAvailableShifts.map((shift) => (
                  <Card key={shift.id} bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <CardHeader>
                      <Flex align="start">
                        <Box>
                          <Heading size="md" mb={2}>{shift.name}</Heading>
                          <HStack spacing={2} mb={2}>
                            <Badge colorScheme={getUrgencyColor(shift.urgency)}>
                              {shift.urgency} priority
                            </Badge>
                            <Badge colorScheme={getCompensationColor(shift.compensation)}>
                              {shift.compensation}
                            </Badge>
                            <Badge variant="outline">
                              {shift.type}
                            </Badge>
                          </HStack>
                        </Box>
                        <Spacer />
                        <Button 
                          colorScheme="brand" 
                          size="sm"
                          onClick={() => handleClaimShift(shift.id)}
                        >
                          Claim Shift
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Icon as={FiCalendar} color="gray.500" />
                          <Text fontSize="sm">{shift.date}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiClock} color="gray.500" />
                          <Text fontSize="sm">{shift.time}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiMapPin} color="gray.500" />
                          <Text fontSize="sm">{shift.location}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiUsers} color="gray.500" />
                          <Text fontSize="sm">{shift.expectedStories} expected stories</Text>
                        </HStack>
                        
                        <Text fontSize="sm" color="gray.600" mt={2}>
                          {shift.description}
                        </Text>
                        
                        <Box mt={3} p={3} bg="gray.50" borderRadius="md" w="full">
                          <Text fontSize="sm" fontWeight="medium">Team Lead: {shift.teamLead}</Text>
                          <Text fontSize="sm" color="gray.600">Contact: {shift.contact}</Text>
                        </Box>
                        
                        <HStack mt={4} spacing={2} w="full">
                          <Button 
                            size="sm" 
                            colorScheme="brand" 
                            flex={1}
                            onClick={() => handleClaimShift(shift.id)}
                          >
                            Claim Shift
                          </Button>
                          <Button size="sm" variant="outline">
                            More Details
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            {/* Claimed Shifts */}
            <TabPanel px={0}>
              <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
                {myClaimedShifts.map((shift) => (
                  <Card key={shift.id} bg={cardBg} borderColor={borderColor} borderWidth="1px">
                    <CardHeader>
                      <Flex align="start">
                        <Box>
                          <Heading size="md" mb={2}>{shift.name}</Heading>
                          <Badge colorScheme="green">{shift.status}</Badge>
                        </Box>
                        <Spacer />
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardBody pt={0}>
                      <VStack align="start" spacing={3}>
                        <HStack>
                          <Icon as={FiCalendar} color="gray.500" />
                          <Text fontSize="sm">{shift.date}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiClock} color="gray.500" />
                          <Text fontSize="sm">{shift.time}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiMapPin} color="gray.500" />
                          <Text fontSize="sm">{shift.location}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiUsers} color="gray.500" />
                          <Text fontSize="sm">{shift.expectedStories} expected stories</Text>
                        </HStack>
                        
                        <Box mt={3} p={3} bg="green.50" borderRadius="md" w="full">
                          <Text fontSize="sm" fontWeight="medium">Team Lead: {shift.teamLead}</Text>
                          <Text fontSize="sm" color="gray.600">Status: Ready to begin</Text>
                        </Box>
                        
                        <HStack mt={4} spacing={2} w="full">
                          <Button size="sm" colorScheme="brand" flex={1}>
                            Start Shift
                          </Button>
                          <Button size="sm" variant="outline">
                            Prepare
                          </Button>
                        </HStack>
                      </VStack>
                    </CardBody>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Box>
  )
}

export default ShiftsPage