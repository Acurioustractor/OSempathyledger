import React, { useState } from 'react';
import { Box, Heading, Text, Tabs, TabList, TabPanels, Tab, TabPanel, Container, Button, VStack, HStack, Badge } from '@chakra-ui/react';
import { MapView, GoogleMap } from '../components/maps';
import { Shift } from '../types/shifts';

/**
 * Example page demonstrating the standardized map components
 */
const MapExamplePage: React.FC = () => {
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(null);
  
  // Sample shift data with location information
  const shifts: Shift[] = [
    {
      id: '1',
      name: 'Downtown Shift',
      address: '123 Main St, Canberra',
      latitude: -35.2809,
      longitude: 149.1300,
      description: 'Downtown area shift with multiple story opportunities',
      date: '2023-06-15',
      createdAt: '2023-05-01T00:00:00Z',
      updatedAt: '2023-05-01T00:00:00Z',
      stories: [
        {
          id: 's1',
          title: 'Community Connection',
          content: 'Met with local business owners to discuss community engagement',
          authorId: 'user1',
          createdAt: '2023-06-15T14:00:00Z',
          updatedAt: '2023-06-15T14:00:00Z'
        }
      ]
    },
    {
      id: '2',
      name: 'Northside Outreach',
      address: '456 North Ave, Gungahlin',
      latitude: -35.1869,
      longitude: 149.1339,
      description: 'Outreach in northern suburbs',
      date: '2023-06-20',
      createdAt: '2023-05-10T00:00:00Z',
      updatedAt: '2023-05-10T00:00:00Z',
      stories: []
    },
    {
      id: '3',
      name: 'Southside Event',
      address: '789 South St, Tuggeranong',
      latitude: -35.4207,
      longitude: 149.0897,
      description: 'Community event in the southern region',
      date: '2023-06-25',
      createdAt: '2023-05-15T00:00:00Z',
      updatedAt: '2023-05-15T00:00:00Z',
      stories: [
        {
          id: 's2',
          title: 'Youth Engagement',
          content: 'Connected with youth center staff about outreach opportunities',
          authorId: 'user2',
          createdAt: '2023-06-25T10:30:00Z',
          updatedAt: '2023-06-25T10:30:00Z'
        },
        {
          id: 's3',
          title: 'Community Feedback',
          content: 'Gathered feedback about needed services from local residents',
          authorId: 'user1',
          createdAt: '2023-06-25T15:45:00Z',
          updatedAt: '2023-06-25T15:45:00Z'
        }
      ]
    }
  ];
  
  // Handle shift selection
  const handleShiftSelect = (shiftId: string) => {
    setSelectedShiftId(shiftId);
    console.log(`Selected shift: ${shiftId}`);
  };
  
  // Custom render function for info window
  const renderInfoContent = (shift: Shift) => {
    const storyCount = shift.stories?.length || 0;
    
    return (
      <Box p={3}>
        <Heading size="sm" mb={2}>{shift.name}</Heading>
        {shift.address && <Text fontSize="sm" mb={2}>{shift.address}</Text>}
        <Badge colorScheme={storyCount > 0 ? "green" : "gray"}>
          {storyCount} Stories
        </Badge>
        {shift.description && (
          <Text fontSize="sm" mt={2}>{shift.description}</Text>
        )}
      </Box>
    );
  };
  
  return (
    <Container maxW="container.xl" py={8}>
      <Heading mb={6}>Standardized Map Components</Heading>
      <Text mb={6}>
        This page demonstrates the standardized map components using a consistent API.
        There are different components available depending on your needs:
      </Text>
      
      <Tabs variant="enclosed" colorScheme="blue" mb={8}>
        <TabList>
          <Tab>MapView (Recommended)</Tab>
          <Tab>GoogleMap (Basic)</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={4}>MapView Component</Heading>
                <Text mb={4}>
                  The MapView component includes a search interface and list view alongside the map.
                  This is the recommended component for most use cases.
                </Text>
              </Box>
              
              <Box borderRadius="lg" overflow="hidden" border="1px" borderColor="gray.200">
                <MapView 
                  shifts={shifts}
                  selectedShiftId={selectedShiftId}
                  onShiftSelect={handleShiftSelect}
                />
              </Box>
              
              <Box bg="blue.50" p={4} borderRadius="md">
                <Heading size="sm" mb={2}>Usage Example:</Heading>
                <pre style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
{`<MapView 
  shifts={shiftsData}
  selectedShiftId={selectedId}
  onShiftSelect={handleSelectShift}
/>`}
                </pre>
              </Box>
            </VStack>
          </TabPanel>
          
          <TabPanel>
            <VStack align="stretch" spacing={4}>
              <Box>
                <Heading size="md" mb={4}>GoogleMap Component</Heading>
                <Text mb={4}>
                  The GoogleMap component is a simpler map implementation without the list view.
                  Use this when you need more control over the map display or want to integrate it
                  in a custom layout.
                </Text>
              </Box>
              
              <Box height="500px" borderRadius="lg" overflow="hidden" border="1px" borderColor="gray.200">
                <GoogleMap 
                  shifts={shifts}
                  selectedShiftId={selectedShiftId}
                  onMarkerClick={(shift) => handleShiftSelect(shift.id)}
                  renderInfoContent={renderInfoContent}
                />
              </Box>
              
              <Box bg="blue.50" p={4} borderRadius="md">
                <Heading size="sm" mb={2}>Usage Example:</Heading>
                <pre style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', overflowX: 'auto' }}>
{`<GoogleMap 
  shifts={shiftsData}
  selectedShiftId={selectedId}
  onMarkerClick={(shift) => handleSelectShift(shift.id)}
  renderInfoContent={customRenderFunction}
/>`}
                </pre>
              </Box>
            </VStack>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Box p={4} bg="gray.50" borderRadius="md">
        <Heading size="md" mb={4}>Benefits of Standardization</Heading>
        <VStack align="stretch" spacing={3}>
          <HStack>
            <Badge colorScheme="green" fontSize="md">1</Badge>
            <Text>Consistent API across all map implementations</Text>
          </HStack>
          <HStack>
            <Badge colorScheme="green" fontSize="md">2</Badge>
            <Text>Improved performance through shared hooks and optimizations</Text>
          </HStack>
          <HStack>
            <Badge colorScheme="green" fontSize="md">3</Badge>
            <Text>Better organization of map-related code</Text>
          </HStack>
          <HStack>
            <Badge colorScheme="green" fontSize="md">4</Badge>
            <Text>Easier maintenance with modular components</Text>
          </HStack>
        </VStack>
      </Box>
    </Container>
  );
};

export default MapExamplePage; 