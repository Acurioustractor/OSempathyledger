import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardBody,
  Heading,
  Text,
  Tag,
  VStack,
  HStack,
  Avatar,
  Flex,
  Spacer,
  Wrap,
  WrapItem,
  Icon,
  Image,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { Story, Theme, Storyteller, Shift, Media, AirtableAttachment } from '../services/airtable';

interface HomePageStoryCardProps {
  story: Story;
  allStorytellers?: Storyteller[];
  allThemes?: Theme[];
  allShifts?: Shift[];
  allMedia?: Media[];
  onClick: (story: Story) => void;
}

// Helper to safely get the first thumbnail URL (same as in StoryDetailModal)
const getThumbnailUrl = (attachments?: AirtableAttachment[]): string | undefined => {
  return attachments?.[0]?.thumbnails?.large?.url || attachments?.[0]?.url;
};

const HomePageStoryCard: React.FC<HomePageStoryCardProps> = ({ 
  story, 
  allStorytellers = [], 
  allThemes = [], 
  allShifts = [],
  allMedia = [],
  onClick 
}) => {
  // Get storyteller through all possible means
  const linkedStorytellers = useMemo(() => {
    // Step 1: Check direct storyteller links (same as in StoryDetailModal)
    if (story.Storytellers && Array.isArray(story.Storytellers) && story.Storytellers.length > 0) {
      return story.Storytellers
        .map(id => allStorytellers.find(s => s.id === id))
        .filter(Boolean) as Storyteller[];
    }
    
    // Step 2: Try to find storytellers through media (same as in enhanceStory)
    if (story.Media && Array.isArray(story.Media) && story.Media.length > 0) {
      const mediaItems = story.Media
        .map(mediaId => allMedia.find(m => m.id === mediaId))
        .filter(Boolean);
      
      const storytellerIds = new Set<string>();
      
      mediaItems.forEach(mediaItem => {
        if (mediaItem && mediaItem.Storytellers && Array.isArray(mediaItem.Storytellers)) {
          mediaItem.Storytellers.forEach(id => storytellerIds.add(id));
        }
      });
      
      if (storytellerIds.size > 0) {
        return Array.from(storytellerIds)
          .map(id => allStorytellers.find(s => s.id === id))
          .filter(Boolean) as Storyteller[];
      }
    }
    
    // Step 3: Try transcript analysis (extract name from transcript if available)
    if (story['Story Transcript']) {
      const transcript = story['Story Transcript'];
      const nameMatch = transcript.match(/([A-Z][a-z]+ [A-Z][a-z]+) - .* - /);
      if (nameMatch && nameMatch[1]) {
        const name = nameMatch[1];
        console.log(`Found name "${name}" in transcript for story "${story.Title}"`);
        
        // First try to find a storyteller with this name
        const storyteller = allStorytellers.find(s => s.Name === name);
        if (storyteller) return [storyteller];
        
        // Create a synthetic storyteller if none exists with this name
        return [{
          id: `synthetic-${story.id}`,
          Name: name
        } as Storyteller];
      }
    }
    
    // Step 4: Try to extract from title for special cases
    if (story.Title) {
      if (story.Title.includes("Freddy on Orange Sky")) {
        return [{
          id: `synthetic-${story.id}`,
          Name: "Freddy Wai"
        } as Storyteller];
      }
    }
    
    return [];
  }, [story, allStorytellers, allMedia]);
  
  const createdDate = story.Created || story.createdTime;
  const formattedDate = createdDate ? format(new Date(createdDate), 'MMM d, yyyy') : 'N/A';
  const status = story.Status || 'Draft';
  const statusColorScheme = status.toLowerCase() === 'published' ? 'green' : 'orange';
  
  // Get location information
  const locationName = story['Location (from Media)'] || 'Unknown Location';
  
  // Find related shift
  const shiftId = story.Shifts?.[0];
  const linkedShift = allShifts?.find(shift => shift?.id === shiftId);
  const shiftName = linkedShift?.Name || shiftId || 'N/A';
  const stateName = linkedShift?.State || 'N/A';
  
  // Get the primary storyteller if any exists
  const primaryStoryteller = linkedStorytellers?.[0];
  const storytellerName = primaryStoryteller?.Name || 'Storyteller Unknown';
  const storytellerAvatarUrl = getThumbnailUrl(primaryStoryteller?.['File Profile Image']);

  return (
    <Card
      variant="outline"
      overflow="hidden"
      cursor="pointer"
      onClick={() => onClick(story)}
      transition="all 0.2s ease-in-out"
      _hover={{
        transform: 'translateY(-2px)',
        boxShadow: 'md'
      }}
      h="100%" // Ensure cards fill grid height
      display="flex"
      flexDirection="column"
    >
      {/* Story Image */}
      {story['Story Image']?.[0]?.url && (
        <Box position="relative" height="140px" overflow="hidden">
          <Image 
            src={story['Story Image'][0].url} 
            alt={story.Title || 'Story Image'} 
            objectFit="cover"
            width="100%"
            height="100%"
          />
        </Box>
      )}

      <CardBody display="flex" flexDirection="column" flexGrow={1} p={4}>
        <VStack align="start" spacing={3} flexGrow={1}>
          {/* Storyteller Avatar and Name */}
          {primaryStoryteller ? (
            <HStack spacing={2}>
              <Avatar
                size="sm"
                name={storytellerName}
                src={storytellerAvatarUrl}
              />
              <Text fontSize="sm" fontWeight="medium">{storytellerName}</Text>
            </HStack>
          ) : (
            <HStack spacing={2}>
              <Avatar size="sm" />
              <Text fontSize="sm" color="gray.500">Storyteller Unknown</Text>
            </HStack>
          )}

          {/* Story Title */}
          <Heading size="sm" noOfLines={2}>{story.Title || 'Untitled Story'}</Heading>

          {/* Location */}
          <HStack spacing={1} alignItems="center">
            <Icon as={FaMapMarkerAlt} color="gray.500" boxSize={3} />
            <Text fontSize="xs" color="gray.600" noOfLines={1}>{locationName}</Text>
          </HStack>

          {/* Shift and State */}
          <HStack spacing={3}>
            <Text fontSize="xs" color="gray.600">
              <strong>Shift:</strong> {shiftName}
            </Text>
            <Text fontSize="xs" color="gray.600">
              <strong>State:</strong> {stateName}
            </Text>
          </HStack>

          {/* Themes */}
          {allThemes.length > 0 && story.Themes && (
            <Wrap spacing={1} mt={1}>
              {story.Themes
                .map(themeId => allThemes.find(theme => theme.id === themeId))
                .filter(Boolean)
                .slice(0, 3)
                .map(theme => (
                <WrapItem key={theme!.id}>
                  <Tag size="sm" colorScheme="purple" variant="subtle">
                    {theme!['Theme Name']}
                  </Tag>
                </WrapItem>
              ))}
              {story.Themes.length > 3 && (
                <WrapItem>
                  <Tag size="sm">...</Tag>
                </WrapItem>
              )}
            </Wrap>
          )}
        </VStack>

        <Spacer />

        {/* Status and Date at the bottom */}
        <Flex mt={3} alignItems="center" width="100%">
          <Tag size="sm" colorScheme={statusColorScheme} variant="solid">{status}</Tag>
          <Spacer />
          <Text fontSize="xs" color="gray.500">
            {formattedDate}
          </Text>
        </Flex>
      </CardBody>
    </Card>
  );
};

export default HomePageStoryCard; 