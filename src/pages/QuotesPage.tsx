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
  Checkbox,
  Stack,
  Wrap,
  WrapItem,
  Tag,
  TagCloseButton,
  TagLabel,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { 
  Quote, 
  fetchQuotes, 
  createQuote, 
  updateQuote, 
  deleteRecord, 
  fetchThemes, 
  Theme,
  Storyteller,
  fetchStorytellers,
  Media,
  fetchMedia
} from '../services/airtable'
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, QuestionIcon } from '@chakra-ui/icons'
import { useForm, Controller } from 'react-hook-form'
import ReactSelect from 'react-select'

interface QuoteFormData {
  text: string
  attribution?: string
  source?: string
  themes?: string[]
}

// Interface for processed data
interface ProcessedQuote extends Quote {
  storytellerData?: Storyteller
  project?: string
  location?: string
  shift?: string
}

const QuotesPage = () => {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [themes, setThemes] = useState<Theme[]>([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  
  // Filter States
  const [selectedStoryteller, setSelectedStoryteller] = useState<{ value: string; label: string } | null>(null)
  const [selectedProject, setSelectedProject] = useState<{ value: string; label: string } | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<{ value: string; label: string } | null>(null)
  const [selectedShift, setSelectedShift] = useState<{ value: string; label: string } | null>(null)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure()
  
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  const {
    handleSubmit,
    register,
    control,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<QuoteFormData>()

  const selectedThemes = watch('themes', [])

  // Initial data load
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      setError(null)
      try {
        const [quotesData, storytellersData, mediaData] = await Promise.all([
          fetchQuotes(),
          fetchStorytellers(),
          fetchMedia()
        ])
        setQuotes(quotesData)
        setStorytellers(storytellersData)
        setMediaItems(mediaData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load quotes'
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }
    loadAllData()
  }, [])

  useEffect(() => {
    if (editingQuote) {
      reset({
        text: editingQuote['Quote Text'] ?? '',
        attribution: editingQuote.attribution ?? '',
        themes: editingQuote.Theme ? [editingQuote.Theme] : [],
      })
    } else {
      reset({
        text: '',
        attribution: '',
        themes: [],
      })
    }
  }, [editingQuote, reset])

  // Process quotes to add related data (including shift)
  const processedQuotes = useMemo(() => {
    console.log("[QuotesPage] Processing quotes to add related data (including shift)...");
    const storytellerMap = new Map(storytellers.map(s => [s.id, s]));
    const mediaMap = new Map(mediaItems.map(m => [m.id, m]));

    return quotes.map(quote => {
      let storyteller: Storyteller | undefined = undefined;
      let project: string | undefined = undefined;
      let location: string | undefined = undefined;
      let shift: string | undefined = undefined;

      // Find the first linked Media ID 
      const linkedMediaId = quote.Media?.[0] || quote["Transcript Reference"]?.[0]; 
      
      if (linkedMediaId) {
        const mediaItem = mediaMap.get(linkedMediaId);
        if (mediaItem) {
          // Get Shift from Media
          shift = mediaItem.Shift; 

          // Get Storyteller from Media
          if (mediaItem.Storytellers && mediaItem.Storytellers.length > 0) {
            storyteller = storytellerMap.get(mediaItem.Storytellers[0]);
            if (storyteller) {
              project = storyteller.Project;
              location = storyteller.Location;
            }
          }
        }
      }
      
      const processed = {
        ...quote,
        storytellerData: storyteller,
        project: project,
        location: location,
        shift: shift,
      } as ProcessedQuote;
      
      if (quotes.findIndex(q => q.id === quote.id) < 3) {
        console.log("[QuotesPage] Processed Quote Example:", processed);
      }
      return processed;
    });
  }, [quotes, storytellers, mediaItems]);

  // Filtered quotes based on state
  const filteredQuotes = useMemo(() => {
    console.log("[QuotesPage] Recalculating filteredQuotes with filters:", 
      { searchTerm, selectedStoryteller, selectedProject, selectedLocation, selectedShift });
    
    const result = processedQuotes.filter(quote => {
      let include = true;

      // --- Apply Search Term Filter --- 
      if (searchTerm !== '') {
        const matchesSearch = 
          (quote['Quote Text'] && quote['Quote Text'].toLowerCase().includes(searchTerm.toLowerCase())) ||
          (quote.attribution && quote.attribution.toLowerCase().includes(searchTerm.toLowerCase()));
        if (!matchesSearch) include = false;
      }
      
      // --- Apply Storyteller Filter --- 
      if (include && selectedStoryteller) {
        const matchesStoryteller = quote.storytellerData?.id === selectedStoryteller.value;
        if (!matchesStoryteller) include = false;
      }
      
      // --- Apply Project Filter --- 
      if (include && selectedProject) {
        const matchesProject = quote.project === selectedProject.value;
        if (!matchesProject) include = false;
      }
      
      // --- Apply Location Filter --- 
      if (include && selectedLocation) {
        const matchesLocation = quote.location === selectedLocation.value;
        if (!matchesLocation) include = false;
      }
      
      // --- Apply Shift Filter --- 
      if (include && selectedShift) {
        // Check if the quote's derived shift matches the filter value
        const matchesShift = quote.shift === selectedShift.value;
        if (!matchesShift) include = false;
      }
      
      // Log details for the first quote being processed if any filter is active
      if (quote.id === processedQuotes[0]?.id && (selectedStoryteller || selectedProject || selectedLocation || selectedShift)) {
        console.log(`[QuotesPage] Filtering Quote ID ${quote.id}:`, {
          quoteData: { id: quote.id, text: quote['Quote Text'], attr: quote.attribution, proj: quote.project, loc: quote.location, stId: quote.storytellerData?.id },
          filters: { story: selectedStoryteller?.value, proj: selectedProject?.value, loc: selectedLocation?.value, shift: selectedShift?.value },
          include // Log the final decision for this quote
        });
      }
      
      return include;
    });
    
    console.log(`[QuotesPage] Filtering Result: ${result.length} quotes match filters.`);
    return result;
  }, [processedQuotes, searchTerm, selectedStoryteller, selectedProject, selectedLocation, selectedShift]);

  // Options for Select dropdowns
  const storytellerOptions = useMemo(() => 
    storytellers.map(s => ({ value: s.id, label: s.Name })).sort((a, b) => a.label.localeCompare(b.label)),
    [storytellers]
  )

  const projectOptions = useMemo(() => 
     Array.from(new Set(storytellers.map(s => s.Project).filter(Boolean))) 
       .map(p => ({ value: p as string, label: p as string })).sort((a, b) => a.label.localeCompare(b.label)),
    [storytellers]
  )

  const locationOptions = useMemo(() => 
    Array.from(new Set(storytellers.map(s => s.Location).filter(Boolean)))
      .map(l => ({ value: l as string, label: l as string })).sort((a, b) => a.label.localeCompare(b.label)),
    [storytellers]
  )

  // Add shiftOptions generation (deriving from Media data)
  const shiftOptions = useMemo(() => 
    Array.from(new Set(mediaItems.map(m => m.Shift).filter(Boolean)))
      .map(s => ({ value: s as string, label: s as string }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [mediaItems]
  );

  const loadThemes = async () => {
    setLoadingThemes(true)
    try {
      const result = await fetchThemes()
      setThemes(result)
    } catch (err) {
      console.error('Failed to load themes:', err)
      toast({
        title: 'Error',
        description: 'Failed to load themes',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingThemes(false)
    }
  }

  const handleCreateQuote = (data: QuoteFormData) => {
    setIsSubmitting(true)

    createQuote({
      'Quote Text': data.text, 
      attribution: data.attribution,
      Theme: data.themes?.[0],
    })
      .then(newQuote => {
        setQuotes(prev => [...prev, newQuote])
        onClose()
        toast({
          title: 'Success',
          description: 'Quote created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error creating quote:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create quote',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditQuote = (data: QuoteFormData) => {
    if (!editingQuote) return

    setIsSubmitting(true)

    updateQuote(editingQuote.id, {
      'Quote Text': data.text,
      attribution: data.attribution,
      Theme: data.themes?.[0],
    })
      .then(updatedQuote => {
        setQuotes(prev => 
          prev.map(quote => quote.id === updatedQuote.id ? updatedQuote : quote)
        )
        setEditingQuote(null)
        onClose()
        toast({
          title: 'Success',
          description: 'Quote updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error updating quote:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update quote',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteQuote = () => {
    if (!deleteQuoteId) return

    deleteRecord('Quotes', deleteQuoteId)
      .then(() => {
        setQuotes(prev => prev.filter(quote => quote.id !== deleteQuoteId))
        setDeleteQuoteId(null)
        onDeleteClose()
        toast({
          title: 'Success',
          description: 'Quote deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error deleting quote:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete quote',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const openAddModal = () => {
    setEditingQuote(null)
    onOpen()
  }

  const openEditModal = (quote: Quote) => {
    setEditingQuote(quote)
    onOpen()
  }

  const openDeleteModal = (id: string) => {
    setDeleteQuoteId(id)
    onDeleteOpen()
  }

  const handleThemeToggle = (themeId: string, isChecked: boolean) => {
    if (isChecked) {
      setValue('themes', [themeId])
    } else {
      if (selectedThemes?.[0] === themeId) {
        setValue('themes', [])
      }
    }
  }

  const removeTheme = (themeId: string) => {
    if (selectedThemes?.[0] === themeId) {
      setValue('themes', [])
    }
  }

  // Add logging to onChange handlers
  const handleStorytellerChange = (option: { value: string; label: string } | null) => {
    console.log("Storyteller filter changed:", option);
    setSelectedStoryteller(option);
  }
  const handleProjectChange = (option: { value: string; label: string } | null) => {
    console.log("Project filter changed:", option);
    setSelectedProject(option);
  }
  const handleLocationChange = (option: { value: string; label: string } | null) => {
    console.log("Location filter changed:", option);
    setSelectedLocation(option);
  }
  const handleShiftChange = (option: { value: string; label: string } | null) => {
    console.log("Shift filter changed:", option);
    setSelectedShift(option);
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Quotes</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={openAddModal}
          >
            Add Quote
          </Button>
        </Flex>

        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "1fr 2fr 2fr 2fr 2fr" }} gap={4} alignItems="center">
          {/* Search Input */}
          <Box gridColumn={{ base: "span 1", sm: "span 2", lg: "span 3", xl: "span 1" }}>
            <InputGroup size="sm">
              {/* Ensure InputLeftElement is here */}
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
          </Box>
          
          {/* Filters */}
          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Storyteller..."
              value={selectedStoryteller}
              options={storytellerOptions}
              onChange={handleStorytellerChange}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
            />
          </Box>
          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Project..."
              value={selectedProject}
              options={projectOptions}
              onChange={handleProjectChange}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
            />
          </Box>
          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Location..."
              value={selectedLocation}
              options={locationOptions}
              onChange={handleLocationChange}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
            />
          </Box>
          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Shift..."
              value={selectedShift}
              options={shiftOptions}
              onChange={handleShiftChange}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
              isDisabled={loading || shiftOptions.length === 0}
            />
          </Box>
        </Grid>

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
        ) : filteredQuotes.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>No quotes found</Text>
            <Button 
              mt={4} 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              onClick={openAddModal}
            >
              Add Quote
            </Button>
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
            {filteredQuotes.map((quote: ProcessedQuote) => (
              <Box
                key={quote.id}
                borderWidth="1px"
                borderRadius="lg"
                p={5}
                bg={cardBg}
                borderColor={borderColor}
                boxShadow="sm"
                position="relative"
              >
                 <Flex justify="space-between" align="start" mb={3}>
                   <Box flex="1" mr={2}>
                      <Text fontSize="lg" fontStyle="italic" mb={2}>
                        "{quote['Quote Text']}"
                      </Text>
                      {/* Display Attribution */}
                      {quote.attribution && (
                        <Text fontSize="sm" color="gray.500" textAlign="right">- {quote.attribution}</Text>
                      )}
                   </Box>
                    {/* Edit/Delete Buttons */}
                    <HStack spacing={1}>
                      <Tooltip label="Edit Quote" fontSize="xs">
                        <IconButton
                          icon={<EditIcon />}
                          aria-label={`Edit quote`}
                          size="xs"
                          variant="ghost"
                          onClick={() => openEditModal(quote)}
                        />
                      </Tooltip>
                      <Tooltip label="Delete Quote" fontSize="xs">
                        <IconButton
                          icon={<DeleteIcon />}
                          aria-label={`Delete quote`}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openDeleteModal(quote.id)}
                        />
                      </Tooltip>
                    </HStack>
                 </Flex>
                 
                <Divider my={2} />
                 
                {/* Display Related Info */}
                <VStack align="start" spacing={1} mt={2}>
                   {quote.storytellerData && (
                     <HStack>
                       <Text fontSize="xs" fontWeight="bold" color="gray.500">Storyteller:</Text>
                       <Badge size="sm" colorScheme="pink" variant="solid" borderRadius="full">{quote.storytellerData.Name}</Badge>
                     </HStack>
                   )}
                   {quote.project && (
                      <HStack>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Project:</Text>
                        <Badge size="sm" colorScheme="green" variant="subtle">{quote.project}</Badge>
                      </HStack>
                   )}
                   {quote.location && (
                      <HStack>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Location:</Text>
                        <Badge size="sm" colorScheme="yellow" variant="subtle">{quote.location}</Badge>
                      </HStack>
                   )}
                   {quote.shift && (
                      <HStack>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Shift:</Text>
                        <Tag size="sm" colorScheme="purple" variant="subtle" borderRadius="md">{quote.shift}</Tag>
                      </HStack>
                   )}
                   {/* Add Theme display if needed */}
                 </VStack>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>

      {/* Add/Edit Quote Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(editingQuote ? handleEditQuote : handleCreateQuote)}>
            <ModalHeader>{editingQuote ? 'Edit Quote' : 'Add Quote'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.text} isRequired mb={4}>
                <FormLabel>Quote Text</FormLabel>
                <Textarea
                  placeholder="Enter the quote text"
                  {...register('text', {
                    required: 'Quote text is required',
                    minLength: { value: 3, message: 'Quote must be at least 3 characters long' }
                  })}
                  rows={4}
                />
                <FormErrorMessage>{errors.text?.message}</FormErrorMessage>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Attribution</FormLabel>
                <Input
                  placeholder="Who said this quote? (optional)"
                  {...register('attribution')}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Themes</FormLabel>
                
                {selectedThemes && selectedThemes.length > 0 && (
                  <Box mb={4}>
                    <Wrap>
                      {selectedThemes.map(themeId => {
                        const themeName = themes.find(t => t.id === themeId)?.['Theme Name'];
                        if (!themeName) return null;
                        return (
                          <WrapItem key={themeId}>
                            <Tag colorScheme="blue" size="md">
                              <TagLabel>{themeName}</TagLabel>
                              <TagCloseButton onClick={() => removeTheme(themeId)} />
                            </Tag>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </Box>
                )}
                
                <Box maxH="200px" overflowY="auto" borderWidth="1px" borderRadius="md">
                  {loadingThemes ? (
                    <Box p={3} textAlign="center">
                      <Spinner size="sm" mr={2} />
                      <Text display="inline">Loading themes...</Text>
                    </Box>
                  ) : themes.length === 0 ? (
                    <Box p={3} textAlign="center">
                      <Text>No themes available</Text>
                    </Box>
                  ) : (
                    <Stack spacing={0} divider={<Divider />}>
                      {themes.map(theme => (
                        <Checkbox
                          key={theme.id}
                          isChecked={selectedThemes?.includes(theme.id)}
                          onChange={(e) => handleThemeToggle(theme.id, e.target.checked)}
                          p={2}
                        >
                          {theme['Theme Name']}
                        </Checkbox>
                      ))}
                    </Stack>
                  )}
                </Box>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                {editingQuote ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
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
              Delete Quote
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this quote? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteQuote} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}

export default QuotesPage 