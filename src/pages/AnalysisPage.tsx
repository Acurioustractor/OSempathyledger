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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Wrap,
  WrapItem,
  Tag,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { Theme, Media, Story, Storyteller, Quote, Shift } from '../services/airtable';
// Use the central Airtable data context hook
import { useAirtableData } from '../context/AirtableDataContext';
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
import chroma from 'chroma-js'; // For generating color scales

// Interface for chart data
interface ThemeChartData {
  name: string;
  count: number;
  id: string;
}

// Interface for co-occurrence data
interface ThemeCooccurrenceData {
  pair: string;
  theme1: string;
  theme2: string;
  count: number;
}

const ThemesOverview = ({ themes, media, stories }: { themes: Theme[], media: Media[], stories: Story[] }) => {
  const barColor = useColorModeValue("teal.500", "teal.300");
  const axisColor = useColorModeValue("gray.600", "gray.400");
  const gridColor = useColorModeValue("gray.200", "gray.600");
  const tooltipBg = useColorModeValue('white', 'gray.700');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');

  const themeNameMap = useMemo(() => new Map(themes.map(t => [t.id, t['Theme Name']])), [themes]);

  // Calculate theme prevalence
  const themeCounts = useMemo(() => {
    if (!themes || (!media && !stories)) return [];
    const counts = new Map<string, number>();
    
    (media || []).forEach(m => {
      if (Array.isArray(m.themes)) {
        m.themes.forEach(themeId => { counts.set(themeId, (counts.get(themeId) || 0) + 1); });
      }
    });
    (stories || []).forEach(s => {
      if (Array.isArray(s.Themes)) {
        s.Themes.forEach(themeId => { counts.set(themeId, (counts.get(themeId) || 0) + 1); });
      }
    });

    const chartData: ThemeChartData[] = Array.from(counts.entries())
      .map(([themeId, count]) => ({ id: themeId, name: themeNameMap.get(themeId) || 'Unknown Theme', count }))
      .filter(d => d.name !== 'Unknown Theme') // Exclude themes not found in the map
      .sort((a, b) => b.count - a.count);
      
    const MAX_ITEMS = 15; // Show top 15
    return chartData.slice(0, MAX_ITEMS);
  }, [themes, media, stories, themeNameMap]);

  // Calculate theme co-occurrence
  const themeCooccurrence = useMemo(() => {
    if (!themes || (!media && !stories)) return [];
    const cooccurrence = new Map<string, number>(); // Key: "themeId1-themeId2" (sorted)

    const processItemThemes = (itemThemes: string[] | undefined) => {
      if (!itemThemes || !Array.isArray(itemThemes) || itemThemes.length < 2) return;
      const validThemes = itemThemes.filter(id => themeNameMap.has(id)); // Ensure themes exist
      
      for (let i = 0; i < validThemes.length; i++) {
        for (let j = i + 1; j < validThemes.length; j++) {
          const pair = [validThemes[i], validThemes[j]].sort().join('-');
          cooccurrence.set(pair, (cooccurrence.get(pair) || 0) + 1);
        }
      }
    };

    (media || []).forEach(m => processItemThemes(m.themes));
    (stories || []).forEach(s => processItemThemes(s.Themes));

    const cooccurrenceData: ThemeCooccurrenceData[] = Array.from(cooccurrence.entries())
      .map(([pairKey, count]) => {
        const [id1, id2] = pairKey.split('-');
        return {
          pair: `${themeNameMap.get(id1)} & ${themeNameMap.get(id2)}`,
          theme1: themeNameMap.get(id1) || 'Unknown',
          theme2: themeNameMap.get(id2) || 'Unknown',
          count
        };
      })
      .filter(d => d.theme1 !== 'Unknown' && d.theme2 !== 'Unknown') // Exclude pairs with unknown themes
      .sort((a, b) => b.count - a.count);
      
    const MAX_PAIRS = 10;
    return cooccurrenceData.slice(0, MAX_PAIRS);

  }, [themes, media, stories, themeNameMap]);

  // Generate colors for the bar chart
  const barColors = useMemo(() => {
     if (themeCounts.length === 0) return [];
     // Create a sequential color scale
     return chroma.scale(['#a6d8f0', '#1661AB']).mode('lch').colors(themeCounts.length);
  }, [themeCounts]);

  if (!themes?.length || (!media?.length && !stories?.length)) {
    return <Text>Loading data or no data available...</Text>;
  }
  
  if (themeCounts.length === 0) {
     return <Text>No themes found linked to media or stories.</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} p={4}>
       {/* Theme Prevalence Chart */}
      <Box>
        <Heading size="md" mb={4}>Theme Prevalence (Top {themeCounts.length})</Heading>
        <Text fontSize="sm" color="gray.500" mb={4}>
          Frequency of themes appearing in stories and media.
        </Text>
        <Box height="500px" borderWidth="1px" borderRadius="lg" p={4}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={themeCounts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.7} />
              <XAxis type="number" stroke={axisColor} />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={120} 
                tick={{ fontSize: 11, fill: axisColor }}
                interval={0}
                stroke={axisColor}
              />
              <Tooltip 
                 contentStyle={{ 
                   backgroundColor: tooltipBg, 
                   border: `1px solid ${tooltipBorder}`, 
                   borderRadius: 'md' 
                 }} 
                 itemStyle={{ color: axisColor }} 
                 formatter={(value) => [`${value} items`, 'Count']}
              />
              <Bar dataKey="count" name="Occurrences" radius={[0, 4, 4, 0]}> 
                 {themeCounts.map((entry, index) => (
                   <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                 ))}
                 <LabelList dataKey="count" position="right" style={{ fill: axisColor, fontSize: '10px' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

       {/* Theme Co-occurrence Table */}
      <Box>
         <Heading size="md" mb={4}>Top Theme Co-occurrences (Top {themeCooccurrence.length})</Heading>
          <Text fontSize="sm" color="gray.500" mb={4}>
            Themes frequently appearing together in the same story or media item.
          </Text>
         {themeCooccurrence.length > 0 ? (
           <TableContainer borderWidth="1px" borderRadius="lg">
             <Table variant="simple" size="sm">
               <Thead bg={tableHeaderBg}>
                 <Tr>
                   <Th>Theme Pair</Th>
                   <Th isNumeric>Count</Th>
                 </Tr>
               </Thead>
               <Tbody>
                 {themeCooccurrence.map((item, index) => (
                   <Tr key={index}>
                     <Td>{item.pair}</Td>
                     <Td isNumeric>{item.count}</Td>
                   </Tr>
                 ))}
               </Tbody>
             </Table>
           </TableContainer>
         ) : (
           <Text>No co-occurrence data found.</Text>
         )}
          {/* Potential area for a more visual co-occurrence chart later */}
      </Box>
    </SimpleGrid>
  );
};

// New interface for storyteller data visualization
interface StorytellerInsightData {
  id: string;
  name: string;
  storyCount: number;
  mediaCount: number;
  quoteCount: number;
  topThemes: { name: string; count: number }[];
}

const StorytellerInsights = ({ storytellers, media, stories, quotes, themes }: { 
  storytellers: Storyteller[], 
  media: Media[], 
  stories: Story[],
  quotes: Quote[],
  themes: Theme[]
}) => {
  // Log received props
  console.log("[StorytellerInsights] Received props:", {
    storytellersCount: storytellers?.length,
    mediaCount: media?.length,
    storiesCount: stories?.length,
    quotesCount: quotes?.length,
    themesCount: themes?.length
  });
  
  const barColor1 = useColorModeValue("teal.500", "#8884d8");
  const barColor2 = useColorModeValue("blue.500", "#82ca9d");
  const barColor3 = useColorModeValue("orange.500", "#ffc658");
  const axisColor = useColorModeValue("gray.600", "gray.400");
  const gridColor = useColorModeValue("gray.200", "gray.600");
  const tooltipBg = useColorModeValue('white', 'gray.700');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');
  const tableHeaderBg = useColorModeValue('gray.50', 'gray.700');

  const themeNameMap = useMemo(() => new Map(themes.map(t => [t.id, t['Theme Name']])), [themes]);

  const storytellerInsightsData = useMemo(() => {
    console.log("[StorytellerInsights UseMemo] Starting calculation..."); // Log start
    if (!storytellers || !storytellers.length || !themes || !themes.length) {
      console.log("[StorytellerInsights UseMemo] Missing essential data (storytellers or themes), returning empty.");
      return [];
    }
    console.log(`[StorytellerInsights UseMemo] Processing ${storytellers.length} storytellers...`);

    const insightsMap = new Map<string, StorytellerInsightData>();
    storytellers.forEach(s => {
      insightsMap.set(s.id, { 
        id: s.id, name: s.Name, storyCount: 0, mediaCount: 0, quoteCount: 0, topThemes: [] 
      });
    });

    const storytellerMediaThemes = new Map<string, string[]>();

    // Count media & themes
    (media || []).forEach((m, index) => {
      if (m.Storytellers && Array.isArray(m.Storytellers)) {
        m.Storytellers.forEach(storytellerId => {
          const insight = insightsMap.get(storytellerId);
          if (insight) {
            insight.mediaCount += 1;
            const currentThemes = storytellerMediaThemes.get(storytellerId) || [];
            if (m.themes && Array.isArray(m.themes)) {
              storytellerMediaThemes.set(storytellerId, [...currentThemes, ...m.themes]);
            }
          } else if (index < 5) { // Log if storyteller ID not found in map (limit logging)
             console.warn(`[StorytellerInsights UseMemo] Media ${m.id}: Storyteller ID ${storytellerId} not found in insightsMap`);
          }
        });
      }
    });
    // Log after processing media
    console.log(`[StorytellerInsights UseMemo] After media processing. Sample media counts:`, Array.from(insightsMap.values()).slice(0, 3).map(i => `${i.name}: ${i.mediaCount}`));

    // Count stories & themes
    (stories || []).forEach((s, index) => {
      const storyStorytellers = new Set<string>();
      if (s.Storytellers && Array.isArray(s.Storytellers)) s.Storytellers.forEach(id => storyStorytellers.add(id));
      if (s.Media && Array.isArray(s.Media)) {
        s.Media.forEach(mediaId => {
          const mediaItem = media?.find(m => m.id === mediaId);
          if (mediaItem?.Storytellers && Array.isArray(mediaItem.Storytellers)) mediaItem.Storytellers.forEach(id => storyStorytellers.add(id));
        });
      }
      
      storyStorytellers.forEach(storytellerId => {
        const insight = insightsMap.get(storytellerId);
        if (insight) {
          insight.storyCount += 1;
          const currentThemes = storytellerMediaThemes.get(storytellerId) || [];
           if (s.Themes && Array.isArray(s.Themes)) {
             storytellerMediaThemes.set(storytellerId, [...currentThemes, ...s.Themes]);
           }
        } else if (index < 5) { // Log if storyteller ID not found (limit logging)
             console.warn(`[StorytellerInsights UseMemo] Story ${s.id}: Storyteller ID ${storytellerId} not found in insightsMap`);
        }
      });
    });
    // Log after processing stories
    console.log(`[StorytellerInsights UseMemo] After story processing. Sample story counts:`, Array.from(insightsMap.values()).slice(0, 3).map(i => `${i.name}: ${i.storyCount}`));

    // Count quotes
    (quotes || []).forEach((q, index) => {
      if (q.Storytellers && Array.isArray(q.Storytellers)) {
        q.Storytellers.forEach(storytellerId => {
          const insight = insightsMap.get(storytellerId);
          if (insight) {
            insight.quoteCount += 1;
          } else if (index < 5) { // Log if storyteller ID not found (limit logging)
            console.warn(`[StorytellerInsights UseMemo] Quote ${q.id}: Storyteller ID ${storytellerId} not found in insightsMap`);
          }
        });
      }
    });
    // Log after processing quotes
    console.log(`[StorytellerInsights UseMemo] After quote processing. Sample quote counts:`, Array.from(insightsMap.values()).slice(0, 3).map(i => `${i.name}: ${i.quoteCount}`));

    // Process themes for each storyteller
    console.log(`[StorytellerInsights UseMemo] Processing themes for ${insightsMap.size} storytellers. themeNameMap size: ${themeNameMap.size}`);
    insightsMap.forEach((insight) => {
      const themeCounts = new Map<string, number>();
      const allThemesForStoryteller = storytellerMediaThemes.get(insight.id) || [];
      allThemesForStoryteller.forEach(themeId => {
        if (themeNameMap.has(themeId)) {
           themeCounts.set(themeId, (themeCounts.get(themeId) || 0) + 1);
        } else {
           // Log if a theme ID from media/stories doesn't exist in the themes list
           // console.warn(`[StorytellerInsights UseMemo] Theme ID ${themeId} not found in themeNameMap for storyteller ${insight.name}`);
        }
      });
      
      insight.topThemes = Array.from(themeCounts.entries())
        .sort(([, countA], [, countB]) => countB - countA)
        .slice(0, 3)
        .map(([themeId, count]) => ({ name: themeNameMap.get(themeId)!, count }));
        
        // Log top themes if found
        // if (insight.topThemes.length > 0) {
        //   console.log(`[StorytellerInsights UseMemo] Top themes for ${insight.name}:`, insight.topThemes);
        // }
    });
    
    // Convert map to array and sort
    const finalData = Array.from(insightsMap.values())
      .filter(insight => insight.storyCount > 0 || insight.mediaCount > 0 || insight.quoteCount > 0) // Only include storytellers with contributions
      .sort((a, b) => (b.storyCount + b.mediaCount + b.quoteCount) - (a.storyCount + a.mediaCount + a.quoteCount))
      .slice(0, 15);
      
    console.log(`[StorytellerInsights UseMemo] Final processed data count (top 15 with contributions): ${finalData.length}`);
    if (finalData.length > 0) {
      console.log(`[StorytellerInsights UseMemo] First item in final data:`, JSON.stringify(finalData[0], null, 2));
      console.log(`[StorytellerInsights UseMemo] Last item in final data:`, JSON.stringify(finalData[finalData.length - 1], null, 2));
    }
    
    return finalData;
    
  }, [storytellers, media, stories, quotes, themeNameMap]); // Added themes to dependency array via themeNameMap

  if (!storytellers?.length) {
    return <Text>Loading storyteller data or no data available...</Text>;
  }

  return (
    <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} p={4}>
      {/* Storyteller Activity Chart */}
      <Box>
        <Heading size="md" mb={4}>Storyteller Activity (Top {storytellerInsightsData.length})</Heading>
        <Text fontSize="sm" color="gray.500" mb={4}>
          Number of stories, media items, and quotes attributed to each storyteller.
        </Text>
        <Box height="500px" borderWidth="1px" borderRadius="lg" p={4}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={storytellerInsightsData}
              margin={{ top: 5, right: 30, left: 20, bottom: 70 }} // Increased bottom margin
            >
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} opacity={0.7}/>
              <XAxis 
                 dataKey="name" 
                 stroke={axisColor} 
                 interval={0} 
                 angle={-45} 
                 textAnchor="end"
                 height={70} // Adjusted height for angled labels
                 tick={{ fontSize: 11 }}
              />
              <YAxis stroke={axisColor} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: tooltipBg, 
                  border: `1px solid ${tooltipBorder}`, 
                  borderRadius: 'md' 
                }} 
                itemStyle={{ color: axisColor }} 
              />
              <Legend verticalAlign="top" height={36}/>
              <Bar dataKey="storyCount" name="Stories" fill={barColor1} radius={[4, 4, 0, 0]}/>
              <Bar dataKey="mediaCount" name="Media Items" fill={barColor2} radius={[4, 4, 0, 0]}/>
              <Bar dataKey="quoteCount" name="Quotes" fill={barColor3} radius={[4, 4, 0, 0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Box>

      {/* Top Themes per Storyteller */}
      <Box>
        <Heading size="md" mb={4}>Top Themes per Storyteller</Heading>
         <Text fontSize="sm" color="gray.500" mb={4}>
           Most frequent themes associated with each top storyteller's content.
         </Text>
        {storytellerInsightsData.length > 0 ? (
          <TableContainer borderWidth="1px" borderRadius="lg" maxHeight="500px" overflowY="auto">
            <Table variant="simple" size="sm">
              <Thead bg={tableHeaderBg} position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th>Storyteller</Th>
                  <Th>Top Themes (up to 3)</Th>
                </Tr>
              </Thead>
              <Tbody>
                {storytellerInsightsData
                  .filter(s => s.topThemes.length > 0) // Only show storytellers with themes
                  .map((item) => (
                  <Tr key={item.id}>
                    <Td fontWeight="medium">{item.name}</Td>
                    <Td>
                      <Wrap spacing={1}>
                        {item.topThemes.map((theme, index) => (
                          <WrapItem key={index}>
                            <Tag size="sm" colorScheme="blue" variant="subtle">
                              {theme.name} ({theme.count})
                            </Tag>
                          </WrapItem>
                        ))}
                      </Wrap>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        ) : (
          <Text>No storyteller theme data found.</Text>
        )}
      </Box>
    </SimpleGrid>
  );
};

// Replace ContentAnalysis with ThemeRelationships
const ThemeRelationships = ({ themes, media, stories, storytellers, quotes, shifts }: { 
  themes: Theme[], 
  media: Media[],
  stories: Story[],
  storytellers: Storyteller[],
  quotes: Quote[],
  shifts: Shift[]
}) => {
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

  // Placeholder analysis - needs real implementation
  const themeMediaData = useMemo(() => {
     if (!themes || !media) return [];
     const themeNames = new Map(themes.map(t => [t.id, t['Theme Name']]));
     return themes.slice(0, 8).map(t => ({ name: t['Theme Name'], value: Math.floor(Math.random() * 50) + 1, id: t.id }));
  }, [themes, media]);
  
  const mediaStorytellersData = useMemo(() => {
    if (!media) return [];
    return media.slice(0, 30).map(m => ({ x: Math.floor(Math.random()*5), y: Math.floor(Math.random()*3), z: 10, name: m['File Name'] || 'Unnamed' }));
  }, [media]);

  if (!themes?.length || !media?.length || !stories?.length) {
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

const AnalysisPage = () => {
  const tabBg = useColorModeValue('gray.100', 'gray.700');
  const panelBg = useColorModeValue('white', 'gray.800');

  // Use the central data context hook
  const {
    themes,
    media,
    stories,
    storytellers,
    quotes,
    shifts,
    isLoading, // Use the combined loading state from context
    error,     // Use the combined error state from context
    // isUsingMockData // Context doesn't have this, remove or adapt if needed
  } = useAirtableData(); 

  // Combine potential errors from context
  const combinedError = useMemo(() => {
    if (error) {
      // Check specific error properties if they exist
      const messages = [error.themes, error.media, error.stories, error.storytellers, error.quotes, error.shifts]
        .filter(Boolean)
        .join('; ');
      return new Error(messages || 'Error loading data from context');
    }
    return null;
  }, [error]);

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading size="lg">Analysis Dashboard</Heading>

        {isLoading && (
           <Box textAlign="center"><Spinner size="xl" /></Box>
        )}
        {combinedError && (
          <Alert status="warning" mb={4}>
             <AlertIcon />
             <Box>
               <Text fontWeight="bold">Data Load Error: {combinedError.message}</Text>
             </Box>
          </Alert>
        )}

        {!isLoading && !combinedError && (
          <Tabs variant="soft-rounded" colorScheme="blue">
            <TabList bg={tabBg} borderRadius="md" p={1}>
              <Tab>Themes Overview</Tab>
              <Tab>Storyteller Insights</Tab>
              <Tab>Content Relationships</Tab>
            </TabList>

            <TabPanels bg={panelBg} borderRadius="md" mt={2} shadow="sm">
              <TabPanel>
                <ThemesOverview themes={themes} media={media} stories={stories} />
              </TabPanel>
              <TabPanel>
                <StorytellerInsights 
                  storytellers={storytellers} 
                  media={media} 
                  stories={stories} 
                  quotes={quotes} 
                  themes={themes}
                />
              </TabPanel>
              <TabPanel>
                <ThemeRelationships 
                  themes={themes} 
                  media={media} 
                  stories={stories}
                  storytellers={storytellers}
                  quotes={quotes}
                  shifts={shifts}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}

      </VStack>
    </Container>
  );
};

export default AnalysisPage; 