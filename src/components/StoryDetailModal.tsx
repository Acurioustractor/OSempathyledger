import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  VStack,
  HStack,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  Avatar,
  Tag,
  Wrap,
  WrapItem,
  Divider,
  Box,
  Icon,
  AspectRatio,
  Grid,
  GridItem,
  Link,
  useBreakpointValue,
  Badge,
  Spinner,
  Center,
  LinkBox,
  LinkOverlay
} from '@chakra-ui/react';
import { FaMapMarkerAlt, FaCalendarAlt, FaTags, FaUser, FaVideo, FaImages, FaQuoteLeft, FaFileAlt, FaExternalLinkAlt } from 'react-icons/fa'; // Import relevant icons
import { EnhancedStory } from '../hooks/useStoriesData'; // Use the enhanced type
import { AirtableAttachment, Media as MediaType } from '../services/airtable'; // Import necessary types
import { format } from 'date-fns';

// Define the props for the modal
export interface StoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: EnhancedStory | null; // Expect EnhancedStory
}

// Helper to safely get the first thumbnail URL
const getThumbnailUrl = (attachments?: AirtableAttachment[]): string | undefined => {
  return attachments?.[0]?.thumbnails?.large?.url || attachments?.[0]?.url;
};

const StoryDetailModal: React.FC<StoryDetailModalProps> = ({
  isOpen,
  onClose,
  story,
}) => {
  const modalSize = useBreakpointValue({ base: 'full', md: '2xl', lg: '4xl' });

  if (!story) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size={modalSize}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Loading Story...</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Center h="200px">
              <Spinner size="xl" />
            </Center>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  const title = story.Title || 'Untitled Story';
  
  // Storyteller Info
  const storyteller = story.linkedStorytellers?.[0];
  const storytellerName = storyteller?.Name || 'Unknown Storyteller';
  const storytellerAvatarUrl = getThumbnailUrl(storyteller?.['File Profile Image']);

  // Location and Shift Info
  const location = story['Location (from Media)'] || 'N/A';
  const shiftId = story.Shifts?.[0];
  const shift = story.ShiftDetails;
  const shiftName = shift?.Name || shiftId || 'N/A';
  const state = shift?.State || 'N/A';

  // Date and Status
  const createdDate = story.Created;
  const formattedDate = createdDate ? format(new Date(createdDate), 'P') : 'N/A';
  const status = story.Status || 'Draft';
  const statusColorScheme = status.toLowerCase() === 'published' ? 'green' : 'orange';

  // Content Fields
  const storyCopy = story['Story copy'] || 'No story text available.';
  const transcript = story['Story Transcript'];
  const videoLinkUrl = story['Video Story Link'];
  const galleryLinks = story['Link (from Galleries) (from Media)'] || [];

  // Tab visibility
  const showTranscriptTab = !!transcript && transcript.trim() !== '';
  const showVideoTab = !!videoLinkUrl && videoLinkUrl.trim() !== '';
  const showGalleryTab = galleryLinks.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={modalSize} scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">{title}</Heading>
          <Badge colorScheme={statusColorScheme} mt={2}>
            {status}
          </Badge>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Tabs variant="soft-rounded" colorScheme="blue" isLazy>
            <TabList mb={5} flexWrap="wrap">
              <Tab>Overview</Tab>
              <Tab>Story Text</Tab>
              {showTranscriptTab && <Tab>Transcript</Tab>}
              {showVideoTab && <Tab>Video</Tab>}
              {showGalleryTab && <Tab>Gallery</Tab>}
            </TabList>
            <TabPanels>
              {/* Overview Tab */}
              <TabPanel px={0}>
                <Grid templateColumns={{ base: '1fr', md: 'auto 1fr' }} gap={{ base: 5, md: 8 }} alignItems="flex-start">
                  {/* Left Column: Avatar and Name */}
                  <GridItem>
                    <VStack spacing={2} align={{ base: 'center', md: 'flex-start' }} minW="100px">
                      <Avatar
                        size="xl"
                        name={storytellerName}
                        src={storytellerAvatarUrl}
                        mb={1}
                      />
                      <Text fontWeight="medium" textAlign={{ base: 'center', md: 'left' }}>
                        {storytellerName}
                      </Text>
                    </VStack>
                  </GridItem>

                  {/* Right Column: Location, Shift, State, Date */}
                  <GridItem pt={{ base: 0, md: 2 }}>
                    <VStack align="stretch" spacing={3}>
                      <HStack>
                        <Icon as={FaMapMarkerAlt} color="gray.500" boxSize={5} />
                        <Text><strong>Location:</strong> {location}</Text>
                      </HStack>
                      <HStack ml={7}>
                        <Text><strong>Shift:</strong> {shiftName}</Text>
                      </HStack>
                      <HStack ml={7}>
                        <Text><strong>State:</strong> {state}</Text>
                      </HStack>
                      <HStack>
                        <Icon as={FaCalendarAlt} color="gray.500" boxSize={5} />
                        <Text><strong>Date:</strong> {formattedDate}</Text>
                      </HStack>
                    </VStack>
                  </GridItem>
                </Grid>
              </TabPanel>

              {/* Story Text Tab */}
              <TabPanel px={0}>
                <VStack align="stretch" spacing={3}>
                  <HStack>
                    <Icon as={FaFileAlt} />
                    <Heading size="sm">Story</Heading>
                  </HStack>
                  <Text whiteSpace="pre-wrap" lineHeight="tall">{storyCopy}</Text>
                </VStack>
              </TabPanel>

              {/* Transcript Tab */}
              {showTranscriptTab && (
                <TabPanel px={0}>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Icon as={FaQuoteLeft} />
                      <Heading size="sm">Video Transcript</Heading>
                    </HStack>
                    <Box p={4} bg="gray.50" borderRadius="md" maxHeight="450px" overflowY="auto">
                      <Text whiteSpace="pre-wrap">{transcript}</Text>
                    </Box>
                  </VStack>
                </TabPanel>
              )}

              {/* Video Tab */}
              {showVideoTab && (
                <TabPanel px={0}>
                  <VStack align="stretch" spacing={3}>
                    <HStack>
                      <Icon as={FaVideo} />
                      <Heading size="sm">Video</Heading>
                    </HStack>
                    <Button
                      as={Link}
                      href={videoLinkUrl}
                      isExternal
                      colorScheme="blue"
                      leftIcon={<Icon as={FaExternalLinkAlt} />}
                      w="fit-content"
                    >
                      Watch Video
                    </Button>
                  </VStack>
                </TabPanel>
              )}

              {/* Gallery Tab */}
              {showGalleryTab && (
                <TabPanel px={0}>
                  <VStack align="stretch" spacing={4}>
                    <HStack>
                      <Icon as={FaImages} />
                      <Heading size="sm">Photo Gallery</Heading>
                    </HStack>
                    <Grid templateColumns="repeat(auto-fill, minmax(150px, 1fr))" gap={4}>
                      {galleryLinks.map((link, index) => (
                        <GridItem key={index}>
                          <Link href={link} isExternal>
                            <Image
                              src={link}
                              alt={`Gallery image ${index + 1}`}
                              borderRadius="md"
                              objectFit="cover"
                              w="full"
                              h="150px"
                            />
                          </Link>
                        </GridItem>
                      ))}
                    </Grid>
                  </VStack>
                </TabPanel>
              )}
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter borderTopWidth="1px" borderColor="gray.200" pt={4}>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default StoryDetailModal; 