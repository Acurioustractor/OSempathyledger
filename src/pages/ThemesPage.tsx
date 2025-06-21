import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Wrap,
  WrapItem,
  Tag,
  useColorModeValue,
  Tooltip,
} from '@chakra-ui/react';
import { fetchThemes, fetchStories } from '../services/airtable';
import { Theme, Story } from '../types';
import { useNavigate } from 'react-router-dom';

const ThemesPage: React.FC = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const tagColorScheme = 'orange';

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [themesData, storiesData] = await Promise.all([
          fetchThemes(),
          fetchStories(),
        ]);
        setThemes(themesData);
        setStories(storiesData);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const themeCounts = useMemo(() => {
    const counts = new Map<string, number>();
    stories.forEach(story => {
      story.Themes?.forEach(themeId => {
        counts.set(themeId, (counts.get(themeId) || 0) + 1);
      });
    });
    return counts;
  }, [stories]);
  
  const maxCount = useMemo(() => Math.max(0, ...Array.from(themeCounts.values())), [themeCounts]);

  const getTagSize = (count: number) => {
    if (maxCount === 0) return 'md';
    const ratio = count / maxCount;
    if (ratio > 0.7) return 'lg';
    if (ratio > 0.3) return 'md';
    return 'sm';
  };

  if (loading) {
    return (
      <Container maxW="container.lg" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading Themes...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.lg" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.lg" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading>Explore by Theme</Heading>
            <Text mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
              Click a theme to discover related stories. The size of the theme reflects its popularity.
            </Text>
          </Box>
          <Box p={8} bg={useColorModeValue('white', 'gray.800')} borderRadius="lg" shadow="md">
            <Wrap spacing={4} justify="center">
              {themes
                .sort((a, b) => (themeCounts.get(b.id) || 0) - (themeCounts.get(a.id) || 0))
                .map(theme => {
                  const count = themeCounts.get(theme.id) || 0;
                  return (
                    <WrapItem key={theme.id}>
                      <Tooltip label={`${count} ${count === 1 ? 'story' : 'stories'}`} hasArrow>
                        <Tag
                          size={getTagSize(count)}
                          variant="solid"
                          colorScheme={tagColorScheme}
                          cursor="pointer"
                          onClick={() => navigate(`/stories?theme=${theme.id}`)}
                          transition="all 0.2s"
                          _hover={{ transform: 'scale(1.1)', shadow: 'md' }}
                        >
                          {theme['Theme Name']}
                        </Tag>
                      </Tooltip>
                    </WrapItem>
                  );
              })}
            </Wrap>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default ThemesPage;