import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  SimpleGrid,
  Flex,
  Badge,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Image,
  AspectRatio,
  Tag,
  Wrap,
  WrapItem,
  Icon,
  Divider,
  IconButton,
  useBreakpointValue,
  Stack,
  Skeleton,
  SkeletonText,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  PeopleIcon,
  LocationIcon,
  SearchIcon,
  ListUnorderedIcon,
  KebabHorizontalIcon,
} from '@primer/octicons-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchStories,
  fetchStorytellers,
  fetchThemes,
  fetchMedia,
} from '../services/airtable';
import { Story, Storyteller, Theme, Media } from '../types';
import StoryCard from '../components/StoryCard';
import ImageWithFallback from '../components/ImageWithFallback';

type ViewMode = 'grid' | 'list';

const StoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const columns = useBreakpointValue({ base: 1, md: 2, lg: viewMode === 'list' ? 1 : 3 });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [storiesData, storytellersData, themesData, mediaData] = await Promise.all([
          fetchStories(),
          fetchStorytellers(),
          fetchThemes(),
          fetchMedia(),
        ]);
        
        setStories(storiesData);
        setStorytellers(storytellersData);
        setThemes(themesData);
        setMedia(mediaData);
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load stories. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredStories = useMemo(() => {
    return stories.filter(story => 
      story.Title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [stories, searchTerm]);

  // Helper functions
  const getStoryImage = (story: Story): string | undefined => {
    if (story['Story Image']?.[0]?.url) {
      return story['Story Image'][0].url;
    }
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
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
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
        <VStack spacing={8} align="stretch">
          <Skeleton height="40px" width="200px" />
          <Skeleton height="40px" width="300px" />
          <SimpleGrid columns={columns} spacing={6}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Box key={i}>
                <Skeleton height="200px" mb={4} />
                <SkeletonText noOfLines={4} />
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
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading>Stories</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Browse through the collection of stories from our community.
            </Text>
          </Box>

          <Flex direction={{ base: 'column', md: 'row' }} justify="space-between" align="center" gap={4}>
            <InputGroup maxW={{ md: '400px' }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} color="gray.300" />
              </InputLeftElement>
              <Input 
                placeholder="Search stories by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <ButtonGroup isAttached variant="outline">
              <IconButton 
                aria-label="Grid view" 
                icon={<KebabHorizontalIcon />} 
                isActive={viewMode === 'grid'}
                onClick={() => setViewMode('grid')}
              />
              <IconButton 
                aria-label="List view" 
                icon={<ListUnorderedIcon />} 
                isActive={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              />
            </ButtonGroup>
          </Flex>
          
          <SimpleGrid columns={columns} spacing={6}>
            {filteredStories.map(story => (
              <StoryCard 
                key={story.id}
                story={story}
                getStoryImage={getStoryImage}
                getStorySummary={getStorySummary}
                getStorytellerName={getStorytellerName}
                getThemeName={getThemeName}
              />
            ))}
          </SimpleGrid>

          {filteredStories.length === 0 && !loading && (
            <Text textAlign="center" py={10}>No stories found.</Text>
          )}

        </VStack>
      </Container>
    </Box>
  );
};

export default StoriesPage;