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
  InputGroup,
  InputLeftElement,
  Card,
  CardHeader,
  CardBody,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
} from '@chakra-ui/react'
import { useState, useEffect, useRef, useMemo } from 'react'
import {
  Theme,
  fetchThemes,
  createTheme,
  updateTheme,
  deleteRecord,
  AirtableError,
  Storyteller,
  fetchStorytellers,
  Media,
  fetchMedia
} from '../services/airtable'
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import ReactSelect from 'react-select'

interface ThemeFormData {
  'Theme Name': string;
  description?: string;
}

interface ProcessedTheme {
  id: string;
  themeName: string;
  description: string;
  storytellers: Array<{ id: string; name: string }>;
  media: Array<{ id: string; fileName: string }>;
  relatedProjects: string[];
  relatedLocations: string[];
  relatedShifts: string[];
}

const ThemePage = () => {
  const [themes, setThemes] = useState<Theme[]>([])
  const [media, setMedia] = useState<Media[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null)
  const [deleteThemeId, setDeleteThemeId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
    formState: { errors },
    reset,
  } = useForm<ThemeFormData>()

  // Add Filter States
  const [selectedStoryteller, setSelectedStoryteller] = useState<{ value: string; label: string } | null>(null);
  const [selectedProject, setSelectedProject] = useState<{ value: string; label: string } | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{ value: string; label: string } | null>(null);
  const [selectedShift, setSelectedShift] = useState<{ value: string; label: string } | null>(null);

  // Add theme tags state
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);

  // Add debug state
  const [dataLoaded, setDataLoaded] = useState({
    themes: false,
    media: false,
    storytellers: false
  });

  // Add this new state to track shift-to-storyteller relationship
  const [shiftStorytellerMap, setShiftStorytellerMap] = useState<Map<string, Set<string>>>(new Map());

  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Load all data in parallel
        console.log("[ThemePage] Starting initial data fetch...");
        const [themesResult, mediaResult, storytellersResult] = await Promise.all([
          fetchThemes(),
          fetchMedia(),
          fetchStorytellers()
        ]);

        // --- Log RAW data before setting state --- 
        console.log("[ThemePage] RAW themesResult[0]:", themesResult?.[0]);
        console.log("[ThemePage] RAW mediaResult[0]:", mediaResult?.[0]);
        console.log("[ThemePage] RAW storytellersResult[0]:", storytellersResult?.[0]);
        // ------------------------------------------

        // Set the state only after all data is loaded
        setThemes(themesResult);
        setMedia(mediaResult);
        setStorytellers(storytellersResult);
        
        // Build shift-to-storyteller mapping
        const shiftToStorytellers = new Map<string, Set<string>>();
        
        // Process media records to build the mapping
        mediaResult.forEach(mediaItem => {
          if (mediaItem.Shift && mediaItem.Storytellers?.length) {
            const shift = mediaItem.Shift; // Create a local constant to avoid TypeScript errors
            if (!shiftToStorytellers.has(shift)) {
              shiftToStorytellers.set(shift, new Set());
            }
            
            // Add all storytellers for this media to the set for this shift
            mediaItem.Storytellers.forEach(storytellerId => {
              shiftToStorytellers.get(shift)?.add(storytellerId);
            });
          }
        });
        
        // Save the mapping to state
        setShiftStorytellerMap(shiftToStorytellers);
        
        console.log("[ThemePage] Data fetch complete. State updated.");
        console.log("[ThemePage] Built shift-to-storyteller map:", 
          Array.from(shiftToStorytellers.entries()).map(([shift, storytellers]) => 
            `${shift}: ${Array.from(storytellers).length} storytellers`
          )
        );
        
        setDataLoaded({
          themes: true,
          media: true,
          storytellers: true
        });
      } catch (err) {
        console.error("[ThemePage] Error loading initial data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (editingTheme) {
      reset({
        'Theme Name': editingTheme['Theme Name'] || '',
        description: editingTheme.Description || ''
      });
    } else {
      if (!isOpen) { 
         reset({ 'Theme Name': '', description: '' });
      }
    }
  }, [editingTheme, reset, isOpen]);

  const processedThemes = useMemo(() => {
    console.log("[ThemePage] Processing themes using CORRECTED relationship path (Theme -> Media -> Storyteller)...");

    if (!themes?.length || !media?.length || !storytellers?.length) {
      console.log("[ThemePage] Themes, Media, or Storytellers not loaded yet.");
      return [];
    }

    // --- Create lookup maps --- 
    const storytellerMap = new Map(storytellers.map(s => [s.id, s]));
    const mediaMap = new Map(media.map(m => [m.id, m]));
    
    console.log(`[ThemePage] Storyteller Map size: ${storytellerMap.size}`);
    console.log(`[ThemePage] Media Map size: ${mediaMap.size}`);

    // --- Process each theme --- 
    return themes.map((theme: Theme): ProcessedTheme => {
      const themeId = theme.id;
      
      // 1. Find Media linked TO this theme
      const linkedMediaIds = theme['Related Media'] || [];
      const linkedMediaRecords = linkedMediaIds
        .map(id => mediaMap.get(id))
        .filter((m): m is Media => m !== undefined);

      // 2. From linked Media, find linked Storytellers
      const linkedStorytellerIds = new Set<string>();
      linkedMediaRecords.forEach(m => {
        m.Storytellers?.forEach(storytellerId => linkedStorytellerIds.add(storytellerId));
      });
      
      const linkedStorytellerRecords = Array.from(linkedStorytellerIds)
        .map(id => storytellerMap.get(id))
        .filter((s): s is Storyteller => s !== undefined);

      // 3. Format the final related data for ProcessedTheme
      const themeStorytellers = linkedStorytellerRecords.map(s => ({ 
        id: s.id, 
        name: s.Name || 'Unnamed' 
      }));
      const themeMedia = linkedMediaRecords.map(m => ({ 
        id: m.id, 
        fileName: m['File Name'] || 'Untitled' 
      }));

      // 4. Collect Metadata from the found storytellers and media
      const relatedProjects = new Set<string>();
      const relatedLocations = new Set<string>();
      const relatedShifts = new Set<string>();

      linkedStorytellerRecords.forEach(s => {
        if (s.Project) relatedProjects.add(s.Project);
        if (s.Location) relatedLocations.add(s.Location);
      });

      linkedMediaRecords.forEach(m => {
        if (m.Shift) relatedShifts.add(m.Shift);
      });

      const processed = {
        id: theme.id,
        themeName: theme['Theme Name'] || '',
        description: theme.Description || '',
        storytellers: themeStorytellers,
        media: themeMedia,
        relatedProjects: Array.from(relatedProjects),
        relatedLocations: Array.from(relatedLocations),
        relatedShifts: Array.from(relatedShifts)
      };

      // Log first few processed themes for verification
      if (themes.findIndex(t => t.id === theme.id) < 3) {
        console.log(`[ThemePage] Processed Theme Example (Corrected Path - ID: ${theme.id}):`, {
           name: processed.themeName,
           linkedMediaIds: linkedMediaIds, // IDs from Theme record
           foundMediaCount: linkedMediaRecords.length,
           foundStorytellerIds: Array.from(linkedStorytellerIds), // Unique IDs from Media
           foundStorytellersCount: linkedStorytellerRecords.length, 
           projects: processed.relatedProjects,
           locations: processed.relatedLocations,
           shifts: processed.relatedShifts,
        });
      }

      return processed;
    });
  }, [themes, media, storytellers]);

  // Update the filtered themes memo to match QuotesPage's pattern
  const filteredThemes = useMemo(() => {
    console.log("[ThemePage] Recalculating filteredThemes with filters:", 
      { searchTerm, selectedStoryteller, selectedProject, selectedLocation, selectedShift });

    return processedThemes.filter(theme => {
      // Start with assuming it matches
      let include = true;

      // Apply Search Term Filter
      if (searchTerm) {
        const matchesSearch = 
          theme.themeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          theme.description.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) include = false;
      }

      // Apply Storyteller Filter
      if (include && selectedStoryteller) {
        const matchesStoryteller = theme.storytellers.some(s => s.id === selectedStoryteller.value);
        if (!matchesStoryteller) include = false;
      }

      // Apply Project Filter
      if (include && selectedProject) {
        const matchesProject = theme.relatedProjects.includes(selectedProject.value);
        if (!matchesProject) include = false;
      }

      // Apply Location Filter
      if (include && selectedLocation) {
        const matchesLocation = theme.relatedLocations.includes(selectedLocation.value);
        if (!matchesLocation) include = false;
      }

      // Apply Shift Filter
      if (include && selectedShift) {
        const matchesShift = theme.relatedShifts.includes(selectedShift.value);
        if (!matchesShift) include = false;
      }

      // Log details for the first theme being processed if any filter is active
      if (theme.id === processedThemes[0]?.id && (selectedStoryteller || selectedProject || selectedLocation || selectedShift)) {
        console.log(`[ThemePage] Filtering Theme ID ${theme.id}:`, {
          themeData: { 
            id: theme.id, 
            name: theme.themeName, 
            storytellers: theme.storytellers.map(s => s.id),
            projects: theme.relatedProjects,
            locations: theme.relatedLocations,
            shifts: theme.relatedShifts
          },
          filters: { 
            story: selectedStoryteller?.value, 
            proj: selectedProject?.value, 
            loc: selectedLocation?.value,
            shift: selectedShift?.value
          },
          include
        });
      }

      return include;
    });
  }, [processedThemes, searchTerm, selectedStoryteller, selectedProject, selectedLocation, selectedShift]);

  // Update the storytellerOptions to filter by selected shift if one is chosen
  const storytellerOptions = useMemo(() => {
    console.log("[ThemePage] Generating storyteller options...");
    console.log("[ThemePage] Selected shift:", selectedShift?.value);
    
    // Start with all unique storytellers
    const uniqueStorytellers = new Map();
    processedThemes.forEach((theme: ProcessedTheme) => {
      theme.storytellers.forEach(s => {
        uniqueStorytellers.set(s.id, { value: s.id, label: s.name });
      });
    });
    
    // If a shift is selected, filter storytellers to only those related to that shift
    let filteredStorytellers;
    if (selectedShift && shiftStorytellerMap.has(selectedShift.value)) {
      const shiftRelatedStorytellers = shiftStorytellerMap.get(selectedShift.value) || new Set();
      
      console.log(`[ThemePage] Filtering storytellers by shift "${selectedShift.value}"`);
      console.log(`[ThemePage] Shift has ${shiftRelatedStorytellers.size} related storytellers`);
      
      filteredStorytellers = new Map(
        Array.from(uniqueStorytellers.entries())
          .filter(([id]) => shiftRelatedStorytellers.has(id as string))
      );
    } else {
      filteredStorytellers = uniqueStorytellers;
    }
    
    const options = Array.from(filteredStorytellers.values())
      .sort((a, b) => a.label.localeCompare(b.label));
    
    console.log("[ThemePage] Generated storyteller options:", options.length);
    return options;
  }, [processedThemes, selectedShift, shiftStorytellerMap]);

  const projectOptions = useMemo(() => {
    const uniqueProjects = new Set<string>();
    processedThemes.forEach((theme: ProcessedTheme) => {
      theme.relatedProjects.forEach(p => uniqueProjects.add(p));
    });
    
    const options = Array.from(uniqueProjects)
      .filter(Boolean)
      .map(p => ({ value: p, label: p }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
    console.log("[ThemePage] Generated project options:", options.length);
    return options;
  }, [processedThemes]);

  const locationOptions = useMemo(() => {
    const uniqueLocations = new Set<string>();
    processedThemes.forEach((theme: ProcessedTheme) => {
      theme.relatedLocations.forEach(l => uniqueLocations.add(l));
    });
    
    const options = Array.from(uniqueLocations)
      .filter(Boolean)
      .map(l => ({ value: l, label: l }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
    console.log("[ThemePage] Generated location options:", options.length);
    return options;
  }, [processedThemes]);

  // Add Shift options generation
  const shiftOptions = useMemo(() => {
    const uniqueShifts = new Set<string>();
    processedThemes.forEach((theme: ProcessedTheme) => {
      theme.relatedShifts.forEach(s => uniqueShifts.add(s));
    });
    
    const options = Array.from(uniqueShifts)
      .filter(Boolean)
      .map(s => ({ value: s, label: s }))
      .sort((a, b) => a.label.localeCompare(b.label));
    
    console.log("[ThemePage] Generated shift options:", options.length);
    return options;
  }, [processedThemes]);

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

  // Update the handleShiftChange function to reset storyteller selection if needed
  const handleShiftChange = (option: { value: string; label: string } | null) => {
    console.log("Shift filter changed:", option);
    
    // Clear storyteller selection if it's not related to the new shift
    if (option && selectedStoryteller) {
      const shiftRelatedStorytellers = shiftStorytellerMap.get(option.value) || new Set();
      if (!shiftRelatedStorytellers.has(selectedStoryteller.value)) {
        console.log("Clearing storyteller selection as it's not related to the selected shift");
        setSelectedStoryteller(null);
      }
    }
    
    setSelectedShift(option);
  }

  const handleCreateTheme = (data: ThemeFormData) => {
    setIsSubmitting(true)

    createTheme({
      'Theme Name': data['Theme Name'],
      Description: data.description
    })
      .then(newTheme => {
        setThemes(prev => [...prev, newTheme])
        onClose()
        toast({
          title: 'Success',
          description: 'Theme created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error creating theme:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create theme',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditTheme = (data: ThemeFormData) => {
    if (!editingTheme) return

    setIsSubmitting(true)

    updateTheme(editingTheme.id, {
      'Theme Name': data['Theme Name'],
      Description: data.description
    })
      .then(updatedTheme => {
        setThemes(prev => 
          prev.map(theme => theme.id === updatedTheme.id ? updatedTheme : theme)
        )
        setEditingTheme(null)
        onClose()
        toast({
          title: 'Success',
          description: 'Theme updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error updating theme:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update theme',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteTheme = () => {
    if (!deleteThemeId) return

    deleteRecord('Themes', deleteThemeId)
      .then(() => {
        setThemes(prev => prev.filter(theme => theme.id !== deleteThemeId))
        setDeleteThemeId(null)
        onDeleteClose()
        toast({
          title: 'Success',
          description: 'Theme deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error deleting theme:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete theme',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const openAddModal = () => {
    setEditingTheme(null)
    onOpen()
  }

  const openEditModal = (theme: Theme) => {
    setEditingTheme(theme)
    onOpen()
  }

  const openDeleteModal = (id: string) => {
    setDeleteThemeId(id)
    onDeleteOpen()
  }

  // Update the helper function to reflect that Theme doesn't directly link storytellers
  // It might need removal or adjustment depending on how the edit modal uses it.
  // For now, let's make it syntactically correct based on the INTERFACE, 
  // acknowledging it doesn't match the actual data flow needed for display.
  const processedThemeToTheme = (processed: ProcessedTheme): Theme => ({
    id: processed.id,
    'Theme Name': processed.themeName,
    Description: processed.description,
    // Theme interface only has 'Related Media'. How should storytellers be handled?
    // Option 1: Omit storytellers (might break modal if it expects them)
    // Option 2: Pass media IDs (correct according to interface)
    'Related Media': processed.media.map(m => m.id),
    createdTime: '', 
  });

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Themes</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={openAddModal}
          >
            Add Theme
          </Button>
        </Flex>

        {/* Debug info during loading */}
        {loading && (
          <Alert status="info">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text>Loading data...</Text>
              <Text fontSize="sm">
                Themes: {dataLoaded.themes ? '✓' : '...'} |
                Media: {dataLoaded.media ? '✓' : '...'} |
                Storytellers: {dataLoaded.storytellers ? '✓' : '...'}
              </Text>
            </VStack>
          </Alert>
        )}

        {/* Update Search and Filters Grid */}
        <Grid templateColumns={{ base: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)", xl: "1fr 2fr 2fr 2fr 2fr" }} gap={4} alignItems="center">
          {/* Search Input takes first column */}
          <Box gridColumn={{ base: "span 1", sm: "span 2", lg: "span 3", xl: "span 1" }}>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Search themes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                borderRadius="md"
              />
            </InputGroup>
          </Box>

          {/* Filters take remaining columns */}
          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Storyteller..."
              value={selectedStoryteller}
              onChange={handleStorytellerChange}
              options={storytellerOptions}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
              isDisabled={loading || storytellerOptions.length === 0}
            />
          </Box>

          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Project..."
              value={selectedProject}
              onChange={handleProjectChange}
              options={projectOptions}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
              isDisabled={loading || projectOptions.length === 0}
            />
          </Box>

          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Location..."
              value={selectedLocation}
              onChange={handleLocationChange}
              options={locationOptions}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
              isDisabled={loading || locationOptions.length === 0}
            />
          </Box>
          
          {/* Add Shift Filter */}
          <Box minW="150px">
            <ReactSelect
              placeholder="Filter by Shift..."
              value={selectedShift}
              onChange={handleShiftChange}
              options={shiftOptions}
              isClearable
              styles={{ control: (base) => ({ ...base, fontSize: 'sm' }) }}
              isDisabled={loading || shiftOptions.length === 0}
            />
          </Box>
        </Grid>

        {/* Theme Cards */}
        {loading ? (
          <Spinner />
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : processedThemes.length === 0 ? (
          <Alert status="info">
            <AlertIcon />
            No themes found or data still processing...
          </Alert>
        ) : (
          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {filteredThemes.map((theme) => (
              <Card key={theme.id} bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="sm">
                <CardHeader pb={2}> {/* Reduced padding */}
                  <Flex justify="space-between" align="start">
                    <Heading size="md" mb={1}>{theme.themeName}</Heading> {/* Reduced margin */}                    
                    <HStack spacing={1}> {/* Reduced spacing */}
                      <Tooltip label="Edit Theme" fontSize="xs">
                        <IconButton
                          aria-label="Edit theme"
                          icon={<EditIcon />}
                          size="xs" // Smaller size
                          variant="ghost"
                          onClick={() => openEditModal(processedThemeToTheme(theme))}
                        />
                      </Tooltip>
                      <Tooltip label="Delete Theme" fontSize="xs">
                        <IconButton
                          aria-label="Delete theme"
                          icon={<DeleteIcon />}
                          size="xs" // Smaller size
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openDeleteModal(theme.id)}
                        />
                       </Tooltip>
                    </HStack>
                  </Flex>
                  {theme.description && (
                    <Text fontSize="sm" color="gray.600">
                      {theme.description}
                    </Text>
                  )}
                </CardHeader>

                <CardBody pt={2}> {/* Reduced padding */}                
                  <Divider my={3}/> {/* Added Divider */}                  
                  <VStack align="stretch" spacing={3}> {/* Reduced spacing */}                  
                    {theme.storytellers.length > 0 && (
                      <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Storyteller:</Text>
                        <Wrap spacing={1}>
                          {theme.storytellers.map((storyteller) => (
                            <WrapItem key={storyteller.id}>
                              <Tag size="sm" colorScheme="pink" variant="solid" borderRadius="full"> {/* Matching style */}                              
                                <TagLabel>{storyteller.name}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </HStack>
                    )}

                    {theme.relatedProjects.length > 0 && (
                       <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Project:</Text>
                        <Wrap spacing={1}>
                          {theme.relatedProjects.map((project) => (
                            <WrapItem key={project}>
                              <Tag size="sm" colorScheme="green" variant="subtle" borderRadius="md"> {/* Matching style */}                              
                                <TagLabel>{project}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </HStack>
                    )}

                    {theme.relatedLocations.length > 0 && (
                      <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Location:</Text>
                        <Wrap spacing={1}>
                          {theme.relatedLocations.map((location) => (
                            <WrapItem key={location}>
                              <Tag size="sm" colorScheme="blue" variant="subtle" borderRadius="md"> {/* Matching style */}                              
                                <TagLabel>{location}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </HStack>
                    )}

                    {/* Display Shifts */}
                    {theme.relatedShifts.length > 0 && (
                      <HStack spacing={2}>
                        <Text fontSize="xs" fontWeight="bold" color="gray.500">Shift:</Text>
                        <Wrap spacing={1}>
                          {theme.relatedShifts.map((shift) => (
                            <WrapItem key={shift}>
                               <Tag size="sm" colorScheme="purple" variant="subtle" borderRadius="md"> {/* Matching style */}                                
                                <TagLabel>{shift}</TagLabel>
                              </Tag>
                            </WrapItem>
                          ))}
                        </Wrap>
                      </HStack>
                    )}
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </Grid>
        )}
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(editingTheme ? handleEditTheme : handleCreateTheme)}>
            <ModalHeader>{editingTheme ? 'Edit Theme' : 'Add Theme'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors['Theme Name']} isRequired mb={4}>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Theme name"
                  {...register('Theme Name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Minimum length should be 2 characters' }
                  })}
                />
                <FormErrorMessage>{errors['Theme Name']?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Theme description"
                  {...register('description')}
                  rows={4}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                {editingTheme ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Theme
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this theme? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteTheme} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}

export default ThemePage 