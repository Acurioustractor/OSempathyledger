import React, { useState, useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Image,
  Badge,
  Button,
  IconButton,
  Flex,
  Avatar,
  AvatarGroup,
  Tooltip,
  Tag,
  TagLabel,
  useColorModeValue,
  Collapse,
  useDisclosure,
  AspectRatio,
  Icon,
  Progress,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlayIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
  CalendarIcon,
  LocationIcon,
  PeopleIcon,
  VideoIcon,
  ImageIcon,
  QuoteIcon,
} from '@primer/octicons-react';
import { Story, Storyteller, Theme, Media, Shift } from '../../services/airtable';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface EnhancedStoryCardProps {
  story: Story;
  storytellers?: Storyteller[];
  themes?: Theme[];
  media?: Media[];
  shift?: Shift;
  viewMode?: 'grid' | 'list' | 'detailed';
  onStoryClick?: (storyId: string) => void;
  onThemeClick?: (themeId: string) => void;
  onStorytellerClick?: (storytellerId: string) => void;
  showConnections?: boolean;
}

const MotionBox = motion(Box);

export const EnhancedStoryCard: React.FC<EnhancedStoryCardProps> = ({
  story,
  storytellers = [],
  themes = [],
  media = [],
  shift,
  viewMode = 'grid',
  onStoryClick,
  onThemeClick,
  onStorytellerClick,
  showConnections = true,
}) => {
  const navigate = useNavigate();
  const { isOpen: isExpanded, onToggle: toggleExpanded } = useDisclosure();
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const mutedColor = useColorModeValue('gray.500', 'gray.400');
  
  // Get related data
  const storyStorytellers = useMemo(() => 
    storytellers.filter(st => story.Storytellers?.includes(st.id)),
    [story, storytellers]
  );
  
  const storyThemes = useMemo(() => 
    themes.filter(theme => story.Themes?.includes(theme.id)),
    [story, themes]
  );
  
  const storyMedia = useMemo(() => 
    media.filter(m => story.Media?.includes(m.id)),
    [story, media]
  );
  
  const hasVideo = storyMedia.some(m => m.Type === 'video' || m.type === 'video');
  const imageCount = storyMedia.filter(m => m.Type === 'image' || m.type === 'image').length;
  const primaryImage = story['Story Image']?.[0] || storyMedia.find(m => m.Type === 'image' || m.type === 'image')?.File?.[0];
  
  // Calculate engagement score (mock data for demo)
  const engagementScore = useMemo(() => {
    const base = 60;
    const mediaBonus = storyMedia.length * 5;
    const themeBonus = storyThemes.length * 10;
    const videoBonus = hasVideo ? 20 : 0;
    return Math.min(100, base + mediaBonus + themeBonus + videoBonus);
  }, [storyMedia, storyThemes, hasVideo]);
  
  const handleCardClick = () => {
    if (onStoryClick) {
      onStoryClick(story.id);
    } else {
      navigate(`/stories/${story.id}`);
    }
  };
  
  const getThemeColor = (theme: Theme) => {
    const colors = ['orange', 'blue', 'green', 'purple', 'pink', 'teal'];
    const index = themes.indexOf(theme) % colors.length;
    return colors[index];
  };
  
  if (viewMode === 'list') {
    return (
      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        onClick={handleCardClick}
        cursor="pointer"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        borderRadius="lg"
        p={4}
        _hover={{ shadow: 'lg', borderColor: 'orangeSky.primary' }}
      >
        <HStack spacing={4} align="start">
          {primaryImage && (
            <AspectRatio ratio={16/9} w="200px">
              <Image
                src={primaryImage.url || primaryImage.thumbnails?.large?.url}
                alt={story.Title}
                objectFit="cover"
                borderRadius="md"
              />
            </AspectRatio>
          )}
          
          <VStack flex={1} align="start" spacing={2}>
            <HStack w="full" justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="lg" fontWeight="semibold">{story.Title}</Text>
                <HStack spacing={2} color={mutedColor} fontSize="sm">
                  {story.Created && (
                    <HStack spacing={1}>
                      <Icon as={CalendarIcon} />
                      <Text>{formatDistanceToNow(new Date(story.Created))} ago</Text>
                    </HStack>
                  )}
                  {shift && (
                    <HStack spacing={1}>
                      <Icon as={LocationIcon} />
                      <Text>{shift.Name || shift.Location}</Text>
                    </HStack>
                  )}
                </HStack>
              </VStack>
              
              <HStack>
                {hasVideo && <Icon as={VideoIcon} color="blue.500" />}
                {imageCount > 0 && (
                  <HStack spacing={0}>
                    <Icon as={ImageIcon} color="green.500" />
                    <Text fontSize="sm" color={mutedColor}>{imageCount}</Text>
                  </HStack>
                )}
              </HStack>
            </HStack>
            
            {story['Story copy'] && (
              <Text noOfLines={2} color={textColor}>
                {story['Story copy']}
              </Text>
            )}
            
            <HStack spacing={2} flexWrap="wrap">
              {storyThemes.slice(0, 3).map(theme => (
                <Tag
                  key={theme.id}
                  size="sm"
                  colorScheme={getThemeColor(theme)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onThemeClick?.(theme.id);
                  }}
                  cursor="pointer"
                >
                  <TagLabel>{theme['Theme Name'] || theme.Name}</TagLabel>
                </Tag>
              ))}
              {storyThemes.length > 3 && (
                <Tag size="sm" variant="outline">
                  <TagLabel>+{storyThemes.length - 3} more</TagLabel>
                </Tag>
              )}
            </HStack>
            
            {storyStorytellers.length > 0 && (
              <HStack spacing={2}>
                <AvatarGroup size="sm" max={3}>
                  {storyStorytellers.map(person => (
                    <Tooltip key={person.id} label={person.Name}>
                      <Avatar
                        name={person.Name}
                        src={person['File Profile Image']?.[0]?.url}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStorytellerClick?.(person.id);
                        }}
                        cursor="pointer"
                      />
                    </Tooltip>
                  ))}
                </AvatarGroup>
                <Text fontSize="sm" color={mutedColor}>
                  {storyStorytellers.map(p => p.Name).join(', ')}
                </Text>
              </HStack>
            )}
          </VStack>
        </HStack>
      </MotionBox>
    );
  }
  
  // Grid and detailed view
  return (
    <MotionBox
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      shadow={isHovered ? 'xl' : 'md'}
      transition="all 0.2s"
      cursor="pointer"
      onClick={handleCardClick}
    >
      {/* Media Section */}
      <Box position="relative" overflow="hidden">
        <AspectRatio ratio={16/9}>
          {primaryImage ? (
            <Image
              src={primaryImage.url || primaryImage.thumbnails?.large?.url}
              alt={story.Title}
              objectFit="cover"
            />
          ) : (
            <Box bg="gray.200" display="flex" alignItems="center" justifyContent="center">
              <Icon as={ImageIcon} boxSize={8} color="gray.400" />
            </Box>
          )}
        </AspectRatio>
        
        {/* Media indicators overlay */}
        <HStack position="absolute" top={2} right={2} spacing={2}>
          {hasVideo && (
            <Badge colorScheme="blue" variant="solid">
              <HStack spacing={1}>
                <Icon as={VideoIcon} />
                <Text>Video</Text>
              </HStack>
            </Badge>
          )}
          {imageCount > 1 && (
            <Badge colorScheme="green" variant="solid">
              <HStack spacing={1}>
                <Icon as={ImageIcon} />
                <Text>{imageCount}</Text>
              </HStack>
            </Badge>
          )}
        </HStack>
        
        {/* Play button for video */}
        {hasVideo && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            opacity={isHovered ? 1 : 0.8}
            transition="opacity 0.2s"
          >
            <IconButton
              aria-label="Play video"
              icon={<PlayIcon size={24} />}
              size="lg"
              isRound
              colorScheme="blue"
              onClick={(e) => {
                e.stopPropagation();
                // Handle video play
              }}
            />
          </Box>
        )}
      </Box>
      
      {/* Content Section */}
      <VStack align="stretch" p={4} spacing={3}>
        {/* Title and metadata */}
        <VStack align="start" spacing={1}>
          <Text fontSize="lg" fontWeight="semibold" noOfLines={2}>
            {story.Title}
          </Text>
          <HStack spacing={3} fontSize="sm" color={mutedColor}>
            {story.Created && (
              <HStack spacing={1}>
                <Icon as={CalendarIcon} boxSize={3} />
                <Text>{formatDistanceToNow(new Date(story.Created))} ago</Text>
              </HStack>
            )}
            {shift && (
              <HStack spacing={1}>
                <Icon as={LocationIcon} boxSize={3} />
                <Text noOfLines={1}>{shift.Name || shift.Location}</Text>
              </HStack>
            )}
          </HStack>
        </VStack>
        
        {/* Story excerpt */}
        {story['Story copy'] && (
          <Text 
            noOfLines={isExpanded ? undefined : 3} 
            color={textColor}
            fontSize="sm"
          >
            {story['Story copy']}
          </Text>
        )}
        
        {/* Themes */}
        {storyThemes.length > 0 && (
          <Wrap spacing={2}>
            {storyThemes.map(theme => (
              <WrapItem key={theme.id}>
                <Tag
                  size="sm"
                  colorScheme={getThemeColor(theme)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onThemeClick?.(theme.id);
                  }}
                  cursor="pointer"
                  _hover={{ opacity: 0.8 }}
                >
                  <TagLabel>{theme['Theme Name'] || theme.Name}</TagLabel>
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}
        
        {/* Storytellers */}
        {storyStorytellers.length > 0 && (
          <HStack spacing={2}>
            <Icon as={PeopleIcon} boxSize={4} color={mutedColor} />
            <AvatarGroup size="xs" max={4}>
              {storyStorytellers.map(person => (
                <Tooltip key={person.id} label={person.Name}>
                  <Avatar
                    name={person.Name}
                    src={person['File Profile Image']?.[0]?.thumbnails?.small?.url}
                    onClick={(e) => {
                      e.stopPropagation();
                      onStorytellerClick?.(person.id);
                    }}
                    cursor="pointer"
                    _hover={{ ring: 2, ringColor: 'orangeSky.primary' }}
                  />
                </Tooltip>
              ))}
            </AvatarGroup>
            <Text fontSize="xs" color={mutedColor} noOfLines={1}>
              {storyStorytellers.map(p => p.Name).join(', ')}
            </Text>
          </HStack>
        )}
        
        {/* Engagement metrics */}
        {viewMode === 'detailed' && (
          <Box>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="xs" color={mutedColor}>Engagement</Text>
              <Text fontSize="xs" fontWeight="medium">{engagementScore}%</Text>
            </HStack>
            <Progress value={engagementScore} size="xs" colorScheme="orange" />
          </Box>
        )}
        
        {/* Action buttons */}
        <HStack justify="space-between" pt={2}>
          <HStack>
            <IconButton
              aria-label="Like"
              icon={<HeartIcon />}
              size="sm"
              variant="ghost"
              color={isLiked ? 'red.500' : undefined}
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
            />
            <IconButton
              aria-label="Share"
              icon={<ShareIcon />}
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                // Handle share
              }}
            />
            <IconButton
              aria-label="Bookmark"
              icon={<BookmarkIcon />}
              size="sm"
              variant="ghost"
              color={isBookmarked ? 'blue.500' : undefined}
              onClick={(e) => {
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
            />
          </HStack>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </Button>
        </HStack>
        
        {/* Connections (when expanded) */}
        {showConnections && (
          <Collapse in={isExpanded}>
            <VStack align="stretch" pt={4} spacing={3} borderTopWidth="1px" borderColor={borderColor}>
              {/* Related quotes */}
              {story['Story copy'] && (
                <Box>
                  <HStack mb={2}>
                    <Icon as={QuoteIcon} boxSize={4} color={mutedColor} />
                    <Text fontSize="sm" fontWeight="medium">Key Quote</Text>
                  </HStack>
                  <Text fontSize="sm" fontStyle="italic" color={textColor}>
                    "{story['Story copy'].slice(0, 150)}..."
                  </Text>
                </Box>
              )}
              
              {/* Media preview */}
              {storyMedia.length > 0 && (
                <Box>
                  <Text fontSize="sm" fontWeight="medium" mb={2}>Media Gallery</Text>
                  <HStack spacing={2} overflowX="auto">
                    {storyMedia.slice(0, 4).map(item => (
                      <AspectRatio key={item.id} ratio={1} minW="60px">
                        <Image
                          src={item.File?.[0]?.thumbnails?.small?.url}
                          alt={item['File Name']}
                          objectFit="cover"
                          borderRadius="md"
                        />
                      </AspectRatio>
                    ))}
                    {storyMedia.length > 4 && (
                      <Box
                        minW="60px"
                        h="60px"
                        bg="gray.200"
                        borderRadius="md"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <Text fontSize="sm" fontWeight="medium">+{storyMedia.length - 4}</Text>
                      </Box>
                    )}
                  </HStack>
                </Box>
              )}
            </VStack>
          </Collapse>
        )}
      </VStack>
    </MotionBox>
  );
};

export default EnhancedStoryCard;