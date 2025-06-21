import React, { useEffect, useState } from 'react';
import { 
  Container, 
  Heading, 
  Text, 
  Box, 
  VStack, 
  HStack,
  Spinner, 
  Alert,
  AlertIcon,
  Code,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  useColorModeValue
} from '@chakra-ui/react';
import { fetchStories, fetchStorytellers, fetchThemes, fetchMedia } from '../services/dataService';

const DataDebugPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>({
    stories: [],
    storytellers: [],
    themes: [],
    media: []
  });

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('[DataDebug] Starting data fetch...');
        
        const [stories, storytellers, themes, media] = await Promise.all([
          fetchStories().catch(err => {
            console.error('[DataDebug] Stories error:', err);
            return [];
          }),
          fetchStorytellers().catch(err => {
            console.error('[DataDebug] Storytellers error:', err);
            return [];
          }),
          fetchThemes().catch(err => {
            console.error('[DataDebug] Themes error:', err);
            return [];
          }),
          fetchMedia().catch(err => {
            console.error('[DataDebug] Media error:', err);
            return [];
          })
        ]);

        console.log('[DataDebug] Data loaded:', {
          stories: stories.length,
          storytellers: storytellers.length,
          themes: themes.length,
          media: media.length
        });

        setData({ stories, storytellers, themes, media });
      } catch (err) {
        console.error('[DataDebug] Error loading data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8} align="center" minH="400px" justify="center">
          <Spinner size="xl" color="orange.500" />
          <Text>Loading data...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Heading size="xl">Data Debug Page</Heading>
          
          <Card bg={cardBg}>
            <CardBody>
              <Heading size="md" mb={4}>Environment Configuration</Heading>
              <Box
                as="pre"
                p={4}
                bg={useColorModeValue('gray.100', 'gray.900')}
                borderRadius="md"
                overflow="auto"
              >
                <Code>{JSON.stringify({
                  DATA_PROVIDER: import.meta.env.VITE_DATA_PROVIDER,
                  DATA_SOURCE: import.meta.env.VITE_DATA_SOURCE,
                  ENABLE_FALLBACK: import.meta.env.VITE_ENABLE_DATA_FALLBACK,
                }, null, 2)}</Code>
              </Box>
            </CardBody>
          </Card>

          {error && (
            <Alert status="error">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Card bg={cardBg}>
            <CardBody>
              <Heading size="md" mb={4}>Data Summary</Heading>
              <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                <Stat>
                  <StatLabel>Stories</StatLabel>
                  <StatNumber color="orange.500">{data.stories.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Storytellers</StatLabel>
                  <StatNumber color="orange.500">{data.storytellers.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Themes</StatLabel>
                  <StatNumber color="orange.500">{data.themes.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Media</StatLabel>
                  <StatNumber color="orange.500">{data.media.length}</StatNumber>
                </Stat>
              </SimpleGrid>
            </CardBody>
          </Card>

          {data.stories.length > 0 && (
            <Card bg={cardBg}>
              <CardBody>
                <Heading size="md" mb={4}>Sample Stories (First 2)</Heading>
                <Box
                  as="pre"
                  p={4}
                  bg={useColorModeValue('gray.100', 'gray.900')}
                  borderRadius="md"
                  overflow="auto"
                  maxH="500px"
                >
                  <Code>{JSON.stringify(data.stories.slice(0, 2), null, 2)}</Code>
                </Box>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default DataDebugPage;