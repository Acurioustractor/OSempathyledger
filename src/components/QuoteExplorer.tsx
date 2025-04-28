import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  VStack,
  Text,
  Select,
  FormControl,
  FormLabel,
  Input,
  useColorModeValue,
  Divider,
  Tag,
  HStack,
  Icon
} from '@chakra-ui/react';
import { Quote, Theme, Storyteller } from '../services/airtable'; // Import types
import { QuoteIcon } from '@primer/octicons-react';

interface QuoteExplorerProps {
  quotes: Quote[];
  themes: Theme[];
  storytellers: Storyteller[];
}

const QuoteExplorer: React.FC<QuoteExplorerProps> = ({ quotes, themes, storytellers }) => {
  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [selectedStorytellerId, setSelectedStorytellerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');

  // Memoized maps for quick lookups
  const themeMap = useMemo(() => new Map(themes.map(t => [t.id, t['Theme Name']])), [themes]);
  const storytellerMap = useMemo(() => new Map(storytellers.map(s => [s.id, s.Name])), [storytellers]);

  // Log incoming quotes once
  useEffect(() => {
      console.log("[QuoteExplorer] Initial quotes received:", quotes.slice(0, 5));
  }, [quotes]);

  // Filter quotes based on selections
  const filteredQuotes = useMemo(() => {
    console.log(`[QuoteExplorer] Filtering with theme: '${selectedThemeId}', storyteller: '${selectedStorytellerId}', search: '${searchTerm}'`);
    const results = quotes.filter((quote, index) => {
      let keep = true;
      let reason = '';

      // Theme filter
      const themeMatch = !selectedThemeId || (quote.Theme === selectedThemeId);
      if (!themeMatch) {
          keep = false;
          reason = `Theme mismatch (Quote: ${quote.Theme}, Filter: ${selectedThemeId})`;
      }
      
      // Storyteller filter
      const storytellerMatch = !selectedStorytellerId || (quote.Storytellers && quote.Storytellers.includes(selectedStorytellerId));
      if (keep && !storytellerMatch) {
          keep = false;
          reason = `Storyteller mismatch (Quote: ${quote.Storytellers?.join(',')}, Filter: ${selectedStorytellerId})`;
      }
      
      // Search term filter
      const lowerSearchTerm = searchTerm.toLowerCase();
      const textMatch = !searchTerm || 
                        quote['Quote Text'].toLowerCase().includes(lowerSearchTerm) ||
                        (quote.attribution && quote.attribution.toLowerCase().includes(lowerSearchTerm));
       if (keep && !textMatch) {
           keep = false;
           reason = `Search term mismatch (Search: ${searchTerm})`;
       }

       // Log only the first few rejections for brevity when a filter is active
       if (!keep && index < 5 && (selectedThemeId || selectedStorytellerId || searchTerm)) {
            console.log(`[QuoteExplorer] Rejecting quote ${quote.id.substring(0,5)}...: ${reason}. Quote data:`, { text: quote['Quote Text'], theme: quote.Theme, storytellers: quote.Storytellers });
       }

      return keep;
    });
    console.log(`[QuoteExplorer] Filtered ${results.length} quotes.`);
    return results;
  }, [quotes, selectedThemeId, selectedStorytellerId, searchTerm]);

  return (
    <VStack spacing={6} align="stretch">
      {/* Filter Controls */}
      <HStack spacing={4} wrap="wrap">
        <FormControl flex={1} minW="200px">
          <FormLabel fontSize="sm">Filter by Theme:</FormLabel>
          <Select 
            placeholder="All Themes"
            value={selectedThemeId}
            onChange={(e) => setSelectedThemeId(e.target.value)}
            size="sm"
            borderRadius="md"
          >
            {themes.map(theme => (
              <option key={theme.id} value={theme.id}>{theme['Theme Name']}</option>
            ))}
          </Select>
        </FormControl>
        <FormControl flex={1} minW="200px">
          <FormLabel fontSize="sm">Filter by Storyteller:</FormLabel>
          <Select 
            placeholder="All Storytellers"
            value={selectedStorytellerId}
            onChange={(e) => setSelectedStorytellerId(e.target.value)}
            size="sm"
            borderRadius="md"
          >
            {storytellers.map(storyteller => (
              <option key={storyteller.id} value={storyteller.id}>
                {storyteller.Name}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl flex={2} minW="250px">
          <FormLabel fontSize="sm">Search Quotes:</FormLabel>
          <Input 
            placeholder="Search quote text or attribution..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="sm"
            borderRadius="md"
          />
        </FormControl>
      </HStack>
      
      <Divider />

      {/* Quote List */}
      <Text fontSize="sm" color={mutedColor}>Displaying {filteredQuotes.length > 50 ? 50 : filteredQuotes.length} of {quotes.length} quotes{filteredQuotes.length > 50 ? ' (top 50 shown)' : ''}.</Text>
      <VStack spacing={4} align="stretch">
        {filteredQuotes.length > 0 ? (
          filteredQuotes.slice(0, 50).map(quote => { // Limit initial display for performance
            const quoteThemeName = quote.Theme ? themeMap.get(quote.Theme) : null;
            const quoteStorytellers = quote.Storytellers?.map(id => storytellerMap.get(id)).filter(Boolean) || [];

            return (
              <Box 
                key={quote.id} 
                p={4} 
                borderWidth="1px" 
                borderRadius="md" 
                borderColor={borderColor}
                bg={cardBg}
                shadow="sm"
              >
                <HStack align="start" spacing={3}>
                   <Icon as={QuoteIcon} color="blue.500" mt={1} boxSize={5}/>
                   <Box>
                     <Text fontStyle="italic" mb={2} color={textColor}>"{quote['Quote Text']}"</Text>
                     {quote.attribution && <Text fontSize="sm" fontWeight="medium" color={mutedColor} mb={2}>- {quote.attribution}</Text>}
                     <HStack spacing={2} wrap="wrap">
                        {quoteThemeName && <Tag size="sm" colorScheme="purple">{quoteThemeName}</Tag>}
                        {quoteStorytellers.map(name => <Tag key={name} size="sm" colorScheme="pink">{name}</Tag>)}
                     </HStack>
                   </Box>
                </HStack>
              </Box>
            );
          })
        ) : (
          <Text textAlign="center" p={5}>No quotes match the current filters.</Text>
        )}
        {filteredQuotes.length > 50 && (
            <Text textAlign="center" fontSize="sm" color={mutedColor}>...and {filteredQuotes.length - 50} more quotes not shown.</Text>
        )}
      </VStack>
    </VStack>
  );
};

export default QuoteExplorer; 