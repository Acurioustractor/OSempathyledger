import React from 'react';
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
  Tooltip,
  Flex,
  Spacer,
  Wrap,
  WrapItem,
  Icon,
  Image,
} from '@chakra-ui/react';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Example icon
import { EnhancedStory } from '../hooks/useStoriesData'; // Import the enhanced type
import { format } from 'date-fns';

interface StoryCardProps {
  story: EnhancedStory; // Use the EnhancedStory type
  onClick: (story: EnhancedStory) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onClick }) => {
  const createdDate = story['Created Date'] || story.createdTime;
  const formattedDate = createdDate ? format(new Date(createdDate), 'MMM d, yyyy') : 'N/A';
  const status = story.Status || 'Draft';
  const statusColorScheme = status === 'Published' ? 'green' : 'orange';

  // Access linked data directly from the EnhancedStory object
  const primaryStoryteller = story.linkedStorytellers?.[0]; // Assuming first storyteller is primary for the card
  const locationName = story['Location (from Media)'] || 'Unknown Location';
  const shift = story.ShiftDetails;
  const shiftName = shift?.Name || story.Shifts?.[0] || 'N/A';
  const stateName = shift?.State || 'N/A';

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
      {/* Optional: Add Image/Thumbnail here if desired */}
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

      <CardBody display="flex" flexDirection="column" flexGrow={1} p={4}> {/* Added padding */}
        <VStack align="start" spacing={3} flexGrow={1}> {/* Allow VStack to grow */}
          {/* Storyteller Avatar and Name */}
          {primaryStoryteller && (
            <HStack spacing={2}>
              <Avatar
                size="sm" // Slightly larger avatar
                name={primaryStoryteller.Name}
                src={primaryStoryteller['File Profile Image']?.[0]?.url || 
                     primaryStoryteller.Avatar?.[0]?.url || 
                     primaryStoryteller['Profile Photo']?.[0]?.url}
              />
              <Text fontSize="sm" fontWeight="medium">{primaryStoryteller.Name}</Text>
            </HStack>
          )}
          {!primaryStoryteller && (
             <HStack spacing={2}>
                <Avatar size="sm" /> {/* Placeholder */}
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
          {story.linkedThemes && story.linkedThemes.length > 0 && (
            <Wrap spacing={1} mt={1}>
              {story.linkedThemes.slice(0, 3).map(theme => (
                <WrapItem key={theme.id}>
                  <Tag size="sm" colorScheme="purple" variant="subtle">{theme['Theme Name'] || theme.Name}</Tag>
                </WrapItem>
              ))}
              {story.linkedThemes.length > 3 && (
                <WrapItem>
                   <Tag size="sm">...</Tag>
                </WrapItem>
              )}
            </Wrap>
          )}
        </VStack>

        <Spacer /> {/* Push status and date to the bottom */}

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

export default StoryCard; 