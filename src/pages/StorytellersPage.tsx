import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  Image,
  HStack,
  Badge,
  Button,
  useColorModeValue,
  Flex,
  Select,
  InputGroup,
  InputLeftElement,
  Code,
  Tooltip,
  Avatar,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Divider,
} from '@chakra-ui/react'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { Storyteller, fetchStorytellers, AirtableAttachment, fetchMedia, Media, Shift, fetchShifts } from '../services/airtable'
import { SearchIcon, AddIcon } from '@chakra-ui/icons'
import { getProfileImageOrFallback } from '../services/imageUtils'
import StorytellersForm from '../components/StorytellersForm'

// Define filter type for better type safety and reusability
type FilterOption = {
  id: string;
  name: string;
  value: string;
}

const StorytellersPage = () => {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [shiftFilter, setShiftFilter] = useState('')
  const [debug, setDebug] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  useEffect(() => {
    loadData()
  }, [])
  
  const loadData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch data from all tables in parallel
      const [storytellersResult, mediaResult, shiftsResult] = await Promise.all([
        fetchStorytellers(),
        fetchMedia(),
        fetchShifts()
      ]);
      console.log('Fetched storytellers:', storytellersResult.length);
      console.log('Fetched media:', mediaResult.length);
      console.log('Fetched shifts:', shiftsResult.length);
      
      // Debug the actual shift data
      console.log('Shifts data (first 3):', shiftsResult.slice(0, 3));
      
      // Debug all shift IDs in media records
      const shiftIdsInMedia = mediaResult
        .filter(m => m.Shift)
        .map(m => m.Shift);
      console.log(`Found ${shiftIdsInMedia.length} media items with shifts:`, 
        shiftIdsInMedia.slice(0, 10));
      
      setStorytellers(storytellersResult);
      setMedia(mediaResult);
      setShifts(shiftsResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data'
      setError(errorMessage)
      console.error('Error loading data:', err);
    } finally {
      setLoading(false)
    }
  }

  // Get shift display name from the shifts data
  const getShiftDisplayName = useCallback((shiftId: string): string => {
    if (!shiftId) return "";
    
    // Look up in the shifts data first (from Airtable)
    const shift = shifts.find(s => s.id === shiftId);
    if (shift?.Name) return shift.Name;
    
    // If not found, check if the ID is actually a name (from 'Shifts (from Media)')
    return shiftId;
  }, [shifts]);

  // Hardcoded shift-to-storyteller mapping based on screenshots
  const getStorytellerShifts = (storyteller: Storyteller): string[] => {
    const knownMappings: Record<string, string[]> = {
      // Exact matches from screenshots
      "Chris Mourad": ["Doveton"],
      "Wayne Tait": ["Doveton"],
      "David Allen": ["Doveton"],
      "Celeste Gibbs": ["Blue Door Pod"],
      "Siobhan Leyne": ["Blue Door Pod"],
      "Marcus Barlow": ["Blue Door Pod"],
      "Paul": ["St Benedicts at Annies"],
      "Edward Campion": ["St Benedicts at Annies"],
      "Tig Hall": ["St Benedicts at Annies"],
      "Freddy Wai": ["James St"],
      "Bernie Moran": ["TOMNET"],
      "Charlie Brun": ["TOMNET"],
      "Anthony Hegerty": ["TOMNET"],
      "Michael Quinn": ["TOMNET"],
      "Darrell Pierpoint": ["TOMNET"],
      "Ray Kirkman": ["TOMNET"],
      "Drew Nicholls": ["Foothills"],
      "Sharna Wentworth": ["Foothills"],
      "Pam Ramsay": ["Foothills"],
      "James Dinsdale": ["Foothills"],
      "Shaun Thomas Rogers": ["Communities at Work Gungahlin"],
      "Daniel O'neill": ["Communities at Work Gungahlin"],
      "Brigit Perry": ["Dickson Place"],
    };

    // Check if we have known mappings for this storyteller
    if (storyteller.Name && knownMappings[storyteller.Name]) {
      return knownMappings[storyteller.Name];
    }

    // Otherwise check fields in order of reliability
    const shifts: string[] = [];
    
    // Check Project field - common to be used for shifts
    if (storyteller.Project === "TOMNET") {
      shifts.push("TOMNET");
    }
    
    // Check Shifts (from Media)
    if (typeof storyteller['Shifts (from Media)'] === 'string') {
      shifts.push(storyteller['Shifts (from Media)']);
    } else if (Array.isArray(storyteller['Shifts (from Media)'])) {
      shifts.push(...storyteller['Shifts (from Media)']);
    }
    
    return shifts;
  };
  
  // Generate unique shift options from both the shifts table and storyteller records
  const shiftOptions = useMemo((): FilterOption[] => {
    const shiftOptionsMap = new Map<string, FilterOption>();
    
    // First, add all shifts from the dedicated shifts table
    shifts.forEach(shift => {
      if (shift.id && shift.Name) {
        shiftOptionsMap.set(shift.id, {
          id: shift.id,
          name: shift.Name,
          value: shift.id
        });
      }
    });
    
    // Then add any additional shifts from the storytellers data
    storytellers.forEach(st => {
      const shiftValue = st['Shifts (from Media)'];
      
      if (typeof shiftValue === 'string' && shiftValue) {
        if (!shiftOptionsMap.has(shiftValue)) {
          shiftOptionsMap.set(shiftValue, {
            id: shiftValue,
            name: shiftValue, // Use ID as name if no better name available
            value: shiftValue
          });
        }
      } else if (Array.isArray(shiftValue)) {
        shiftValue.forEach(s => {
          if (s && !shiftOptionsMap.has(s)) {
            shiftOptionsMap.set(s, {
              id: s,
              name: s, // Use ID as name if no better name available
              value: s
            });
          }
        });
      }
    });
    
    // Convert to array and sort by name
    return Array.from(shiftOptionsMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [shifts, storytellers]);
  
  // Get unique projects for filter dropdown
  const projectOptions = useMemo((): FilterOption[] => {
    const projectSet = new Set<string>();
    
    storytellers.forEach(s => {
      if (s.Project) {
        projectSet.add(s.Project as string);
      }
    });
    
    return Array.from(projectSet)
      .sort()
      .map(project => ({
        id: project,
        name: project,
        value: project
      }));
  }, [storytellers]);
  
  // Simple check if a storyteller has a specific shift - directly using the field
  const hasShift = useCallback((storyteller: Storyteller, shift: string): boolean => {
    const shiftValue = storyteller['Shifts (from Media)'];
    
    // Case 1: Direct string match
    if (typeof shiftValue === 'string') {
      return shiftValue === shift;
    }
    
    // Case 2: Array includes
    if (Array.isArray(shiftValue)) {
      return shiftValue.includes(shift);
    }
    
    return false;
  }, []);
  
  // Filter storytellers based on selected filters
  const filteredStorytellers = useMemo(() => {
    let results = [...storytellers];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(st => 
        st.Name?.toLowerCase().includes(term) || 
        st.Location?.toLowerCase().includes(term) || 
        st.Bio?.toLowerCase().includes(term)
      );
    }
    
    // Project filter
    if (projectFilter) {
      results = results.filter(st => st.Project === projectFilter);
    }
    
    // Shift filter - direct comparison with the field
    if (shiftFilter) {
      results = results.filter(st => hasShift(st, shiftFilter));
      
      // Debug info
      console.log(`Filtered to ${results.length} storytellers with shift: ${shiftFilter}`);
      results.forEach(st => {
        console.log(`- ${st.Name} has shift ${shiftFilter}`);
      });
    }
    
    return results;
  }, [storytellers, searchTerm, projectFilter, shiftFilter, hasShift]);
  
  // Handle form submission for adding a new storyteller
  const handleAddStorytellerSubmit = (newStoryteller: Storyteller) => {
    setStorytellers(prev => [...prev, newStoryteller]);
    onClose();
  }
  
  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Storytellers</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={onOpen}
          >
            Add Storyteller
          </Button>
        </Flex>
        
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4}
          align={{ base: 'stretch', md: 'center' }}
        >
          <InputGroup maxW={{ base: '100%', md: '400px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search storytellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="All Projects"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            maxW={{ base: '100%', md: '250px' }}
          >
            {projectOptions.map(option => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>
          
          {/* Shift Filter - using proper display names */}
          <Select
            placeholder="All Shifts"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            maxW={{ base: '100%', md: '250px' }}
          >
            {shiftOptions.map(option => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>
          
          <Button ml="auto" onClick={loadData} isLoading={loading}>
            Refresh
          </Button>
          
          <Button size="sm" onClick={() => setDebug(!debug)}>
            {debug ? 'Hide Debug' : 'Debug'}
          </Button>
        </Flex>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : filteredStorytellers.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>No storytellers found</Text>
          </Box>
        ) : (
          <Grid 
            templateColumns={{ 
              base: "repeat(1, 1fr)", 
              md: "repeat(2, 1fr)", 
              lg: "repeat(3, 1fr)" 
            }}
            gap={6}
          >
            {filteredStorytellers.map(storyteller => {
              console.log(`Processing storyteller: ${storyteller.Name}`, storyteller);
              console.log(`File_Profile_Image for ${storyteller.Name}:`, storyteller['File Profile Image']);
              
              // Get image URL - either from Airtable or generate a fallback
              const imageUrl = getProfileImageOrFallback(storyteller.Name, storyteller['File Profile Image']);
              console.log(`Generated imageUrl for ${storyteller.Name}:`, imageUrl);
              
              // Get shifts for this storyteller for debug display
              const storytellerShifts = debug 
                ? storyteller['Shifts (from Media)'] 
                  ? (Array.isArray(storyteller['Shifts (from Media)']) 
                      ? storyteller['Shifts (from Media)'].map(id => getShiftDisplayName(id))
                      : [getShiftDisplayName(storyteller['Shifts (from Media)'] as string)])
                  : []
                : [];
              
              return (
                <Box
                  key={storyteller.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  bg={cardBg}
                  borderColor={borderColor}
                  transition="transform 0.2s"
                  _hover={{
                    transform: 'translateY(-5px)',
                    shadow: 'md'
                  }}
                  as={RouterLink}
                  to={`/storyteller/${storyteller.id}`}
                >
                  <Box 
                    height="200px" 
                    position="relative" 
                    overflow="hidden"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    backgroundColor="gray.100"
                  >
                    <Image
                      src={imageUrl}
                      alt={storyteller.Name}
                      height="100%"
                      width="100%"
                      objectFit="cover"
                      fallback={
                        <Box
                          height="100%"
                          width="100%"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          bg="gray.100"
                        >
                          <Avatar 
                            size="2xl" 
                            name={storyteller.Name} 
                            backgroundColor="transparent"
                          />
                        </Box>
                      }
                    />
                    
                    {debug && (
                      <Box 
                        position="absolute" 
                        bottom={0} 
                        right={0} 
                        bg="blackAlpha.700" 
                        color="white"
                        p={1}
                        fontSize="xs"
                        maxW="100%"
                        overflow="hidden"
                      >
                        {storyteller['File Profile Image'] ? 
                          `Has attachment: ${storyteller['File Profile Image'].length > 0}` : 
                          'No attachment'}
                        
                        {/* Add shifts to debug info */}
                        {storytellerShifts.length > 0 && 
                          ` | Shifts: ${storytellerShifts.join(', ')}`}
                        
                        {/* Add a tooltip with debug info */}
                        <Tooltip 
                          label={
                            <Box maxH="400px" overflowY="auto" width="500px">
                              <Text fontWeight="bold" mb={2}>Image URL: {imageUrl || 'none'}</Text>
                              <Divider my={2} />
                              <Text fontWeight="bold" mb={1}>Attachment Data:</Text>
                              <pre>{JSON.stringify(storyteller['File Profile Image'], null, 2)}</pre>
                              
                              {/* Add shifts detail to tooltip */}
                              {storytellerShifts.length > 0 && (
                                <>
                                  <Divider my={2} />
                                  <Text fontWeight="bold" mb={1}>Shifts:</Text>
                                  <pre>{JSON.stringify(storytellerShifts, null, 2)}</pre>
                                </>
                              )}
                            </Box>
                          } 
                          placement="top-start"
                          hasArrow
                          bg="gray.800"
                          color="white"
                          maxW="600px"
                        >
                          <Button size="xs" mt={1} colorScheme="blue" variant="outline">
                            View Details
                          </Button>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                  
                  <Box p={5}>
                    <Heading size="md" mb={2} noOfLines={1}>
                      {storyteller.Name}
                    </Heading>
                    
                    <HStack mt={2} mb={3} spacing={2} flexWrap="wrap">
                      {storyteller.Project && (
                        <Badge colorScheme="green">
                          {storyteller.Project}
                        </Badge>
                      )}
                      {storyteller.Role && (
                        <Badge colorScheme="blue">
                          {storyteller.Role}
                        </Badge>
                      )}
                      
                      {/* Show shift badge if filtered by shift */}
                      {shiftFilter && hasShift(storyteller, shiftFilter) && (
                        <Badge colorScheme="purple">
                          {getShiftDisplayName(shiftFilter)}
                        </Badge>
                      )}
                    </HStack>
                    
                    {storyteller.Summary && (
                      <Text noOfLines={2} fontSize="sm" color="gray.600">
                        {storyteller.Summary}
                      </Text>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Grid>
        )}
      </VStack>
      
      {/* Add Storyteller Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Storyteller</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <StorytellersForm 
              onSubmit={handleAddStorytellerSubmit}
              isLoading={loading}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default StorytellersPage 