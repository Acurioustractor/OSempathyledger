import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Flex,
  Badge,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
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
  Switch,
  FormControl,
  FormLabel,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  PeopleIcon,
  LocationIcon,
  SearchIcon,
  ListUnorderedIcon,
  KebabHorizontalIcon,
  RocketIcon,
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
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import QuickActions from '../components/navigation/QuickActions';
import FilterSuggestions from '../components/filters/FilterSuggestions';
import { UniformVirtualScrollList } from '../components/VirtualScrollList';
import { performanceMonitor } from '../utils/performanceMonitor';

type ViewMode = 'grid' | 'list';

const OptimizedStoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [useVirtualScroll, setUseVirtualScroll] = useState(true);
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const columns = useBreakpointValue({ 
    base: 1, 
    md: viewMode === 'list' ? 1 : 2, 
    lg: viewMode === 'list' ? 1 : 3,
    xl: viewMode === 'list' ? 1 : 4,
  }) || 1;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        performanceMonitor.startMeasure('data-fetch');
        
        const [storiesData, storytellersData, themesData, mediaData] = await Promise.all([
          fetchStories(),
          fetchStorytellers(),
          fetchThemes(),
          fetchMedia(),
        ]);
        
        const fetchTime = performanceMonitor.endMeasure('data-fetch');
        console.log(`Data fetching completed in ${fetchTime.toFixed(2)}ms`);
        
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
    performanceMonitor.startMeasure('filter-stories');
    
    const filtered = stories.filter(story => 
      story.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story['Story copy']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story['Story Transcript']?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const filterTime = performanceMonitor.endMeasure('filter-stories');
    if (filtered.length !== stories.length) {
      console.log(`Filtering ${stories.length} stories took ${filterTime.toFixed(2)}ms`);
    }
    
    return filtered;
  }, [stories, searchTerm]);

  // Helper functions
  const getStoryImage = useCallback((story: Story): string | undefined => {
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
  }, [media]);

  const getStorySummary = useCallback((story: Story): string => {
    const content = story['Story copy'] || story['Story Transcript'] || '';
    return content.length > 200 ? content.substring(0, 200) + '...' : content;
  }, []);

  const getStorytellerName = useCallback((storytellerId: string): string => {
    const teller = storytellers.find(s => s.id === storytellerId);
    return teller?.Name || 'Anonymous';
  }, [storytellers]);

  const getThemeName = useCallback((themeId: string): string => {
    const theme = themes.find(t => t.id === themeId);
    return theme?.['Theme Name'] || '';
  }, [themes]);

  // Render story card for virtual scroll
  const renderStoryCard = useCallback((story: Story, index: number) => {
    return (
      <StoryCard 
        story={story}
        getStoryImage={getStoryImage}
        getStorySummary={getStorySummary}
        getStorytellerName={getStorytellerName}
        getThemeName={getThemeName}
      />
    );
  }, [getStoryImage, getStorySummary, getStorytellerName, getThemeName]);

  if (loading) {
    return (
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="40px" width="200px" />
          <Skeleton height="40px" width="300px" />
          <Stack spacing={6}>
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Box key={i}>
                <Skeleton height="200px" mb={4} />
                <SkeletonText noOfLines={4} />
              </Box>
            ))}
          </Stack>
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

  const itemHeight = viewMode === 'list' ? 120 : 380;
  const gap = 24;

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Breadcrumbs />
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
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            
            <HStack spacing={4}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="virtual-scroll" mb="0" fontSize="sm">
                  <HStack spacing={2}>
                    <Icon as={RocketIcon} />
                    <Text>Performance Mode</Text>
                  </HStack>
                </FormLabel>
                <Switch 
                  id="virtual-scroll" 
                  isChecked={useVirtualScroll}
                  onChange={(e) => setUseVirtualScroll(e.target.checked)}
                  colorScheme="orange"
                />
              </FormControl>
              
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
            </HStack>
          </Flex>
          
          <FilterSuggestions compact />
          
          {useVirtualScroll && filteredStories.length > 20 ? (
            <Box>
              <HStack mb={4} spacing={4}>
                <Badge colorScheme="green">Virtual Scrolling Active</Badge>
                <Text fontSize="sm" color="gray.500">
                  Rendering {filteredStories.length} stories efficiently
                </Text>
              </HStack>
              <UniformVirtualScrollList
                items={filteredStories}
                itemHeight={itemHeight}
                renderItem={renderStoryCard}
                columns={columns}
                gap={gap}
                height="calc(100vh - 400px)"
                overscan={2}
              />
            </Box>
          ) : (
            <Box
              display="grid"
              gridTemplateColumns={`repeat(${columns}, 1fr)`}
              gap={6}
            >
              {filteredStories.map((story, index) => renderStoryCard(story, index))}
            </Box>
          )}

          {filteredStories.length === 0 && !loading && (
            <Text textAlign="center" py={10}>No stories found.</Text>
          )}

        </VStack>
      </Container>
      <QuickActions context="global" />
    </Box>
  );
};

export default OptimizedStoriesPage;