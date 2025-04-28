import {
  Box,
  Container,
  Grid,
  Heading,
  Image,
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
  Tag,
  TagCloseButton,
  HStack,
  Badge,
  Input,
  Select,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Checkbox,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverHeader,
  PopoverFooter,
  PopoverArrow,
  PopoverCloseButton,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Stack,
  VisuallyHidden,
  SkipNavLink,
  SkipNavContent,
  FormControl,
  FormLabel,
  ModalFooter,
  Switch,
  Divider,
  ButtonGroup,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  AspectRatio,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  CardFooter,
  Link,
} from '@chakra-ui/react'
import { useState, useEffect, useMemo, useRef, useCallback, KeyboardEvent } from 'react'
import { Media, fetchMedia, createRecord, updateRecord, deleteRecord, FetchOptions, fetchThemes, fetchTags, Theme, Tag as TagType, createMedia, AirtableError, Storyteller, fetchStorytellers, fetchQuotes, Quote } from '../services/airtable'
import MediaForm, { MediaFormData } from '../components/MediaForm'
import { SearchIcon, AddIcon, DeleteIcon, EditIcon, ChevronDownIcon, CheckIcon, CloseIcon, ExternalLinkIcon, ChatIcon } from '@chakra-ui/icons'
import CacheService from "../services/CacheService"
import { useHotkeys } from 'react-hotkeys-hook'
import { FaImage, FaVideo, FaFilter, FaCube, FaSearch } from 'react-icons/fa'
import { useInView } from 'react-intersection-observer'
import { useForm } from 'react-hook-form'
import { Link as RouterLink } from 'react-router-dom'
import MediaDetailModal from "../components/MediaDetailModal"

const MediaCard = ({ 
  media, 
  onEdit, 
  onDelete,
  isSelected,
  onSelect,
  index,
  allThemes, 
  allStorytellers,
  allQuotes,
  onCardClick
}: { 
  media: Media
  onEdit: (media: Media) => void
  onDelete: (id: string) => void
  isSelected: boolean
  onSelect: () => void
  index: number
  allThemes: Theme[] 
  allStorytellers: Storyteller[] 
  allQuotes: Quote[]
  onCardClick: (media: Media) => void;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const selectedBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  
  // --- START: Storyteller Profile Image Logic ---
  let storytellerProfileImageUrl: string | undefined = undefined;
  if (Array.isArray(media.Storytellers) && media.Storytellers.length > 0 && Array.isArray(allStorytellers) && allStorytellers.length > 0) {
    const firstStorytellerId = media.Storytellers[0];
    const storyteller = allStorytellers.find(s => s.id === firstStorytellerId);
    if (storyteller) {
      const fileProfileImageField = (storyteller as any)['File Profile Image'];
      if (Array.isArray(fileProfileImageField) && fileProfileImageField.length > 0 && fileProfileImageField[0]?.url) {
        storytellerProfileImageUrl = fileProfileImageField[0].url;
        console.log(`[MediaPage Card - SUCCESS] Image URL for ${storyteller.Name} (Media: ${media['File Name']}): ${storytellerProfileImageUrl}`);
      } else {
        console.log(`[MediaPage Card - INFO] Storyteller ${storyteller.Name} found, but no valid 'File Profile Image' data for Media: ${media['File Name']}`);
      }
    } else {
      console.log(`[MediaPage Card - WARN] Storyteller with ID ${firstStorytellerId} not found for Media: ${media['File Name']}`);
    }
  } else {
    console.log(`[MediaPage Card - INFO] No Storytellers linked or array empty for Media: ${media['File Name']}`);
  }
  // --- END: Storyteller Profile Image Logic ---

  // Memoized Lookups
  const themeNames = useMemo(() => {
    if (!media.Themes || !allThemes) return [];
    const themeMap = new Map(allThemes.map(t => [t.id, t['Theme Name']]));
    return media.Themes.map(id => themeMap.get(id)).filter(Boolean) as string[];
  }, [media.Themes, allThemes]);

  const storytellerData = useMemo(() => {
    if (!media.Storytellers || !allStorytellers) return [];
    const storytellerMap = new Map(allStorytellers.map(s => [s.id, s]));
    return media.Storytellers.map(id => storytellerMap.get(id)).filter((s): s is Storyteller => s !== undefined);
  }, [media.Storytellers, allStorytellers]);

  // Event Handlers
  const handleEdit = (e: React.MouseEvent) => { e.stopPropagation(); onEdit(media); };
  const handleDelete = (e: React.MouseEvent) => { e.stopPropagation(); onDelete(media.id); };
  const handleCardClickInternal = () => {
    console.log("MediaCard Clicked (Internal Handler)! Media ID:", media.id);
    onCardClick(media);
  }; 
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCardClickInternal(); }
    else if (e.key === 'e' || e.key === 'E') { e.preventDefault(); onEdit(media); }
    else if (e.key === 'd' || e.key === 'D') { e.preventDefault(); onDelete(media.id); }
    else if (e.key === 's' || e.key === 'S') { e.preventDefault(); onSelect(); }
  };

  // Icon & Link Logic
  const linkUrl = media['Video draft link'];
  const icon = media.Type === 'Photo' || media.Type === 'Image' ? <FaImage size={20} /> 
              : media.Type === 'Video' ? <FaVideo size={20} /> 
              : media.Type === 'Interview' ? <ChatIcon />
              : <FaCube size={20} />;
  const iconColor = media.Type === 'Photo' || media.Type === 'Image' ? 'green.500' 
                  : media.Type === 'Video' ? 'blue.500' 
                  : media.Type === 'Interview' ? 'orange.500'
                  : 'gray.500';

  return (
      <Card 
        ref={cardRef}
        variant="outline" 
        size="sm"
        bg={isSelected ? selectedBg : useColorModeValue('white', 'gray.800')} // Use specific background
        borderColor={isSelected ? 'blue.400' : borderColor}
        boxShadow={isSelected ? 'md' : 'sm'}
        transition="all 0.2s ease-in-out"
        _hover={{ 
          transform: 'translateY(-3px)', 
          shadow: 'md',
          borderColor: 'blue.300',
          bg: hoverBg
        }}
        cursor="pointer"
        onClick={handleCardClickInternal}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label={`${media['File Name']}, ${media.Type}`}
        role="group" 
        position="relative"
        display="flex" 
        flexDirection="column"
        height="100%"
      >
        {/* Checkbox */}
        <Box position="absolute" top={2} left={2} zIndex={2}>
           <Checkbox
              isChecked={isSelected}
              onChange={onSelect}
              aria-label={`Select ${media['File Name']}`}
              bg="whiteAlpha.700"
              borderColor="gray.400"
              size="lg"
              colorScheme="blue"
              borderRadius="full"
              boxShadow="md"
              opacity={isSelected ? 1 : 0.4}
              _groupHover={{ opacity: 1 }}
              onClick={(e) => e.stopPropagation()} 
            />
        </Box>

        {/* Edit/Delete Buttons */}
        <Box position="absolute" top={2} right={2} zIndex={2} opacity={0} _groupHover={{ opacity: 1 }} transition="opacity 0.2s">
           <ButtonGroup size="xs" isAttached variant="outline">
             <Tooltip label="Edit Media (E)" fontSize="xs">
              <IconButton icon={<EditIcon />} aria-label={`Edit ${media['File Name']}`} onClick={handleEdit} borderRightRadius={0}/>
            </Tooltip>
            <Tooltip label="Delete Media (D)" fontSize="xs">
              <IconButton icon={<DeleteIcon />} aria-label={`Delete ${media['File Name']}`} colorScheme="red" onClick={handleDelete} borderLeftRadius={0}/>
            </Tooltip>
          </ButtonGroup>
        </Box>

        {/* Icon Preview */}
        <Flex 
          height="100px" 
          alignItems="center" 
          justifyContent="center" 
          bg={useColorModeValue('gray.50', 'gray.700')}
          borderBottomWidth="1px"
          borderColor={borderColor}
          borderTopRadius="md"
          position="relative" // Add relative positioning for the avatar overlay
        >
          <Box color={iconColor} opacity={0.7}>{icon}</Box>
          {/* Show storyteller avatar if available */}
          {storytellerProfileImageUrl && (
            <Box
              position="absolute"
              bottom={2}
              right={2}
              borderRadius="full"
              borderWidth="2px"
              borderColor="white"
              boxShadow="md"
              width="32px" // Slightly smaller for this card style
              height="32px"
              overflow="hidden"
              zIndex={2}
              bg="white"
            >
              <Image
                src={storytellerProfileImageUrl}
                alt={`Profile of storyteller for ${media['File Name']}`}
                width="100%"
                height="100%"
                objectFit="cover"
              />
            </Box>
          )}
        </Flex>

        <CardBody display="flex" flexDirection="column" flexGrow={1} p={3}>
          <Heading as="h3" size="xs" noOfLines={2} mb={1} flexGrow={1} title={media['File Name']}>
            {media['File Name']}
          </Heading>
          
          {/* Metadata Badges */}
          <HStack spacing={1.5} mt={1} mb={2} align="center" wrap="wrap" fontSize="xs">
            {media.Type && <Badge colorScheme="purple" variant="subtle" px={1.5}>{media.Type}</Badge>}
            {media['Created At'] && 
              <Tooltip label={`Created: ${new Date(media['Created At']).toLocaleString()}`} placement="top">
                <Text color="gray.500">{new Date(media['Created At']).toLocaleDateString()}</Text>
              </Tooltip>}
           {media.Shift && <Badge colorScheme="orange" variant="subtle" px={1.5} title={`Shift: ${media.Shift}`}>{media.Shift}</Badge>}
           {media.Location && <Badge colorScheme="yellow" variant="subtle" px={1.5} title={`Location: ${media.Location}`}>{media.Location}</Badge>}
           {media.Project && <Badge colorScheme="cyan" variant="subtle" px={1.5} title={`Project: ${media.Project}`}>{media.Project}</Badge>}
          </HStack>
          
          {/* Description/Summary Snippet */}
          {(media.description || media.Summary) && (
            <Text noOfLines={2} fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} mb={2} title={media.description || media.Summary}>
              {media.description || media.Summary}
            </Text>
          )}
          
          {/* Storytellers */} 
          {storytellerData.length > 0 && (
            <Box mb={2}>
               <Text fontSize="2xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">Storytellers</Text>
               <HStack spacing={1} flexWrap="wrap">
                {storytellerData.slice(0, 2).map((st) => (
                  <Tooltip key={st.id} label={st.Name} fontSize="xs">
                    <Badge 
                      size="sm" 
                      colorScheme="pink" 
                      variant="solid"
                      as={RouterLink}
                      to={`/storyteller/${st.id}`}
                      onClick={(e) => e.stopPropagation()} 
                      _hover={{bg: 'pink.600'}}
                      px={1.5} // Adjusted padding
                      py={0.5}
                      borderRadius="full" // Changed to full
                      isTruncated
                      maxWidth="70px" // Adjusted width
                    >
                      {st.Name}
                    </Badge>
                  </Tooltip>
                ))}
                {storytellerData.length > 2 && (
                  <Badge size="sm" colorScheme="pink" variant="outline" borderRadius="full">+{storytellerData.length - 2}</Badge>
                )}
              </HStack>
            </Box>
          )}

          {/* Themes */}
          {themeNames.length > 0 && (
            <Box>
               <Text fontSize="2xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">Themes</Text>
               <HStack spacing={1} flexWrap="wrap">
                {themeNames.slice(0, 3).map((name) => (
                   <Tooltip key={name} label={name} fontSize="xs">
                    <Badge 
                      size="sm" 
                      colorScheme="blue" 
                      variant="subtle"
                      px={1.5} // Adjusted padding
                      py={0.5}
                      borderRadius="md"
                      isTruncated
                      maxWidth="70px" // Adjusted width
                    >
                      {name}
                    </Badge>
                  </Tooltip>
                ))}
                {themeNames.length > 3 && (
                  <Badge size="sm" colorScheme="blue" variant="outline" borderRadius="md">+{themeNames.length - 3}</Badge>
                )}
              </HStack>
            </Box>
          )}
        </CardBody>
        
        {/* Footer for Link */}
        {linkUrl && (
           <CardFooter pt={0} pb={2} px={3} mt="auto"> 
             <Button 
              as="a" 
              href={linkUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              size="xs" 
              rightIcon={<ExternalLinkIcon />}
              colorScheme="gray"
              variant="link"
              fontWeight="normal"
              onClick={(e) => e.stopPropagation()}
            >
              View Source
            </Button>
           </CardFooter>
        )}
      </Card>
  )
}

const ITEMS_PER_PAGE = 12

interface FilterState {
  type: string
  themes: string[]
  tags: string[]
  dateRange: [Date | null, Date | null]
}

interface BulkEditState {
  themes: {
    mode: 'add' | 'remove' | 'replace'
    values: string[]
  }
  tags: {
    mode: 'add' | 'remove' | 'replace'
    values: string[]
  }
}

const MediaPage = () => {
  // --- HOOKS (ALL MUST BE CALLED UNCONDITIONALLY AT TOP) ---
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    themes: [],
    tags: [],
    dateRange: [null, null],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [sortField, setSortField] = useState<string>('File Name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [themes, setThemes] = useState<Theme[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [selectedMediaForModal, setSelectedMediaForModal] = useState<Media | null>(null)
  const [liveRegionMessage, setLiveRegionMessage] = useState('')
  const [bulkEditState, setBulkEditState] = useState<BulkEditState>({
    themes: { mode: 'add', values: [] },
    tags: { mode: 'add', values: [] }
  })
  const [isBulkEditing, setIsBulkEditing] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure() // Main Add/Edit Modal
  const { 
    isOpen: isBulkEditOpen, 
    onOpen: onBulkEditOpen, 
    onClose: onBulkEditClose 
  } = useDisclosure() // Bulk Edit Modal
  const { 
    isOpen: isDeleteConfirmOpen, 
    onOpen: onDeleteConfirmOpen, 
    onClose: onDeleteConfirmClose 
  } = useDisclosure() // Single Delete Confirm
   const { 
    isOpen: isBulkDeleteConfirmOpen, 
    onOpen: onBulkDeleteConfirmOpen, 
    onClose: onBulkDeleteConfirmClose 
  } = useDisclosure() // Bulk Delete Confirm
  const { 
    isOpen: isDetailModalOpen,
    onOpen: onDetailModalOpen, 
    onClose: onDetailModalClose 
  } = useDisclosure() // Detail Modal state hooks
  const [editingMedia, setEditingMedia] = useState<Media | null>(null)
  const [deleteMediaId, setDeleteMediaId] = useState<string | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const toast = useToast()
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false
  })
  const { 
    handleSubmit: handleFormSubmit, 
    register: registerFormField, 
    formState: { errors: formErrors }, 
    reset: resetForm, 
    control: formControl 
  } = useForm<MediaFormData>() // Hooks related to the Add/Edit form

  // --- CALLBACKS (useCallback) ---
  const loadPageData = useCallback(async () => {
    console.log("--- loadPageData started ---");
    setLoading(true);
    setError(null);
    setMediaItems([]); // Clear previous results immediately
    setThemes([]);
    setTags([]);
    setStorytellers([]);
    setQuotes([]);
    setPage(1);
    setHasMore(false); // Assume no more pages until fetch confirms otherwise
    setLiveRegionMessage('Loading all page data...');

    try {
      console.log("Fetching Media, Themes, Tags, Storytellers, Quotes...");
      const [mediaResult, themesResult, tagsResult, storytellersResult, quotesResult] = await Promise.all([
        fetchMedia({ sort: [{ field: sortField, direction: sortDirection }] }),
        fetchThemes(),
        fetchTags(),
        fetchStorytellers(),
        fetchQuotes()
      ]);
      
      console.log(`Fetched Counts - Media: ${mediaResult.length}, Themes: ${themesResult.length}, Tags: ${tagsResult.length}, Storytellers: ${storytellersResult.length}, Quotes: ${quotesResult.length}`);

      // Update state AFTER all promises resolved
      setMediaItems(mediaResult); 
      setThemes(themesResult); 
      setTags(tagsResult);
      setStorytellers(storytellersResult); 
      setQuotes(quotesResult); 

      setLiveRegionMessage('Page data loaded successfully.');

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load page data';
      setError(errorMessage);
      console.error("Error loading page data:", err);
      setLiveRegionMessage(`Error loading page data: ${errorMessage}`);
    } finally {
      console.log("--- loadPageData finished, setting loading to false ---");
      setLoading(false); // Set loading false *after* state updates
    }
  }, [sortField, sortDirection]);

  // --- SIDE EFFECTS (useEffect) ---
  // Load initial data on mount and when sort changes
  useEffect(() => {
    loadPageData();
  }, [loadPageData]); // Depend on the memoized function

  useEffect(() => {
    // This effect depends on loadPageData potentially updating mediaItems
    if (mediaItems.length === 0 && !loading) {
       loadPageData(); // Re-trigger load if empty after initial attempt
    }
  }, [loadPageData, mediaItems.length, loading]);
  
  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((p) => p + 1);
      setLiveRegionMessage('Loading more media items');
    }
  }, [inView, hasMore, loading]);
  
  // Add this effect to specifically track the detail modal state
  useEffect(() => {
    console.log("Modal State Check: isDetailModalOpen is now:", isDetailModalOpen);
  }, [isDetailModalOpen]);
  
  // --- MEMOIZED VALUES (useMemo) --- 
  // Define filteredMedia and paginatedMedia AFTER state/callbacks they depend on, but BEFORE render logic that uses them
  const filteredMedia = useMemo(() => {
    return mediaItems.filter((media) => { 
      const nameMatch = media['File Name']?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      const descMatch = media.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      // Add actual filter logic based on `filters` state here later
      return nameMatch || descMatch;
    })
  }, [mediaItems, searchTerm/*, filters*/]);

  const paginatedMedia = useMemo(() => {
      const startIndex = 0; 
      const endIndex = page * ITEMS_PER_PAGE; 
      console.log(`Paginating: page=${page}, startIndex=${startIndex}, endIndex=${endIndex}, totalFiltered=${filteredMedia.length}`);
      return filteredMedia.slice(startIndex, endIndex); 
  }, [filteredMedia, page]);
  
  // Update hasMore based on pagination
  useEffect(() => {
      const moreExist = paginatedMedia.length < filteredMedia.length;
      console.log(`Setting hasMore: ${moreExist} (paginated: ${paginatedMedia.length}, filtered: ${filteredMedia.length})`);
      setHasMore(moreExist);
  }, [paginatedMedia.length, filteredMedia.length]);

  // --- OTHER CALLBACKS --- 
  const setLoadMoreRef = useCallback((node: HTMLDivElement | null) => {
    ref(node);
  }, [ref]);
  const selectAll = useCallback(() => { /* ... */ }, [mediaItems, selectedItems]);
  const toggleItemSelection = useCallback((id: string) => { /* ... */ }, [selectedItems]);
  const handleAddMedia = useCallback(async (data: Omit<Media, 'id' | 'createdTime'>) => { /* ... */ }, [onClose, toast]);
  const handleEditMedia = useCallback(async (data: Omit<Media, 'id' | 'createdTime'>) => { /* ... */ }, [editingMedia, onClose, toast]); 
  const handleDeleteMedia = useCallback(async (id: string) => { /* ... */ }, [toast]);
  const handleSort = useCallback((field: string) => { /* ... */ }, [sortField, sortDirection]);
  // Define handleKeyboardNavigation HERE
  const handleKeyboardNavigation = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (!gridRef.current) return;
    const cards = Array.from(gridRef.current.querySelectorAll('[data-index]'));
    const currentFocusedIndex = cards.findIndex(card => card === document.activeElement);
    if (currentFocusedIndex === -1) return;
    let nextIndex = currentFocusedIndex;
    const columnsPerRow = window.innerWidth >= 1280 ? 5 : window.innerWidth >= 992 ? 4 : window.innerWidth >= 768 ? 3 : window.innerWidth >= 480 ? 2 : 1;
    switch (e.key) {
      case 'ArrowRight':
        nextIndex = Math.min(currentFocusedIndex + 1, cards.length - 1);
        break
      case 'ArrowLeft':
        nextIndex = Math.max(currentFocusedIndex - 1, 0);
        break
      case 'ArrowDown':
        nextIndex = Math.min(currentFocusedIndex + columnsPerRow, cards.length - 1);
        break
      case 'ArrowUp':
        nextIndex = Math.max(currentFocusedIndex - columnsPerRow, 0);
        break
      case 'Home':
        nextIndex = 0;
        break;
      case 'End':
        nextIndex = cards.length - 1;
        break;
      default: return;
    }
    if (nextIndex !== currentFocusedIndex) {
      e.preventDefault();
      (cards[nextIndex] as HTMLElement).focus();
    }
  }, []); // No dependencies needed if it only reads refs/window
  const getSelectedItemsThemes = useCallback(() => { /* ... */ }, [mediaItems, selectedItems]);
  const getSelectedItemsTags = useCallback(() => { /* ... */ }, [mediaItems, selectedItems]);
  const handleBulkEdit = useCallback(async () => { /* ... */ }, [onBulkEditClose, selectedItems, mediaItems, bulkEditState, toast]);
  const resetBulkEditState = useCallback(() => { /* ... */ }, []);
  const handleBulkDelete = useCallback(async () => { /* ... */ }, [selectedItems, mediaItems, toast]);
  const openEditModal = useCallback((media: Media | null = null) => { /* ... */ }, [onOpen]); 
  const openDeleteDialog = useCallback((id: string) => { /* ... */ }, [onDeleteConfirmOpen]);
  const closeDeleteDialog = useCallback(() => { /* ... */ }, [onDeleteConfirmClose]);
  const confirmDelete = useCallback(() => { /* ... */ }, [deleteMediaId, handleDeleteMedia, closeDeleteDialog]);
  const handleMediaCardClick = useCallback((media: Media) => {
    console.log("handleMediaCardClick called in MediaPage! Setting selected media:", media);
    setSelectedMediaForModal(media);
    onDetailModalOpen();
  }, [onDetailModalOpen]);

  // --- RENDER LOGIC --- 
  const renderContent = () => {
    // Condition 1: Show initial loading spinner ONLY if loading is true AND mediaItems is still empty
    if (loading && mediaItems.length === 0) {
      return (
        <VStack spacing={8} py={20}>
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" aria-label="Loading media content" />
          <Text mt={2} color="gray.600" fontWeight="medium">Loading Media Library...</Text>
          <Box maxW="md" textAlign="center" opacity={0.7}>
            <Text fontSize="sm">We're preparing your media content. This should only take a moment.</Text>
          </Box>
        </VStack>
      );
    }
  
    // Condition 2: Show error if present (and we're not in the initial loading phase)
    if (error && !loading) { 
      return (
        <Alert status="error" aria-live="assertive" mt={4}>
          <AlertIcon />
          {error}
        </Alert>
      );
    }
    
    // Condition 3: Show the main content (Grid, Empty State, Load More) if loading is false OR if we already have items
    // This ensures we show the grid even if loading flickers back to true during refresh/sort
    if (!loading || mediaItems.length > 0) {
       return (
         <>
           <SkipNavContent />
           <Grid
             ref={gridRef}
             templateColumns={{
               base: '1fr',
               sm: 'repeat(2, 1fr)',
               md: 'repeat(3, 1fr)',
               lg: 'repeat(4, 1fr)',
               xl: 'repeat(5, 1fr)',
             }}
             gap={{ base: 4, md: 6 }}
             onKeyDown={handleKeyboardNavigation}
             role="grid"
             aria-label="Media items grid"
             tabIndex={-1}
             mt={4}
             position="relative"
           >
             {/* Map over PAGINATED media */} 
             {paginatedMedia.map((media, index) => (
               <MediaCard 
                 key={media.id} 
                 media={media} 
                 onEdit={openEditModal} 
                 onDelete={openDeleteDialog}
                 isSelected={selectedItems.has(media.id)}
                 onSelect={() => toggleItemSelection(media.id)}
                 index={index}
                 allThemes={themes} 
                 allStorytellers={storytellers}
                 allQuotes={quotes}
                 onCardClick={handleMediaCardClick} 
               />
             ))}
           </Grid>
 
           {/* Empty state if NO filtered items and NOT loading initial data */}
           {filteredMedia.length === 0 && !loading && (
             <Box textAlign="center" py={16} aria-live="polite">
               <Text>No media items match your current search/filters.</Text>
               {/* Consider adding Add Media button here too */} 
             </Box>
           )}
           
           {/* Show loading spinner when loading MORE pages (infinite scroll) */}
           {loading && page > 1 && (
             <Box textAlign="center" py={6}> <Spinner size="md"/> </Box>
           )}
 
           {/* Infinite Scroll Trigger */} 
           {hasMore && !loading && (
             <Box ref={setLoadMoreRef} h="20px" aria-hidden="true" />
           )}
         </>
       )
    }

    // Fallback if none of the above conditions are met (should ideally not happen)
    return <Text>Unexpected state.</Text>; 
  };

  // --- MAIN RETURN --- 
  return (
    <Container maxW="container.xl" py={8}>
      {/* ... Header, Filters, etc. ... */}
      {renderContent()} 
      {/* ... Modals ... */}

      {/* Render the MediaDetailModal Here */}
      <MediaDetailModal 
         isOpen={isDetailModalOpen}
         onClose={onDetailModalClose}
         // Temporarily pass null/empty arrays for data props
         media={selectedMediaForModal} // Keep selected media
         allStorytellers={[]} 
         allThemes={[]}
         allQuotes={[]} 
       />
    </Container>
  );
}

export default MediaPage 