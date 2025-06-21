import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
} from '@chakra-ui/react';
import { useState, useEffect, useMemo } from 'react';
import { Theme, fetchThemes } from '../services/airtable';
import { Link as RouterLink } from 'react-router-dom';

const ThemePage = () => {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const themesResult = await fetchThemes();
        setThemes(themesResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load themes');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Themes
        </Heading>
        <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))" gap={6}>
          {themes.map((theme) => (
            <Card key={theme.id} as={RouterLink} to={`/themes/${theme.id}`} _hover={{ transform: 'translateY(-5px)', shadow: 'lg' }}>
              <CardBody>
                <Heading size="md">{theme['Theme Name']}</Heading>
                <Text noOfLines={3}>{theme.Description}</Text>
                {/* We could add more info like related story counts here in the future */}
              </CardBody>
            </Card>
          ))}
        </Grid>
      </VStack>
    </Container>
  );
};

export default ThemePage;