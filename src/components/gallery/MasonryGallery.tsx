import React, { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Image,
  AspectRatio,
  Skeleton,
  useColorModeValue,
  Text,
  VStack,
  HStack,
  IconButton,
  Fade,
  Badge,
  Flex,
} from '@chakra-ui/react';
import { motion, AnimatePresence } from 'framer-motion';
import { EyeIcon, HeartIcon, DownloadIcon } from '@primer/octicons-react';
import { useInView } from 'react-intersection-observer';
import ImageWithFallback from '../ImageWithFallback';

export interface GalleryImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
  tags?: string[];
  width?: number;
  height?: number;
  author?: string;
  date?: string;
  likes?: number;
}

interface MasonryGalleryProps {
  images: GalleryImage[];
  columns?: number;
  gap?: number;
  onImageClick?: (image: GalleryImage, index: number) => void;
  showInfo?: boolean;
  animateOnScroll?: boolean;
  enableHover?: boolean;
}

const MotionBox = motion(Box);

export const MasonryGallery: React.FC<MasonryGalleryProps> = ({
  images,
  columns = 3,
  gap = 4,
  onImageClick,
  showInfo = true,
  animateOnScroll = true,
  enableHover = true,
}) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const overlayBg = useColorModeValue('blackAlpha.700', 'blackAlpha.800');

  const handleImageLoad = useCallback((imageId: string) => {
    setLoadedImages(prev => new Set(prev).add(imageId));
  }, []);

  // Distribute images across columns
  const columnImages = useMemo(() => {
    const cols: GalleryImage[][] = Array.from({ length: columns }, () => []);
    
    images.forEach((image, index) => {
      const columnIndex = index % columns;
      cols[columnIndex].push(image);
    });
    
    return cols;
  }, [images, columns]);

  const ImageCard: React.FC<{ image: GalleryImage; index: number }> = ({ image, index }) => {
    const { ref, inView } = useInView({
      threshold: 0.1,
      triggerOnce: true,
    });

    const isLoaded = loadedImages.has(image.id);
    const isHovered = hoveredImage === image.id;

    return (
      <MotionBox
        ref={ref}
        position="relative"
        cursor={onImageClick ? 'pointer' : 'default'}
        overflow="hidden"
        borderRadius="lg"
        bg={bgColor}
        borderWidth="1px"
        borderColor={borderColor}
        initial={animateOnScroll ? { opacity: 0, y: 20 } : undefined}
        animate={animateOnScroll && inView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        whileHover={enableHover ? { scale: 1.02 } : undefined}
        onMouseEnter={() => enableHover && setHoveredImage(image.id)}
        onMouseLeave={() => enableHover && setHoveredImage(null)}
        onClick={() => onImageClick?.(image, index)}
        mb={gap}
      >
        {/* Image Skeleton */}
        {!isLoaded && (
          <Skeleton
            height={image.height ? `${image.height}px` : '300px'}
            width="100%"
          />
        )}

        {/* Image */}
        <ImageWithFallback
          src={image.thumbnailUrl || image.url}
          alt={image.title || ''}
          width="100%"
          height="auto"
          display={isLoaded ? 'block' : 'none'}
          onLoad={() => handleImageLoad(image.id)}
        />

        {/* Hover Overlay */}
        <AnimatePresence>
          {enableHover && isHovered && (
            <MotionBox
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg={overlayBg}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Flex
                height="100%"
                direction="column"
                justify="space-between"
                p={4}
              >
                {/* Top Actions */}
                <HStack justify="flex-end" spacing={2}>
                  <IconButton
                    aria-label="View"
                    icon={<EyeIcon />}
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onImageClick?.(image, index);
                    }}
                  />
                  <IconButton
                    aria-label="Like"
                    icon={<HeartIcon />}
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <IconButton
                    aria-label="Download"
                    icon={<DownloadIcon />}
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(image.url, '_blank');
                    }}
                  />
                </HStack>

                {/* Bottom Info */}
                {showInfo && (
                  <VStack align="start" spacing={2}>
                    {image.title && (
                      <Text color="white" fontWeight="semibold" noOfLines={2}>
                        {image.title}
                      </Text>
                    )}
                    {image.author && (
                      <Text color="whiteAlpha.800" fontSize="sm">
                        by {image.author}
                      </Text>
                    )}
                    {image.tags && image.tags.length > 0 && (
                      <HStack spacing={2} flexWrap="wrap">
                        {image.tags.slice(0, 3).map((tag, i) => (
                          <Badge
                            key={i}
                            size="sm"
                            colorScheme="orange"
                            variant="solid"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </HStack>
                    )}
                  </VStack>
                )}
              </Flex>
            </MotionBox>
          )}
        </AnimatePresence>

        {/* Static Info (when not hovering) */}
        {showInfo && !enableHover && (
          <Box p={3}>
            <VStack align="start" spacing={1}>
              {image.title && (
                <Text fontWeight="medium" noOfLines={1}>
                  {image.title}
                </Text>
              )}
              {image.author && (
                <Text fontSize="sm" color="gray.500">
                  {image.author}
                </Text>
              )}
            </VStack>
          </Box>
        )}
      </MotionBox>
    );
  };

  return (
    <Box>
      <Flex gap={gap} align="start">
        {columnImages.map((columnImgs, colIndex) => (
          <Box key={colIndex} flex="1">
            {columnImgs.map((image, imgIndex) => (
              <ImageCard
                key={image.id}
                image={image}
                index={colIndex * images.length + imgIndex}
              />
            ))}
          </Box>
        ))}
      </Flex>
    </Box>
  );
};

export default MasonryGallery;