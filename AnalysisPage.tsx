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
import { fetchThemes, Theme, fetchMedia, Media } from '../services/airtable';
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
      const storytellerCount = Array.isArray(m.Storytellers) ? m.Storytellers.length : 0;
      const themeCount = Array.isArray(m.themes) ? m.themes.length : 0;
      
      if (storytellerCount > 0 || themeCount > 0) {
        mediaStorytellerMap.set(m.id, {
          mediaName: m['File Name'],
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

// ... existing code ... 

<Tabs variant="soft-rounded" colorScheme="blue">
  <TabList bg={tabBg} borderRadius="md" p={1}>
    <Tab>Themes Overview</Tab>
    <Tab>Storyteller Insights</Tab>
    <Tab>Content Relationships</Tab>
  </TabList>

  <TabPanels bg={panelBg} borderRadius="md" mt={2} shadow="sm">
    <TabPanel>
      {useMockData && (
        <Alert status="info" mb={4} size="sm">
          <AlertIcon />
          <Text fontSize="sm">Showing mock data visualization. Connect to Airtable for real data.</Text>
        </Alert>
      )}
      <ThemesOverview themes={themes} media={media} />
    </TabPanel>
    <TabPanel>
      {useMockData && (
        <Alert status="info" mb={4} size="sm">
          <AlertIcon />
          <Text fontSize="sm">Showing mock data visualization. Connect to Airtable for real data.</Text>
        </Alert>
      )}
      <StorytellerInsights media={media} />
    </TabPanel>
    <TabPanel>
      {useMockData && (
        <Alert status="info" mb={4} size="sm">
          <AlertIcon />
          <Text fontSize="sm">Showing mock data visualization. Connect to Airtable for real data.</Text>
        </Alert>
      )}
      <ThemeRelationships themes={themes} media={media} />
    </TabPanel>
  </TabPanels>
</Tabs>

// ... existing code ... 