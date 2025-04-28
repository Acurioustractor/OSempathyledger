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
  createQuote, 
  updateQuote, 
  deleteRecord, 
  Theme,
  Storyteller,
  Media
} from '../services/airtable'
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, QuestionIcon } from '@chakra-ui/icons'
import { useForm, Controller } from 'react-hook-form'
import ReactSelect from 'react-select'
import { useQuotesData } from '../hooks'

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
  const {
    quotes,
    storytellers,
    themes,
    media: mediaItems,
    isLoading: loading,
    error,
    refetchAll,
    refetchQuotes,
    getQuoteStorytellers,
    getQuoteTheme,
    getQuoteMedia
  } = useQuotesData()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  const [deleteQuoteId, setDeleteQuoteId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
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

  // Remove the initial data load effect since useQuotesData handles it

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
        shift: shift
      };
      return processed;
    });
  }, [quotes, storytellers, mediaItems]);

  // Replace loadThemes with useEffect that watches themes from hook
  // Remove the loadThemes function since themes are already loaded by useQuotesData

  const handleCreateQuote = async (data: QuoteFormData) => {
    setIsSubmitting(true)
    try {
      const newQuote = {
        'Quote Text': data.text,
        'attribution': data.attribution,
        'Theme': data.themes && data.themes.length > 0 ? data.themes[0] : undefined
      }
      
      await createQuote(newQuote)
      toast({
        title: 'Quote created.',
        description: 'The quote has been successfully created.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Refresh quotes data
      refetchQuotes()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create quote'
      toast({
        title: 'Failed to create quote.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditQuote = async (data: QuoteFormData) => {
    if (!editingQuote) return
    
    setIsSubmitting(true)
    try {
      const updatedQuote = {
        id: editingQuote.id,
        'Quote Text': data.text,
        'attribution': data.attribution,
        'Theme': data.themes && data.themes.length > 0 ? data.themes[0] : undefined
      }
      
      await updateQuote(updatedQuote)
      toast({
        title: 'Quote updated.',
        description: 'The quote has been successfully updated.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Refresh quotes data
      refetchQuotes()
      onClose()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update quote'
      toast({
        title: 'Failed to update quote.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteQuote = async () => {
    if (!deleteQuoteId) return
    
    try {
      await deleteRecord('Quotes', deleteQuoteId)
      
      toast({
        title: 'Quote deleted.',
        description: 'The quote has been successfully deleted.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      // Refresh quotes data
      refetchQuotes()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete quote'
      toast({
        title: 'Failed to delete quote.',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      onDeleteClose()
      setDeleteQuoteId(null)
    }
  }

  const openAddDialog = () => {
    setEditingQuote(null)
    reset({
      text: '',
      attribution: '',
      themes: [],
    })
    onOpen()
  }

  const openEditDialog = (quote: Quote) => {
    setEditingQuote(quote)
    onOpen()
  }

  const openDeleteDialog = (id: string) => {
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

  // Filtered quotes based on state
  const filteredQuotes = useMemo(() => {
    return processedQuotes.filter(quote => {
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
      
      return include;
    });
  }, [processedQuotes, searchTerm, selectedStoryteller, selectedProject, selectedLocation, selectedShift]);

  // Options for filter dropdowns derived from data
  const projectOptions = useMemo(() => 
    Array.from(new Set(storytellers.map(s => s.Project).filter(Boolean))) 
      .map(p => ({ value: p as string, label: p as string }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [storytellers]
  );

  const locationOptions = useMemo(() => 
    Array.from(new Set(storytellers.map(s => s.Location).filter(Boolean)))
      .map(l => ({ value: l as string, label: l as string }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [storytellers]
  );

  const shiftOptions = useMemo(() => 
    Array.from(new Set(mediaItems.map(m => m.Shift).filter(Boolean)))
      .map(s => ({ value: s as string, label: s as string }))
      .sort((a, b) => a.label.localeCompare(b.label)),
    [mediaItems]
  );

  const themeOptions = useMemo(() => 
    themes.map(theme => ({
      value: theme.id,
      label: theme.Name
    })),
    [themes]
  );

  if (loading) {
    return (
      <Container maxW="container.xl" py={5}>
        <Flex justify="center" align="center" minH="50vh">
          <Spinner size="xl" thickness="4px" />
        </Flex>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={5}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={5}>
      <Box mb={6}>
        <Flex justifyContent="space-between" alignItems="center" mb={4}>
          <Heading as="h1" size="xl">Quotes</Heading>
          <Button leftIcon={<AddIcon />} colorScheme="teal" onClick={openAddDialog}>
            Add Quote
          </Button>
        </Flex>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={3} mb={4}>
          <Box>
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search quotes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Box>
          <Box>
            <ReactSelect
              placeholder="Filter by Storyteller..."
              value={selectedStoryteller}
              options={storytellers.map(s => ({ value: s.id, label: s.Name })).sort((a, b) => a.label.localeCompare(b.label))}
              onChange={handleStorytellerChange}
              isClearable
            />
          </Box>
          <Box>
            <ReactSelect
              placeholder="Filter by Project..."
              value={selectedProject}
              options={projectOptions}
              onChange={handleProjectChange}
              isClearable
            />
          </Box>
          <Box>
            <ReactSelect
              placeholder="Filter by Location..."
              value={selectedLocation}
              options={locationOptions}
              onChange={handleLocationChange}
              isClearable
            />
          </Box>
          <Box>
            <ReactSelect
              placeholder="Filter by Shift..."
              value={selectedShift}
              options={shiftOptions}
              onChange={handleShiftChange}
              isClearable
            />
          </Box>
        </Grid>

        <Text mb={2}>
          Showing {filteredQuotes.length} of {quotes.length} quotes
        </Text>
      </Box>

      <VStack spacing={4} align="stretch">
        {filteredQuotes.length === 0 ? (
          <Box p={4} borderWidth={1} borderRadius="md" bg={cardBg}>
            <Text>No quotes found matching the current filters.</Text>
          </Box>
        ) : (
          filteredQuotes.map(quote => (
            <Box 
              key={quote.id} 
              p={4} 
              borderWidth={1} 
              borderRadius="md" 
              bg={cardBg}
              borderColor={borderColor}
              boxShadow="sm"
            >
              <Flex justify="space-between" mb={2}>
                <Text fontSize="lg" fontWeight="bold">
                  {quote.attribution ? `"${quote['Quote Text']}" - ${quote.attribution}` : `"${quote['Quote Text']}"`}
                </Text>
                <HStack>
                  <IconButton
                    aria-label="Edit quote"
                    icon={<EditIcon />}
                    size="sm"
                    onClick={() => openEditDialog(quote)}
                  />
                  <IconButton
                    aria-label="Delete quote"
                    icon={<DeleteIcon />}
                    size="sm"
                    colorScheme="red"
                    onClick={() => openDeleteDialog(quote.id)}
                  />
                </HStack>
              </Flex>
              
              <Divider my={2} />
              
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={3}>
                {quote.storytellerData && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">Storyteller:</Text>
                    <Text>{quote.storytellerData.Name}</Text>
                  </Box>
                )}
                
                {quote.project && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">Project:</Text>
                    <Text>{quote.project}</Text>
                  </Box>
                )}
                
                {quote.location && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">Location:</Text>
                    <Text>{quote.location}</Text>
                  </Box>
                )}
                
                {quote.shift && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">Shift:</Text>
                    <Text>{quote.shift}</Text>
                  </Box>
                )}
              </Grid>
              
              {quote.Theme && (
                <Box mt={2}>
                  <Wrap>
                    <WrapItem>
                      <Badge colorScheme="purple" py={1} px={2} borderRadius="lg">
                        {themes.find(t => t.id === quote.Theme)?.Name || 'Unknown Theme'}
                      </Badge>
                    </WrapItem>
                  </Wrap>
                </Box>
              )}
            </Box>
          ))
        )}
      </VStack>

      {/* Create/Edit Quote Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingQuote ? 'Edit Quote' : 'Add New Quote'}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmit(editingQuote ? handleEditQuote : handleCreateQuote)}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl isInvalid={!!errors.text}>
                  <FormLabel htmlFor="text">Quote Text</FormLabel>
                  <Textarea
                    id="text"
                    placeholder="Enter the quote text"
                    {...register('text', {
                      required: 'Quote text is required',
                    })}
                  />
                  {errors.text && (
                    <FormErrorMessage>{errors.text.message}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl>
                  <FormLabel htmlFor="attribution">Attribution</FormLabel>
                  <Input
                    id="attribution"
                    placeholder="Who said this quote? (optional)"
                    {...register('attribution')}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Theme</FormLabel>
                  <Controller
                    name="themes"
                    control={control}
                    render={({ field }) => (
                      <ReactSelect
                        {...field}
                        isMulti
                        options={themeOptions}
                        placeholder="Select a theme (optional)"
                        value={themeOptions.filter(option => field.value?.includes(option.value))}
                        onChange={(selectedOptions) => {
                          field.onChange(selectedOptions ? selectedOptions.map(option => option.value) : []);
                        }}
                        isLoading={loadingThemes}
                      />
                    )}
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isSubmitting}
                loadingText="Submitting"
              >
                {editingQuote ? 'Update' : 'Create'}
              </Button>
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