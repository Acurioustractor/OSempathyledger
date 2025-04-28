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
} from '@chakra-ui/react'
import { AddIcon, SearchIcon, DeleteIcon, EditIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { Story, updateRecord, deleteRecord, AirtableError } from '../services/airtable'
import StoryForm from '../components/StoryForm'
import MapView from '../components/MapView'
import { useNavigate } from 'react-router-dom'
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
    navigate(`/stories/${storyId}`)
  }
  
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

      {/* View selection tabs */}
      <Tabs variant="enclosed" colorScheme="blue" mb={5}
        index={currentView === 'list' ? 0 : 1}
        onChange={(index) => setCurrentView(index === 0 ? 'list' : 'map')}
      >
        <TabList>
          <Tab>List View</Tab>
          <Tab>Map View</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0} pt={4}>
            {/* List view */}
            {displayedStories.length === 0 ? (
              <Alert status="info">
                <AlertIcon />
                No stories found.
              </Alert>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th cursor="pointer" onClick={() => handleSort('Title')}>
                        Title {sortIndicator('Title')}
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('Location')}>
                        Location {sortIndicator('Location')}
                      </Th>
                      <Th cursor="pointer" onClick={() => handleSort('Storyteller')}>
                        Storyteller {sortIndicator('Storyteller')}
                      </Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {displayedStories.map((story) => (
                      <Tr key={story.id} _hover={{ bg: 'gray.50' }}>
                        <Td fontWeight="medium">
                          <Text 
                            color="blue.600" 
                            cursor="pointer"
                            onClick={() => handleStoryView(story.id)}
                          >
                            {story.Title}
                          </Text>
                        </Td>
                        <Td>{story.Location}</Td>
                        <Td>
                          {storytellers.find(s => s.id === story.Storyteller_id)?.Name || 'Unknown'}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              aria-label="Edit story"
                              icon={<EditIcon />}
                              size="sm"
                              onClick={() => handleEditStory(story)}
                            />
                            <IconButton
                              aria-label="Delete story"
                              icon={<DeleteIcon />}
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteClick(story.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </TabPanel>

          <TabPanel p={0} pt={4}>
            {/* Map view */}
            <MapView 
              shifts={displayedStories.map(story => ({
                id: story.id,
                name: story.Title,
                address: story.Location || '',
                latitude: story.Latitude,
                longitude: story.Longitude,
                stories: story.Stories || []
              }))} 
              height="600px"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

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