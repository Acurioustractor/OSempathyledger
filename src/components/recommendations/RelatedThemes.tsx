import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, Link } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Theme } from '../../types';
import { cachedDataService } from '../../services/cachedDataService';

interface RelatedThemesProps {
  currentTheme: Theme;
}

const RelatedThemes: React.FC<RelatedThemesProps> = ({ currentTheme }) => {
  const [recommendations, setRecommendations] = useState<Theme[]>([]);

  useEffect(() => {
    const recs = cachedDataService.getThemeRecommendations(currentTheme);
    setRecommendations(recs);
  }, [currentTheme]);

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Box mt={8}>
      <Heading size="md" mb={4}>Related Themes</Heading>
      <VStack spacing={2} align="start">
        {recommendations.map(theme => (
          <Link as={RouterLink} to={`/themes/${theme.id}`} key={theme.id}>
            {theme['Theme Name']}
          </Link>
        ))}
      </VStack>
    </Box>
  );
};

export default RelatedThemes; 