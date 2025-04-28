import {
  Box,
  Heading,
  Text,
  Image,
  HStack,
  VStack,
  Badge,
  Card,
  CardBody,
  Flex,
  useColorModeValue,
  Tooltip
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';
import { Story, Storyteller, Theme } from '../services/airtable'; // Import types
import { getProfileImageOrFallback } from '../services/imageUtils'; // For potential fallback/image extraction
import React, { useMemo, useRef } from 'react'; // Import useMemo and useRef

interface StoryCardProps {
  story: Story;
  allStorytellers: Storyteller[];
  allThemes: Theme[];
  onClick: () => void; // Function to open the detail modal
}

const StoryCard = ({ story, allStorytellers, allThemes, onClick }: StoryCardProps) => {
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardRef = useRef<HTMLDivElement>(null); // Define useRef

  // Find the first storyteller for display
  const primaryStoryteller = useMemo(() => {
    if (!story.Storytellers || story.Storytellers.length === 0 || !allStorytellers) return null;
    return allStorytellers.find(s => s.id === story.Storytellers[0]);
  }, [story.Storytellers, allStorytellers]);

  // Get theme names
  const themeNames = useMemo(() => {
    if ((!story.Themes || story.Themes.length === 0) && (!story['Theme Links'] || story['Theme Links'].length === 0) || !allThemes) 
      return [];
    
    // Use either Themes or Theme Links field, whichever contains data
    const themeIds = story.Themes && story.Themes.length > 0 
      ? story.Themes 
      : (story['Theme Links'] || []);
    
    const themeMap = new Map(allThemes.map(t => [t.id, t['Theme Name']]));
    return themeIds.map(id => themeMap.get(id)).filter(Boolean) as string[];
  }, [story.Themes, story['Theme Links'], allThemes]);

  // Get the story image URL (prioritize 'Story Image', fallback to storyteller profile)
  const imageUrl = getProfileImageOrFallback(
    story.Title, // Fallback name
    story['Story Image'] || primaryStoryteller?.['File Profile Image'] // Use Story Image first, then storyteller
  );

  return (
    <Card 
      variant="outline" 
      size="sm"
      bg={cardBg}
      borderColor={borderColor} 
      boxShadow="sm"
      transition="all 0.2s ease-in-out"
      _hover={{ 
        shadow: 'md',
        borderColor: 'blue.300',
        transform: 'translateY(-3px)',
        bg: hoverBg
      }}
      cursor="pointer"
      onClick={onClick}
      height="100%" // Ensure cards have consistent height
      display="flex"
      flexDirection="column"
    >
      {/* Image Area */}
      <Box height="150px" borderTopRadius="md" overflow="hidden" bg="gray.100">
        <Image 
          src={imageUrl} 
          alt={`Image for ${story.Title}`} 
          objectFit="cover" 
          width="100%" 
          height="100%"
          fallback={<Box height="100%" display="flex" alignItems="center" justifyContent="center" bg="gray.200"><Text color="gray.500" fontSize="sm">No Image</Text></Box>} 
        />
      </Box>
      
      {/* Content Area */}
      <CardBody display="flex" flexDirection="column" flexGrow={1} p={3}>
        <Heading as="h3" size="xs" noOfLines={2} mb={2} flexGrow={1}>
          {story.Title}
        </Heading>

        {/* Storyteller Badge */}
        {primaryStoryteller && (
          <Tooltip label={`Storyteller: ${primaryStoryteller.Name}`} fontSize="xs">
            <Badge 
              colorScheme="pink" 
              variant="solid" 
              size="sm" 
              mb={2} 
              alignSelf="flex-start" 
              isTruncated
              maxWidth="90%"
            >
              {primaryStoryteller.Name}
            </Badge>
          </Tooltip>
        )}

        {/* Themes Badges */}
        {themeNames.length > 0 && (
          <Box mb={2}>
            <Text fontSize="2xs" fontWeight="bold" color="gray.500" mb={1} textTransform="uppercase">Themes</Text>
            <HStack spacing={1} wrap="wrap">
              {themeNames.slice(0, 3).map((name) => (
                <Tooltip key={name} label={name} fontSize="xs">
                  <Badge 
                    size="sm" colorScheme="blue" variant="subtle" 
                    px={1.5} py={0.5} borderRadius="md" 
                    isTruncated maxWidth="70px"
                  >
                    {name}
                  </Badge>
                </Tooltip>
              ))}
              {themeNames.length > 3 && (
                <Badge size="sm" colorScheme="blue" variant="outline">+{themeNames.length - 3}</Badge>
              )}
            </HStack>
          </Box>
        )}

        {/* Status Badge */}
        {story.Status && (
          <Badge 
            mt="auto" // Push to bottom
            alignSelf="flex-start" 
            colorScheme={story.Status === 'Published' ? 'green' : 'gray'} // Example coloring
            size="xs"
          >
            {story.Status}
          </Badge>
        )}
      </CardBody>
    </Card>
  );
};

export default StoryCard; 