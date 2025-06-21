import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, Spinner, Alert, AlertIcon } from '@chakra-ui/react';
import { Theme } from '../types';
import { cachedDataService } from '../services/cachedDataService';
import RelatedThemes from '../components/recommendations/RelatedThemes';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import QuickActions from '../components/navigation/QuickActions';

const ThemeDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      try {
        const themeData = cachedDataService.getAllThemesSync().find(t => t.id === id);
        if (themeData) {
          setTheme(themeData);
        } else {
          setError('Theme not found.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load theme data.');
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container centerContent>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!theme) {
    return null;
  }

  return (
    <Box minH="100vh">
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="stretch">
          <Breadcrumbs theme={theme} />
          <Box>
            <Heading as="h1" size="2xl" mb={4}>{theme['Theme Name']}</Heading>
            <Text fontSize="xl">{theme.Description}</Text>
          </Box>

          <RelatedThemes currentTheme={theme} />

        </VStack>
      </Container>
      <QuickActions context="global" />
    </Box>
  );
};

export default ThemeDetailPage; 