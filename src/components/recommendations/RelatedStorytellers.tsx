import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Storyteller } from '../../types';
import { cachedDataService } from '../../services/cachedDataService';

interface RelatedStorytellersProps {
  currentStoryteller: Storyteller;
}

const RelatedStorytellers: React.FC<RelatedStorytellersProps> = ({ currentStoryteller }) => {
  const [recommendations, setRecommendations] = useState<Storyteller[]>([]);

  useEffect(() => {
    const recs = cachedDataService.getStorytellerRecommendations(currentStoryteller);
    setRecommendations(recs);
  }, [currentStoryteller]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box mt={8}>
      <Heading size="md" mb={4}>Related Storytellers</Heading>
      <VStack spacing={2} align="start">
        {recommendations.map(storyteller => (
          <Link as={RouterLink} to={`/storyteller/${storyteller.id}`} key={storyteller.id}>
            {storyteller.Name}
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default RelatedStorytellers; 