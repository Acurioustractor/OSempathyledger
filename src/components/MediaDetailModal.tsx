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
import React, { useMemo } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Media, Storyteller, Theme, Quote, AirtableAttachment } from "../services/airtable"; 
import { FaVideo } from "react-icons/fa";
import { getImageUrl } from "../services/imageUtils";

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  media: Media | null;
  allStorytellers: Storyteller[]; 
  allThemes: Theme[]; 
  allQuotes: Quote[]; 
}

const MediaDetailModal = ({ 
  isOpen, 
  onClose, 
  media, 
  allStorytellers,
  allThemes,
  allQuotes 
}: MediaDetailModalProps) => {

  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Log when the component renders and what props it receives
  console.log("Rendering FULL MediaDetailModal...", { isOpen, mediaId: media?.id });

  if (!isOpen || !media) return null; // Don't render if not open or no media

  // --- Prepare LIMITED Data ---
  const displayUrl = media['Video draft link'] || getImageUrl(media.File);
  const isVideo = media.Type === 'Video';
  const isImage = media.Type === 'Image' || media.Type === 'Photo';

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(3px)" />
      <ModalContent mx={4} my={8}>
        <ModalHeader borderBottomWidth="1px" borderColor={borderColor}>
          {media['File Name'] || 'Media Details'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody py={6} px={{ base: 4, md: 6 }}>
          <VStack spacing={6} align="stretch">
            {/* Media Preview Area */}
            <Box>
              {isImage && displayUrl && (
                <Image 
                  src={displayUrl} 
                  alt={media['File Name']} 
                  maxH={{ base: "300px", md: "500px" }} 
                  objectFit="contain" 
                  mx="auto"
                  borderRadius="md"
                  boxShadow="sm"
                  fallback={<Spinner />}
                />
              )}
              {isVideo && displayUrl && (
                <AspectRatio ratio={16 / 9} maxW="100%">
                  <video src={displayUrl} controls style={{ borderRadius: '8px', background: '#000' }}>
                    Your browser does not support the video tag.
                  </video>
                </AspectRatio>
              )}
              {!displayUrl && (
                  <Text fontStyle="italic" color="gray.500" textAlign="center" p={4} bg={bgColor} borderRadius="md">
                    No media preview available.
                  </Text>
              )}
            </Box>

            <Divider />

            {/* Metadata Section */}
            <Box>
              <Heading size="sm" mb={3}>Details</Heading>
              <Wrap spacing={2} mb={4}>
                 {media.Type && <WrapItem><Badge colorScheme="purple">{media.Type}</Badge></WrapItem>}
                 {media['Created At'] && <WrapItem><Badge colorScheme="gray">{new Date(media['Created At']).toLocaleDateString()}</Badge></WrapItem>}
                 {media.Shift && <WrapItem><Badge colorScheme="orange">Shift: {media.Shift}</Badge></WrapItem>}
                 {media.Location && <WrapItem><Badge colorScheme="yellow">{media.Location}</Badge></WrapItem>}
                 {media.Project && <WrapItem><Badge colorScheme="cyan">{media.Project}</Badge></WrapItem>}
              </Wrap>
              {(media.description || media.Summary) && (
                  <Box mb={4}>
                      <Text fontSize="sm" fontWeight="medium" mb={1} color="gray.600">Description/Summary</Text>
                      <Text fontSize="sm" p={3} bg={bgColor} borderRadius="md" whiteSpace="pre-wrap">{media.description || media.Summary}</Text>
                  </Box>
              )}
              {media['Video draft link'] && (
                  <Link href={media['Video draft link']} isExternal color="blue.500" fontSize="sm">
                      View Source Link <ExternalLinkIcon mx="2px" />
                  </Link>
              )}
            </Box>

            {/* Temporarily Comment Out Linked Data Sections */}
            {/* 
            {linkedStorytellers.length > 0 && (
              <Box>
                <Heading size="sm" mb={3}>Linked Storytellers</Heading>
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

            {linkedThemes.length > 0 && (
              <Box>
                <Heading size="sm" mb={3}>Linked Themes</Heading>
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
            
            {linkedQuotes.length > 0 && (
              <Box>
                <Heading size="sm" mb={3}>Linked Quotes</Heading>
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

            {media.Transcript && (
              <Box>
                <Heading size="sm" mb={3}>Transcript</Heading>
                 <Box 
                  maxH="300px" 
                  overflowY="auto" 
                  p={3} 
                  bg={bgColor} 
                  borderRadius="md" 
                  borderWidth="1px" 
                  borderColor={borderColor}
                >
                  <Text fontSize="sm" whiteSpace="pre-wrap">
                    {media.Transcript}
                  </Text>
                </Box>
              </Box>
            )}
            */}

          </VStack>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor={borderColor}>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default MediaDetailModal; 