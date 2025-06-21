import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Image,
  VStack,
  HStack,
  Text,
  IconButton,
  Flex,
  Badge,
  Spinner,
  useColorModeValue,
  Kbd,
  Tooltip,
  useBreakpointValue,
} from '@chakra-ui/react';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
  DownloadIcon,
  ShareIcon,
  ZoomInIcon,
  ZoomOutIcon,
  InfoIcon,
} from '@primer/octicons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import ImageWithFallback from '../ImageWithFallback';
import { GalleryImage } from './MasonryGallery';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: GalleryImage[];
  initialIndex?: number;
  showInfo?: boolean;
  enableZoom?: boolean;
  enableDownload?: boolean;
  enableShare?: boolean;
}

const MotionBox = motion(Box);

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
  showInfo = true,
  enableZoom = true,
  enableDownload = true,
  enableShare = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const bgColor = useColorModeValue('white', 'gray.900');
  const overlayBg = useColorModeValue('blackAlpha.800', 'blackAlpha.900');
  const controlsBg = useColorModeValue('whiteAlpha.900', 'blackAlpha.700');
  const isMobile = useBreakpointValue({ base: true, md: false });

  const currentImage = images[currentIndex];

  // Update current index when initial index changes
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Auto-hide controls
  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    setShowControls(true);
    
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  }, [controlsTimeout]);

  useEffect(() => {
    if (isOpen && !isMobile) {
      resetControlsTimeout();
    }
    
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [isOpen, isMobile, resetControlsTimeout]);

  // Navigation functions
  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
    resetControlsTimeout();
  }, [images.length, resetControlsTimeout]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1);
    resetControlsTimeout();
  }, [images.length, resetControlsTimeout]);

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 3));
    resetControlsTimeout();
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
    resetControlsTimeout();
  };

  const handleDownload = () => {
    window.open(currentImage.url, '_blank');
  };

  const handleShare = async () => {
    if (navigator.share && currentImage) {
      try {
        await navigator.share({
          title: currentImage.title || 'Image',
          text: currentImage.description,
          url: currentImage.url,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    }
  };

  // Keyboard shortcuts
  useHotkeys('left', goToPrevious, { enabled: isOpen }, [goToPrevious]);
  useHotkeys('right', goToNext, { enabled: isOpen }, [goToNext]);
  useHotkeys('esc', onClose, { enabled: isOpen }, [onClose]);
  useHotkeys('=,+', handleZoomIn, { enabled: isOpen && enableZoom }, [handleZoomIn]);
  useHotkeys('-,_', handleZoomOut, { enabled: isOpen && enableZoom }, [handleZoomOut]);

  if (!currentImage) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      motionPreset="none"
      blockScrollOnMount={true}
    >
      <ModalOverlay bg={overlayBg} />
      <ModalContent
        bg="transparent"
        boxShadow="none"
        m={0}
        p={0}
        maxW="100vw"
        maxH="100vh"
      >
        <ModalBody
          p={0}
          position="relative"
          height="100vh"
          width="100vw"
          display="flex"
          alignItems="center"
          justifyContent="center"
          onMouseMove={resetControlsTimeout}
        >
          {/* Loading spinner */}
          {isLoading && (
            <Spinner
              size="xl"
              color="white"
              position="absolute"
              zIndex={1}
            />
          )}

          {/* Main image */}
          <AnimatePresence mode="wait">
            <MotionBox
              key={currentImage.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: zoom }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              cursor={zoom > 1 ? 'move' : 'default'}
              position="relative"
            >
              <ImageWithFallback
                src={currentImage.url}
                alt={currentImage.title || ''}
                maxH="90vh"
                maxW="90vw"
                objectFit="contain"
                onLoad={() => setIsLoading(false)}
                onLoadStart={() => setIsLoading(true)}
                draggable={false}
              />
            </MotionBox>
          </AnimatePresence>

          {/* Navigation arrows */}
          <AnimatePresence>
            {showControls && images.length > 1 && (
              <>
                <MotionBox
                  position="absolute"
                  left={4}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <IconButton
                    aria-label="Previous image"
                    icon={<ChevronLeftIcon size={24} />}
                    onClick={goToPrevious}
                    size="lg"
                    variant="ghost"
                    color="white"
                    bg={controlsBg}
                    _hover={{ bg: 'whiteAlpha.300' }}
                  />
                </MotionBox>

                <MotionBox
                  position="absolute"
                  right={4}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <IconButton
                    aria-label="Next image"
                    icon={<ChevronRightIcon size={24} />}
                    onClick={goToNext}
                    size="lg"
                    variant="ghost"
                    color="white"
                    bg={controlsBg}
                    _hover={{ bg: 'whiteAlpha.300' }}
                  />
                </MotionBox>
              </>
            )}
          </AnimatePresence>

          {/* Top controls */}
          <AnimatePresence>
            {showControls && (
              <MotionBox
                position="absolute"
                top={4}
                right={4}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HStack spacing={2}>
                  {enableZoom && (
                    <>
                      <IconButton
                        aria-label="Zoom in"
                        icon={<ZoomInIcon />}
                        onClick={handleZoomIn}
                        size="sm"
                        variant="ghost"
                        color="white"
                        bg={controlsBg}
                        _hover={{ bg: 'whiteAlpha.300' }}
                        isDisabled={zoom >= 3}
                      />
                      <IconButton
                        aria-label="Zoom out"
                        icon={<ZoomOutIcon />}
                        onClick={handleZoomOut}
                        size="sm"
                        variant="ghost"
                        color="white"
                        bg={controlsBg}
                        _hover={{ bg: 'whiteAlpha.300' }}
                        isDisabled={zoom <= 0.5}
                      />
                    </>
                  )}
                  {enableShare && navigator.share && (
                    <IconButton
                      aria-label="Share"
                      icon={<ShareIcon />}
                      onClick={handleShare}
                      size="sm"
                      variant="ghost"
                      color="white"
                      bg={controlsBg}
                      _hover={{ bg: 'whiteAlpha.300' }}
                    />
                  )}
                  {enableDownload && (
                    <IconButton
                      aria-label="Download"
                      icon={<DownloadIcon />}
                      onClick={handleDownload}
                      size="sm"
                      variant="ghost"
                      color="white"
                      bg={controlsBg}
                      _hover={{ bg: 'whiteAlpha.300' }}
                    />
                  )}
                  <IconButton
                    aria-label="Close"
                    icon={<XIcon />}
                    onClick={onClose}
                    size="sm"
                    variant="ghost"
                    color="white"
                    bg={controlsBg}
                    _hover={{ bg: 'whiteAlpha.300' }}
                  />
                </HStack>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Bottom info */}
          <AnimatePresence>
            {showControls && showInfo && (currentImage.title || currentImage.description) && (
              <MotionBox
                position="absolute"
                bottom={4}
                left={4}
                right={4}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Box
                  bg={controlsBg}
                  p={4}
                  borderRadius="lg"
                  maxW="600px"
                  mx="auto"
                >
                  <VStack align="start" spacing={2}>
                    {currentImage.title && (
                      <Text color="white" fontWeight="semibold" fontSize="lg">
                        {currentImage.title}
                      </Text>
                    )}
                    {currentImage.description && (
                      <Text color="whiteAlpha.800" fontSize="sm">
                        {currentImage.description}
                      </Text>
                    )}
                    <HStack spacing={4} fontSize="sm" color="whiteAlpha.600">
                      {currentImage.author && (
                        <Text>by {currentImage.author}</Text>
                      )}
                      {currentImage.date && (
                        <Text>{new Date(currentImage.date).toLocaleDateString()}</Text>
                      )}
                      {images.length > 1 && (
                        <Text>
                          {currentIndex + 1} of {images.length}
                        </Text>
                      )}
                    </HStack>
                    {currentImage.tags && currentImage.tags.length > 0 && (
                      <HStack spacing={2} flexWrap="wrap">
                        {currentImage.tags.map((tag, i) => (
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
                </Box>
              </MotionBox>
            )}
          </AnimatePresence>

          {/* Keyboard shortcuts hint */}
          {!isMobile && showControls && (
            <Box
              position="absolute"
              bottom={4}
              right={4}
              color="whiteAlpha.600"
              fontSize="xs"
            >
              <HStack spacing={4}>
                <HStack spacing={1}>
                  <Kbd>←</Kbd>
                  <Kbd>→</Kbd>
                  <Text>Navigate</Text>
                </HStack>
                {enableZoom && (
                  <HStack spacing={1}>
                    <Kbd>+</Kbd>
                    <Kbd>-</Kbd>
                    <Text>Zoom</Text>
                  </HStack>
                )}
                <HStack spacing={1}>
                  <Kbd>ESC</Kbd>
                  <Text>Close</Text>
                </HStack>
              </HStack>
            </Box>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default Lightbox;