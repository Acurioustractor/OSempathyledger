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
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  SimpleGrid,
  Icon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { fetchStorytellers } from '../services/airtable';
import { Storyteller } from '../types';
import StorytellerCard from '../components/StorytellerCard';

const StorytellersPage: React.FC = () => {
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchStorytellers();
        setStorytellers(data);
      } catch (err) {
        setError('Failed to load storytellers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredStorytellers = useMemo(() => {
    return storytellers.filter(storyteller => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      return (
        storyteller.Name?.toLowerCase().includes(query) ||
        storyteller.Location?.toLowerCase().includes(query)
      );
    });
  }, [storytellers, searchTerm]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading Storytellers...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }
  
  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading>Storytellers</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Meet the people behind the stories.
            </Text>
          </Box>
        
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={useColorModeValue('white', 'gray.800')}
            />
          </InputGroup>

          {filteredStorytellers.length > 0 ? (
            <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
              {filteredStorytellers.map((storyteller) => (
                <StorytellerCard key={storyteller.id} storyteller={storyteller} />
              ))}
            </SimpleGrid>
          ) : (
            <Box textAlign="center" py={10}>
              <Text>No storytellers found matching your search.</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default StorytellersPage;