import React from 'react';
import {
  Box,
  VStack,
  Text,
  Avatar,
  useColorModeValue,
  Heading,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { Storyteller } from '../../types';

interface StorytellerCardProps {
  storyteller: Storyteller;
}

const StorytellerCard: React.FC<StorytellerCardProps> = ({ storyteller }) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      bg={cardBg}
      shadow="md"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={() => navigate(`/storytellers/${storyteller.id}`)}
      transition="all 0.2s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      p={6}
      h="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      textAlign="center"
    >
      <Avatar
        size="xl"
        name={storyteller.Name}
        src={storyteller.Avatar?.[0]?.url || storyteller['File Profile Image']?.[0]?.url}
        mb={4}
      />
      <VStack spacing={1}>
        <Heading size="md">{storyteller.Name}</Heading>
        {storyteller.Location && (
          <Text fontSize="sm" color="gray.500">{storyteller.Location}</Text>
        )}
      </VStack>
    </Box>
  );
};

export default StorytellerCard; 