import React, { useMemo } from 'react';
import { Box, Heading, SimpleGrid } from '@chakra-ui/react';
import { Story } from '../../types';
import { dataService } from '../../services/cachedDataService';
import StoryCard from '../StoryCard';

interface YouMightAlsoLikeProps {
  currentItem: Story;
}

const YouMightAlsoLike: React.FC<YouMightAlsoLikeProps> = ({ currentItem }) => {
  const recommendedStories = useMemo(() => {
    return dataService.getRecommendations(currentItem);
  }, [currentItem]);

  if (recommendedStories.length === 0) {
    return null;
  }

  return (
    <Box mt={8}>
      <Heading size="lg" mb={4}>You Might Also Like</Heading>
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
        {recommendedStories.map(story => (
          <StoryCard key={story.id} story={story} />
        ))}
      </SimpleGrid>
    </Box>
  );
};

export default YouMightAlsoLike; 