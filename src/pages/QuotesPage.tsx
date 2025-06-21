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
  Icon,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { fetchQuotes, fetchStorytellers } from '../services/airtable';
import { Quote, Storyteller } from '../types';
import QuoteCard from '../components/QuoteCard';

const QuotesPage: React.FC = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [storytellers, setStorytellers] = useState<Storyteller[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [quotesData, storytellersData] = await Promise.all([
          fetchQuotes(),
          fetchStorytellers(),
        ]);
        setQuotes(quotesData);
        setStorytellers(storytellersData);
      } catch (err) {
        setError('Failed to load data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const storytellerMap = useMemo(() => {
    return new Map(storytellers.map(s => [s.id, s]));
  }, [storytellers]);
  
  const getStorytellerForQuote = (quote: Quote): Storyteller | undefined => {
    if (!quote.Storyteller || quote.Storyteller.length === 0) return undefined;
    return storytellerMap.get(quote.Storyteller[0]);
  }

  const filteredQuotes = useMemo(() => {
    return quotes.filter(quote => {
      if (!searchTerm) return true;
      const query = searchTerm.toLowerCase();
      const storyteller = getStorytellerForQuote(quote);
      return (
        quote['Quote Text']?.toLowerCase().includes(query) ||
        quote.attribution?.toLowerCase().includes(query) ||
        storyteller?.Name?.toLowerCase().includes(query)
      );
    });
  }, [quotes, searchTerm, storytellerMap]);

  if (loading) {
    return (
      <Container maxW="container.md" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading Quotes...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.md" py={8}>
        <VStack spacing={8} align="stretch">
          <Box textAlign="center">
            <Heading>Voices from the Community</Heading>
            <Text mt={2} color={useColorModeValue('gray.600', 'gray.400')}>
              A collection of powerful quotes from our storytellers.
            </Text>
          </Box>

          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search quotes or storytellers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={useColorModeValue('white', 'gray.800')}
            />
          </InputGroup>

          {filteredQuotes.length > 0 ? (
            <VStack spacing={6}>
              {filteredQuotes.map(quote => (
                <QuoteCard
                  key={quote.id}
                  quote={quote}
                  storyteller={getStorytellerForQuote(quote)}
                />
              ))}
            </VStack>
          ) : (
            <Box textAlign="center" py={10}>
              <Text>No quotes found matching your search.</Text>
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default QuotesPage;