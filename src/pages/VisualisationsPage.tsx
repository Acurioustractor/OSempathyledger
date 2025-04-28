import { Container, Heading, Text, VStack, Box, Divider, Tabs, TabList, Tab, TabPanels, TabPanel, Spinner, Alert, AlertIcon, useColorModeValue, HStack, Button, Tag, FormControl, FormLabel } from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { fetchThemes, Theme, fetchStories, Story, fetchMedia, Media, fetchQuotes, Quote, fetchStorytellers, Storyteller } from '../services/airtable';
import ThemeNetworkGraph from '../components/ThemeNetworkGraph';
import ThemeProjectBarChart from '../components/ThemeProjectBarChart';
import ThemeWordCloud from '../components/ThemeWordCloud';
import QuoteExplorer from '../components/QuoteExplorer';
import ThemeTimelineChart from '../components/ThemeTimelineChart';
import { Select as ChakraReactSelect, OptionBase } from "chakra-react-select";

// Define types for graph data
interface GraphNode {
  id: string;
  name: string;
  frequency: number; // How often the theme appears overall
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  isNeighbor?: boolean;
}

interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  value: number;
  index?: number;
  sourceNode?: GraphNode;
  targetNode?: GraphNode;
  isHighlighted?: boolean;
}

// Type for Heatmap data point
interface HeatmapDataPoint {
  themeName: string;
  projectName: string;
  count: number;
}

// Type for Select options
interface SelectOption extends OptionBase {
  label: string;
  value: string; // Use theme NAME as value for simplicity here
}

// Type for Timeline data point
interface TimelineDataPoint {
  date: string; // e.g., "YYYY-MM"
  [themeName: string]: number | string; // Each theme count + date
}

const VisualisationsPage = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);
  const placeholderBg = useColorModeValue('gray.50', 'gray.700');

  // Fetch all necessary data on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch in parallel
        const [themesData, storiesData, mediaData, quotesData, storytellersData] = await Promise.all([
          fetchThemes(),
          fetchStories(),
          fetchMedia(),
          fetchQuotes(),
          fetchStorytellers(),
        ]);
        setThemes(themesData);
        setStories(storiesData);
        setMedia(mediaData);
        setQuotes(quotesData);
        setStorytellers(storytellersData);
      } catch (err) {
        console.error("Error loading visualisation data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Process data for Theme Network Graph AND get theme frequencies
  const { themeNetworkData, themeFrequencies } = useMemo(() => {
    if (loading || error || !themes.length) return { themeNetworkData: { nodes: [], links: [] }, themeFrequencies: {} };

    const calculatedFrequencies: Record<string, number> = {};
    const coOccurrence: Record<string, number> = {};
    const themeMap = new Map(themes.map(t => [t.id, t]));

    // Count theme frequency and co-occurrence from Stories
    stories.forEach(story => {
      const storyThemes = story.Themes || [];
      storyThemes.forEach(themeId => {
        calculatedFrequencies[themeId] = (calculatedFrequencies[themeId] || 0) + 1;
      });
      for (let i = 0; i < storyThemes.length; i++) {
        for (let j = i + 1; j < storyThemes.length; j++) {
          const ids = [storyThemes[i], storyThemes[j]].sort();
          const key = `${ids[0]}-${ids[1]}`;
          coOccurrence[key] = (coOccurrence[key] || 0) + 1;
        }
      }
    });

    // Count theme frequency and co-occurrence from Media
    media.forEach(mediaItem => {
      let mediaThemes: string[] = [];
      if (Array.isArray((mediaItem as any).Themes)) mediaThemes = (mediaItem as any).Themes;
      else if (Array.isArray((mediaItem as any).themes)) mediaThemes = (mediaItem as any).themes;
      
      mediaThemes.forEach(themeId => {
        calculatedFrequencies[themeId] = (calculatedFrequencies[themeId] || 0) + 1;
      });
      for (let i = 0; i < mediaThemes.length; i++) {
        for (let j = i + 1; j < mediaThemes.length; j++) {
          const ids = [mediaThemes[i], mediaThemes[j]].sort();
          const key = `${ids[0]}-${ids[1]}`;
          coOccurrence[key] = (coOccurrence[key] || 0) + 1;
        }
      }
    });

    // Create nodes
    const nodes: GraphNode[] = themes.map(theme => ({
      id: theme.id,
      name: theme['Theme Name'] || 'Unnamed Theme',
      frequency: calculatedFrequencies[theme.id] || 0,
    })).filter(node => node.frequency > 0);

    // Create links
    const links: GraphLink[] = Object.entries(coOccurrence).map(([key, value]) => {
      const [source, target] = key.split('-');
      if (nodes.find(n => n.id === source) && nodes.find(n => n.id === target)) {
        return { source, target, value };
      }
      return null;
    }).filter(link => link !== null) as GraphLink[];

    return { themeNetworkData: { nodes, links }, themeFrequencies: calculatedFrequencies };

  }, [themes, stories, media, loading, error]);

  // Process data for Bar Chart (Top N Themes vs Projects)
  const themeProjectBarData = useMemo(() => {
    if (loading || error || !themes.length || !media.length || Object.keys(themeFrequencies).length === 0) return [];
    
    const NUMBER_OF_TOP_THEMES = 20; // Keep filtering for manageable bar groups

    const sortedThemeIds = Object.entries(themeFrequencies)
        .sort(([, freqA], [, freqB]) => freqB - freqA)
        .map(([themeId]) => themeId)
        .slice(0, NUMBER_OF_TOP_THEMES);
    const topThemeIdsSet = new Set(sortedThemeIds);

    const aggregatedData: Record<string, Record<string, number>> = {}; // { themeId: { projectId: count } }
    const themeMap = new Map(themes.map(t => [t.id, t['Theme Name'] || 'Unknown Theme']));
    const projectSet = new Set<string>();

    media.forEach(mediaItem => {
      const projectName = mediaItem.Project || 'Uncategorized';
      projectSet.add(projectName);

      let mediaThemes: string[] = [];
      if (Array.isArray((mediaItem as any).Themes)) mediaThemes = (mediaItem as any).Themes;
      else if (Array.isArray((mediaItem as any).themes)) mediaThemes = (mediaItem as any).themes;

      mediaThemes.forEach(themeId => {
        if (topThemeIdsSet.has(themeId)) {
            if (!aggregatedData[themeId]) {
                aggregatedData[themeId] = {};
            }
            aggregatedData[themeId][projectName] = (aggregatedData[themeId][projectName] || 0) + 1;
        }
      });
    });

    // Convert to flat array for the bar chart component
    const flatData: HeatmapDataPoint[] = []; // Reusing the interface name
    sortedThemeIds.forEach(themeId => {
        const themeName = themeMap.get(themeId);
        if (themeName && aggregatedData[themeId]) { 
            Object.entries(aggregatedData[themeId]).forEach(([projectName, count]) => {
                flatData.push({ themeName, projectName, count });
            });
        }
    });

    console.log(`[VisualisationsPage] Processed Bar Chart Data Points (Top ${NUMBER_OF_TOP_THEMES}):`, flatData.length);
    return flatData;

  }, [themes, media, themeFrequencies, loading, error]);

  // Prepare data for Word Cloud
  const wordCloudData = useMemo(() => {
    if (loading || error || Object.keys(themeFrequencies).length === 0) return [];
    const themeMap = new Map(themes.map(t => [t.id, t['Theme Name'] || 'Unknown Theme']));
    return Object.entries(themeFrequencies)
      .map(([id, value]) => ({ text: themeMap.get(id) || 'Unknown', value }))
      .filter(d => d.text !== 'Unknown'); // Filter out themes without names
  }, [themes, themeFrequencies, loading, error]);

  // Process data for Theme Timeline Chart
  const themeTimelineData = useMemo(() => {
    if (loading || error || !themes.length || !media.length || Object.keys(themeFrequencies).length === 0) return { timelineData: [], topThemeNames: [] };

    const NUMBER_OF_TOP_THEMES = 10;
    const themeMap = new Map(themes.map(t => [t.id, t['Theme Name'] || 'Unknown Theme']));

    // Get Top N theme names
    const topThemeIds = Object.entries(themeFrequencies)
        .sort(([, freqA], [, freqB]) => freqB - freqA)
        .map(([themeId]) => themeId)
        .slice(0, NUMBER_OF_TOP_THEMES);
    const topThemeNames = topThemeIds.map(id => themeMap.get(id)).filter(name => !!name) as string[];
    const topThemeIdsSet = new Set(topThemeIds);

    // Group counts by month and theme
    const monthlyCounts: Record<string, Record<string, number>> = {}; // { "YYYY-MM": { themeName: count } }

    media.forEach(mediaItem => {
        if (!mediaItem['Created At']) return; // Skip if no date
        
        try {
            const date = new Date(mediaItem['Created At']);
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are 0-indexed
            const yearMonth = `${year}-${month}`;

            if (!monthlyCounts[yearMonth]) {
                monthlyCounts[yearMonth] = {};
                topThemeNames.forEach(name => monthlyCounts[yearMonth][name] = 0); // Initialize all top themes for the month
            }

            let mediaThemes: string[] = [];
            if (Array.isArray((mediaItem as any).Themes)) mediaThemes = (mediaItem as any).Themes;
            else if (Array.isArray((mediaItem as any).themes)) mediaThemes = (mediaItem as any).themes;

            mediaThemes.forEach(themeId => {
                if (topThemeIdsSet.has(themeId)) {
                    const themeName = themeMap.get(themeId);
                    if (themeName) {
                        monthlyCounts[yearMonth][themeName] = (monthlyCounts[yearMonth][themeName] || 0) + 1;
                    }
                }
            });
        } catch (e) {
            console.warn(`[VisualisationsPage] Could not parse date for media item ${mediaItem.id}: ${mediaItem['Created At']}`, e);
        }
    });

    // Convert to array format and sort by date
    const timelineData: TimelineDataPoint[] = Object.entries(monthlyCounts)
        .map(([date, themeCounts]) => ({ date, ...themeCounts }))
        .sort((a, b) => a.date.localeCompare(b.date));
        
    console.log(`[VisualisationsPage] Processed Timeline Data Points for Top ${topThemeNames.length} themes:`, timelineData.length);
    return { timelineData, topThemeNames };

  }, [themes, media, themeFrequencies, loading, error]);

  // Get top 5 themes by frequency (for buttons - use processed network data)
  const topThemesForButtons = useMemo(() => {
    return [...themeNetworkData.nodes]
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5); // Get top 5
  }, [themeNetworkData.nodes]);

  return (
    <Container maxW="container.xl" py={12}> {/* Wider container */}
      <Heading as="h1" size="2xl" mb={4}>Visualisations</Heading>
      <Text fontSize="lg" color="gray.600" mb={8}>
        Explore interactive charts and dashboards based on the Empathy Ledger data. Each section below represents a recommended visualisation from the project analysis.
      </Text>

      {loading ? (
        <Spinner />
      ) : error ? (
        <Alert status="error">
          <AlertIcon />
          Error loading data: {error}
        </Alert>
      ) : (
        <Tabs isLazy variant="soft-rounded" colorScheme="blue"> {/* Use Tabs */}
          <TabList mb="1em">
            <Tab>Thematic Analysis</Tab>
            <Tab>Geographic Visualisations</Tab>
            <Tab>Relationship Visualisations</Tab>
            <Tab>Temporal Visualisations</Tab>
            <Tab>Text Analysis</Tab>
            <Tab>Dashboards</Tab>
          </TabList>
          <TabPanels>
            {/* 1. Thematic Analysis Panel */}
            <TabPanel>
              <VStack spacing={8} align="stretch"> {/* Increased spacing */}
                <Heading as="h2" size="lg" mb={2}>Thematic Analysis</Heading>
                <Text mb={4}>Explore how themes connect, cluster, and appear across stories, projects, and locations.</Text>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Theme Network Graph</Heading>
                  {topThemesForButtons.length > 0 && (
                      <Box mb={4}>
                          <Text fontSize="sm" fontWeight="medium" mb={2}>Focus on Top Themes:</Text>
                          <HStack spacing={2} wrap="wrap">
                              {topThemesForButtons.map(theme => (
                                  <Button 
                                      key={theme.id} 
                                      size="xs" 
                                      variant={focusedNodeId === theme.id ? "solid" : "outline"}
                                      colorScheme="blue"
                                      onClick={() => setFocusedNodeId(theme.id)}
                                  >
                                      {theme.name}
                                  </Button>
                              ))}
                               {focusedNodeId && (
                                   <Button size="xs" variant="ghost" onClick={() => setFocusedNodeId(null)} title="Clear focus">Clear</Button>
                               )}
                          </HStack>
                      </Box>
                  )}
                  <Text mb={3}>Interactive network showing themes (nodes) and their co-occurrence in stories/media (links). Node size indicates frequency, link thickness indicates co-occurrence strength.</Text>
                  <Text fontSize="sm" color="gray.500" mb={3}>Data processed: {themeNetworkData.nodes.length} themes, {themeNetworkData.links.length} connections.</Text>
                  {themeNetworkData.nodes.length > 0 ? (
                    <ThemeNetworkGraph 
                        data={themeNetworkData} 
                        width={800} 
                        height={500} 
                        focusedNodeId={focusedNodeId}
                    />
                  ) : (
                    <Text>No theme connection data available to display the graph.</Text>
                  )}
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Top Themes by Project</Heading>
                  <Text mb={3}>Frequency of the top themes within each project. Shows how prevalent key themes are across different project contexts.</Text>
                  <Text fontSize="sm" color="gray.500" mb={3}>Themes shown: {themeProjectBarData.length > 0 ? (new Set(themeProjectBarData.map(d=>d.themeName))).size : 0}</Text>
                  {themeProjectBarData.length > 0 ? (
                    <ThemeProjectBarChart data={themeProjectBarData} />
                  ) : (
                    <Text>No data available for themes vs projects bar chart.</Text>
                  )}
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Theme WordCloud with Context</Heading>
                  <Text mb={3}>Word cloud representation of themes, sized by frequency.</Text>
                  <Text fontSize="sm" color="gray.500" mb={3}>Themes processed: {wordCloudData.length}</Text>
                  {wordCloudData.length > 0 ? (
                     <ThemeWordCloud words={wordCloudData} width={800} height={400} />
                  ) : (
                    <Text>No theme frequency data available for word cloud.</Text>
                  )}
                </Box>
              </VStack>
            </TabPanel>

            {/* 2. Geographic Panel */}
            <TabPanel>
               <VStack spacing={6} align="stretch">
                  <Heading as="h2" size="lg" mb={2}>Geographic Visualisations</Heading>
                  <Text mb={4}>See how stories and themes are distributed across places and journeys.</Text>
                  <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                    <Heading as="h3" size="md" mb={3}>Interactive Story Map</Heading>
                    <Text mb={3}>Map of storyteller locations, with details and themes by place.</Text>
                    <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                      <Text color="gray.500">[Interactive Story Map Placeholder]</Text>
                    </Box>
                  </Box>
                  <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                    <Heading as="h3" size="md" mb={3}>Thematic Heat Map</Heading>
                    <Text mb={3}>Geographic heatmap showing concentration of themes by region.</Text>
                    <Box h="300px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                      <Text color="gray.500">[Thematic Heat Map Placeholder]</Text>
                    </Box>
                  </Box>
                  <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                    <Heading as="h3" size="md" mb={3}>Storyteller Journey Map</Heading>
                    <Text mb={3}>Visualise movement and theme evolution for storytellers with multiple locations.</Text>
                    <Box h="300px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                      <Text color="gray.500">[Storyteller Journey Map Placeholder]</Text>
                    </Box>
                  </Box>
               </VStack>
            </TabPanel>

            {/* 3. Relationship Panel */}
            <TabPanel>
               <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg" mb={2}>Relationship Visualisations</Heading>
                <Text mb={4}>Understand how roles, themes, organisations, and projects interconnect.</Text>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Role-Theme Sankey Diagram</Heading>
                  <Text mb={3}>Flows from roles to themes, showing strength of association.</Text>
                  <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Role-Theme Sankey Diagram Placeholder]</Text>
                  </Box>
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Organisation Network</Heading>
                  <Text mb={3}>Network of organisations and storytellers, clustered by shared themes or projects.</Text>
                  <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Organisation Network Placeholder]</Text>
                  </Box>
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Multi-dimensional Chord Diagram</Heading>
                  <Text mb={3}>Chord diagram connecting projects, themes, locations, and roles.</Text>
                  <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Chord Diagram Placeholder]</Text>
                  </Box>
                </Box>
              </VStack>
            </TabPanel>
            
            {/* 4. Temporal Panel */}
             <TabPanel>
               <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg" mb={2}>Temporal Visualisations</Heading>
                <Text mb={4}>Track how themes and participation change over time.</Text>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Theme Evolution Timeline</Heading>
                  <Text mb={3}>Monthly frequency of the top themes over time, based on Media creation dates.</Text>
                  <Text fontSize="sm" color="gray.500" mb={3}>Data points processed: {themeTimelineData.timelineData.length}</Text>
                  {themeTimelineData.timelineData.length > 0 ? (
                      <ThemeTimelineChart 
                          data={themeTimelineData.timelineData} 
                          themes={themeTimelineData.topThemeNames} 
                      />
                  ) : (
                      <Text>No data available for theme timeline.</Text>
                  )}
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Storyteller Participation Flow</Heading>
                  <Text mb={3}>Visualise when storytellers joined projects and how themes cluster over time.</Text>
                  <Box h="300px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Participation Flow Placeholder]</Text>
                  </Box>
                </Box>
              </VStack>
            </TabPanel>

            {/* 5. Text Analysis Panel */}
            <TabPanel>
               <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg" mb={2}>Text Analysis Visualisations</Heading>
                <Text mb={4}>Dive into the words, sentiment, and language patterns of storytellers.</Text>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Interactive Quote Explorer</Heading>
                  <Text mb={3}>Browse and filter quotes by theme, sentiment, and other dimensions.</Text>
                  {quotes.length > 0 ? (
                    <QuoteExplorer quotes={quotes} themes={themes} storytellers={storytellers} />
                  ) : (
                    <Text>No quotes loaded to explore.</Text>
                  )}
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Sentiment Analysis Dashboard</Heading>
                  <Text mb={3}>Visualise emotional tone across themes, projects, and locations.</Text>
                  <Box h="300px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Sentiment Dashboard Placeholder]</Text>
                  </Box>
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Linguistic Pattern Visualisation</Heading>
                  <Text mb={3}>Explore common language, metaphors, and imagery in transcripts.</Text>
                  <Box h="300px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Linguistic Pattern Visualisation Placeholder]</Text>
                  </Box>
                </Box>
              </VStack>
            </TabPanel>

            {/* 6. Dashboards Panel */}
            <TabPanel>
              <VStack spacing={6} align="stretch">
                <Heading as="h2" size="lg" mb={2}>Interactive Dashboards</Heading>
                <Text mb={4}>Integrated dashboards for different audiences and use cases.</Text>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Public Engagement Dashboard</Heading>
                  <Text mb={3}>Simple, mobile-friendly dashboard for public exploration.</Text>
                  <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Public Dashboard Placeholder]</Text>
                  </Box>
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Practitioner Analysis Dashboard</Heading>
                  <Text mb={3}>Advanced tools for thematic analysis and reporting.</Text>
                  <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Practitioner Dashboard Placeholder]</Text>
                  </Box>
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Storyteller Feedback Dashboard</Heading>
                  <Text mb={3}>Personal story visualisations and community connections.</Text>
                  <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Storyteller Feedback Placeholder]</Text>
                  </Box>
                </Box>
                <Box p={5} bg={placeholderBg} borderRadius="md" shadow="sm">
                  <Heading as="h3" size="md" mb={3}>Integrated Multi-view Dashboard</Heading>
                  <Text mb={3}>Coordinated views and filters across all visualisation types.</Text>
                  <Box h="400px" bg="gray.200" borderRadius="md" display="flex" alignItems="center" justifyContent="center">
                    <Text color="gray.500">[Integrated Dashboard Placeholder]</Text>
                  </Box>
                </Box>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </Container>
  );
};

export default VisualisationsPage; 