import React from 'react';
import {
  Box,
  Text,
  VStack,
  HStack,
  Avatar,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { CommentIcon } from '@primer/octicons-react';
import { Quote, Storyteller } from '../types';

interface QuoteCardProps {
  quote: Quote;
  storyteller?: Storyteller;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote, storyteller }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'gray.300');
  const quoteColor = useColorModeValue('orange.500', 'orange.300');

  return (
    <Box
      p={6}
      bg={cardBg}
      shadow="md"
      borderRadius="lg"
      w="100%"
    >
      <VStack spacing={4} align="start">
        <Icon as={CommentIcon} boxSize={8} color={quoteColor} />
        <Text fontSize="xl" fontStyle="italic" color={textColor}>
          "{quote['Quote Text']}"
        </Text>
        <HStack w="100%" justify="flex-end" align="center">
          {storyteller && (
             <Avatar
              size="sm"
              name={storyteller.Name}
              src={storyteller.Avatar?.[0]?.url || storyteller['File Profile Image']?.[0]?.url}
              mr={2}
            />
          )}
          <Text fontWeight="bold">
            {storyteller?.Name || quote.attribution || 'Anonymous'}
          </Text>
        </HStack>
      </VStack>
    </Box>
  );
};

export default QuoteCard; 