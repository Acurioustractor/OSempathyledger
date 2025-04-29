import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Container,
  VStack,
  HStack,
  Box,
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
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Select,
  useToast,
  Stack,
  Avatar,
  Link,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon, DeleteIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Story, updateRecord, deleteRecord, AirtableError } from '../services/airtable'
import StoryForm from '../components/StoryForm'
import MapView from '../components/MapView'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import useStoriesData from '../hooks/useStoriesData'

const StoriesPage = () => {
  const [displayedStories, setDisplayedStories] = useState<Story[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [currentView, setCurrentView] = useState<'list' | 'map'>('list')
  const [sortField, setSortField] = useState<string>('Title')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const navigate = useNavigate()
  const toast = useToast()
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mediaFilter, setMediaFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [storytellerFilter, setStorytellerFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  
  // Form modal disclosure
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Use the standardized data fetching hook
  const fetchOptions = useMemo(() => ({ 
    sort: [{ field: sortField, direction: sortDirection }] 
  }), [sortField, sortDirection])
  
  const { 
    stories, 
    themes, 
    tags, 
    storytellers, 
    isLoading, 
    error, 
    refetchAll: refetchStoriesData,
    refetchStories 
  } = useStoriesData(fetchOptions)
  
  // Update displayed stories when stories from the hook change
  useEffect(() => {
    setDisplayedStories(stories)
  }, [stories])
  
  // Filter stories based on search term
  useEffect(() => {
    if (searchTerm && stories.length) {
      const filtered = stories.filter(
        story => 
          story.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.Description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          story.Location?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setDisplayedStories(filtered)
    } else if (stories.length) {
      setDisplayedStories(stories)
    }
  }, [searchTerm, stories])
  
  const handleAddStory = () => {
    setSelectedStory(null)
    onOpen()
  }
  
  const handleEditStory = (story: Story) => {
    setSelectedStory(story)
    onOpen()
  }
  
  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteConfirmOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    
    try {
      await deleteRecord('Stories', deleteId)
      toast({
        title: 'Story deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      refetchStories() // Use the targeted refetch from the hook
    } catch (error) {
      console.error('Error deleting story:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete story',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    
    setIsDeleteConfirmOpen(false)
    setDeleteId(null)
  }
  
  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false)
    setDeleteId(null)
  }
  
  const handleStorySubmit = async (storyData: any) => {
    try {
      if (selectedStory) {
        // Edit existing story
        await updateRecord('Stories', selectedStory.id, storyData)
        toast({
          title: 'Story updated',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      } else {
        // Add new story - this should be handled by StoryForm internal logic
        toast({
          title: 'Story created',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      }
      onClose()
      refetchStories() // Use the targeted refetch from the hook
    } catch (error) {
      const errorMessage = error instanceof AirtableError 
        ? `Failed to ${selectedStory ? 'update' : 'create'} story: ${error.message}`
        : `Failed to ${selectedStory ? 'update' : 'create'} story`
        
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  
  const handleStoryView = (storyId: string) => {
    navigate(`/OSempathyledger/story/${storyId}`)
  }
  
  // Get storyteller names for a story
  const getStorytellersForStory = useCallback((story: Story) => {
    // Check both Storyteller_id and Storytellers fields
    let storytellerIds: string[] = [];
    
    if (story.Storyteller_id) {
      storytellerIds = Array.isArray(story.Storyteller_id) 
        ? story.Storyteller_id 
        : [story.Storyteller_id];
    } else if (story.Storytellers) {
      storytellerIds = Array.isArray(story.Storytellers)
        ? story.Storytellers
        : [story.Storytellers];
    }
    
    // If we have no storytellers, try to debug
    if (storytellerIds.length === 0) {
      console.log('No storyteller IDs found for story:', story.id, story.Title);
      // Try to see if there are any storyteller-related fields
      const storytellerFields = Object.keys(story).filter(key => 
        key.toLowerCase().includes('storyteller')
      );
      if (storytellerFields.length > 0) {
        console.log('Found potential storyteller fields:', storytellerFields);
        console.log('Field values:', storytellerFields.map(field => ({ field, value: story[field] })));
      }
    }
    
    // Map storyteller IDs to actual storyteller objects
    const storytellersFound = storytellerIds
      .map(id => storytellers.find(s => s.id === id))
      .filter(s => s) // Remove undefined entries
      .map(s => ({
        id: s!.id,
        name: s!.Name || 'Unknown',
        image: s!['File Profile Image']?.[0]?.url || s!['Profile Image']?.[0]?.url
      }));
      
    if (storytellerIds.length > 0 && storytellersFound.length === 0) {
      console.log('Found storyteller IDs but no matching storytellers:', storytellerIds);
      console.log('Available storytellers:', storytellers.map(s => ({ id: s.id, name: s.Name })));
    }
    
    return storytellersFound;
  }, [storytellers]);

  // Get unique storytellers for filter
  const uniqueStorytellers = useMemo(() => {
    const storytellerMap = new Map();
    stories.forEach(story => {
      const storyStorytellers = getStorytellersForStory(story);
      storyStorytellers.forEach(s => {
        if (!storytellerMap.has(s.id)) {
          storytellerMap.set(s.id, s);
        }
      });
    });
    return Array.from(storytellerMap.values());
  }, [stories, getStorytellersForStory]);

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  // Determine sort indicator
  const sortIndicator = (field: string) => {
    if (field !== sortField) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  // Get unique locations from stories
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    stories.forEach(story => {
      const mediaLocation = typeof story['Location (from Media)'] === 'string' 
        ? story['Location (from Media)'].trim() 
        : '';
      const storyLocation = typeof story.Location === 'string' 
        ? story.Location.trim() 
        : '';
      
      if (mediaLocation) locations.add(mediaLocation);
      if (storyLocation && storyLocation !== mediaLocation) locations.add(storyLocation);
    });
    return Array.from(locations).sort();
  }, [stories]);

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
          Error loading stories: {error}
        </Alert>
        <Button onClick={refetchStoriesData} colorScheme="blue">
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
        <HStack>
          <InputGroup w={{ base: 'full', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search stories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddStory}>
            Add
          </Button>
        </HStack>
      </Flex>

      <Stack spacing={4} mb={4}>
        <Flex gap={4}>
          <Input
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            maxW="300px"
          />
          
          <Select
            value={storytellerFilter}
            onChange={(e) => setStorytellerFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Storytellers</option>
            {uniqueStorytellers.map(storyteller => (
              <option key={storyteller.id} value={storyteller.id}>
                {storyteller.name}
              </option>
            ))}
          </Select>

          <Select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </Select>

          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>

          <Select
            value={mediaFilter}
            onChange={(e) => setMediaFilter(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Media</option>
            <option value="video">Video</option>
            <option value="image">Image</option>
            <option value="transcript">Transcript</option>
          </Select>

          <Select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            maxW="150px"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </Select>
        </Flex>
      </Stack>

      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Story</Th>
            <Th>Storyteller</Th>
            <Th>Location</Th>
            <Th>Status</Th>
            <Th>Created</Th>
          </Tr>
        </Thead>
        <Tbody>
          {displayedStories.map((story) => (
            <Tr key={story.id}>
              <Td>
                <Link
                  as={RouterLink}
                  to={`/story/${story.id}`}
                  color="blue.500"
                  _hover={{ textDecoration: 'underline' }}
                >
                  {story.Title || 'Untitled Story'}
                </Link>
              </Td>
              <Td>
                <HStack spacing={2}>
                  {getStorytellersForStory(story).length > 0 ? (
                    getStorytellersForStory(story).map((storyteller, index) => (
                      <HStack key={storyteller.id} spacing={2}>
                        {storyteller.image && (
                          <Avatar size="sm" src={storyteller.image} name={storyteller.name} />
                        )}
                        <Text>
                          {storyteller.name}
                          {index < getStorytellersForStory(story).length - 1 ? ', ' : ''}
                        </Text>
                      </HStack>
                    ))
                  ) : (
                    <Text color="gray.500">No storyteller</Text>
                  )}
                </HStack>
              </Td>
              <Td>
                {story['Location (from Media)'] || story.Location || '-'}
              </Td>
              <Td>
                <Badge
                  colorScheme={story.Status?.toLowerCase() === 'draft' ? 'orange' : 'green'}
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

      {/* Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedStory ? 'Edit Story' : 'Add New Story'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <StoryForm 
              story={selectedStory} 
              onSubmit={handleStorySubmit}
              availableThemes={themes}
              availableTags={tags}
              availableStorytellers={storytellers}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

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