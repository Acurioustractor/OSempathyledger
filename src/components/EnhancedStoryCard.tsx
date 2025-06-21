import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Tag,
  Avatar,
  Icon,
  Flex,
  useColorModeValue,
  AspectRatio,
  Skeleton,
  Badge,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarIcon, PeopleIcon, LocationIcon, HeartIcon } from '@primer/octicons-react';
import { format } from 'date-fns';
import AppleCard from './AppleCard';
import ImageWithFallback from './ImageWithFallback';
import OrangeSkyBadge from './OrangeSkyBadge';
import { Story, Storyteller, Theme } from '../types';

interface EnhancedStoryCardProps {
  story: Story;
  storyteller?: Storyteller;
  themes?: Theme[];
  onClick?: () => void;
  isOrangeSkyStory?: boolean;
  viewMode?: 'grid' | 'list';
}

const MotionBox = motion(Box);

const EnhancedStoryCard: React.FC<EnhancedStoryCardProps> = ({
  story,
  storyteller,
  themes = [],
  onClick,
  isOrangeSkyStory = false,
  viewMode = 'grid',
}) => {
  const titleColor = useColorModeValue('gray.800', 'white');
  const subtitleColor = useColorModeValue('gray.600', 'gray.400');
  const accentColor = useColorModeValue('orange.500', 'orange.300');
  const tagBg = useColorModeValue('orange.50', 'rgba(255, 152, 0, 0.1)');

  const imageUrl = story['Story Image']?.[0]?.url;
  const summary = story['Story copy'] || story['Story Transcript'] || '';
  const truncatedSummary = summary.length > 150 ? summary.substring(0, 150) + '...' : summary;
  const createdDate = story.Created ? format(new Date(story.Created), 'MMM d, yyyy') : '';
  const location = story['Location (from Media)']?.[0] || '';

  const storyThemes = themes.filter(theme => 
    story.Themes?.includes(theme.id)
  ).slice(0, 3);

  if (viewMode === 'list') {
    return (
      <AppleCard
        variant="interactive"
        onClick={onClick}
        hoverScale={1.01}
        p={6}
        mb={4}
      >
        <Flex gap={6} align="stretch">
          {imageUrl && (
            <Box flexShrink={0} width="200px">
              <AspectRatio ratio={4/3}>
                <Box borderRadius="12px" overflow="hidden">
                  <ImageWithFallback
                    src={imageUrl}
                    alt={story.Title}
                    objectFit="cover"
                    width="100%"
                    height="100%"
                  />
                </Box>
              </AspectRatio>
            </Box>
          )}
          
          <VStack align="start" flex="1" spacing={3}>
            <Flex justify="space-between" width="full" align="start">
              <VStack align="start" spacing={2} flex="1">
                {isOrangeSkyStory && <OrangeSkyBadge size="sm" />}
                <Heading size="md" color={titleColor} noOfLines={1}>
                  {story.Title}
                </Heading>
              </VStack>
              
              <AnimatePresence>
                <MotionBox
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon as={HeartIcon} size={20} color={accentColor} />
                </MotionBox>
              </AnimatePresence>
            </Flex>

            <Text color={subtitleColor} noOfLines={2}>
              {truncatedSummary}
            </Text>

            {storyThemes.length > 0 && (
              <Wrap spacing={2}>
                {storyThemes.map((theme) => (
                  <WrapItem key={theme.id}>
                    <Tag 
                      size="sm" 
                      bg={tagBg}
                      color={accentColor}
                      borderRadius="full"
                      px={3}
                      fontWeight="medium"
                    >
                      {theme['Theme Name']}
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            )}

            <HStack spacing={4} fontSize="sm" color={subtitleColor}>
              {storyteller && (
                <HStack spacing={2}>
                  <Avatar size="xs" name={storyteller.Name} />
                  <Text>{storyteller.Name}</Text>
                </HStack>
              )}
              {location && (
                <HStack spacing={1}>
                  <Icon as={LocationIcon} />
                  <Text>{location}</Text>
                </HStack>
              )}
              {createdDate && (
                <HStack spacing={1}>
                  <Icon as={CalendarIcon} />
                  <Text>{createdDate}</Text>
                </HStack>
              )}
            </HStack>
          </VStack>
        </Flex>
      </AppleCard>
    );
  }

  // Grid view
  return (
    <AppleCard
      variant="interactive"
      onClick={onClick}
      hoverScale={1.03}
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {imageUrl && (
        <Box position="relative" overflow="hidden" borderRadius="16px 16px 0 0" mx={-1} mt={-1}>
          <AspectRatio ratio={16/9}>
            <ImageWithFallback
              src={imageUrl}
              alt={story.Title}
              objectFit="cover"
              width="100%"
              height="100%"
            />
          </AspectRatio>
          
          {isOrangeSkyStory && (
            <Box position="absolute" top={3} left={3}>
              <OrangeSkyBadge size="sm" />
            </Box>
          )}
        </Box>
      )}
      
      <VStack align="start" p={6} spacing={4} flex="1">
        {storyteller && (
          <HStack spacing={3}>
            <Avatar 
              size="sm" 
              name={storyteller.Name}
              src={storyteller['Profile Photo']?.[0]?.url}
            />
            <Text fontSize="sm" fontWeight="medium" color={subtitleColor}>
              {storyteller.Name}
            </Text>
          </HStack>
        )}
        
        <VStack align="start" spacing={2} flex="1">
          <Heading size="md" color={titleColor} noOfLines={2}>
            {story.Title}
          </Heading>
          
          <Text color={subtitleColor} fontSize="sm" noOfLines={3}>
            {truncatedSummary}
          </Text>
        </VStack>
        
        {storyThemes.length > 0 && (
          <Wrap spacing={2}>
            {storyThemes.map((theme) => (
              <WrapItem key={theme.id}>
                <Tag 
                  size="sm" 
                  bg={tagBg}
                  color={accentColor}
                  borderRadius="full"
                  px={3}
                  fontWeight="medium"
                >
                  {theme['Theme Name']}
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}
        
        <HStack spacing={4} fontSize="xs" color={subtitleColor} pt={2}>
          {location && (
            <HStack spacing={1}>
              <Icon as={LocationIcon} />
              <Text>{location}</Text>
            </HStack>
          )}
          {createdDate && (
            <HStack spacing={1}>
              <Icon as={CalendarIcon} />
              <Text>{createdDate}</Text>
            </HStack>
          )}
        </HStack>
      </VStack>
    </AppleCard>
  );
};

export default EnhancedStoryCard;