import React from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Icon,
  Badge,
  Wrap,
  WrapItem,
  useColorModeValue,
  AspectRatio,
  Divider,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { PeopleIcon, CalendarIcon } from '@primer/octicons-react';
import { Story } from '../../types';
import ImageWithFallback from './ImageWithFallback';

interface StoryCardProps {
  story: Story;
  getStoryImage: (story: Story) => string | undefined;
  getStorySummary: (story: Story) => string;
  getStorytellerName: (storytellerId: string) => string;
  getThemeName: (themeId: string) => string;
}

const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  getStoryImage,
  getStorySummary,
  getStorytellerName,
  getThemeName,
}) => {
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const imageUrl = getStoryImage(story);

  return (
    <Box
      bg={cardBg}
      shadow="md"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={() => navigate(`/story/${story.id}`)}
      transition="all 0.2s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      h="100%"
      display="flex"
      flexDirection="column"
    >
      {imageUrl && (
        <AspectRatio ratio={16 / 9}>
          <ImageWithFallback src={imageUrl} alt={story.Title} />
        </AspectRatio>
      )}
      <Box p={6} flex="1" display="flex" flexDirection="column">
        <VStack align="start" spacing={3} flex="1">
          {story.Themes?.length > 0 && (
            <Wrap spacing={2}>
              {story.Themes.slice(0, 3).map(themeId => (
                <WrapItem key={themeId}>
                  <Badge colorScheme="teal">{getThemeName(themeId)}</Badge>
                </WrapItem>
              ))}
            </Wrap>
          )}
          <Heading size="md" noOfLines={2}>{story.Title}</Heading>
          <Text noOfLines={3} color={useColorModeValue('gray.600', 'gray.400')}>
            {getStorySummary(story)}
          </Text>
        </VStack>
        <Divider my={4} />
        <HStack justify="space-between" color="gray.500" fontSize="sm">
          <HStack spacing={2} align="center">
            <Icon as={PeopleIcon} />
            <Text>{getStorytellerName(story.Storytellers?.[0])}</Text>
          </HStack>
          <HStack spacing={2} align="center">
            <Icon as={CalendarIcon} />
            <Text>{new Date(story.Created).toLocaleDateString()}</Text>
          </HStack>
        </HStack>
      </Box>
    </Box>
  );
};

export default StoryCard; 