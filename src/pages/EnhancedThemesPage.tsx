import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  Wrap,
  WrapItem,
  Tag,
  useColorModeValue,
  Tooltip,
  Button,
  ButtonGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  List,
  ListItem,
  ListIcon,
  Divider,
  Badge,
} from '@chakra-ui/react';
import {
  GraphIcon,
  TagIcon,
  FileIcon,
  PersonIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';
import { useNavigate } from 'react-router-dom';
import { Theme, Story, Storyteller } from '../types';
import OptimizedThemeVisualization from '../components/OptimizedThemeVisualization';
import ThemeFrequencyChart from '../components/charts/ThemeFrequencyChart';
import AppleCard from '../components/AppleCard';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import QuickActions from '../components/navigation/QuickActions';
import { useEnhancedThemes, useEnhancedStories, useEnhancedStorytellers } from '../services/enhancedAirtableService';

const EnhancedThemesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [viewMode, setViewMode] = useState<'network' | 'cloud' | 'list'>('network');
  
  const { data: themes, loading: themesLoading, error: themesError } = useEnhancedThemes();
  const { data: stories, loading: storiesLoading } = useEnhancedStories();
  const { data: storytellers, loading: storytellersLoading } = useEnhancedStorytellers();
  
  const loading = themesLoading || storiesLoading || storytellersLoading;
  const error = themesError;
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Calculate theme statistics
  const themeStats = useMemo(() => {
    if (!themes || !stories) return null;
    
    const totalThemes = themes.length;
    const activeThemes = themes.filter(t => t['Story Count'] > 0).length;
    const totalConnections = stories.reduce((acc, story) => 
      acc + (story.Themes?.length || 0), 0
    );
    const avgStoriesPerTheme = totalConnections / totalThemes || 0;
    
    return {
      totalThemes,
      activeThemes,
      totalConnections,
      avgStoriesPerTheme: avgStoriesPerTheme.toFixed(1),
    };
  }, [themes, stories]);

  // Get related data for selected theme
  const getThemeDetails = (theme: Theme) => {
    if (!stories || !storytellers) return null;
    
    const relatedStories = stories.filter(story => 
      story.Themes?.includes(theme.id)
    );
    
    const relatedStorytellerIds = new Set<string>();
    relatedStories.forEach(story => {
      story.Storytellers?.forEach(id => relatedStorytellerIds.add(id));
    });
    
    const relatedStorytellers = storytellers.filter(teller =>
      relatedStorytellerIds.has(teller.id)
    );
    
    // Find co-occurring themes
    const coOccurringThemes = new Map<string, number>();
    relatedStories.forEach(story => {
      story.Themes?.forEach(themeId => {
        if (themeId !== theme.id) {
          coOccurringThemes.set(themeId, (coOccurringThemes.get(themeId) || 0) + 1);
        }
      });
    });
    
    const topCoOccurringThemes = Array.from(coOccurringThemes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([themeId, count]) => ({
        theme: themes.find(t => t.id === themeId),
        count,
      }))
      .filter(item => item.theme);
    
    return {
      stories: relatedStories,
      storytellers: relatedStorytellers,
      coOccurringThemes: topCoOccurringThemes,
    };
  };

  const handleThemeClick = (themeId: string) => {
    const theme = themes?.find(t => t.id === themeId);
    if (theme) {
      setSelectedTheme(theme);
      onOpen();
    }
  };

  const handleNavigateToTheme = (themeId: string) => {
    navigate(`/themes/${themeId}`);
  };

  // Tag cloud sizing
  const getTagSize = (count: number, maxCount: number) => {
    const minSize = 0.8;
    const maxSize = 2.5;
    const ratio = count / maxCount;
    return minSize + (maxSize - minSize) * ratio;
  };

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading themes...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load themes. Please try again later.
        </Alert>
      </Container>
    );
  }

  const maxThemeCount = Math.max(...(themes?.map(t => t['Story Count'] || 0) || [1]));

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Breadcrumbs />
          
          <Box>
            <Heading size="xl" mb={2}>Themes</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Explore the interconnected themes that emerge from our community stories
            </Text>
          </Box>

          {/* Statistics */}
          {themeStats && (
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <AppleCard variant="subtle">
                <Stat>
                  <StatLabel>Total Themes</StatLabel>
                  <StatNumber>{themeStats.totalThemes}</StatNumber>
                </Stat>
              </AppleCard>
              <AppleCard variant="subtle">
                <Stat>
                  <StatLabel>Active Themes</StatLabel>
                  <StatNumber>{themeStats.activeThemes}</StatNumber>
                  <StatHelpText>With stories</StatHelpText>
                </Stat>
              </AppleCard>
              <AppleCard variant="subtle">
                <Stat>
                  <StatLabel>Connections</StatLabel>
                  <StatNumber>{themeStats.totalConnections}</StatNumber>
                  <StatHelpText>Theme-story links</StatHelpText>
                </Stat>
              </AppleCard>
              <AppleCard variant="subtle">
                <Stat>
                  <StatLabel>Avg Stories/Theme</StatLabel>
                  <StatNumber>{themeStats.avgStoriesPerTheme}</StatNumber>
                </Stat>
              </AppleCard>
            </SimpleGrid>
          )}

          {/* View Mode Selector */}
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="medium">Visualization</Text>
            <ButtonGroup size="sm" isAttached variant="outline">
              <Button
                leftIcon={<GraphIcon />}
                onClick={() => setViewMode('network')}
                isActive={viewMode === 'network'}
              >
                Network
              </Button>
              <Button
                leftIcon={<TagIcon />}
                onClick={() => setViewMode('cloud')}
                isActive={viewMode === 'cloud'}
              >
                Tag Cloud
              </Button>
              <Button
                leftIcon={<FileIcon />}
                onClick={() => setViewMode('list')}
                isActive={viewMode === 'list'}
              >
                List
              </Button>
            </ButtonGroup>
          </HStack>

          {/* Visualizations */}
          <Tabs index={viewMode === 'network' ? 0 : viewMode === 'cloud' ? 1 : 2} variant="soft-rounded">
            <TabPanels>
              <TabPanel p={0}>
                <VStack spacing={6} align="stretch">
                  <OptimizedThemeVisualization
                    themes={themes || []}
                    stories={stories || []}
                    onThemeClick={handleThemeClick}
                    height={600}
                  />
                  <ThemeFrequencyChart
                    themes={themes || []}
                    limit={10}
                    height={400}
                    title="Most Common Themes"
                  />
                </VStack>
              </TabPanel>
              
              <TabPanel p={0}>
                <AppleCard variant="elevated" p={8}>
                  <Wrap spacing={4} justify="center">
                    {themes?.filter(theme => theme['Story Count'] > 0)
                      .map(theme => (
                        <WrapItem key={theme.id}>
                          <Tooltip 
                            label={`${theme['Story Count']} stories`} 
                            hasArrow
                          >
                            <Tag
                              size="lg"
                              colorScheme="orange"
                              variant="subtle"
                              cursor="pointer"
                              onClick={() => handleThemeClick(theme.id)}
                              fontSize={`${getTagSize(theme['Story Count'], maxThemeCount)}rem`}
                              px={4}
                              py={2}
                              _hover={{
                                transform: 'scale(1.05)',
                                bg: useColorModeValue('orange.100', 'orange.800'),
                              }}
                              transition="all 0.2s"
                            >
                              {theme['Theme Name']}
                            </Tag>
                          </Tooltip>
                        </WrapItem>
                      ))}
                  </Wrap>
                </AppleCard>
              </TabPanel>
              
              <TabPanel p={0}>
                <VStack spacing={4} align="stretch">
                  {themes?.filter(theme => theme['Story Count'] > 0)
                    .sort((a, b) => (b['Story Count'] || 0) - (a['Story Count'] || 0))
                    .map(theme => (
                      <AppleCard
                        key={theme.id}
                        variant="elevated"
                        p={4}
                        cursor="pointer"
                        onClick={() => handleThemeClick(theme.id)}
                        _hover={{
                          transform: 'translateX(4px)',
                          shadow: 'md',
                        }}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between" align="center">
                          <VStack align="start" spacing={1}>
                            <Heading size="sm">{theme['Theme Name']}</Heading>
                            <HStack spacing={4} fontSize="sm" color="gray.500">
                              <HStack spacing={1}>
                                <Icon as={FileIcon} />
                                <Text>{theme['Story Count']} stories</Text>
                              </HStack>
                              {theme['Quote Count'] > 0 && (
                                <HStack spacing={1}>
                                  <Text>•</Text>
                                  <Text>{theme['Quote Count']} quotes</Text>
                                </HStack>
                              )}
                            </HStack>
                          </VStack>
                          <ChevronRightIcon size={20} />
                        </HStack>
                      </AppleCard>
                    ))}
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>

      {/* Theme Details Drawer */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {selectedTheme?.['Theme Name']}
          </DrawerHeader>
          <DrawerBody>
            {selectedTheme && (() => {
              const details = getThemeDetails(selectedTheme);
              if (!details) return null;

              return (
                <VStack spacing={6} align="stretch" py={4}>
                  {/* Stats */}
                  <SimpleGrid columns={2} spacing={4}>
                    <AppleCard variant="subtle" p={3}>
                      <Stat size="sm">
                        <StatLabel>Stories</StatLabel>
                        <StatNumber>{details.stories.length}</StatNumber>
                      </Stat>
                    </AppleCard>
                    <AppleCard variant="subtle" p={3}>
                      <Stat size="sm">
                        <StatLabel>Storytellers</StatLabel>
                        <StatNumber>{details.storytellers.length}</StatNumber>
                      </Stat>
                    </AppleCard>
                  </SimpleGrid>

                  <Divider />

                  {/* Related Themes */}
                  {details.coOccurringThemes.length > 0 && (
                    <Box>
                      <Heading size="sm" mb={3}>Often Appears With</Heading>
                      <VStack align="stretch" spacing={2}>
                        {details.coOccurringThemes.map(({ theme, count }) => (
                          <HStack 
                            key={theme!.id} 
                            justify="space-between"
                            p={2}
                            borderRadius="md"
                            _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                            cursor="pointer"
                            onClick={() => {
                              setSelectedTheme(theme!);
                            }}
                          >
                            <Text fontSize="sm">{theme!['Theme Name']}</Text>
                            <Badge>{count} stories</Badge>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  )}

                  <Divider />

                  {/* Recent Stories */}
                  <Box>
                    <Heading size="sm" mb={3}>Recent Stories</Heading>
                    <VStack align="stretch" spacing={2}>
                      {details.stories.slice(0, 5).map(story => (
                        <Box
                          key={story.id}
                          p={2}
                          borderRadius="md"
                          _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                          cursor="pointer"
                          onClick={() => {
                            onClose();
                            navigate(`/story/${story.id}`);
                          }}
                        >
                          <Text fontSize="sm" fontWeight="medium">
                            {story.Title}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {new Date(story.Created).toLocaleDateString()}
                          </Text>
                        </Box>
                      ))}
                    </VStack>
                  </Box>

                  <Button
                    colorScheme="orange"
                    onClick={() => {
                      onClose();
                      handleNavigateToTheme(selectedTheme.id);
                    }}
                    rightIcon={<ChevronRightIcon />}
                  >
                    View Theme Details
                  </Button>
                </VStack>
              );
            })()}
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <QuickActions context="themes" />
    </Box>
  );
};

export default EnhancedThemesPage;