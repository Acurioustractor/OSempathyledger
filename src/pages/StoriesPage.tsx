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
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Input,
  IconButton,
  useToast,
  Flex,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  ModalFooter,
  Divider,
  useColorModeValue,
  Badge,
  Image,
  SimpleGrid,
  Checkbox,
  Stack,
  Wrap,
  WrapItem,
  Tag,
  TagCloseButton,
  TagLabel,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  InputGroup,
  InputLeftElement,
  Select,
  ButtonGroup,
} from '@chakra-ui/react'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { 
  Story, 
  Media,
  Theme,
  Tag as TagType,
  fetchStories, 
  fetchMedia,
  fetchThemes,
  fetchTags,
  createStory, 
  updateStory, 
  deleteRecord,
  Quote,
  fetchQuotes,
  Storyteller,
  fetchStorytellers,
  fetchShifts,
  Shift
} from '../services/airtable'
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons'
import { useForm } from 'react-hook-form'
import StoryCard from '../components/StoryCard'
import StoryDetailModal from '../components/StoryDetailModal'
import MapView from '../components/MapView'

// Define filter type for better type safety and reusability
type FilterOption = {
  id: string;
  name: string;
  value: string;
}

interface StoryFormData {
  title: string
  content?: string
  themes?: string[]
  tags?: string[]
  media?: string[]
}

const STORIES_PER_PAGE = 9; // Adjust as needed

const StoriesPage = () => {
  const [stories, setStories] = useState<Story[]>([])
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [themes, setThemes] = useState<Theme[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingRelations, setLoadingRelations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [projectFilter, setProjectFilter] = useState('')
  const [shiftFilter, setShiftFilter] = useState('')
  const [monthFilter, setMonthFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')
  const [editingStory, setEditingStory] = useState<Story | null>(null)
  const [deleteStoryId, setDeleteStoryId] = useState<string | null>(null)
  const [viewingStory, setViewingStory] = useState<Story | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [page, setPage] = useState(1) // For potential pagination
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure()
  const { 
    isOpen: isViewOpen,
    onOpen: onViewOpen, 
    onClose: onViewClose 
  } = useDisclosure()
  
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StoryFormData>()

  const selectedThemes = watch('themes', [])
  const selectedTags = watch('tags', [])
  const selectedMedia = watch('media', [])

  useEffect(() => {
    loadStories()
    loadRelationData()
  }, [])

  useEffect(() => {
    if (editingStory) {
      reset({
        title: editingStory.title,
        content: editingStory.content,
        themes: editingStory.themes,
        tags: editingStory.tags,
        media: editingStory.media,
      })
    } else {
      reset({
        title: '',
        content: '',
        themes: [],
        tags: [],
        media: [],
      })
    }
  }, [editingStory, reset])

  const loadStories = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchStories()
      setStories(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load stories'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadRelationData = async () => {
    setLoadingRelations(true)
    try {
      const [mediaResult, themesResult, tagsResult, quotesResult, storytellersResult, shiftsResult] = await Promise.all([
        fetchMedia(),
        fetchThemes(),
        fetchTags(),
        fetchQuotes(),
        fetchStorytellers(),
        fetchShifts()
      ])
      setMediaItems(mediaResult)
      setThemes(themesResult)
      setTags(tagsResult)
      setQuotes(quotesResult)
      setStorytellers(storytellersResult)
      setShifts(shiftsResult)
    } catch (err) {
      console.error('Failed to load relation data:', err)
      toast({
        title: 'Error',
        description: 'Failed to load relation data',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingRelations(false)
    }
  }

  // Helper function to check if a story is associated with a specific shift
  const hasShift = useCallback((story: Story, shiftId: string): boolean => {
    if (!story.shifts) return false;
    
    if (typeof story.shifts === 'string') {
      return story.shifts === shiftId;
    }
    
    if (Array.isArray(story.shifts)) {
      return story.shifts.includes(shiftId);
    }
    
    return false;
  }, []);

  // Get unique projects for filter dropdown
  const projectOptions = useMemo((): FilterOption[] => {
    const projectSet = new Set<string>();
    
    stories.forEach(story => {
      if (story.project) {
        projectSet.add(story.project as string);
      }
    });
    
    return Array.from(projectSet)
      .sort()
      .map(project => ({
        id: project,
        name: project,
        value: project
      }));
  }, [stories]);

  // Generate shift options from both the shifts table
  const shiftOptions = useMemo((): FilterOption[] => {
    const shiftOptionsMap = new Map<string, FilterOption>();
    
    // Add all shifts from the dedicated shifts table
    shifts.forEach(shift => {
      if (shift.id && shift.Name) {
        shiftOptionsMap.set(shift.id, {
          id: shift.id,
          name: shift.Name,
          value: shift.id
        });
      }
    });
    
    // Convert to array and sort by name
    return Array.from(shiftOptionsMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [shifts]);

  // Generate month options for filter
  const monthOptions = useMemo((): FilterOption[] => {
    return [
      { id: '1', name: 'January', value: '1' },
      { id: '2', name: 'February', value: '2' },
      { id: '3', name: 'March', value: '3' },
      { id: '4', name: 'April', value: '4' },
      { id: '5', name: 'May', value: '5' },
      { id: '6', name: 'June', value: '6' },
      { id: '7', name: 'July', value: '7' },
      { id: '8', name: 'August', value: '8' },
      { id: '9', name: 'September', value: '9' },
      { id: '10', name: 'October', value: '10' },
      { id: '11', name: 'November', value: '11' },
      { id: '12', name: 'December', value: '12' }
    ];
  }, []);

  // Generate year options for filter (last 5 years)
  const yearOptions = useMemo((): FilterOption[] => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 0; i < 5; i++) {
      const year = currentYear - i;
      years.push({
        id: year.toString(),
        name: year.toString(),
        value: year.toString()
      });
    }
    
    return years;
  }, []);

  const handleCreateStory = (data: StoryFormData) => {
    setIsSubmitting(true)

    createStory({
      title: data.title,
      content: data.content,
      themes: data.themes,
      tags: data.tags,
      media: data.media,
    })
      .then(newStory => {
        setStories(prev => [...prev, newStory])
        onClose()
        toast({
          title: 'Success',
          description: 'Story created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error creating story:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create story',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditStory = (data: StoryFormData) => {
    if (!editingStory) return

    setIsSubmitting(true)

    updateStory(editingStory.id, {
      title: data.title,
      content: data.content,
      themes: data.themes,
      tags: data.tags,
      media: data.media,
    })
      .then(updatedStory => {
        setStories(prev => 
          prev.map(story => story.id === updatedStory.id ? updatedStory : story)
        )
        setEditingStory(null)
        onClose()
        toast({
          title: 'Success',
          description: 'Story updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error updating story:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update story',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteStory = () => {
    if (!deleteStoryId) return

    deleteRecord('Stories', deleteStoryId)
      .then(() => {
        setStories(prev => prev.filter(story => story.id !== deleteStoryId))
        setDeleteStoryId(null)
        onDeleteClose()
        toast({
          title: 'Success',
          description: 'Story deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error deleting story:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete story',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const openAddModal = () => {
    setEditingStory(null)
    onOpen()
  }

  const openEditModal = (story: Story) => {
    setEditingStory(story)
    onOpen()
  }

  const openDeleteModal = (id: string) => {
    setDeleteStoryId(id)
    onDeleteOpen()
  }

  const openViewModal = (story: Story) => {
    setViewingStory(story)
    onViewOpen()
  }

  // Filter stories based on search, project, shift, and date criteria
  const filteredStories = useMemo(() => {
    let results = [...stories];
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(story => 
        story.title.toLowerCase().includes(term) ||
        (story.content && story.content.toLowerCase().includes(term))
      );
    }
    
    // Project filter
    if (projectFilter) {
      results = results.filter(story => story.project === projectFilter);
    }
    
    // Shift filter
    if (shiftFilter) {
      results = results.filter(story => hasShift(story, shiftFilter));
    }
    
    // Date filters (month and year)
    if (monthFilter || yearFilter) {
      results = results.filter(story => {
        if (!story.createdTime) return false;
        
        const createdDate = new Date(story.createdTime);
        
        if (monthFilter && yearFilter) {
          // Both month and year specified
          return (
            createdDate.getMonth() + 1 === parseInt(monthFilter) && 
            createdDate.getFullYear() === parseInt(yearFilter)
          );
        } else if (monthFilter) {
          // Only month specified
          return createdDate.getMonth() + 1 === parseInt(monthFilter);
        } else if (yearFilter) {
          // Only year specified
          return createdDate.getFullYear() === parseInt(yearFilter);
        }
        
        return true;
      });
    }
    
    return results;
  }, [stories, searchTerm, projectFilter, shiftFilter, monthFilter, yearFilter, hasShift]);

  const paginatedStories = filteredStories;

  const handleCardClick = useCallback((story: Story) => {
    setSelectedStory(story)
    setIsDetailModalOpen(true)
  }, [])

  // Helper functions for form management
  const handleThemeToggle = (themeName: string, isChecked: boolean) => {
    const currentThemes = selectedThemes || []
    
    if (isChecked) {
      setValue('themes', [...currentThemes, themeName])
    } else {
      setValue('themes', currentThemes.filter(t => t !== themeName))
    }
  }

  const handleTagToggle = (tagName: string, isChecked: boolean) => {
    const currentTags = selectedTags || []
    
    if (isChecked) {
      setValue('tags', [...currentTags, tagName])
    } else {
      setValue('tags', currentTags.filter(t => t !== tagName))
    }
  }

  const handleMediaToggle = (mediaId: string, isChecked: boolean) => {
    const currentMedia = selectedMedia || []
    
    if (isChecked) {
      setValue('media', [...currentMedia, mediaId])
    } else {
      setValue('media', currentMedia.filter(id => id !== mediaId))
    }
  }

  const removeTheme = (themeName: string) => {
    setValue('themes', (selectedThemes || []).filter(t => t !== themeName))
  }

  const removeTag = (tagName: string) => {
    setValue('tags', (selectedTags || []).filter(t => t !== tagName))
  }

  const removeMedia = (mediaId: string) => {
    setValue('media', (selectedMedia || []).filter(id => id !== mediaId))
  }

  // Find related items for a story
  const getStoryThemes = (storyThemeNames: string[] = []) => {
    return themes.filter(theme => storyThemeNames.includes(theme.name))
  }

  const getStoryTags = (storyTagNames: string[] = []) => {
    return tags.filter(tag => storyTagNames.includes(tag.name))
  }

  const getStoryMedia = (storyMediaIds: string[] = []) => {
    return mediaItems.filter(media => storyMediaIds.includes(media.id))
  }

  const onDetailModalClose = () => {
    setIsDetailModalOpen(false)
    setSelectedStory(null)
  }

  // Add to existing code - this will count stories per shift
  const storyCountByShift = useMemo(() => {
    const countMap: Record<string, number> = {};
    
    stories.forEach(story => {
      if (story.shifts) {
        if (typeof story.shifts === 'string') {
          countMap[story.shifts] = (countMap[story.shifts] || 0) + 1;
        } else if (Array.isArray(story.shifts)) {
          story.shifts.forEach(shiftId => {
            countMap[shiftId] = (countMap[shiftId] || 0) + 1;
          });
        }
      }
    });
    
    return countMap;
  }, [stories]);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Stories</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={openAddModal}
          >
            Add Story
          </Button>
        </Flex>

        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={4}
          align={{ base: 'stretch', md: 'center' }}
          wrap="wrap"
        >
          <InputGroup maxW={{ base: '100%', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search stories by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={useColorModeValue('white', 'gray.700')}
            />
          </InputGroup>
          
          <Select
            placeholder="All Projects"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            maxW={{ base: '100%', md: '200px' }}
            bg={useColorModeValue('white', 'gray.700')}
          >
            {projectOptions.map(option => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>
          
          <Select
            placeholder="All Shifts"
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            maxW={{ base: '100%', md: '200px' }}
            bg={useColorModeValue('white', 'gray.700')}
          >
            {shiftOptions.map(option => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>
          
          <Select
            placeholder="Month"
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            maxW={{ base: '100%', md: '150px' }}
            bg={useColorModeValue('white', 'gray.700')}
          >
            {monthOptions.map(option => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>
          
          <Select
            placeholder="Year"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            maxW={{ base: '100%', md: '120px' }}
            bg={useColorModeValue('white', 'gray.700')}
          >
            {yearOptions.map(option => (
              <option key={option.id} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>
          
          <ButtonGroup isAttached ml={{ md: 'auto' }} mt={{ base: 2, md: 0 }}>
            <Button
              onClick={() => setViewMode('list')}
              colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
              size="md"
            >
              List
            </Button>
            <Button
              onClick={() => setViewMode('map')}
              colorScheme={viewMode === 'map' ? 'blue' : 'gray'}
              size="md"
            >
              Map
            </Button>
          </ButtonGroup>
          
          <Button 
            onClick={loadStories} 
            isLoading={loading}
            mt={{ base: 2, md: 0 }}
          >
            Refresh
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
        ) : paginatedStories.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>No stories found</Text>
            <Button 
              mt={4} 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              onClick={openAddModal}
            >
              Add Story
            </Button>
          </Box>
        ) : viewMode === 'list' ? (
          <Grid 
            templateColumns={{ 
              base: "repeat(1, 1fr)", 
              md: "repeat(2, 1fr)", 
              lg: "repeat(3, 1fr)" 
            }}
            gap={6}
          >
            {paginatedStories.map(story => (
              <StoryCard 
                key={story.id} 
                story={story} 
                allStorytellers={storytellers}
                allThemes={themes}
                onClick={() => handleCardClick(story)}
              />
            ))}
          </Grid>
        ) : (
          <Box my={4}>
            <MapView
              shifts={shifts}
              onShiftSelect={(shiftId) => setShiftFilter(shiftId)}
              selectedShiftId={shiftFilter}
            />
            <Flex justifyContent="space-between" mt={2}>
              <Text fontSize="sm" color="gray.500">
                {filteredStories.length} stories found for selected filters
              </Text>
              {shiftFilter && (
                <Button 
                  size="sm" 
                  variant="ghost" 
                  colorScheme="blue" 
                  onClick={() => setShiftFilter('')}
                >
                  Clear shift filter
                </Button>
              )}
            </Flex>
          </Box>
        )}
      </VStack>

      {/* Add/Edit Story Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(editingStory ? handleEditStory : handleCreateStory)}>
            <ModalHeader>{editingStory ? 'Edit Story' : 'Add Story'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.title} isRequired mb={4}>
                <FormLabel>Title</FormLabel>
                <Input
                  placeholder="Enter story title"
                  {...register('title', {
                    required: 'Title is required',
                    minLength: { value: 3, message: 'Title must be at least 3 characters' }
                  })}
                />
                <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
              </FormControl>

              <FormControl mb={6}>
                <FormLabel>Content</FormLabel>
                <Textarea
                  placeholder="Enter story content"
                  {...register('content')}
                  rows={6}
                />
              </FormControl>

              <Tabs isFitted variant="enclosed" colorScheme="blue" mb={4}>
                <TabList>
                  <Tab>Themes</Tab>
                  <Tab>Tags</Tab>
                  <Tab>Media</Tab>
                </TabList>
                <TabPanels>
                  {/* Themes Tab */}
                  <TabPanel>
                    <FormControl mb={4}>
                      {selectedThemes && selectedThemes.length > 0 && (
                        <Box mb={4}>
                          <Text mb={2} fontSize="sm" fontWeight="medium">Selected themes:</Text>
                          <Wrap>
                            {selectedThemes.map(themeName => (
                              <WrapItem key={themeName}>
                                <Tag colorScheme="blue" size="md">
                                  <TagLabel>{themeName}</TagLabel>
                                  <TagCloseButton onClick={() => removeTheme(themeName)} />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Box>
                      )}
                      
                      <Box borderWidth="1px" borderRadius="md">
                        <Box p={3} borderBottomWidth="1px">
                          <Input 
                            placeholder="Search themes..." 
                            size="sm"
                          />
                        </Box>
                        
                        <Box maxH="250px" overflowY="auto">
                          {loadingRelations ? (
                            <Flex justify="center" py={4}>
                              <Spinner size="sm" mr={2} />
                              <Text>Loading themes...</Text>
                            </Flex>
                          ) : themes.length === 0 ? (
                            <Box p={4} textAlign="center">
                              <Text color="gray.500">No themes available</Text>
                            </Box>
                          ) : (
                            <Stack spacing={0} divider={<Divider />}>
                              {themes.map(theme => (
                                <Checkbox
                                  key={theme.id}
                                  isChecked={selectedThemes?.includes(theme.name)}
                                  onChange={e => handleThemeToggle(theme.name, e.target.checked)}
                                  p={3}
                                >
                                  <HStack>
                                    <Text>{theme.name}</Text>
                                  </HStack>
                                </Checkbox>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </FormControl>
                  </TabPanel>
                  
                  {/* Tags Tab */}
                  <TabPanel>
                    <FormControl mb={4}>
                      {selectedTags && selectedTags.length > 0 && (
                        <Box mb={4}>
                          <Text mb={2} fontSize="sm" fontWeight="medium">Selected tags:</Text>
                          <Wrap>
                            {selectedTags.map(tagName => (
                              <WrapItem key={tagName}>
                                <Tag colorScheme="green" size="md">
                                  <TagLabel>{tagName}</TagLabel>
                                  <TagCloseButton onClick={() => removeTag(tagName)} />
                                </Tag>
                              </WrapItem>
                            ))}
                          </Wrap>
                        </Box>
                      )}
                      
                      <Box borderWidth="1px" borderRadius="md">
                        <Box p={3} borderBottomWidth="1px">
                          <Input 
                            placeholder="Search tags..." 
                            size="sm"
                          />
                        </Box>
                        
                        <Box maxH="250px" overflowY="auto">
                          {loadingRelations ? (
                            <Flex justify="center" py={4}>
                              <Spinner size="sm" mr={2} />
                              <Text>Loading tags...</Text>
                            </Flex>
                          ) : tags.length === 0 ? (
                            <Box p={4} textAlign="center">
                              <Text color="gray.500">No tags available</Text>
                            </Box>
                          ) : (
                            <Stack spacing={0} divider={<Divider />}>
                              {tags.map(tag => (
                                <Checkbox
                                  key={tag.id}
                                  isChecked={selectedTags?.includes(tag.name)}
                                  onChange={e => handleTagToggle(tag.name, e.target.checked)}
                                  p={3}
                                >
                                  <HStack>
                                    <Text>{tag.name}</Text>
                                  </HStack>
                                </Checkbox>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </FormControl>
                  </TabPanel>
                  
                  {/* Media Tab */}
                  <TabPanel>
                    <FormControl mb={4}>
                      {selectedMedia && selectedMedia.length > 0 && (
                        <Box mb={4}>
                          <Text mb={2} fontSize="sm" fontWeight="medium">Selected media ({selectedMedia.length}):</Text>
                          <SimpleGrid columns={{ base: 2, sm: 3, md: 4 }} spacing={2}>
                            {selectedMedia.map(mediaId => {
                              const media = mediaItems.find(m => m.id === mediaId)
                              return (
                                <Box
                                  key={mediaId}
                                  borderWidth="1px"
                                  borderRadius="md"
                                  overflow="hidden"
                                  position="relative"
                                >
                                  <Box height="80px">
                                    {media?.type === 'image' ? (
                                      <Image
                                        src={media.url}
                                        alt={media.title}
                                        objectFit="cover"
                                        height="100%"
                                        width="100%"
                                      />
                                    ) : (
                                      <Flex
                                        bg="gray.700"
                                        color="white"
                                        height="100%"
                                        align="center"
                                        justify="center"
                                        fontSize="xs"
                                      >
                                        Video
                                      </Flex>
                                    )}
                                  </Box>
                                  <IconButton
                                    icon={<DeleteIcon />}
                                    aria-label={`Remove ${media?.title || mediaId}`}
                                    size="xs"
                                    colorScheme="red"
                                    position="absolute"
                                    top={1}
                                    right={1}
                                    onClick={() => removeMedia(mediaId)}
                                  />
                                </Box>
                              )
                            })}
                          </SimpleGrid>
                        </Box>
                      )}
                      
                      <Box borderWidth="1px" borderRadius="md">
                        <Box p={3} borderBottomWidth="1px">
                          <Input 
                            placeholder="Search media..." 
                            size="sm"
                          />
                        </Box>
                        
                        <Box maxH="300px" overflowY="auto">
                          {loadingRelations ? (
                            <Flex justify="center" py={4}>
                              <Spinner size="sm" mr={2} />
                              <Text>Loading media...</Text>
                            </Flex>
                          ) : mediaItems.length === 0 ? (
                            <Box p={4} textAlign="center">
                              <Text color="gray.500">No media available</Text>
                            </Box>
                          ) : (
                            <Stack spacing={0} divider={<Divider />}>
                              {mediaItems.map(media => (
                                <Checkbox
                                  key={media.id}
                                  isChecked={selectedMedia?.includes(media.id)}
                                  onChange={e => handleMediaToggle(media.id, e.target.checked)}
                                  p={3}
                                >
                                  <HStack>
                                    <Box 
                                      width="40px" 
                                      height="40px" 
                                      borderRadius="md" 
                                      overflow="hidden" 
                                      mr={2}
                                    >
                                      {media.type === 'image' ? (
                                        <Image 
                                          src={media.url} 
                                          alt={media.title} 
                                          width="100%" 
                                          height="100%" 
                                          objectFit="cover"
                                          fallback={<Box bg="gray.100" width="100%" height="100%" />}
                                        />
                                      ) : (
                                        <Flex 
                                          bg="gray.700" 
                                          width="100%" 
                                          height="100%" 
                                          align="center" 
                                          justify="center"
                                          color="white"
                                          fontSize="xs"
                                        >
                                          Video
                                        </Flex>
                                      )}
                                    </Box>
                                    <Text noOfLines={1}>{media.title}</Text>
                                  </HStack>
                                </Checkbox>
                              ))}
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    </FormControl>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                {editingStory ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Story Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{viewingStory?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {viewingStory && (
              <VStack spacing={8} align="stretch">
                {/* Content Section */}
                {viewingStory.content && (
                  <Box>
                    <Heading size="sm" mb={2}>Content</Heading>
                    <Text whiteSpace="pre-wrap">{viewingStory.content}</Text>
                  </Box>
                )}
                
                <Divider />
                
                {/* Themes Section */}
                <Box>
                  <Heading size="sm" mb={4}>Themes</Heading>
                  
                  {getStoryThemes(viewingStory.themes).length === 0 ? (
                    <Text color="gray.500">No themes associated with this story</Text>
                  ) : (
                    <Wrap>
                      {getStoryThemes(viewingStory.themes).map(theme => (
                        <WrapItem key={theme.id}>
                          <Tag colorScheme="blue" size="lg">
                            {theme.name}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>
                
                {/* Tags Section */}
                <Box>
                  <Heading size="sm" mb={4}>Tags</Heading>
                  
                  {getStoryTags(viewingStory.tags).length === 0 ? (
                    <Text color="gray.500">No tags associated with this story</Text>
                  ) : (
                    <Wrap>
                      {getStoryTags(viewingStory.tags).map(tag => (
                        <WrapItem key={tag.id}>
                          <Tag colorScheme="green" size="md">
                            {tag.name}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  )}
                </Box>
                
                <Divider />
                
                {/* Media Section */}
                <Box>
                  <Heading size="sm" mb={4}>Media ({getStoryMedia(viewingStory.media).length})</Heading>
                  
                  {getStoryMedia(viewingStory.media).length === 0 ? (
                    <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
                      <Text color="gray.500">No media items associated with this story</Text>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                      {getStoryMedia(viewingStory.media).map(media => (
                        <Box
                          key={media.id}
                          borderWidth="1px"
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Box height="120px" position="relative">
                            {media.type === 'image' ? (
                              <Image
                                src={media.url}
                                alt={media.title}
                                height="100%"
                                width="100%"
                                objectFit="cover"
                                fallback={<Box bg="gray.100" height="100%" />}
                              />
                            ) : (
                              <Flex
                                bg="gray.700"
                                height="100%"
                                align="center"
                                justify="center"
                                color="white"
                              >
                                Video
                              </Flex>
                            )}
                            <Badge
                              position="absolute"
                              bottom={1}
                              right={1}
                              colorScheme={media.type === 'image' ? 'blue' : 'red'}
                            >
                              {media.type}
                            </Badge>
                          </Box>
                          <Box p={3}>
                            <Text fontWeight="medium" noOfLines={1}>
                              {media.title}
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Story
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this story? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteStory} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Render StoryDetailModal */}
      <StoryDetailModal 
        isOpen={isDetailModalOpen}
        onClose={onDetailModalClose}
        story={selectedStory}
        allMedia={mediaItems}
        allStorytellers={storytellers}
        allThemes={themes}
        allQuotes={quotes}
      />
    </Container>
  )
}

export default StoriesPage 