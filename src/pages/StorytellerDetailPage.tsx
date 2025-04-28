import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Image,
  Spinner,
  Alert,
  AlertIcon,
  HStack,
  Badge,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  ButtonGroup,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Grid,
  IconButton,
  Tooltip,
  Card,
  CardBody,
  Stack,
  Divider,
  Avatar,
  Flex,
  CardFooter,
} from '@chakra-ui/react';
import { 
  ChevronLeftIcon, 
  EditIcon, 
  DeleteIcon, 
  ExternalLinkIcon, 
  ChatIcon
} from '@chakra-ui/icons';
import {
  Storyteller, 
  fetchStorytellers, 
  Media, 
  fetchMedia, 
  Quote, 
  fetchQuotes,
  Theme, 
  fetchThemes,
  Tag, 
  fetchTags,
  deleteStoryteller
} from '../services/airtable';
import StorytellersForm from '../components/StorytellersForm';
import { FaImage, FaVideo, FaCube } from 'react-icons/fa';
import { getProfileImageOrFallback } from '../services/imageUtils';
import MediaDetailModal from "../components/MediaDetailModal";

const StorytellerDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [storyteller, setStoryteller] = useState<Storyteller | null>(null);
  const [relatedMedia, setRelatedMedia] = useState<Media[]>([]);
  const [relatedQuotes, setRelatedQuotes] = useState<Quote[]>([]);
  const [relatedThemes, setRelatedThemes] = useState<Theme[]>([]);
  const [relatedTag, setRelatedTag] = useState<Tag | null>(null);
  const [allStorytellers, setAllStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);
  const [allQuotes, setAllQuotes] = useState<Quote[]>([]);
  const [selectedMediaForModal, setSelectedMediaForModal] = useState<Media | null>(null);
  
  // For edit modal
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
  
  // For delete confirmation modal
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  // For media detail modal
  const { 
    isOpen: isMediaModalOpen, 
    onOpen: onMediaModalOpen, 
    onClose: onMediaModalClose 
  } = useDisclosure();
  
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  useEffect(() => {
    if (!id) return;
    
    const loadStorytellerAndRelatedData = async () => {
      console.log(`--- Loading data for Storyteller ID: ${id} ---`); // Log Start
      setLoading(true);
      setError(null);
      setRelatedMedia([]);
      setRelatedQuotes([]);
      setRelatedThemes([]);
      setRelatedTag(null); 
      
      try {
        // --- Step 1: Fetch the Storyteller --- 
        console.log("Step 1: Fetching Storytellers...");
        const storytellersResult = await fetchStorytellers();
        const foundStoryteller = storytellersResult.find(s => s.id === id);
        
        if (!foundStoryteller) {
          throw new Error(`Storyteller with ID ${id} not found`);
        }
        console.log(`Step 1: Found Storyteller - ${foundStoryteller.Name}`, foundStoryteller);
        setStoryteller(foundStoryteller);
        setAllStorytellers(storytellersResult);

        // --- Step 2: Fetch Directly Linked Media --- 
        let storytellerMedia: Media[] = [];
        const mediaIdsToFetch = foundStoryteller.Media || [];
        console.log(`Step 2: Media IDs linked on Storyteller:`, mediaIdsToFetch);
        if (mediaIdsToFetch.length > 0) {
          console.log("Step 2: Fetching all Media records...");
          const allMedia = await fetchMedia(); 
          const mediaMap = new Map(allMedia.map(m => [m.id, m]));
          storytellerMedia = mediaIdsToFetch
            .map(mediaId => {
                const mediaItem = mediaMap.get(mediaId);
                if (!mediaItem) console.warn(`Media record not found for ID: ${mediaId}`);
                return mediaItem;
            })
            .filter((m): m is Media => m !== undefined);
          console.log(`Step 2: Filtered Storyteller Media Objects (${storytellerMedia.length}):`, JSON.stringify(storytellerMedia, null, 2));
          setRelatedMedia(storytellerMedia);
        } else {
          console.log("Step 2: No Media IDs found on storyteller record.");
        }

        // --- Step 3: Extract IDs and Data *from* the fetched Media --- 
        console.log("Step 3: Extracting Quote/Theme IDs from fetched Media...");
        const quoteIdsFromMedia = new Set<string>();
        const themeIdsFromMedia = new Set<string>();

        storytellerMedia.forEach(media => {
          console.log(`  Processing Media Item ID: ${media.id}, Name: ${media['File Name']}`);
          console.log(`    Media Quotes Field:`, media.Quotes);
          console.log(`    Media Themes Field:`, media.Themes);
          
          if (Array.isArray(media.Quotes)) {
             media.Quotes.forEach(id => quoteIdsFromMedia.add(id));
          } else if (media.Quotes) {
             console.warn(`    Media ${media.id} Quotes field is not an array:`, media.Quotes);
          }
          if (Array.isArray(media.Themes)) {
             media.Themes.forEach(id => themeIdsFromMedia.add(id));
          } else if (media.Themes) {
             console.warn(`    Media ${media.id} Themes field is not an array:`, media.Themes);
          }
        });

        console.log(`Step 3: Extracted Quote IDs:`, Array.from(quoteIdsFromMedia));
        console.log(`Step 3: Extracted Theme IDs:`, Array.from(themeIdsFromMedia));

        // --- Step 4: Fetch ALL Quotes and Themes once for lookups --- 
        console.log("Fetching all supporting Quotes and Themes...");
        const [allQuotesData, allThemesData, allTagsData] = await Promise.all([
          fetchQuotes(),
          fetchThemes(),
          fetchTags()
        ]);
        setAllQuotes(allQuotesData);

        // --- Filter Quotes/Themes based on EXTRACTED IDs using the FULL lists ---
        if (quoteIdsFromMedia.size > 0) {
          const quoteMap = new Map(allQuotesData.map(q => [q.id, q]));
          const filteredQuotes = Array.from(quoteIdsFromMedia)
            .map(quoteId => quoteMap.get(quoteId))
            .filter((q): q is Quote => q !== undefined);
          console.log(`Filtered Quotes based on Media links (${filteredQuotes.length}):`, JSON.stringify(filteredQuotes, null, 2));
          setRelatedQuotes(filteredQuotes);
        } else {
          console.log("  No Quote IDs extracted from Media, skipping Quote fetch.");
        }

        if (themeIdsFromMedia.size > 0) {
          const themeMap = new Map(allThemesData.map(t => [t.id, t]));
          const filteredThemes = Array.from(themeIdsFromMedia)
            .map(themeId => themeMap.get(themeId))
            .filter((t): t is Theme => t !== undefined);
          console.log(`Filtered Themes based on Media links (${filteredThemes.length}):`, JSON.stringify(filteredThemes, null, 2));
          setRelatedThemes(filteredThemes);
        } else {
           console.log("  No Theme IDs extracted from Media, skipping Theme fetch.");
        }

        // --- Step 5: Fetch Directly Linked Tag (if still applicable) --- 
        console.log("Step 5: Checking for directly linked Tag...");
        if (foundStoryteller.Tag) {
          const tagMap = new Map(allTagsData.map(t => [t.id, t]));
          const storytellerTag = tagMap.get(foundStoryteller.Tag);
          console.log("Filtered Storyteller Tag:", JSON.stringify(storytellerTag, null, 2)); 
          if (storytellerTag) {
            setRelatedTag(storytellerTag);
          }
        } else {
           console.log("  No Tag ID found on storyteller record.");
        }

        // --- Step 6: Log direct Summary/Transcript for reference --- 
        console.log("Step 6: Checking direct Summary/Transcript fields on Storyteller...");
        console.log("  Storyteller Summary (Direct Field):", foundStoryteller.Summary);
        console.log("  Storyteller Transcript (Direct Field):", foundStoryteller.Transcript);
        console.log(`--- Finished loading data for Storyteller ID: ${id} ---`);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load storyteller data';
        setError(errorMessage);
        console.error('Error loading storyteller data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadStorytellerAndRelatedData();
  }, [id]);
  
  // Handler for clicking media card within this page's tab
  const handleMediaCardClick = useCallback((media: Media) => {
    console.log("Storyteller Detail - Media Card Clicked!", media);
    setSelectedMediaForModal(media);
    onMediaModalOpen(); // Open the modal defined in this component
  }, [onMediaModalOpen]);
  
  // Handle form submission for editing
  const handleEditSubmit = (updatedStoryteller: Storyteller) => {
    setStoryteller(updatedStoryteller);
    onEditClose();
  };
  
  // Handle delete storyteller
  const handleDelete = async () => {
    if (!storyteller?.id) return;
    
    setDeleteInProgress(true);
    
    try {
      await deleteStoryteller(storyteller.id);
      navigate('/storytellers', { replace: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete storyteller';
      setError(errorMessage);
      console.error('Error deleting storyteller:', err);
      onDeleteClose();
    } finally {
      setDeleteInProgress(false);
    }
  };
  
  if (loading) {
    return (
      <Container maxW="container.lg" py={10} centerContent>
        <VStack spacing={5}>
          <Spinner size="xl" />
          <Text>Loading storyteller details...</Text>
        </VStack>
      </Container>
    );
  }
  
  if (error) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
        <Button 
          mt={4} 
          leftIcon={<ChevronLeftIcon />} 
          onClick={() => navigate('/storytellers')}
        >
          Back to Storytellers
        </Button>
      </Container>
    );
  }
  
  if (!storyteller) {
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="warning">
          <AlertIcon />
          Storyteller not found
        </Alert>
        <Button 
          mt={4} 
          leftIcon={<ChevronLeftIcon />} 
          onClick={() => navigate('/storytellers')}
        >
          Back to Storytellers
        </Button>
      </Container>
    );
  }
  
  // Get image URL - either from Airtable or generate a fallback
  const profileImageUrl = getProfileImageOrFallback(storyteller.Name, storyteller['File Profile Image']);
  
  return (
    <Container maxW="container.lg" py={8}>
      <Button 
        mb={6} 
        leftIcon={<ChevronLeftIcon />} 
        onClick={() => navigate('/storytellers')}
        size="sm"
        variant="outline"
      >
        Back to Storytellers
      </Button>
      
      <Box
        bg={bgColor}
        borderRadius="lg"
        boxShadow="md"
        overflow="hidden"
        borderWidth="1px"
        borderColor={borderColor}
      >
        <Flex direction={{ base: 'column', md: 'row' }}>
          {/* Image Column */}
          <Box 
            width={{ base: "100%", md: "250px" }} 
            minWidth={{ md: "250px" }}
            height={{ base: "250px", md: "auto" }}
            bg="gray.100"
          >
            <Image
              src={profileImageUrl}
              alt={storyteller.Name}
              width="100%"
              height="100%"
              objectFit="cover"
            />
          </Box>
          
          {/* Details Column */}
          <VStack align="stretch" spacing={4} p={6} flex="1">
            {/* Header Row */}
            <Flex justify="space-between" align="start">
              <Box flex="1" mr={4}>
                <Heading size="xl" mb={1}>{storyteller.Name}</Heading>
                {/* Badges for Role, Project, Location */}
                <HStack spacing={2} wrap="wrap" mt={1}>
                  {storyteller.Role && (
                    <Badge colorScheme="cyan" variant="subtle" size="sm">
                      {storyteller.Role}
                    </Badge>
                  )}
                  {storyteller.Project && (
                    <Badge colorScheme="green" variant="subtle" size="sm">
                      {storyteller.Project}
                    </Badge>
                  )}
                  {storyteller.Location && (
                    <Badge colorScheme="purple" variant="subtle" size="sm">
                      {storyteller.Location}
                    </Badge>
                  )}
                </HStack>
              </Box>
              {/* Action Buttons */}
              <ButtonGroup size="sm" variant="outline">
                <Tooltip label="Edit Storyteller">
                  <IconButton
                    icon={<EditIcon />}
                    aria-label="Edit storyteller"
                    onClick={onEditOpen}
                    colorScheme="blue"
                  />
                </Tooltip>
                <Tooltip label="Delete Storyteller">
                  <IconButton
                    icon={<DeleteIcon />}
                    aria-label="Delete storyteller"
                    onClick={onDeleteOpen}
                    colorScheme="red"
                  />
                </Tooltip>
              </ButtonGroup>
            </Flex>
            
            {/* Tabs Section */}
            <Tabs variant="soft-rounded" colorScheme="blue" size="sm" mt={4}>
              <TabList flexWrap="wrap">
                <Tab>Details</Tab>
                <Tab>Media ({relatedMedia.length})</Tab>
                <Tab>Quotes ({relatedQuotes.length})</Tab>
                <Tab>Themes ({relatedThemes.length})</Tab>
                {relatedTag && <Tab>Tag</Tab>}
              </TabList>
              
              <TabPanels mt={3}>
                {/* Details Tab Content - Show Summary/Transcript from Media */}
                <TabPanel px={0}>
                  <VStack spacing={6} align="stretch">
                    {relatedMedia.length > 0 ? (
                      relatedMedia.map((media, index) => (
                        <Box key={media.id} pb={4} borderBottomWidth={index < relatedMedia.length - 1 ? "1px" : "0px"} borderColor={borderColor}>
                          <Heading size="sm" mb={2} color="blue.600">
                            Media: {media['File Name'] || `Item ${index + 1}`}
                          </Heading>
                          {media.Summary && (
                             <Box mb={3}>
                               <Heading size="xs" mb={1} textTransform="uppercase" color="gray.500">Summary</Heading>
                               <Text fontSize="sm" whiteSpace="pre-wrap" bg="gray.50" p={2} borderRadius="md">
                                {media.Summary}
                               </Text>
                             </Box>
                          )}
                          {media.Transcript && (
                            <Box> 
                              <Heading size="xs" mb={1} textTransform="uppercase" color="gray.500">Full Transcript</Heading>
                              <Box 
                                maxH="400px" // Limit height and make scrollable
                                overflowY="auto"
                                p={2} 
                                bg="gray.50" 
                                borderRadius="md" 
                                borderWidth="1px" 
                                borderColor="gray.200"
                              >
                                <Text fontSize="sm" whiteSpace="pre-wrap">
                                  {media.Transcript}
                                </Text>
                              </Box>
                            </Box>
                          )}
                          {!media.Summary && !media.Transcript && (
                            <Text fontSize="sm" fontStyle="italic" color="gray.500">
                              No Summary or Transcript available for this media item.
                            </Text>
                          )}
                        </Box>
                      ))
                    ) : (
                      <Text fontStyle="italic" color="gray.500">
                        No media linked to this storyteller to display Summary or Transcript from.
                      </Text>
                    )}
                  </VStack>
                </TabPanel>

                {/* Media Tab Content - Apply Enhanced Card Layout */}
                <TabPanel px={0}>
                  {relatedMedia.length > 0 ? (
                    <Grid templateColumns={{ base: "repeat(1, 1fr)", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }} gap={4}>
                      {relatedMedia.map(media => {
                        // Find themes linked specifically to THIS media item
                        const mediaThemeNames = media.Themes?.map(themeId => 
                          relatedThemes.find(t => t.id === themeId)?.['Theme Name']
                        ).filter(Boolean) || [];
                        
                         // Find storytellers linked specifically to THIS media item
                         const mediaStorytellers = media.Storytellers?.map(stId => 
                           allStorytellers.find(s => s.id === stId)
                         ).filter((s): s is Storyteller => s !== undefined) || [];

                        // Icon logic 
                        const icon = media.Type === 'Photo' || media.Type === 'Image' ? <FaImage size={20} /> 
                                   : media.Type === 'Video' ? <FaVideo size={20} /> 
                                   : media.Type === 'Interview' ? <ChatIcon />
                                   : <FaCube size={20} />;
                        const iconColor = media.Type === 'Photo' || media.Type === 'Image' ? 'green.500' 
                                      : media.Type === 'Video' ? 'blue.500' 
                                      : media.Type === 'Interview' ? 'orange.500'
                                      : 'gray.500';
                        const linkUrl = media['Video draft link'];
                                      
                        return (
                          // Apply detailed Card structure here
                          <Card 
                            key={media.id} 
                            variant="outline" 
                            size="sm" 
                            overflow="hidden" 
                            height="100%" 
                            display="flex" 
                            flexDirection="column"
                            onClick={() => handleMediaCardClick(media)}
                            cursor="pointer"
                            _hover={{ shadow: 'md', borderColor: 'blue.300' }}
                          >
                            {/* Header Area with Icon */}
                            <Flex 
                              height="100px" 
                              alignItems="center" 
                              justifyContent="center" 
                              bg={useColorModeValue('gray.100', 'gray.700')}
                              borderBottomWidth="1px"
                              borderColor={borderColor}
                            >
                              <Box color={iconColor} opacity={0.7}>{icon}</Box>
                            </Flex>

                            {/* Body with Details */}
                            <CardBody display="flex" flexDirection="column" flexGrow={1} p={3}>
                              <Heading as="h4" size="xs" noOfLines={2} mb={1} flexGrow={1} title={media['File Name']}>
                                {media['File Name']}
                              </Heading>
                              
                              <HStack spacing={2} mt={1} mb={2} align="center" wrap="wrap">
                                {media.Type && 
                                  <Badge colorScheme="purple" variant="subtle" size="xs" px={1.5}>{media.Type}</Badge>}
                                {media['Created At'] && 
                                  <Tooltip label={`Created: ${new Date(media['Created At']).toLocaleString()}`} placement="top" fontSize="xs">
                                    <Text color="gray.500" fontSize="xs">
                                      {new Date(media['Created At']).toLocaleDateString()}
                                    </Text>
                                  </Tooltip>
                                }
                                 {media.Shift && (
                                   <Badge size="xs" colorScheme="orange" variant="subtle" px={1.5} title={`Shift: ${media.Shift}`}>
                                     {media.Shift}
                                   </Badge>
                                 )}
                                 {media.Location && (
                                   <Badge size="xs" colorScheme="yellow" variant="subtle" px={1.5} title={`Location: ${media.Location}`}>
                                     {media.Location}
                                   </Badge>
                                 )}
                                 {media.Project && (
                                   <Badge size="xs" colorScheme="cyan" variant="subtle" px={1.5} title={`Project: ${media.Project}`}>
                                     {media.Project}
                                   </Badge>
                                 )}
                              </HStack>
                              
                              {(media.description || media.Summary) && (
                                <Text noOfLines={2} fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')} mb={2} title={media.description || media.Summary}>
                                  {media.description || media.Summary}
                                </Text>
                              )}

                              {/* Storytellers for this specific media */}
                              {mediaStorytellers.length > 0 && (
                                <Box mb={2}>
                                  <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">Storytellers</Text>
                                  <HStack spacing={1} flexWrap="wrap">
                                    {mediaStorytellers.slice(0, 2).map((st) => (
                                      <Tooltip key={st.id} label={st.Name} fontSize="xs">
                                        <Badge 
                                          size="sm" 
                                          colorScheme="pink" 
                                          variant="subtle"
                                          px={2}
                                          py={0.5}
                                          borderRadius="md"
                                          isTruncated
                                          maxWidth="80px"
                                        >
                                          {st.Name}
                                        </Badge>
                                      </Tooltip>
                                    ))}
                                    {mediaStorytellers.length > 2 && (
                                      <Badge size="sm" colorScheme="pink" variant="outline">+{mediaStorytellers.length - 2}</Badge>
                                    )}
                                  </HStack>
                                </Box>
                              )}

                              {/* Themes for this specific media */}
                              {mediaThemeNames.length > 0 && (
                                <Box>
                                   <Text fontSize="xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">Themes</Text>
                                   <HStack spacing={1} flexWrap="wrap">
                                    {mediaThemeNames.slice(0, 3).map((name) => (
                                      <Tooltip key={name} label={name} fontSize="xs">
                                        <Badge 
                                          size="sm" 
                                          colorScheme="blue" 
                                          variant="subtle"
                                          px={2}
                                          py={0.5}
                                          borderRadius="md"
                                          isTruncated
                                          maxWidth="80px"
                                        >
                                          {name}
                                        </Badge>
                                      </Tooltip>
                                    ))}
                                    {mediaThemeNames.length > 3 && (
                                      <Badge size="sm" colorScheme="blue" variant="outline">+{mediaThemeNames.length - 3}</Badge>
                                    )}
                                  </HStack>
                                </Box>
                              )}
                            </CardBody>
                            
                            {/* Footer for Link */}
                            {linkUrl && (
                               <CardFooter pt={0} pb={3} px={3} mt="auto"> 
                                 <Button 
                                  as="a" 
                                  href={linkUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  size="xs" 
                                  rightIcon={<ExternalLinkIcon />}
                                  colorScheme="gray"
                                  variant="ghost"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  View Source
                                </Button>
                               </CardFooter>
                            )}
                          </Card>
                        );
                      })}
                    </Grid>
                  ) : (
                     <Box textAlign="center" py={10}>
                       <Text fontStyle="italic" color="gray.500">No media items linked to this storyteller.</Text>
                     </Box>
                  )}
                </TabPanel>
                
                {/* Quotes Tab Content */}
                <TabPanel px={0}>
                  {relatedQuotes.length > 0 ? (
                    <VStack align="stretch" spacing={4}>
                      {relatedQuotes.map((quote) => {
                        // Find the single related theme name (if any)
                        const relatedThemeName = quote.Theme 
                          ? relatedThemes.find(t => t.id === quote.Theme)?.['Theme Name'] 
                          : null;
                        
                        return (
                          <Card key={quote.id} variant="outline">
                            <CardBody>
                              <Text fontStyle="italic" mb={2}>"{quote['Quote Text']}"</Text>
                              {quote.attribution && <Text mt={2} fontSize="sm" color="gray.500">- {quote.attribution}</Text>}
                              {/* Display single theme if found */}
                              {relatedThemeName && (
                                <HStack mt={3} spacing={2} wrap="wrap">
                                  <Text fontSize="xs" fontWeight="medium">Theme:</Text>
                                  <Badge colorScheme="teal" size="sm">
                                    {relatedThemeName}
                                  </Badge>
                                </HStack>
                              )}
                            </CardBody>
                          </Card>
                        );
                      })}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text fontStyle="italic" color="gray.500">No quotes linked to this storyteller.</Text>
                    </Box>
                  )}
                </TabPanel>
                
                {/* Themes Tab */}
                <TabPanel px={0}>
                  {relatedThemes.length > 0 ? (
                    <VStack align="stretch" spacing={4}>
                      {relatedThemes.map((theme) => {
                         // Log the theme object being rendered
                         console.log(`Rendering Theme Card for: ${theme['Theme Name']}`, theme);
                         return (
                           <Card key={theme.id} variant="outline">
                            <CardBody>
                              <Heading size="sm" mb={2}>{theme['Theme Name']}</Heading>
                              {/* Explicitly check for non-empty description */}
                              {(theme.Description && theme.Description.trim() !== '') ? (
                                <Text fontSize="sm" color="gray.600">
                                  {theme.Description}
                                </Text>
                              ) : (
                                <Text fontSize="sm" fontStyle="italic" color="gray.400">
                                  No description available for this theme.
                                </Text>
                              )}
                            </CardBody>
                          </Card>
                         );
                      })}
                    </VStack>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text fontStyle="italic" color="gray.500">No themes linked to this storyteller.</Text>
                    </Box>
                  )}
                </TabPanel>
                
                {/* Tag Tab Content */}
                <TabPanel px={0}>
                  {relatedTag ? (
                    <Card variant="outline">
                      <CardBody>
                        <Heading size="sm" mb={1}>{relatedTag['Tag Name']}</Heading>
                         <Text fontSize="sm" color="gray.600">
                            {relatedTag.description || "No description"}
                         </Text>
                      </CardBody>
                    </Card>
                  ) : (
                    <Box textAlign="center" py={10}>
                      <Text fontStyle="italic" color="gray.500">No tag linked to this storyteller.</Text>
                    </Box>
                  )}
                </TabPanel>
              </TabPanels>
            </Tabs>
          </VStack>
        </Flex>
      </Box>
      
      {/* Edit Modal */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Storyteller</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <StorytellersForm 
              initialData={storyteller} 
              onSubmit={handleEditSubmit}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete {storyteller.Name}? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={handleDelete}
              isLoading={deleteInProgress}
              loadingText="Deleting..."
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      
      {/* Add Media Detail Modal */}
      <MediaDetailModal 
         isOpen={isMediaModalOpen}
         onClose={onMediaModalClose}
         media={selectedMediaForModal}
         allStorytellers={allStorytellers}
         allThemes={relatedThemes}
         allQuotes={allQuotes}
       />
    </Container>
  );
};

export default StorytellerDetailPage; 