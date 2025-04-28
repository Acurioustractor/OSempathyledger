import {
  Modal, 
  ModalOverlay, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalCloseButton, 
  ModalFooter, 
  Button, 
  VStack, 
  HStack,
  Heading, 
  Text, 
  Badge, 
  Image, 
  Box, 
  Divider, 
  Link,
  useColorModeValue,
  AspectRatio,
  Tag as ChakraTag,
  Wrap, 
  WrapItem,
  Spinner,
  Flex
} from "@chakra-ui/react";
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Story, Media, Storyteller, Theme, Quote } from "../services/airtable";
import { getProfileImageOrFallback } from '../services/imageUtils'; 
import { FaVideo } from 'react-icons/fa';

interface StoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: Story | null;
  allMedia: Media[];
  allStorytellers: Storyteller[];
  allThemes: Theme[];
  allQuotes: Quote[];
}

const StoryDetailModal = ({ 
  isOpen, 
  onClose, 
  story, 
  allMedia,
  allStorytellers,
  allThemes,
  allQuotes 
}: StoryDetailModalProps) => {

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (!story) return null;

  // --- Prepare Linked Data ---
  const linkedStorytellers = story.Storytellers?.map(id => 
    allStorytellers.find(s => s.id === id)
  ).filter((s): s is Storyteller => s !== undefined) || [];
  
  const linkedMedia = story.Media?.map(id => 
    allMedia.find(m => m.id === id)
  ).filter((m): m is Media => m !== undefined) || [];
  
  // Derive themes and quotes from the linked media
  const themeIdsFromMedia = new Set<string>();
  const quoteIdsFromMedia = new Set<string>();
  let aggregatedSummary = "";
  let aggregatedTranscript = "";
  linkedMedia.forEach(media => {
    media.Themes?.forEach(id => themeIdsFromMedia.add(id));
    media.Quotes?.forEach(id => quoteIdsFromMedia.add(id));
    if(media.Summary) aggregatedSummary += media.Summary + "\n\n";
    if(media.Transcript) aggregatedTranscript += media.Transcript + "\n\n";
  });
  const linkedThemes = Array.from(themeIdsFromMedia).map(id => allThemes.find(t => t.id === id)).filter((t): t is Theme => t !== undefined);
  const linkedQuotes = Array.from(quoteIdsFromMedia).map(id => allQuotes.find(q => q.id === id)).filter((q): q is Quote => q !== undefined);

  const storyImageUrl = getProfileImageOrFallback(
    story.Title, 
    story['Story Image'] || linkedStorytellers[0]?.['File Profile Image']
  );
  const videoUrl = story['Video Story Link'];
  console.log("Video Story Link URL:", videoUrl);
  const isVideo = !!videoUrl;
  const isImage = !isVideo && story['Story Image']?.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(5px)" />
      <ModalContent mx={4} my={8}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          {story.Title}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6} px={{ base: 4, md: 6 }}>
          <Flex direction={{base: 'column', md: 'row'}} gap={6}>
             {/* Left Column: Image/Video */}
             <Box flex={{md: 1}} minW={{md: "300px"}} maxW={{md: "400px"}}>
                {/* Media Preview Area - Prioritize Story Image */}
                <Box mb={4}>
                  {storyImageUrl && story['Story Image'] ? (
                    <Image 
                      src={storyImageUrl} 
                      alt={`Image for ${story.Title}`} 
                      borderRadius="md" 
                      boxShadow="sm"
                      objectFit="contain"
                      maxH="400px"
                      fallback={<Spinner />}
                    />
                  ) : videoUrl ? (
                    // If no Story Image but video link exists, show placeholder/icon
                    <AspectRatio ratio={16/9} bg="black" borderRadius="md">
                      <Flex direction="column" align="center" justify="center" color="white">
                         <FaVideo size="40px" />
                         <Text mt={2} fontSize="sm">Video Link Available</Text>
                      </Flex>
                    </AspectRatio>
                  ) : (
                     // Fallback if no image or video link
                     <Box p={4} bg={bgColor} borderRadius="md" textAlign="center">
                       <Text fontStyle="italic" color="gray.500">No Story Image or Video Link.</Text>
                     </Box>
                  )}
                  {/* Always show the Video Story Link if it exists */}
                  {videoUrl && (
                      <Link href={videoUrl} isExternal color="blue.500" fontSize="sm" display="block" mt={3} textAlign="center">
                          Open Video Link <ExternalLinkIcon mx="1px" />
                      </Link>
                  )}
                </Box>
                
                {/* Storytellers */} 
                {linkedStorytellers.length > 0 && (
                  <Box mb={4}>
                    <Heading size="xs" textTransform="uppercase" color="gray.500" mb={2}>Storytellers</Heading>
                    <Wrap spacing={2}>
                      {linkedStorytellers.map(st => (
                        <WrapItem key={st.id}>
                          <ChakraTag size="md" colorScheme="pink" borderRadius="full">
                            {st.Name}
                          </ChakraTag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}
                
                {/* Metadata */} 
                 <VStack align="start" spacing={1} fontSize="sm">
                    {story.Status && <HStack><Text fontWeight="bold">Status:</Text><Badge colorScheme={story.Status === 'Published' ? 'green' : 'gray'}>{story.Status}</Badge></HStack>}
                    {story.Permissions && <HStack><Text fontWeight="bold">Permissions:</Text><Text>{story.Permissions}</Text></HStack>}
                    {story.Created && <HStack><Text fontWeight="bold">Created:</Text><Text>{new Date(story.Created).toLocaleDateString()}</Text></HStack>}
                    {story.Watermark && <HStack><Text fontWeight="bold">Watermark:</Text><Text>{story.Watermark}</Text></HStack>}
                 </VStack>
             </Box>
             
             {/* Right Column: Content */}
             <VStack flex={{md: 2}} spacing={6} align="stretch">
                {/* Story Transcript (from Story Record) - Moved to Top */}
                {story['Story Transcript'] && (
                  <Box>
                    <Heading size="xs" textTransform="uppercase" color="gray.500" mb={2}>Story Transcript</Heading>
                     <Box 
                      maxH="250px" // Make scrollable
                      overflowY="auto" 
                      p={3} 
                      bg={bgColor} 
                      borderRadius="md" 
                      borderWidth="1px" 
                      borderColor={borderColor}
                    >
                      <Text fontSize="sm" whiteSpace="pre-wrap">
                        {story['Story Transcript']}
                      </Text>
                    </Box>
                  </Box>
                )}
                
                {/* Story Copy (Summary from Media) */}
                {aggregatedSummary && (
                  <Box>
                    <Heading size="xs" textTransform="uppercase" color="gray.500" mb={2}>Story Copy (Summary from Media)</Heading>
                    <Text fontSize="sm" p={3} bg={bgColor} borderRadius="md" whiteSpace="pre-wrap">{aggregatedSummary.trim()}</Text>
                  </Box>
                )}

                {/* Transcript Section (from Media) - Can be removed or kept as secondary */}
                {/* {aggregatedTranscript && (
                  <Box>
                    <Heading size="xs" textTransform="uppercase" color="gray.500" mb={2}>Transcript (from Media)</Heading>
                    <Box maxH="300px" overflowY="auto" p={3} bg={bgColor} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                      <Text fontSize="sm" whiteSpace="pre-wrap">{aggregatedTranscript.trim()}</Text>
                    </Box>
                  </Box>
                )} */}

                {/* Themes */}
                {linkedThemes.length > 0 && (
                  <Box>
                    <Heading size="xs" textTransform="uppercase" color="gray.500" mb={2}>Themes</Heading>
                    <Wrap spacing={2}>
                      {linkedThemes.map(th => (
                        <WrapItem key={th.id}>
                          <ChakraTag size="md" colorScheme="blue" borderRadius="full">
                            {th['Theme Name']}
                          </ChakraTag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </Box>
                )}

                {/* Quotes */} 
                 {linkedQuotes.length > 0 && (
                  <Box>
                    <Heading size="xs" textTransform="uppercase" color="gray.500" mb={2}>Quotes</Heading>
                     <VStack align="stretch" spacing={3}>
                       {linkedQuotes.map(q => (
                          <Box key={q.id} p={3} bg={bgColor} borderRadius="md" fontSize="sm" borderWidth="1px" borderColor={borderColor}>
                            <Text fontStyle="italic">"{q['Quote Text']}"</Text>
                            {q.attribution && <Text fontSize="xs" color="gray.500" mt={1}>- {q.attribution}</Text>}
                          </Box>
                      ))}
                    </VStack>
                  </Box>
                )}

             </VStack>
             
          </Flex>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StoryDetailModal; 