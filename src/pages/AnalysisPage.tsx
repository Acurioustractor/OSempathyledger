import {
  Box,
  Container,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  Text,
  Flex,
  HStack,
  Badge,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { Theme, Media } from '../services/airtable';
import { useAnalysisData } from '../hooks/useAirtableData';
// Import Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
  Scatter,
  ScatterChart,
  ZAxis,
} from 'recharts';

// Interface for chart data
interface ThemeChartData {
  name: string;
  count: number;
}

const ThemesOverview = ({ themes, media }: { themes: Theme[], media: Media[] }) => {
  // Use theme colors for chart
  const barColor = useColorModeValue("teal", "#8884d8"); // Example colors
  const axisColor = useColorModeValue("black", "white");

  const themeCounts = useMemo(() => {
    if (!themes || !media) return [];

    const counts = new Map<string, number>();
    media.forEach(m => {
      // Ensure m.themes exists and is an array before iterating
      if (Array.isArray(m.themes)) {
        m.themes.forEach(themeId => {
          counts.set(themeId, (counts.get(themeId) || 0) + 1);
        });
      }
    });

    const themeNameMap = new Map(themes.map(t => [t.id, t['Theme Name']]));

    const chartData: ThemeChartData[] = Array.from(counts.entries())
      .map(([themeId, count]) => ({
        name: themeNameMap.get(themeId) || 'Unknown Theme', // Get name from map
        count: count,
      }))
      .sort((a, b) => b.count - a.count); // Sort descending by count
      
    console.log("[AnalysisPage] ThemesOverview calculated counts:", chartData.length);

    // Limit chart data for better readability if necessary
    const MAX_ITEMS = 20; // Show top 20 themes
    return chartData.slice(0, MAX_ITEMS);

  }, [themes, media]);

  if (!themes?.length || !media?.length) {
    return <Text>Loading theme/media data or no data available...</Text>;
  }
  
  if (themeCounts.length === 0) {
     return <Text>No themes found linked to media.</Text>;
  }

  return (
    <Box p={4} height="500px"> {/* Set height for chart container */}
      <Heading size="md" mb={4}>Theme Prevalence (Top {themeCounts.length} by Media Count)</Heading>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={themeCounts}
          layout="vertical" // Use vertical layout for better label readability
          margin={{
            top: 5,
            right: 30,
            left: 100, // Increase left margin for Y-axis labels
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis type="number" stroke={axisColor} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={150} // Adjust width if labels are long
            tick={{ fontSize: 10, fill: axisColor }} // Style ticks
            interval={0} // Ensure all labels are shown
            stroke={axisColor}
          />
          <Tooltip 
             contentStyle={{ backgroundColor: useColorModeValue('#ffffff', '#333333'), border: '1px solid #cccccc' }} 
             itemStyle={{ color: axisColor }} 
          />
          {/* <Legend /> */}
          <Bar dataKey="count" fill={barColor} name="Media Count">
             {/* Optionally add labels inside bars */}
             {/* <LabelList dataKey="count" position="right" style={{ fill: axisColor }} /> */}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

// New interface for storyteller data visualization
interface StorytellersChartData {
  name: string;
  stories: number;
  engagement: number;
}

const StorytellerInsights = ({ media }: { media: Media[] }) => {
  const barColor1 = useColorModeValue("teal.500", "#8884d8");
  const barColor2 = useColorModeValue("blue.500", "#82ca9d");
  const axisColor = useColorModeValue("black", "white");

  // Analyze storyteller engagement from media data
  const storytellerData = useMemo(() => {
    if (!media || !media.length) return [];

    const storytellerMap = new Map<string, {
      name: string,
      stories: number,
      quotes: number,
      mediaAppearances: number
    }>();

    // Process media to count storyteller appearances
    media.forEach(m => {
      // Standardize property name and fix inconsistency
      const storytellers = Array.isArray(m.storytellers) ? m.storytellers : 
                         Array.isArray(m.Storytellers) ? m.Storytellers : [];
      
      // Skip if no storytellers data
      if (storytellers.length === 0) return;
      
      storytellers.forEach(storytellerId => {
        const existing = storytellerMap.get(storytellerId);
        if (existing) {
          existing.mediaAppearances += 1;
        } else {
          storytellerMap.set(storytellerId, {
            name: storytellerId, // Will be replaced with actual name if available
            stories: 0,
            quotes: 0,
            mediaAppearances: 1
          });
        }
      });
    });

    // Convert map to array and calculate engagement score
    const chartData: StorytellersChartData[] = Array.from(storytellerMap.entries())
      .map(([id, data]) => ({
        name: data.name.split(' ').slice(0, 2).join(' '), // Shorten names for display
        stories: data.mediaAppearances,
        engagement: data.mediaAppearances * 1.5 // Simple engagement score
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10); // Show top 10 by engagement
    
    return chartData;
  }, [media]);

  if (!media?.length) {
    return <Text>Loading storyteller data or no data available...</Text>;
  }

  if (storytellerData.length === 0) {
    return <Text>No storyteller engagement data available.</Text>;
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Heading size="md" mb={2}>Storyteller Engagement Analysis</Heading>
        <Text fontSize="sm" color="gray.500">
          Visualizing storyteller participation and impact across collected media
        </Text>
        
        <Box p={4} height="400px" borderWidth="1px" borderRadius="lg">
          <Heading size="sm" mb={4}>Top Storytellers by Engagement</Heading>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={storytellerData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="name" 
                stroke={axisColor}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke={axisColor} />
              <Tooltip 
                contentStyle={{ backgroundColor: useColorModeValue('#ffffff', '#333333'), border: '1px solid #cccccc' }} 
                itemStyle={{ color: axisColor }} 
              />
              <Legend />
              <Bar dataKey="stories" name="Media Appearances" fill={barColor1} />
              <Bar dataKey="engagement" name="Engagement Score" fill={barColor2} />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Coming Soon:</Text>
            <Text fontSize="sm">Storyteller journey visualization, compensation tracking, and diversity representation metrics</Text>
          </Box>
        </Alert>
      </VStack>
    </Box>
  );
};

// Replace ContentAnalysis with ThemeRelationships
const ThemeRelationships = ({ themes, media }: { themes: Theme[], media: Media[] }) => {
  const bgColor = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const chartColors = [
    useColorModeValue("#8884d8", "#8884d8"),
    useColorModeValue("#82ca9d", "#82ca9d"),
    useColorModeValue("#ffc658", "#ffc658"),
    useColorModeValue("#ff8042", "#ff8042"),
    useColorModeValue("#0088FE", "#0088FE"),
    useColorModeValue("#00C49F", "#00C49F"),
    useColorModeValue("#FFBB28", "#FFBB28"),
    useColorModeValue("#FF8042", "#FF8042"),
  ];

  // Process data for Theme-Media connections
  const themeMediaData = useMemo(() => {
    if (!themes || !media) return [];

    // Create a map to count media per theme
    const themeMediaCounts = new Map<string, number>();
    const themeNames = new Map(themes.map(t => [t.id, t['Theme Name']]));
    
    media.forEach(m => {
      if (Array.isArray(m.themes)) {
        m.themes.forEach(themeId => {
          themeMediaCounts.set(themeId, (themeMediaCounts.get(themeId) || 0) + 1);
        });
      }
    });
    
    // Convert to chart data
    return Array.from(themeMediaCounts.entries())
      .map(([themeId, count]) => ({
        name: themeNames.get(themeId) || 'Unknown Theme',
        value: count,
        id: themeId
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 themes
  }, [themes, media]);
  
  // Process data for Media-Storyteller connections
  const mediaStorytellersData = useMemo(() => {
    if (!media) return [];
    
    // Count storytellers per media
    const mediaStorytellerMap = new Map<string, { mediaName: string, storytellers: number, themes: number }>();
    
    media.forEach(m => {
      // Standardize property access with fallbacks for both casing patterns
      const storytellers = Array.isArray(m.storytellers) ? m.storytellers : 
                          Array.isArray(m.Storytellers) ? m.Storytellers : [];
      const themesList = Array.isArray(m.themes) ? m.themes : [];
      const fileName = m['File Name'] || 'Unnamed Media';
      
      const storytellerCount = storytellers.length;
      const themeCount = themesList.length;
      
      if (storytellerCount > 0 || themeCount > 0) {
        mediaStorytellerMap.set(m.id, {
          mediaName: fileName,
          storytellers: storytellerCount,
          themes: themeCount
        });
      }
    });
    
    // Convert to chart data
    return Array.from(mediaStorytellerMap.entries())
      .map(([id, data]) => ({
        x: data.themes, // Number of themes
        y: data.storytellers, // Number of storytellers
        z: 10, // Size (can be calculated based on other metrics if needed)
        name: data.mediaName
      }))
      .filter(item => item.x > 0 && item.y > 0) // Only show media with both themes and storytellers
      .slice(0, 30); // Limit to 30 data points
  }, [media]);

  if (!themes?.length || !media?.length) {
    return <Text>Loading data or no data available...</Text>;
  }

  return (
    <Box>
      <VStack spacing={8} align="stretch">
        {/* Theme Distribution */}
        <Box>
          <Heading size="md" mb={2}>Theme Distribution</Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Distribution of themes across media content
          </Text>
          
          <Box p={4} height="400px" borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={themeMediaData}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {themeMediaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [`${value} media items`, 'Count']}
                  contentStyle={{ backgroundColor: bgColor, color: textColor, borderColor: useColorModeValue("gray.200", "gray.700") }} 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </Box>
        
        {/* Media-Storyteller-Theme Relationships */}
        <Box>
          <Heading size="md" mb={2}>Content Relationship Map</Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            How media connects themes and storytellers
          </Text>
          
          <Box p={4} height="400px" borderWidth="1px" borderRadius="lg" bg={bgColor}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{
                  top: 20,
                  right: 20,
                  bottom: 40,
                  left: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Themes" 
                  label={{ value: 'Number of Themes', position: 'bottom', offset: 10 }}
                  stroke={textColor}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Storytellers" 
                  label={{ value: 'Number of Storytellers', angle: -90, position: 'left' }}
                  stroke={textColor}
                />
                <ZAxis type="number" dataKey="z" range={[60, 400]} />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  formatter={(value, name, props) => {
                    if (name === 'Themes') return [`${value} themes`, name];
                    if (name === 'Storytellers') return [`${value} storytellers`, name];
                    return [value, name];
                  }}
                  contentStyle={{ backgroundColor: bgColor, color: textColor, borderColor: useColorModeValue("gray.200", "gray.700") }}
                  wrapperStyle={{ zIndex: 100 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <Box bg={bgColor} p={2} borderWidth="1px" borderRadius="md">
                          <Text fontWeight="bold">{data.name}</Text>
                          <Text fontSize="sm">{data.x} themes</Text>
                          <Text fontSize="sm">{data.y} storytellers</Text>
                        </Box>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  name="Media Content" 
                  data={mediaStorytellersData} 
                  fill={chartColors[0]}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </Box>
          
          <Text mt={2} fontSize="sm" color="gray.500">
            Each point represents a piece of media content. Position shows how many themes and storytellers are connected to it.
          </Text>
        </Box>

        {/* Insight box */}
        <Box p={4} borderWidth="1px" borderRadius="lg" bg={useColorModeValue("blue.50", "blue.900")}>
          <Heading size="sm" mb={2}>Key Insights</Heading>
          <UnorderedList spacing={2} pl={4}>
            <ListItem>
              <Text fontSize="sm">The most common theme is <strong>{themeMediaData[0]?.name}</strong> with {themeMediaData[0]?.value} media items</Text>
            </ListItem>
            <ListItem>
              <Text fontSize="sm">Media with both multiple themes and multiple storytellers indicates interconnected content</Text>
            </ListItem>
            <ListItem>
              <Text fontSize="sm">Content in the upper-right of the scatter plot represents the most collaborative and thematically rich material</Text>
            </ListItem>
          </UnorderedList>
        </Box>
      </VStack>
    </Box>
  );
};

// Define interfaces for mock data to improve type safety
interface MockTheme extends Theme {
  'Theme Name': string;
  Description: string;
}

interface MockMedia extends Media {
  'File Name': string;
  themes?: string[];
  Storytellers?: string[];
  storytellers?: string[];
}

const AnalysisPage = () => {
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const panelBg = useColorModeValue('white', 'gray.800');

  // Mock data for when Airtable API fails
  const mockThemes: MockTheme[] = useMemo(() => [
    { id: 't1', createdTime: '2023-01-01', 'Theme Name': 'Community Building', Description: 'Building connections between people' },
    { id: 't2', createdTime: '2023-01-02', 'Theme Name': 'Personal Growth', Description: 'Individual development and transformation' },
    { id: 't3', createdTime: '2023-01-03', 'Theme Name': 'Social Justice', Description: 'Addressing systemic inequalities' },
    { id: 't4', createdTime: '2023-01-04', 'Theme Name': 'Environmental Stewardship', Description: 'Caring for our planet' },
    { id: 't5', createdTime: '2023-01-05', 'Theme Name': 'Innovation', Description: 'Creating new solutions to challenges' },
    { id: 't6', createdTime: '2023-01-06', 'Theme Name': 'Cultural Heritage', Description: 'Preserving and celebrating traditions' },
    { id: 't7', createdTime: '2023-01-07', 'Theme Name': 'Resilience', Description: 'Overcoming adversity and adapting to challenges' },
    { id: 't8', createdTime: '2023-01-08', 'Theme Name': 'Collective Wisdom', Description: 'Shared knowledge and learning' },
  ], []);

  const mockMedia: MockMedia[] = useMemo(() => [
    { id: 'm1', createdTime: '2023-02-01', 'File Name': 'Interview 1', themes: ['t1', 't3', 't7'], Storytellers: ['s1', 's2'] },
    { id: 'm2', createdTime: '2023-02-02', 'File Name': 'Workshop Recording', themes: ['t2', 't5'], Storytellers: ['s3'] },
    { id: 'm3', createdTime: '2023-02-03', 'File Name': 'Community Event', themes: ['t1', 't6'], Storytellers: ['s1', 's4'] },
    { id: 'm4', createdTime: '2023-02-04', 'File Name': 'Personal Story', themes: ['t2', 't7'], Storytellers: ['s5'] },
    { id: 'm5', createdTime: '2023-02-05', 'File Name': 'Group Discussion', themes: ['t3', 't8'], Storytellers: ['s2', 's3', 's4'] },
    { id: 'm6', createdTime: '2023-02-06', 'File Name': 'Project Documentation', themes: ['t4', 't5'], Storytellers: ['s1'] },
    { id: 'm7', createdTime: '2023-02-07', 'File Name': 'Cultural Celebration', themes: ['t6', 't8'], Storytellers: ['s5', 's6'] },
    { id: 'm8', createdTime: '2023-02-08', 'File Name': 'Educational Session', themes: ['t5', 't8'], Storytellers: ['s3'] },
  ], []);

  // Use the custom hook instead of direct API calls
  const { themes, media, isLoading, error, isUsingMockData } = useAnalysisData(mockThemes, mockMedia);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Analysis Dashboard</Heading>

        {isLoading && (
           <Box textAlign="center"><Spinner size="xl" /></Box>
        )}
        {error && (
          <Alert status="warning" mb={4}>
             <AlertIcon />
             <Box>
               <Text fontWeight="bold">Data Load Issue: {error.message}</Text>
               <Text fontSize="sm">Using mock data for visualizations.</Text>
             </Box>
          </Alert>
        )}

        {!isLoading && (
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList bg={tabBg} borderRadius="md" p={1}>
              <Tab>Themes Overview</Tab>
              <Tab>Storyteller Insights</Tab>
              <Tab>Content Relationships</Tab>
            </TabList>

            <TabPanels bg={panelBg} borderRadius="md" mt={2} shadow="sm">
              <TabPanel>
                {isUsingMockData && (
                  <Alert status="info" mb={4} size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">Showing mock data visualization. Connect to Airtable for real data.</Text>
                  </Alert>
                )}
                <ThemesOverview themes={themes} media={media} />
              </TabPanel>
              <TabPanel>
                {isUsingMockData && (
                  <Alert status="info" mb={4} size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">Showing mock data visualization. Connect to Airtable for real data.</Text>
                  </Alert>
                )}
                <StorytellerInsights media={media} />
              </TabPanel>
              <TabPanel>
                {isUsingMockData && (
                  <Alert status="info" mb={4} size="sm">
                    <AlertIcon />
                    <Text fontSize="sm">Showing mock data visualization. Connect to Airtable for real data.</Text>
                  </Alert>
                )}
                <ThemeRelationships themes={themes} media={media} />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}

      </VStack>
    </Container>
  );
};

export default AnalysisPage; 