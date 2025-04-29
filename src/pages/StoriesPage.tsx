import { useState, useEffect, useCallback, useMemo, ChangeEvent } from 'react'
import {
  Container,
  HStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Input,
  Badge,
  Select,
  useToast,
  Stack,
  Avatar,
  Link,
  ButtonGroup,
  SimpleGrid,
  Box,
  VStack,
} from '@chakra-ui/react'
import { AddIcon } from '@chakra-ui/icons'
import { Story, deleteRecord, Storyteller, Media } from '../services/airtable'
// Commenting out StoryForm import until the component is available
// import StoryForm from '../components/StoryForm'
import MapView from '../components/MapView'
import useStoriesData from '../hooks/useStoriesData'
import StoryDetailModal from '../components/StoryDetailModal' // Assuming this component will be created
import StoryCard from '../components/StoryCard' // Import StoryCard
import useMediaData from '../hooks/useMediaData'
import useStorytellersData from '../hooks/useStorytellersData'

// Interface for storyteller display data
interface StorytellerDisplay {
  id: string;
  name: string;
  image?: string;
}

const StoriesPage = () => {
  const [displayedStories, setDisplayedStories] = useState<Story[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStoryForEdit, setSelectedStoryForEdit] = useState<Story | null>(null)
  const [selectedStoryForDetail, setSelectedStoryForDetail] = useState<Story | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'map' | 'card'>('list')
  // Commenting out unused sort state for now
  // const [sortField, setSortField] = useState<string>('Title')
  // const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const toast = useToast()
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [storytellerFilter, setStorytellerFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [shiftFilter, setShiftFilter] = useState<string>('all');
  
  // Separate disclosures for Edit and Detail modals
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  
  // Use the standardized data fetching hook
  const fetchOptions = useMemo(() => ({}), []); 
  
  const { stories, shifts, isLoading: loadingStories, error: errorStories, refetchStories } = useStoriesData(fetchOptions); 
  const { storytellers, isLoading: loadingStorytellers, error: errorStorytellers } = useStorytellersData();
  const { media, isLoading: loadingMedia, error: errorMedia } = useMediaData();
  
  // Combine loading and error states
  const isLoading = loadingStories || loadingStorytellers || loadingMedia;
  const error = errorStories || errorStorytellers || errorMedia;
  
  // Update displayed stories when stories from the hook change
  useEffect(() => {
    if (stories) {
      setDisplayedStories(stories);
    }
  }, [stories]);

  const handleAddStoryClick = () => {
    setSelectedStoryForEdit(null);
    onEditOpen();
  };
  
  // Function to handle opening the detail modal
  const handleStoryTitleClick = (story: Story) => {
    setSelectedStoryForDetail(story);
    onDetailOpen();
  };
  
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    
    try {
      await deleteRecord('Stories', deleteId);
      toast({
        title: 'Story deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      refetchStories(); // Use the targeted refetch from the hook
    } catch (error) {
      console.error('Error deleting story:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete story',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
    
    setIsDeleteConfirmOpen(false);
    setDeleteId(null);
  };
  
  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false);
    setDeleteId(null);
  };
  
  // This submit handler is likely for the Edit/Add form, keep it but it's unused for now
  // const handleStoryEditSubmit = async (storyData: any) => { ... };
  
  // This handler is used by MapView click and Card click
  const handleMapViewSelect = (storyId: string) => {
    const story = stories.find((s: Story) => s.id === storyId);
    if (story) {
      handleStoryTitleClick(story);
    }
  };
  
  // Handler for StoryCard clicks (same logic as MapView select)
  const handleCardClick = (storyId: string) => {
    const story = stories.find((s: Story) => s.id === storyId);
    if (story) {
      handleStoryTitleClick(story); // Reuse the detail modal handler
    }
  };
  
  // Get storyteller names for a story
  const getStorytellersForStory = useCallback((story: Story): StorytellerDisplay[] => {
    if (!Array.isArray(media) || !Array.isArray(storytellers)) {
      return [];
    }
    
    // Get Media IDs from the Story object
    const linkedMediaIds = story.Media || [];
    if (!Array.isArray(linkedMediaIds)) {
      console.warn(`Story ${story.id} has unexpected Media field type:`, story.Media);
      return [];
    }
    
    // Find the corresponding Media objects from the full media list
    const linkedMediaObjects = linkedMediaIds
      .map(mediaId => media.find(m => m.id === mediaId))
      .filter((m): m is Media => !!m); 
      
    if (linkedMediaIds.length > 0 && linkedMediaObjects.length === 0) {
      console.log(`Story ${story.id} links to media IDs [${linkedMediaIds.join(', ')}] but corresponding media objects were not found.`);
    }

    // Extract Storyteller IDs from each linked Media object
    const storytellerIdSet = new Set<string>();
    linkedMediaObjects.forEach(mediaObj => {
      const mediaStorytellerIds = mediaObj.Storytellers || [];
      if (Array.isArray(mediaStorytellerIds)) {
        mediaStorytellerIds.forEach(id => storytellerIdSet.add(id));
      } else {
        console.warn(`Media ${mediaObj.id} has unexpected Storytellers field type:`, mediaObj.Storytellers);
      }
    });
    
    const uniqueStorytellerIds = Array.from(storytellerIdSet);
    
    if (linkedMediaObjects.length > 0 && uniqueStorytellerIds.length === 0) {
      console.log(`Story ${story.id} is linked to media, but those media objects have no linked storytellers.`);
    }

    // Map unique Storyteller IDs to actual Storyteller objects
    const result = uniqueStorytellerIds
      .map(id => {
        const found = storytellers.find((s: Storyteller) => s.id === id);
        if (!found) {
          console.log(`No storyteller found for ID: ${id} (linked via media for story ${story.id})`);
        }
        return found;
      })
      .filter((s): s is Storyteller => !!s) // Type guard
      .map((s: Storyteller) => {
        // Use optional chaining and check both image fields
        const imageUrl = s['File Profile Image']?.[0]?.url || (s as any)['Profile Image']?.[0]?.url;
        return {
          id: s.id,
          name: s.Name || 'Unknown',
          image: imageUrl
        };
      });
      
    return result;
  }, [storytellers, media]);

  // Get unique storytellers for filter
  const uniqueStorytellers = useMemo(() => {
    if (!Array.isArray(stories)) {
      return [];
    }
    
    const storytellerMap = new Map<string, StorytellerDisplay>();
    stories.forEach((story: Story) => {
      const storyStorytellers = getStorytellersForStory(story);
      storyStorytellers.forEach((s: StorytellerDisplay) => {
        if (!storytellerMap.has(s.id)) {
          storytellerMap.set(s.id, s);
        }
      });
    });
    return Array.from(storytellerMap.values());
  }, [stories, getStorytellersForStory]);

  // Get unique locations from stories
  const uniqueLocations = useMemo(() => {
    if (!Array.isArray(stories)) {
      return [];
    }
    
    const locations = new Set<string>();
    stories.forEach((story: Story) => {
      const mediaLocation = typeof story['Location (from Media)'] === 'string' 
        ? story['Location (from Media)'].trim() 
        : '';
      
      if (mediaLocation) locations.add(mediaLocation);
    });
    return Array.from(locations).sort();
  }, [stories]);

  // Get unique shifts from stories
  const uniqueShifts = useMemo(() => {
    if (!Array.isArray(stories) || !Array.isArray(shifts)) {
      return [];
    }
    
    // Create a map of shift ids to shift objects
    const shiftMap = new Map();
    shifts.forEach(shift => {
      if (shift.id && shift.Name) {
        shiftMap.set(shift.id, shift);
      }
    });
    
    // Get all shifts used in stories
    const shiftIds = new Set<string>();
    stories.forEach(story => {
      if (Array.isArray(story.Shifts) && story.Shifts.length > 0) {
        story.Shifts.forEach(shiftId => shiftIds.add(shiftId));
      }
    });
    
    // Convert to array of shift objects
    return Array.from(shiftIds)
      .map(id => shiftMap.get(id))
      .filter(Boolean)
      .sort((a, b) => a.Name.localeCompare(b.Name));
  }, [stories, shifts]);

  // Apply filters to displayed stories
  useEffect(() => {
    if (!Array.isArray(stories)) {
      setDisplayedStories([]);
      return;
    }
    
    let filtered = [...stories]; // Start with all stories from the hook
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (story: Story) => 
          (story.Title || '').toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply storyteller filter
    if (storytellerFilter !== 'all') {
      filtered = filtered.filter((story: Story) => {
        const storyStorytellers = getStorytellersForStory(story);
        return storyStorytellers.some((s: StorytellerDisplay) => s.id === storytellerFilter);
      });
    }
    
    // Apply location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter((story: Story) => {
        const mediaLocation = story['Location (from Media)'] || '';
        return mediaLocation === locationFilter;
      });
    }
    
    // Apply shift filter
    if (shiftFilter !== 'all') {
      filtered = filtered.filter((story: Story) => {
        return Array.isArray(story.Shifts) && 
               story.Shifts.length > 0 && 
               story.Shifts[0] === shiftFilter;
      });
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((story: Story) => 
        (story.Status || '').toLowerCase() === statusFilter
      );
    }
    
    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter((story: Story) => {
        if (!story.Created) return false;
        
        const storyDate = new Date(story.Created);
        
        if (dateFilter === 'today') {
          return storyDate >= today;
        } else if (dateFilter === 'week') {
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return storyDate >= weekAgo;
        } else if (dateFilter === 'month') {
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return storyDate >= monthAgo;
        } else if (dateFilter === 'year') {
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          return storyDate >= yearAgo;
        }
        return true;
      });
    }
    
    setDisplayedStories(filtered);
  }, [searchTerm, storytellerFilter, locationFilter, statusFilter, dateFilter, shiftFilter, stories, getStorytellersForStory, shifts]);

  // Update the modal close handler for edit modal
  const handleEditModalClose = () => {
    setSelectedStoryForEdit(null);
    onEditClose();
  };

  // Update the modal close handler for detail modal
  const handleDetailModalClose = () => {
    setSelectedStoryForDetail(null);
    onDetailClose();
  };

  // Add view toggle function
  const toggleView = (view: 'list' | 'map' | 'card') => {
    setCurrentView(view);
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={5}>
        <Flex justify="center" align="center" h="50vh">
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={5}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error loading data: {typeof error === 'string' ? error : (error as Error)?.message || 'Unknown error'}
        </Alert>
        <Button onClick={() => refetchStories()} colorScheme="blue">
          Retry
        </Button>
      </Container>
    )
  }

  // Render the main content
  return (
    <Container maxW="container.xl" py={5}>
      {/* Page header with actions */}
      <Flex justifyContent="space-between" mb={5} flexWrap="wrap" gap={3}>
          <Heading size="lg">Stories</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddStoryClick}>
          Add
          </Button>
        </Flex>

      <Stack spacing={4} mb={4}>
        <Flex justifyContent="space-between" alignItems="center">
          <ButtonGroup size="sm" isAttached variant="outline">
            <Button 
              key="list-view-btn"
              onClick={() => toggleView('list')} 
              colorScheme={currentView === 'list' ? 'blue' : 'gray'}
            >
              List View
            </Button>
            <Button 
              key="map-view-btn"
              onClick={() => toggleView('map')} 
              colorScheme={currentView === 'map' ? 'blue' : 'gray'}
            >
              Map View
            </Button>
            <Button 
              key="card-view-btn"
              onClick={() => toggleView('card')} 
              colorScheme={currentView === 'card' ? 'blue' : 'gray'}
            >
              Card View
            </Button>
          </ButtonGroup>
        </Flex>
        <Flex gap={4} wrap="wrap">
            <Input
            placeholder="Search stories..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            maxW="300px"
            />
          
          <Select
            value={storytellerFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setStorytellerFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Storytellers</option>
            {uniqueStorytellers.map((storyteller: StorytellerDisplay) => (
              <option key={storyteller.id} value={storyteller.id}>
                {storyteller.name}
              </option>
            ))}
          </Select>
          
          <Select
            value={locationFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setLocationFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map((location: string) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>
          
          <Select
            value={statusFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
          
          <Select
            value={dateFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setDateFilter(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </Select>
          
          <Select
            value={shiftFilter}
            onChange={(e: ChangeEvent<HTMLSelectElement>) => setShiftFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Shifts</option>
            {uniqueShifts.map((shift) => (
              <option key={shift.id} value={shift.id}>
                {shift.Name}
              </option>
            ))}
          </Select>
        </Flex>
      </Stack>

      {currentView === 'list' ? (
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Story</Th>
              <Th>Storyteller</Th>
              <Th>Location</Th>
              <Th>Shift</Th>
              <Th>Status</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {displayedStories.map((story) => (
              <Tr key={story.id}>
                <Td>
                  {/* Make title clickable to open detail modal */}
                  <Link
                    onClick={() => handleStoryTitleClick(story)}
                    color="blue.500"
                    cursor="pointer"
                    _hover={{ textDecoration: 'underline' }}
                  >
                    {story.Title || 'Untitled Story'}
                  </Link>
                </Td>
                <Td>
                  <HStack spacing={2}>
                    {(() => {
                      const storyStorytellers = getStorytellersForStory(story);
                      if (storyStorytellers && storyStorytellers.length > 0) {
                        return storyStorytellers.map((storyteller: StorytellerDisplay, index: number) => (
                          <HStack key={`${story.id}-${storyteller.id}-${index}`} spacing={2}>
                            {storyteller.image ? (
                              <Avatar size="sm" src={storyteller.image} name={storyteller.name} />
                            ) : (
                              <Avatar size="sm" name={storyteller.name} />
                            )}
                            <Text>
                              {storyteller.name}
                              {index < storyStorytellers.length - 1 ? ', ' : ''}
                            </Text>
                                  </HStack>
                        ));
                      } else {
                        // Try direct storyteller name access as a fallback
                        const directName = (story as any).StorytellerName || (story as any).Storyteller;
                        if (directName && typeof directName === 'string') {
                          return <Text>{directName}</Text>;
                        }
                        return <Text color="gray.500">No storyteller</Text>;
                      }
                    })()}
                  </HStack>
                </Td>
                <Td>
                  {story['Location (from Media)'] || '-'}
                </Td>
                <Td>
                  <VStack align="start" spacing={1}>
                    <Text fontSize="sm">
                      {(story as any).ShiftDetails?.Name || story.Shifts?.[0] || '-'}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {(story as any).ShiftDetails?.State || (story as any)['State (from Shifts)'] || '-'}
                    </Text>
                  </VStack>
                </Td>
                <Td>
                  <Badge
                    colorScheme={(story.Status || '').toLowerCase() === 'draft' ? 'orange' : 'green'}
                  >
                    {story.Status || 'Unknown'}
                  </Badge>
                </Td>
                <Td>
                  {story.Created
                    ? new Date(story.Created).toLocaleDateString()
                    : '-'}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : currentView === 'map' ? (
        <MapView 
          stories={displayedStories} // Pass filtered stories to MapView
          onStorySelect={handleMapViewSelect} // Use the correct handler
        />
      ) : currentView === 'card' && (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {displayedStories.map((story) => (
            <StoryCard 
              key={story.id} 
              story={story}
              onClick={() => handleCardClick(story.id)}
            />
          ))}
        </SimpleGrid>
      )}

      {/* Edit/Add Form Modal */}
      <Modal isOpen={isEditOpen} onClose={handleEditModalClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedStoryForEdit ? 'Edit Story' : 'Add New Story'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Temporarily commented out until StoryForm component is available */}
            {/* <StoryForm 
              story={selectedStoryForEdit} 
              onSubmit={handleStoryEditSubmit}
              availableThemes={themes}
              availableTags={tags}
              availableStorytellers={storytellers}
            /> */}
            <Alert status="warning">
              <AlertIcon />
              Story form component is not available or commented out.
            </Alert>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Story Detail Modal */}
      {selectedStoryForDetail && (
        <StoryDetailModal
          isOpen={isDetailOpen}
          onClose={handleDetailModalClose}
          story={selectedStoryForDetail}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={handleDeleteCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
              Are you sure you want to delete this story? This action cannot be undone.
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleDeleteCancel}>
                Cancel
              </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
                Delete
              </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default StoriesPage 