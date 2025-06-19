import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  SimpleGrid,
  Icon,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Image,
  Link,
  AspectRatio,
  Wrap,
  WrapItem,
  Tag,
  HStack,
  Stack,
  Divider,
  Badge,
  useBreakpointValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import { 
  PeopleIcon, 
  LocationIcon, 
  BriefcaseIcon, 
  FileMediaIcon, 
  TagIcon, 
  PlayIcon, 
  QuoteIcon, 
  ChevronRightIcon,
  HeartIcon,
  CommentIcon,
  CalendarIcon
} from '@primer/octicons-react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  fetchStorytellers,
  fetchMedia,
  fetchStories,
  fetchThemes,
  fetchQuotes,
  fetchShifts
} from '../services/dataService';
import { Story, Storyteller, Theme, Media } from '../types';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [stats, setStats] = useState({
    stories: 0,
    storytellers: 0,
    themes: 0,
    media: 0,
    locations: 0
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const accentColor = useColorModeValue('orange.500', 'orange.300');
  const heroColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [storiesData, storytellersData, themesData, mediaData, shiftsData] = await Promise.all([
        fetchStories(),
        fetchStorytellers(),
        fetchThemes(),
        fetchMedia(),
        fetchShifts()
      ]);

      setStories(storiesData);
      setStorytellers(storytellersData);
      setThemes(themesData);
      setMedia(mediaData);

      // Calculate unique locations
      const uniqueLocations = new Set<string>();
      storiesData.forEach(story => {
        if (story['Location (from Media)']?.length > 0) {
          story['Location (from Media)'].forEach(loc => uniqueLocations.add(loc));
        }
      });

      setStats({
        stories: storiesData.length,
        storytellers: storytellersData.length,
        themes: themesData.length,
        media: mediaData.length,
        locations: uniqueLocations.size
      });

    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load stories. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Get featured stories (first 6 with images)
  const featuredStories = stories
    .filter(story => story['Story Image']?.length > 0 || story.Media?.length > 0)
    .slice(0, 6);

  // Get recent stories
  const recentStories = stories
    .sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime())
    .slice(0, 3);

  // Helper functions
  const getStoryImage = (story: Story): string | undefined => {
    if (story['Story Image']?.[0]?.url) {
      return story['Story Image'][0].url;
    }
    // Fallback to media images
    if (story.Media?.length > 0) {
      const mediaItem = media.find(m => m.id === story.Media[0]);
      if (mediaItem?.['File attachment']?.[0]?.url) {
        return mediaItem['File attachment'][0].url;
      }
    }
    return undefined;
  };

  const getStorySummary = (story: Story): string => {
    const content = story['Story copy'] || story['Story Transcript'] || '';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  const getStorytellerName = (storytellerId: string): string => {
    const teller = storytellers.find(s => s.id === storytellerId);
    return teller?.Name || 'Anonymous';
  };

  const getThemeName = (themeId: string): string => {
    const theme = themes.find(t => t.id === themeId);
    return theme?.['Theme Name'] || '';
  };

  if (loading) {
    return (
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8}>
          <Skeleton height="60px" width="300px" />
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={4} width="full">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} height="100px" />
            ))}
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} width="full">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Box key={i}>
                <Skeleton height="200px" mb={4} />
                <SkeletonText noOfLines={3} />
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Hero Section */}
      <Box 
        bg={useColorModeValue('orange.50', 'gray.800')} 
        py={{ base: 12, md: 20 }}
        borderBottom="1px"
        borderColor={borderColor}
      >
        <Container maxWidth="7xl">
          <VStack spacing={6} textAlign="center">
            <Heading size="2xl" fontWeight="bold">
              Orange Sky Empathy Ledger
            </Heading>
            <Text fontSize="xl" color="gray.600" maxW="3xl">
              Exploring stories of human connection, resilience, and community support. 
              Each story represents a journey of hope and the transformative power of compassion.
            </Text>
            <HStack spacing={4} pt={4}>
              <Button 
                size="lg" 
                colorScheme="orange" 
                onClick={() => navigate('/stories')}
                rightIcon={<ChevronRightIcon />}
              >
                Explore Stories
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => navigate('/capture')}
              >
                Share Your Story
              </Button>
            </HStack>
          </VStack>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="7xl" py={8}>
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
          <Stat
            p={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <StatLabel color="gray.500">Stories</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>{stats.stories}</StatNumber>
          </Stat>
          <Stat
            p={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <StatLabel color="gray.500">Storytellers</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>{stats.storytellers}</StatNumber>
          </Stat>
          <Stat
            p={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <StatLabel color="gray.500">Themes</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>{stats.themes}</StatNumber>
          </Stat>
          <Stat
            p={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <StatLabel color="gray.500">Media</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>{stats.media}</StatNumber>
          </Stat>
          <Stat
            p={4}
            bg={cardBg}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            textAlign="center"
          >
            <StatLabel color="gray.500">Locations</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>{stats.locations}</StatNumber>
          </Stat>
        </SimpleGrid>
      </Container>

      {/* Featured Stories */}
      <Container maxWidth="7xl" py={12}>
        <VStack spacing={8} align="start">
          <Box>
            <Heading size="lg" mb={2}>Featured Stories</Heading>
            <Text color="gray.600">Powerful narratives of connection and community</Text>
          </Box>
          
          <SimpleGrid columns={heroColumns} spacing={6} width="full">
            {featuredStories.map((story) => {
              const imageUrl = getStoryImage(story);
              return (
                <Box
                  key={story.id}
                  bg={cardBg}
                  borderRadius="lg"
                  overflow="hidden"
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{ 
                    transform: 'translateY(-4px)', 
                    shadow: 'lg',
                    borderColor: accentColor 
                  }}
                  cursor="pointer"
                  onClick={() => navigate(`/story/${story.id}`)}
                >
                  {imageUrl && (
                    <AspectRatio ratio={16/9}>
                      <Image 
                        src={imageUrl} 
                        alt={story.Title}
                        objectFit="cover"
                      />
                    </AspectRatio>
                  )}
                  
                  <Box p={6}>
                    <VStack align="start" spacing={3}>
                      {story.Themes?.length > 0 && (
                        <Wrap spacing={2}>
                          {story.Themes.slice(0, 2).map(themeId => {
                            const themeName = getThemeName(themeId);
                            if (!themeName) return null;
                            return (
                              <WrapItem key={themeId}>
                                <Tag size="sm" colorScheme="orange" variant="subtle">
                                  {themeName}
                                </Tag>
                              </WrapItem>
                            );
                          })}
                        </Wrap>
                      )}
                      
                      <Heading size="md" noOfLines={2}>
                        {story.Title}
                      </Heading>
                      
                      <Text color="gray.600" noOfLines={3}>
                        {getStorySummary(story)}
                      </Text>
                      
                      <HStack spacing={4} fontSize="sm" color="gray.500" pt={2}>
                        {story.Storytellers?.length > 0 && (
                          <HStack spacing={1}>
                            <Icon as={PeopleIcon} />
                            <Text>{getStorytellerName(story.Storytellers[0])}</Text>
                          </HStack>
                        )}
                        {story['Location (from Media)']?.[0] && (
                          <HStack spacing={1}>
                            <Icon as={LocationIcon} />
                            <Text>{story['Location (from Media)'][0]}</Text>
                          </HStack>
                        )}
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Recent Stories Section */}
      <Box bg={useColorModeValue('gray.100', 'gray.800')} py={12}>
        <Container maxWidth="7xl">
          <VStack spacing={8} align="start">
            <Box>
              <Heading size="lg" mb={2}>Recent Stories</Heading>
              <Text color="gray.600">Latest additions to our collection</Text>
            </Box>
            
            <Stack spacing={4} width="full">
              {recentStories.map((story) => (
                <Box
                  key={story.id}
                  p={6}
                  bg={cardBg}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{ borderColor: accentColor, shadow: 'md' }}
                  cursor="pointer"
                  onClick={() => navigate(`/story/${story.id}`)}
                >
                  <Flex justify="space-between" align="start">
                    <Box flex="1">
                      <Heading size="md" mb={2}>{story.Title}</Heading>
                      <Text color="gray.600" mb={3} noOfLines={2}>
                        {getStorySummary(story)}
                      </Text>
                      <HStack spacing={4} fontSize="sm" color="gray.500">
                        <HStack spacing={1}>
                          <Icon as={CalendarIcon} />
                          <Text>{new Date(story.Created).toLocaleDateString()}</Text>
                        </HStack>
                        {story.Storytellers?.length > 0 && (
                          <HStack spacing={1}>
                            <Icon as={PeopleIcon} />
                            <Text>{getStorytellerName(story.Storytellers[0])}</Text>
                          </HStack>
                        )}
                      </HStack>
                    </Box>
                    <Icon as={ChevronRightIcon} size={24} color="gray.400" ml={4} />
                  </Flex>
                </Box>
              ))}
            </Stack>
            
            <Button 
              variant="outline" 
              size="lg" 
              width="full"
              onClick={() => navigate('/stories')}
              rightIcon={<ChevronRightIcon />}
            >
              View All Stories
            </Button>
          </VStack>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box py={16}>
        <Container maxWidth="4xl">
          <Box
            bg={useColorModeValue('orange.500', 'orange.600')}
            color="white"
            p={12}
            borderRadius="xl"
            textAlign="center"
          >
            <VStack spacing={4}>
              <Icon as={HeartIcon} size={48} />
              <Heading size="lg">Every Story Matters</Heading>
              <Text fontSize="lg" maxW="2xl">
                Behind every statistic is a human being with a unique journey. 
                Share your story or explore the experiences of others in our community.
              </Text>
              <HStack spacing={4} pt={4}>
                <Button 
                  size="lg" 
                  bg="white" 
                  color="orange.500"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => navigate('/capture')}
                >
                  Share Your Story
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  color="white"
                  borderColor="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                  onClick={() => navigate('/storytellers')}
                >
                  Meet Our Storytellers
                </Button>
              </HStack>
            </VStack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;