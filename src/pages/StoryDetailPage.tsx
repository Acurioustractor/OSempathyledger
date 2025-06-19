import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Image,
  AspectRatio,
  Button,
  Divider,
  Tag,
  TagLabel,
  Wrap,
  WrapItem,
  Icon,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Grid,
  GridItem,
  Card,
  CardBody,
  Stack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Link,
  useToast,
  IconButton,
  useBreakpointValue,
  SimpleGrid,
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  LocationIcon,
  PeopleIcon,
  TagIcon,
  PlayIcon,
  QuoteIcon,
  LinkExternalIcon,
  HeartIcon,
  ShareIcon,
  DownloadIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';
import {
  fetchStories,
  fetchStorytellers,
  fetchThemes,
  fetchMedia,
  fetchQuotes,
} from '../services/dataService';
import { Story, Storyteller, Theme, Media, Quote } from '../types';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [relatedStories, setRelatedStories] = useState<Story[]>([]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = useColorModeValue('orange.500', 'orange.300');
  const isMobile = useBreakpointValue({ base: true, md: false });

  useEffect(() => {
    if (id) {
      loadStoryData();
    }
  }, [id]);

  const loadStoryData = async () => {
    try {
      setLoading(true);
      const [storiesData, storytellersData, themesData, mediaData, quotesData] = await Promise.all([
        fetchStories(),
        fetchStorytellers(),
        fetchThemes(),
        fetchMedia(),
        fetchQuotes()
      ]);

      const foundStory = storiesData.find(s => s.id === id);
      if (!foundStory) {
        throw new Error('Story not found');
      }

      setStory(foundStory);
      setStorytellers(storytellersData);
      setThemes(themesData);
      setMedia(mediaData);
      setQuotes(quotesData);

      // Find related stories (same themes or storyteller)
      const related = storiesData.filter(s => 
        s.id !== id && (
          (s.Themes && foundStory.Themes && s.Themes.some(t => foundStory.Themes?.includes(t))) ||
          (s.Storytellers && foundStory.Storytellers && s.Storytellers.some(st => foundStory.Storytellers?.includes(st)))
        )
      ).slice(0, 3);
      setRelatedStories(related);

    } catch (err) {
      console.error('Error loading story:', err);
      setError('Failed to load story. Please try again later.');
      toast({
        title: 'Error loading story',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getStoryImage = (): string | undefined => {
    if (!story) return undefined;
    if (story['Story Image']?.[0]?.url) {
      return story['Story Image'][0].url;
    }
    if (story.Media?.length > 0) {
      const mediaItem = media.find(m => m.id === story.Media[0]);
      return mediaItem?.['File attachment']?.[0]?.url;
    }
    return undefined;
  };

  const getStoryteller = (storytellerId: string): Storyteller | undefined => {
    return storytellers.find(s => s.id === storytellerId);
  };

  const getTheme = (themeId: string): Theme | undefined => {
    return themes.find(t => t.id === themeId);
  };

  const getStoryQuotes = (): Quote[] => {
    if (!story?.Quotes) return [];
    return quotes.filter(q => story.Quotes.includes(q.id));
  };

  const getStoryMedia = (): Media[] => {
    if (!story?.Media) return [];
    return media.filter(m => story.Media.includes(m.id));
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: story?.Title,
        text: story?.['Story copy']?.substring(0, 100) + '...',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link copied to clipboard',
        status: 'success',
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8}>
          <Spinner size="xl" color={accentColor} />
          <Text>Loading story...</Text>
        </VStack>
      </Container>
    );
  }

  if (error || !story) {
    return (
      <Container maxWidth="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error || 'Story not found'}
        </Alert>
        <Button mt={4} onClick={() => navigate('/stories')} leftIcon={<ArrowLeftIcon />}>
          Back to Stories
        </Button>
      </Container>
    );
  }

  const storyImage = getStoryImage();
  const storyQuotes = getStoryQuotes();
  const storyMedia = getStoryMedia();

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header with breadcrumb */}
      <Box bg={cardBg} borderBottom="1px" borderColor={borderColor}>
        <Container maxWidth="7xl" py={4}>
          <Breadcrumb spacing="8px" separator={<ChevronRightIcon />}>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/stories">Stories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <BreadcrumbLink>{story.Title}</BreadcrumbLink>
            </BreadcrumbItem>
          </Breadcrumb>
        </Container>
      </Box>

      {/* Hero section with image */}
      {storyImage && (
        <Box position="relative" h={{ base: "300px", md: "500px" }} overflow="hidden">
          <Image
            src={storyImage}
            alt={story.Title}
            w="full"
            h="full"
            objectFit="cover"
          />
          <Box
            position="absolute"
            bottom={0}
            left={0}
            right={0}
            bgGradient="linear(to-t, blackAlpha.800, transparent)"
            p={{ base: 6, md: 12 }}
          >
            <Container maxWidth="7xl">
              <VStack align="start" spacing={4}>
                <Heading size="2xl" color="white">
                  {story.Title}
                </Heading>
                <HStack spacing={4} color="whiteAlpha.900" flexWrap="wrap">
                  <HStack>
                    <Icon as={CalendarIcon} />
                    <Text>{formatDate(story.Created)}</Text>
                  </HStack>
                  {story['Location (from Media)']?.[0] && (
                    <HStack>
                      <Icon as={LocationIcon} />
                      <Text>{story['Location (from Media)'][0]}</Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
            </Container>
          </Box>
        </Box>
      )}

      <Container maxWidth="7xl" py={8}>
        <Grid templateColumns={{ base: "1fr", lg: "3fr 1fr" }} gap={8}>
          {/* Main content */}
          <GridItem>
            <VStack spacing={8} align="stretch">
              {/* Story header (if no hero image) */}
              {!storyImage && (
                <Box>
                  <Heading size="xl" mb={4}>{story.Title}</Heading>
                  <HStack spacing={4} color="gray.600" fontSize="sm">
                    <HStack>
                      <Icon as={CalendarIcon} />
                      <Text>{formatDate(story.Created)}</Text>
                    </HStack>
                    {story['Location (from Media)']?.[0] && (
                      <HStack>
                        <Icon as={LocationIcon} />
                        <Text>{story['Location (from Media)'][0]}</Text>
                      </HStack>
                    )}
                  </HStack>
                </Box>
              )}

              {/* Action buttons */}
              <HStack spacing={4}>
                <Button
                  leftIcon={<HeartIcon />}
                  colorScheme="orange"
                  variant="outline"
                  size="sm"
                >
                  Like
                </Button>
                <Button
                  leftIcon={<ShareIcon />}
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                >
                  Share
                </Button>
                {story['Video Story Link'] && (
                  <Button
                    as={Link}
                    href={story['Video Story Link']}
                    isExternal
                    leftIcon={<PlayIcon />}
                    variant="outline"
                    size="sm"
                  >
                    Watch Video
                  </Button>
                )}
              </HStack>

              {/* Tabs for content */}
              <Tabs colorScheme="orange">
                <TabList>
                  <Tab>Story</Tab>
                  {story['Story Transcript'] && <Tab>Transcript</Tab>}
                  {storyQuotes.length > 0 && <Tab>Quotes ({storyQuotes.length})</Tab>}
                  {storyMedia.length > 0 && <Tab>Media ({storyMedia.length})</Tab>}
                </TabList>

                <TabPanels>
                  {/* Story tab */}
                  <TabPanel px={0}>
                    <Box 
                      fontSize="lg" 
                      lineHeight="tall"
                      whiteSpace="pre-wrap"
                    >
                      {story['Story copy'] || 'No story content available.'}
                    </Box>
                  </TabPanel>

                  {/* Transcript tab */}
                  {story['Story Transcript'] && (
                    <TabPanel px={0}>
                      <Box 
                        fontSize="md" 
                        lineHeight="tall"
                        whiteSpace="pre-wrap"
                        fontFamily="mono"
                        bg={useColorModeValue('gray.50', 'gray.800')}
                        p={6}
                        borderRadius="md"
                      >
                        {story['Story Transcript']}
                      </Box>
                    </TabPanel>
                  )}

                  {/* Quotes tab */}
                  {storyQuotes.length > 0 && (
                    <TabPanel px={0}>
                      <VStack spacing={4} align="stretch">
                        {storyQuotes.map((quote) => (
                          <Card key={quote.id} variant="filled">
                            <CardBody>
                              <HStack align="start" spacing={3}>
                                <Icon as={QuoteIcon} size={24} color={accentColor} />
                                <Box flex="1">
                                  <Text fontSize="lg" fontStyle="italic" mb={2}>
                                    "{quote.Content}"
                                  </Text>
                                  {quote['Context or Attribution'] && (
                                    <Text fontSize="sm" color="gray.600">
                                      — {quote['Context or Attribution']}
                                    </Text>
                                  )}
                                </Box>
                              </HStack>
                            </CardBody>
                          </Card>
                        ))}
                      </VStack>
                    </TabPanel>
                  )}

                  {/* Media tab */}
                  {storyMedia.length > 0 && (
                    <TabPanel px={0}>
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {storyMedia.map((item) => (
                          <Card key={item.id}>
                            <CardBody>
                              {item['File attachment']?.[0] && (
                                <AspectRatio ratio={16/9} mb={4}>
                                  <Image
                                    src={item['File attachment'][0].url}
                                    alt={item.Description || 'Media'}
                                    objectFit="cover"
                                    borderRadius="md"
                                  />
                                </AspectRatio>
                              )}
                              {item.Description && (
                                <Text>{item.Description}</Text>
                              )}
                              {item['Media Type'] && (
                                <Badge mt={2}>{item['Media Type']}</Badge>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </SimpleGrid>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>

              {/* Video embed */}
              {story['Video Embed Code'] && (
                <Box>
                  <Heading size="md" mb={4}>Video</Heading>
                  <Box 
                    dangerouslySetInnerHTML={{ __html: story['Video Embed Code'] }}
                    sx={{
                      '& iframe': {
                        width: '100%',
                        height: 'auto',
                        aspectRatio: '16/9',
                        borderRadius: 'md',
                      }
                    }}
                  />
                </Box>
              )}
            </VStack>
          </GridItem>

          {/* Sidebar */}
          <GridItem>
            <VStack spacing={6} align="stretch">
              {/* Storytellers */}
              {story.Storytellers?.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      <HStack>
                        <Icon as={PeopleIcon} />
                        <Text>Storyteller{story.Storytellers.length > 1 ? 's' : ''}</Text>
                      </HStack>
                    </Heading>
                    <VStack spacing={3} align="stretch">
                      {story.Storytellers.map(storytellerId => {
                        const teller = getStoryteller(storytellerId);
                        if (!teller) return null;
                        return (
                          <HStack
                            key={teller.id}
                            p={3}
                            borderRadius="md"
                            _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                            cursor="pointer"
                            onClick={() => navigate(`/storyteller/${teller.id}`)}
                          >
                            <Avatar
                              size="md"
                              name={teller.Name}
                              src={teller['File Profile Image']?.[0]?.url}
                            />
                            <Box flex="1">
                              <Text fontWeight="medium">{teller.Name}</Text>
                              {teller.Gender && (
                                <Text fontSize="sm" color="gray.600">{teller.Gender}</Text>
                              )}
                            </Box>
                            <Icon as={ChevronRightIcon} />
                          </HStack>
                        );
                      })}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Themes */}
              {story.Themes?.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>
                      <HStack>
                        <Icon as={TagIcon} />
                        <Text>Themes</Text>
                      </HStack>
                    </Heading>
                    <Wrap spacing={2}>
                      {story.Themes.map(themeId => {
                        const theme = getTheme(themeId);
                        if (!theme) return null;
                        return (
                          <WrapItem key={theme.id}>
                            <Tag
                              size="md"
                              colorScheme="orange"
                              cursor="pointer"
                              onClick={() => navigate(`/themes?filter=${theme.id}`)}
                            >
                              <TagLabel>{theme['Theme Name']}</TagLabel>
                            </Tag>
                          </WrapItem>
                        );
                      })}
                    </Wrap>
                  </CardBody>
                </Card>
              )}

              {/* Demographics */}
              {(story.Gender || story['Age Range']) && (
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>Demographics</Heading>
                    <VStack spacing={2} align="start">
                      {story.Gender && (
                        <HStack>
                          <Text fontWeight="medium">Gender:</Text>
                          <Text>{story.Gender}</Text>
                        </HStack>
                      )}
                      {story['Age Range'] && (
                        <HStack>
                          <Text fontWeight="medium">Age Range:</Text>
                          <Text>{story['Age Range']}</Text>
                        </HStack>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              )}

              {/* Related Stories */}
              {relatedStories.length > 0 && (
                <Card>
                  <CardBody>
                    <Heading size="sm" mb={4}>Related Stories</Heading>
                    <VStack spacing={3} align="stretch">
                      {relatedStories.map((related) => (
                        <Box
                          key={related.id}
                          p={3}
                          borderRadius="md"
                          borderWidth="1px"
                          borderColor={borderColor}
                          _hover={{ borderColor: accentColor }}
                          cursor="pointer"
                          onClick={() => navigate(`/story/${related.id}`)}
                        >
                          <Text fontWeight="medium" noOfLines={2}>
                            {related.Title}
                          </Text>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            {formatDate(related.Created)}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </CardBody>
                </Card>
              )}
            </VStack>
          </GridItem>
        </Grid>
      </Container>
    </Box>
  );
};

export default StoryDetailPage;