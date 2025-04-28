import React from 'react';
import { Box, Heading, Text, Button, VStack, HStack, Badge } from '@chakra-ui/react';
import { Shift, Story } from '../../types';

export interface InfoWindowContentProps {
  shift: Shift;
  stories: Story[];
  onViewAllStories?: () => void;
}

/**
 * InfoWindowContent - Content displayed in the map's info window when a marker is clicked
 */
const InfoWindowContent: React.FC<InfoWindowContentProps> = ({
  shift,
  stories,
  onViewAllStories
}) => {
  // Count unique storytellers
  const uniqueStorytellers = new Set(
    stories
      .map(story => story.storytellerId || story.StoryTellerId)
      .filter(Boolean)
  );

  const storyCount = stories.length;
  const storytellerCount = uniqueStorytellers.size;

  return (
    <Box width="280px" p={2}>
      <VStack align="start" spacing={2}>
        <Heading as="h3" size="sm">{shift.Name || shift.name}</Heading>
        
        {shift.Address && (
          <Text fontSize="sm" color="gray.600">
            {shift.Address}
          </Text>
        )}
        
        <HStack mt={1}>
          <Badge colorScheme="blue">{storyCount} Stories</Badge>
          <Badge colorScheme="green">{storytellerCount} Storytellers</Badge>
        </HStack>
        
        {stories.length > 0 && (
          <Box pt={2} width="100%">
            <Heading as="h4" size="xs" mb={1}>Recent Stories</Heading>
            <VStack align="start" spacing={1} maxH="120px" overflowY="auto" width="100%">
              {stories.slice(0, 3).map(story => (
                <Box 
                  key={story.id || story.Id} 
                  p={2} 
                  bg="gray.50" 
                  borderRadius="md" 
                  width="100%"
                >
                  <Text fontSize="sm" fontWeight="bold" noOfLines={1}>
                    {story.Title || story.title}
                  </Text>
                  {story.Description && (
                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                      {story.Description}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
            
            {storyCount > 3 && onViewAllStories && (
              <Button 
                size="sm" 
                colorScheme="blue"
                variant="link"
                onClick={onViewAllStories}
                mt={2}
              >
                View all {storyCount} stories
              </Button>
            )}
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default InfoWindowContent; 