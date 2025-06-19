import {
  Box,
  Heading,
  Grid,
  Card,
  CardBody,
  CardHeader,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Icon,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { FiCamera, FiMapPin, FiClock, FiUsers, FiTrendingUp } from 'react-icons/fi'

const PhotographerDashboard = () => {
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  // Mock data for demonstration
  const upcomingShifts = [
    {
      id: 1,
      name: 'Canberra City Shift',
      date: '2024-01-15',
      time: '10:00 AM - 2:00 PM',
      location: 'Civic Square, Canberra',
      expectedStories: 5,
      status: 'confirmed'
    },
    {
      id: 2,
      name: 'Tuggeranong Community Day',
      date: '2024-01-18',
      time: '9:00 AM - 1:00 PM',
      location: 'Tuggeranong Town Centre',
      expectedStories: 8,
      status: 'pending'
    }
  ]

  const recentActivity = [
    { action: 'Completed Canberra City shift', time: '2 days ago', stories: 6 },
    { action: 'Uploaded media for Belconnen shift', time: '1 week ago', stories: 4 },
    { action: 'Submitted reflection for Woden shift', time: '2 weeks ago', stories: 3 }
  ]

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color="orangeSky.primary">
            Photographer Dashboard
          </Heading>
          <Text color="gray.600">
            Welcome back! Here's your overview of shifts and storytelling impact.
          </Text>
        </Box>

        {/* Stats Grid */}
        <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Stories Captured</StatLabel>
                <StatNumber color="orangeSky.primary">47</StatNumber>
                <StatHelpText>
                  <Icon as={FiTrendingUp} color="green.500" />
                  +12% from last month
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Shifts Completed</StatLabel>
                <StatNumber color="orangeSky.primary">15</StatNumber>
                <StatHelpText>This quarter</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Storytellers Met</StatLabel>
                <StatNumber color="orangeSky.primary">32</StatNumber>
                <StatHelpText>Unique individuals</StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardBody>
              <Stat>
                <StatLabel>Impact Reach</StatLabel>
                <StatNumber color="orangeSky.primary">1.2K</StatNumber>
                <StatHelpText>Story views</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </Grid>

        {/* Main Content Grid */}
        <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={8}>
          {/* Upcoming Shifts */}
          <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Upcoming Shifts</Heading>
                <Button
                  as={RouterLink}
                  to="/shifts"
                  size="sm"
                  colorScheme="brand"
                  variant="outline"
                >
                  View All Shifts
                </Button>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={4} align="stretch">
                {upcomingShifts.map((shift) => (
                  <Box key={shift.id} p={4} border="1px" borderColor={borderColor} borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">{shift.name}</Text>
                      <Badge colorScheme={shift.status === 'confirmed' ? 'green' : 'yellow'}>
                        {shift.status}
                      </Badge>
                    </HStack>
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Icon as={FiClock} color="gray.500" />
                        <Text fontSize="sm">{shift.date} • {shift.time}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiMapPin} color="gray.500" />
                        <Text fontSize="sm">{shift.location}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FiUsers} color="gray.500" />
                        <Text fontSize="sm">{shift.expectedStories} expected stories</Text>
                      </HStack>
                    </VStack>
                    <HStack mt={3} spacing={2}>
                      <Button size="sm" colorScheme="brand">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Prepare
                      </Button>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* Quick Actions & Recent Activity */}
          <VStack spacing={6} align="stretch">
            {/* Quick Actions */}
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Quick Actions</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  <Button
                    as={RouterLink}
                    to="/capture"
                    leftIcon={<Icon as={FiCamera} />}
                    colorScheme="brand"
                    size="sm"
                  >
                    Capture New Story
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/shifts"
                    leftIcon={<Icon as={FiMapPin} />}
                    variant="outline"
                    size="sm"
                  >
                    Browse Shifts
                  </Button>
                  <Button
                    as={RouterLink}
                    to="/stories"
                    leftIcon={<Icon as={FiUsers} />}
                    variant="outline"
                    size="sm"
                  >
                    View My Stories
                  </Button>
                </VStack>
              </CardBody>
            </Card>

            {/* Recent Activity */}
            <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
              <CardHeader>
                <Heading size="md">Recent Activity</Heading>
              </CardHeader>
              <CardBody>
                <VStack spacing={3} align="stretch">
                  {recentActivity.map((activity, index) => (
                    <Box key={index}>
                      <Text fontSize="sm" fontWeight="medium">
                        {activity.action}
                      </Text>
                      <HStack justify="space-between" mt={1}>
                        <Text fontSize="xs" color="gray.500">
                          {activity.time}
                        </Text>
                        <Badge size="sm" colorScheme="brand">
                          {activity.stories} stories
                        </Badge>
                      </HStack>
                      {index < recentActivity.length - 1 && <Divider mt={3} />}
                    </Box>
                  ))}
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </Grid>
      </VStack>
    </Box>
  )
}

export default PhotographerDashboard