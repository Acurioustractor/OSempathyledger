import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Select,
  FormControl,
  FormLabel,
  Divider,
  Progress,
  Badge,
  Alert,
  AlertIcon,
  Skeleton,
  IconButton,
  Tooltip,
  Flex,
} from '@chakra-ui/react';
import {
  GraphIcon,
  CalendarIcon,
  PersonIcon,
  TagIcon,
  FileIcon,
  TrendingUpIcon,
  DownloadIcon,
  RefreshIcon,
} from '@primer/octicons-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import AppleCard from '../components/AppleCard';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import QuickActions from '../components/navigation/QuickActions';
import { useAllData } from '../services/enhancedAirtableService';
import { Story, Storyteller, Theme, Media } from '../types';

const MotionBox = motion(Box);

interface AnalyticsMetrics {
  totalStories: number;
  totalStorytellers: number;
  totalThemes: number;
  totalMedia: number;
  avgStoriesPerTeller: number;
  avgThemesPerStory: number;
  avgMediaPerStory: number;
  growthRate: number;
}

interface TimeSeriesData {
  date: string;
  stories: number;
  media: number;
  engagement: number;
}

const AnalyticsDashboard: React.FC = () => {
  const { data, loading, error } = useAllData();
  const [timeRange, setTimeRange] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState<'stories' | 'engagement' | 'themes'>('stories');
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Calculate analytics metrics
  const metrics: AnalyticsMetrics | null = useMemo(() => {
    if (!data) return null;
    
    const { stories, storytellers, themes, media } = data;
    
    const totalStories = stories.length;
    const totalStorytellers = storytellers.length;
    const totalThemes = themes.length;
    const totalMedia = media.length;
    
    const avgStoriesPerTeller = totalStorytellers > 0 
      ? stories.reduce((acc, story) => acc + (story.Storytellers?.length || 0), 0) / totalStorytellers
      : 0;
    
    const avgThemesPerStory = totalStories > 0
      ? stories.reduce((acc, story) => acc + (story.Themes?.length || 0), 0) / totalStories
      : 0;
    
    const avgMediaPerStory = totalStories > 0
      ? stories.reduce((acc, story) => acc + (story.Media?.length || 0), 0) / totalStories
      : 0;
    
    // Calculate growth rate (mock data for demo)
    const recentStories = stories.filter(story => {
      const storyDate = new Date(story.Created);
      const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
      return storyDate > cutoffDate;
    });
    
    const growthRate = totalStories > 0 ? (recentStories.length / totalStories) * 100 : 0;
    
    return {
      totalStories,
      totalStorytellers,
      totalThemes,
      totalMedia,
      avgStoriesPerTeller,
      avgThemesPerStory,
      avgMediaPerStory,
      growthRate,
    };
  }, [data, timeRange]);

  // Generate time series data
  const timeSeriesData: TimeSeriesData[] = useMemo(() => {
    if (!data) return [];
    
    const { stories } = data;
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const dataPoints: TimeSeriesData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const storiesOnDate = stories.filter(story => {
        const storyDate = new Date(story.Created).toISOString().split('T')[0];
        return storyDate === dateStr;
      });
      
      dataPoints.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        stories: storiesOnDate.length,
        media: Math.floor(Math.random() * 10) + storiesOnDate.length * 2, // Mock data
        engagement: Math.floor(Math.random() * 100) + 50, // Mock data
      });
    }
    
    // Cumulative values
    let cumulativeStories = 0;
    let cumulativeMedia = 0;
    dataPoints.forEach(point => {
      cumulativeStories += point.stories;
      cumulativeMedia += point.media;
      point.stories = cumulativeStories;
      point.media = cumulativeMedia;
    });
    
    return dataPoints;
  }, [data, timeRange]);

  // Theme distribution data
  const themeDistribution = useMemo(() => {
    if (!data) return [];
    
    const { themes } = data;
    return themes
      .filter(theme => theme['Story Count'] > 0)
      .sort((a, b) => (b['Story Count'] || 0) - (a['Story Count'] || 0))
      .slice(0, 8)
      .map(theme => ({
        name: theme['Theme Name'],
        value: theme['Story Count'] || 0,
        quotes: theme['Quote Count'] || 0,
      }));
  }, [data]);

  // Location distribution
  const locationDistribution = useMemo(() => {
    if (!data) return [];
    
    const { stories } = data;
    const locationCounts = new Map<string, number>();
    
    stories.forEach(story => {
      const locations = story['Location (from Media)'] || [];
      locations.forEach(location => {
        locationCounts.set(location, (locationCounts.get(location) || 0) + 1);
      });
    });
    
    return Array.from(locationCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }, [data]);

  // Storyteller activity
  const storytellerActivity = useMemo(() => {
    if (!data) return [];
    
    const { storytellers, stories } = data;
    
    return storytellers
      .map(teller => {
        const tellerStories = stories.filter(story => 
          story.Storytellers?.includes(teller.id)
        );
        return {
          name: teller.Name,
          stories: tellerStories.length,
          recent: tellerStories.filter(story => {
            const storyDate = new Date(story.Created);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return storyDate > thirtyDaysAgo;
          }).length,
        };
      })
      .filter(teller => teller.stories > 0)
      .sort((a, b) => b.stories - a.stories)
      .slice(0, 10);
  }, [data]);

  const COLORS = ['#FF6B35', '#FFA500', '#FFD700', '#FF8C00', '#FF7F50', '#FF6347', '#FF4500', '#FF69B4'];

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Exporting analytics data...');
  };

  const handleRefresh = () => {
    // TODO: Implement data refresh
    window.location.reload();
  };

  if (loading) {
    return (
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Skeleton height="40px" width="300px" />
          <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} height="120px" />
            ))}
          </SimpleGrid>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} height="300px" />
            ))}
          </SimpleGrid>
        </VStack>
      </Container>
    );
  }

  if (error || !metrics) {
    return (
      <Container maxW="7xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          Failed to load analytics data. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Breadcrumbs />
          
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="xl" mb={2}>Analytics Dashboard</Heading>
              <Text color={useColorModeValue('gray.600', 'gray.400')}>
                Comprehensive insights into your content and engagement
              </Text>
            </Box>
            
            <HStack spacing={2}>
              <FormControl maxW="150px">
                <Select 
                  size="sm" 
                  value={timeRange} 
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </Select>
              </FormControl>
              
              <Tooltip label="Export Data">
                <IconButton
                  aria-label="Export"
                  icon={<DownloadIcon />}
                  size="sm"
                  variant="outline"
                  onClick={handleExport}
                />
              </Tooltip>
              
              <Tooltip label="Refresh">
                <IconButton
                  aria-label="Refresh"
                  icon={<RefreshIcon />}
                  size="sm"
                  variant="outline"
                  onClick={handleRefresh}
                />
              </Tooltip>
            </HStack>
          </Flex>

          {/* Key Metrics */}
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
            <AppleCard variant="elevated">
              <Stat>
                <StatLabel>Total Stories</StatLabel>
                <StatNumber>{metrics.totalStories}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                  {metrics.growthRate.toFixed(1)}% this period
                </StatHelpText>
              </Stat>
            </AppleCard>
            
            <AppleCard variant="elevated">
              <Stat>
                <StatLabel>Storytellers</StatLabel>
                <StatNumber>{metrics.totalStorytellers}</StatNumber>
                <StatHelpText>
                  {metrics.avgStoriesPerTeller.toFixed(1)} stories/teller
                </StatHelpText>
              </Stat>
            </AppleCard>
            
            <AppleCard variant="elevated">
              <Stat>
                <StatLabel>Active Themes</StatLabel>
                <StatNumber>{metrics.totalThemes}</StatNumber>
                <StatHelpText>
                  {metrics.avgThemesPerStory.toFixed(1)} themes/story
                </StatHelpText>
              </Stat>
            </AppleCard>
            
            <AppleCard variant="elevated">
              <Stat>
                <StatLabel>Media Items</StatLabel>
                <StatNumber>{metrics.totalMedia}</StatNumber>
                <StatHelpText>
                  {metrics.avgMediaPerStory.toFixed(1)} media/story
                </StatHelpText>
              </Stat>
            </AppleCard>
          </SimpleGrid>

          {/* Charts */}
          <Tabs variant="soft-rounded" colorScheme="orange">
            <TabList>
              <Tab>Growth Trends</Tab>
              <Tab>Theme Analysis</Tab>
              <Tab>Geographic Insights</Tab>
              <Tab>Storyteller Activity</Tab>
            </TabList>
            
            <TabPanels>
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {/* Time Series Chart */}
                  <AppleCard variant="elevated" p={6}>
                    <VStack align="stretch" spacing={4}>
                      <HStack justify="space-between">
                        <Heading size="sm">Content Growth</Heading>
                        <ButtonGroup size="xs" isAttached variant="outline">
                          <Button 
                            onClick={() => setSelectedMetric('stories')}
                            isActive={selectedMetric === 'stories'}
                          >
                            Stories
                          </Button>
                          <Button 
                            onClick={() => setSelectedMetric('engagement')}
                            isActive={selectedMetric === 'engagement'}
                          >
                            Engagement
                          </Button>
                        </ButtonGroup>
                      </HStack>
                      
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Area 
                            type="monotone" 
                            dataKey={selectedMetric === 'stories' ? 'stories' : 'engagement'} 
                            stroke="#FF6B35" 
                            fill="#FF6B35" 
                            fillOpacity={0.3}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </VStack>
                  </AppleCard>
                  
                  {/* Media vs Stories */}
                  <AppleCard variant="elevated" p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Content Distribution</Heading>
                      
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timeSeriesData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <RechartsTooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="stories" 
                            stroke="#FF6B35" 
                            strokeWidth={2}
                            name="Stories"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="media" 
                            stroke="#FFA500" 
                            strokeWidth={2}
                            name="Media"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </VStack>
                  </AppleCard>
                </SimpleGrid>
              </TabPanel>
              
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {/* Theme Distribution */}
                  <AppleCard variant="elevated" p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Top Themes</Heading>
                      
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={themeDistribution} layout="horizontal">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={100} />
                          <RechartsTooltip />
                          <Bar dataKey="value" fill="#FF6B35" />
                        </BarChart>
                      </ResponsiveContainer>
                    </VStack>
                  </AppleCard>
                  
                  {/* Theme Pie Chart */}
                  <AppleCard variant="elevated" p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Theme Distribution</Heading>
                      
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={themeDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => entry.name}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {themeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </VStack>
                  </AppleCard>
                </SimpleGrid>
              </TabPanel>
              
              <TabPanel px={0}>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  {/* Location Stats */}
                  <AppleCard variant="elevated" p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Top Locations</Heading>
                      
                      <VStack align="stretch" spacing={3}>
                        {locationDistribution.map((location, index) => (
                          <Box key={location.location}>
                            <HStack justify="space-between" mb={1}>
                              <Text fontSize="sm">{location.location}</Text>
                              <Text fontSize="sm" fontWeight="bold">
                                {location.count} stories
                              </Text>
                            </HStack>
                            <Progress 
                              value={(location.count / locationDistribution[0].count) * 100} 
                              colorScheme="orange"
                              size="sm"
                            />
                          </Box>
                        ))}
                      </VStack>
                    </VStack>
                  </AppleCard>
                  
                  {/* Geographic Coverage */}
                  <AppleCard variant="elevated" p={6}>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Geographic Coverage</Heading>
                      
                      <SimpleGrid columns={2} spacing={4}>
                        <Stat size="sm">
                          <StatLabel>Locations</StatLabel>
                          <StatNumber>{locationDistribution.length}</StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel>Coverage</StatLabel>
                          <StatNumber>
                            {((locationDistribution.length / 50) * 100).toFixed(0)}%
                          </StatNumber>
                        </Stat>
                      </SimpleGrid>
                      
                      <Divider />
                      
                      <Text fontSize="sm" color="gray.500">
                        Stories are distributed across {locationDistribution.length} locations,
                        with the highest concentration in {locationDistribution[0]?.location || 'N/A'}.
                      </Text>
                    </VStack>
                  </AppleCard>
                </SimpleGrid>
              </TabPanel>
              
              <TabPanel px={0}>
                <AppleCard variant="elevated" p={6}>
                  <VStack align="stretch" spacing={4}>
                    <Heading size="sm">Most Active Storytellers</Heading>
                    
                    <Box overflowX="auto">
                      <VStack align="stretch" spacing={3}>
                        {storytellerActivity.map((teller, index) => (
                          <HStack key={index} justify="space-between" p={3} 
                            borderRadius="md"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                          >
                            <HStack spacing={3}>
                              <Badge colorScheme="orange">{index + 1}</Badge>
                              <Text fontWeight="medium">{teller.name}</Text>
                            </HStack>
                            <HStack spacing={4}>
                              <Text fontSize="sm">
                                {teller.stories} total stories
                              </Text>
                              {teller.recent > 0 && (
                                <Badge colorScheme="green">
                                  {teller.recent} recent
                                </Badge>
                              )}
                            </HStack>
                          </HStack>
                        ))}
                      </VStack>
                    </Box>
                  </VStack>
                </AppleCard>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </VStack>
      </Container>
      
      <QuickActions context="analytics" />
    </Box>
  );
};

export default AnalyticsDashboard;