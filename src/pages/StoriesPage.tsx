import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Button,
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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useBreakpointValue,
  Stack,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';
import {
  SearchIcon,
  CalendarIcon,
  PeopleIcon,
  LocationIcon,
  TagIcon,
  FilterIcon,
  RowsIcon,
  ProjectIcon,
  ChevronDownIcon,
} from '@primer/octicons-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchStories,
  fetchStorytellers,
  fetchThemes,
  fetchMedia
} from '../services/dataService';
import { Story, Storyteller, Theme, Media } from '../types';

type ViewMode = 'grid' | 'list';

const StoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [themeFilter, setThemeFilter] = useState('all');
  const [storytellerFilter, setStorytellerFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const columns = useBreakpointValue({ base: 1, md: 2, lg: viewMode === 'list' ? 1 : 3 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [storiesData, storytellersData, themesData, mediaData] = await Promise.all([
        fetchStories(),
        fetchStorytellers(),
        fetchThemes(),
        fetchMedia()
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

  // Get unique locations from stories
  const locations = useMemo(() => {
    const locationSet = new Set<string>();
    stories.forEach(story => {
      story['Location (from Media)']?.forEach(loc => locationSet.add(loc));
    });
    return Array.from(locationSet).sort();
  }, [stories]);

  // Filter and sort stories
  const filteredStories = useMemo(() => {
    let filtered = stories;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(story => 
        story.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story['Story copy']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        story['Story Transcript']?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Theme filter
    if (themeFilter !== 'all') {
      filtered = filtered.filter(story => 
        story.Themes?.includes(themeFilter)
      );
    }

    // Storyteller filter
    if (storytellerFilter !== 'all') {
      filtered = filtered.filter(story => 
        story.Storytellers?.includes(storytellerFilter)
      );
    }

    // Location filter
    if (locationFilter !== 'all') {
      filtered = filtered.filter(story => 
        story['Location (from Media)']?.includes(locationFilter)
      );
    }

    // Sort
    const sorted = [...filtered];
    switch (sortBy) {
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.Created).getTime() - new Date(a.Created).getTime());
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.Created).getTime() - new Date(b.Created).getTime());
        break;
      case 'title':
        sorted.sort((a, b) => a.Title.localeCompare(b.Title));
        break;
      default:
        break;
    }

    return sorted;
  }, [stories, searchTerm, themeFilter, storytellerFilter, locationFilter, sortBy]);

  // Helper functions
  const getStoryImage = (story: Story): string | undefined => {
    if (story['Story Image']?.[0]?.url) {
      return story['Story Image'][0].url;
    }
    if (story.Media?.length > 0) {
      const mediaItem = media.find(m => m.id === story.Media[0]);
      return mediaItem?.['File attachment']?.[0]?.url;
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

  const resetFilters = () => {
    setSearchTerm('');
    setThemeFilter('all');
    setStorytellerFilter('all');
    setLocationFilter('all');
    setSortBy('date-desc');
  };

  const activeFiltersCount = [
    searchTerm,
    themeFilter !== 'all',
    storytellerFilter !== 'all',
    locationFilter !== 'all'
  ].filter(Boolean).length;

  if (loading) {
    return (
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="40px" width="200px" />
          <HStack spacing={4}>
            <Skeleton height="40px" width="300px" />
            <Skeleton height="40px" width="150px" />
            <Skeleton height="40px" width="150px" />
          </HStack>
          <SimpleGrid columns={columns} spacing={6}>
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
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="xl" mb={2}>Stories</Heading>
            <Text color="gray.600">
              {filteredStories.length} of {stories.length} stories
            </Text>
          </Box>

          {/* Filters */}
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
            <InputGroup maxW={{ base: 'full', md: '400px' }}>
              <InputLeftElement>
                <Icon as={SearchIcon} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search stories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>

            <Select
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              maxW={{ base: 'full', md: '200px' }}
            >
              <option value="all">All Themes</option>
              {themes.map(theme => (
                <option key={theme.id} value={theme.id}>
                  {theme['Theme Name']} ({theme['Story Count'] || 0})
                </option>
              ))}
            </Select>

            <Select
              value={storytellerFilter}
              onChange={(e) => setStorytellerFilter(e.target.value)}
              maxW={{ base: 'full', md: '200px' }}
            >
              <option value="all">All Storytellers</option>
              {storytellers.map(teller => (
                <option key={teller.id} value={teller.id}>
                  {teller.Name}
                </option>
              ))}
            </Select>

            <Select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              maxW={{ base: 'full', md: '200px' }}
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </Select>

            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<ChevronDownIcon />}
                variant="outline"
              >
                Sort
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setSortBy('date-desc')}>
                  Newest First
                </MenuItem>
                <MenuItem onClick={() => setSortBy('date-asc')}>
                  Oldest First
                </MenuItem>
                <MenuItem onClick={() => setSortBy('title')}>
                  Title A-Z
                </MenuItem>
              </MenuList>
            </Menu>

            <HStack>
              <IconButton
                aria-label="Grid view"
                icon={<ProjectIcon />}
                variant={viewMode === 'grid' ? 'solid' : 'ghost'}
                onClick={() => setViewMode('grid')}
              />
              <IconButton
                aria-label="List view"
                icon={<RowsIcon />}
                variant={viewMode === 'list' ? 'solid' : 'ghost'}
                onClick={() => setViewMode('list')}
              />
            </HStack>
          </Stack>

          {activeFiltersCount > 0 && (
            <HStack>
              <Text fontSize="sm" color="gray.600">
                {activeFiltersCount} filter{activeFiltersCount > 1 ? 's' : ''} active
              </Text>
              <Button size="sm" variant="link" onClick={resetFilters}>
                Clear all
              </Button>
            </HStack>
          )}

          {/* Stories Grid/List */}
          {filteredStories.length === 0 ? (
            <Box 
              p={12} 
              textAlign="center" 
              bg={cardBg} 
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
            >
              <Text fontSize="lg" color="gray.500">
                No stories found matching your filters.
              </Text>
              <Button mt={4} onClick={resetFilters}>
                Clear Filters
              </Button>
            </Box>
          ) : viewMode === 'grid' ? (
            <SimpleGrid columns={columns} spacing={6}>
              {filteredStories.map((story) => {
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
                      borderColor: 'orange.500' 
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
                        
                        <Divider />
                        
                        <HStack spacing={4} fontSize="sm" color="gray.500" width="full">
                          {story.Storytellers?.length > 0 && (
                            <HStack spacing={1}>
                              <Icon as={PeopleIcon} />
                              <Text>{getStorytellerName(story.Storytellers[0])}</Text>
                            </HStack>
                          )}
                          <HStack spacing={1} ml="auto">
                            <Icon as={CalendarIcon} />
                            <Text>{new Date(story.Created).toLocaleDateString()}</Text>
                          </HStack>
                        </HStack>
                      </VStack>
                    </Box>
                  </Box>
                );
              })}
            </SimpleGrid>
          ) : (
            <VStack spacing={4} align="stretch">
              {filteredStories.map((story) => {
                const imageUrl = getStoryImage(story);
                return (
                  <Box
                    key={story.id}
                    p={6}
                    bg={cardBg}
                    borderRadius="lg"
                    borderWidth="1px"
                    borderColor={borderColor}
                    transition="all 0.3s"
                    _hover={{ borderColor: 'orange.500', shadow: 'md' }}
                    cursor="pointer"
                    onClick={() => navigate(`/story/${story.id}`)}
                  >
                    <Flex gap={6}>
                      {imageUrl && (
                        <Box flexShrink={0}>
                          <Image
                            src={imageUrl}
                            alt={story.Title}
                            width="200px"
                            height="150px"
                            objectFit="cover"
                            borderRadius="md"
                          />
                        </Box>
                      )}
                      <Box flex="1">
                        <VStack align="start" spacing={3}>
                          {story.Themes?.length > 0 && (
                            <Wrap spacing={2}>
                              {story.Themes.slice(0, 3).map(themeId => {
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
                          
                          <Heading size="lg">{story.Title}</Heading>
                          
                          <Text color="gray.600" noOfLines={2}>
                            {getStorySummary(story)}
                          </Text>
                          
                          <HStack spacing={6} fontSize="sm" color="gray.500">
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
                            <HStack spacing={1}>
                              <Icon as={CalendarIcon} />
                              <Text>{new Date(story.Created).toLocaleDateString()}</Text>
                            </HStack>
                          </HStack>
                        </VStack>
                      </Box>
                    </Flex>
                  </Box>
                );
              })}
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default StoriesPage;