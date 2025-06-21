import React from 'react';
import {
  Box,
  Image,
  Text,
  useColorModeValue,
  AspectRatio,
  VStack,
} from '@chakra-ui/react';
import { Media } from '../../types';
import ImageWithFallback from './ImageWithFallback';

interface MediaCardProps {
  media: Media;
  onClick: () => void;
}

const MediaCard: React.FC<MediaCardProps> = ({ media, onClick }) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={cardBg}
      shadow="md"
      borderRadius="lg"
      overflow="hidden"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{ shadow: 'xl', transform: 'translateY(-4px)' }}
    >
      <AspectRatio ratio={4 / 3}>
        <ImageWithFallback
          src={media['File attachment']?.[0]?.thumbnails?.large?.url || media['File attachment']?.[0]?.url}
          alt={media.Title || 'Media item'}
          objectFit="cover"
        />
      </AspectRatio>
      <VStack p={4} align="start" spacing={1}>
        <Text fontWeight="bold" noOfLines={1}>
          {media.Title || 'Untitled'}
        </Text>
        <Text fontSize="sm" color={textColor}>
          {media.Type}
        </Text>
      </VStack>
    </Box>
  );
};

export default MediaCard; 