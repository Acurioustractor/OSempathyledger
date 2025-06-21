/**
 * Orange Sky Section Component
 * Showcases Orange Sky stories and content on the homepage
 */

import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  VStack,
  HStack,
  Image,
  AspectRatio,
  Badge,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  Icon,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { ChevronRightIcon } from '@primer/octicons-react';
import { useOrangeSkyData } from '../hooks/useOrangeSkyData';
import { getImageUrl } from '../services/imageUtils';
import ImageWithFallback from './ImageWithFallback';

const OrangeSkySection: React.FC = () => {
  const { featuredStories, counts, loading, error } = useOrangeSkyData();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('orange.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accentColor = '#FF6B35';

  if (error) {
    return null; // Gracefully hide section on error
  }

  // Helper function to get story image
  const getStoryImage = (story: any): string | undefined => {
    if (story['Story Image'] && story['Story Image'].length > 0) {
      const imageUrl = getImageUrl(story['Story Image']);
      return imageUrl || undefined;
    }
    return undefined;
  };

  // Helper function to get story summary
  const getStorySummary = (story: any): string => {
    const content = story['Story copy'] || story['Story Transcript'] || '';
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  return (
    <Box
      bg={bgColor}
      py={{ base: 12, md: 16 }}
      position="relative"
      _before={{
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #FF6B35 0%, #FFA500 100%)',
      }}
    >
      <Container maxWidth="7xl">
        <VStack spacing={8} align="center">
          {/* Header */}
          <VStack spacing={4} textAlign="center" maxW="3xl">
            <HStack spacing={3}>
              <Box 
                w={10} 
                h={10} 
                borderRadius="full" 
                bg={accentColor} 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
              >
                <Text color="white" fontWeight="bold">OS</Text>
              </Box>
              <Heading size="xl">Orange Sky Stories</Heading>
            </HStack>
            <Text fontSize="lg" color="gray.600">
              Discover the impact of Orange Sky through the voices of volunteers, friends, and communities 
              experiencing the power of connection through mobile laundry and shower services.
            </Text>
            
            {/* Stats */}
            {!loading && (
              <HStack spacing={8} pt={2}>
                <Stat textAlign="center">
                  <StatNumber color={accentColor} fontSize="2xl">{counts.stories}</StatNumber>
                  <StatLabel>Stories</StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber color={accentColor} fontSize="2xl">{counts.storytellers}</StatNumber>
                  <StatLabel>Storytellers</StatLabel>
                </Stat>
                <Stat textAlign="center">
                  <StatNumber color={accentColor} fontSize="2xl">{counts.media}</StatNumber>
                  <StatLabel>Media Items</StatLabel>
                </Stat>
              </HStack>
            )}
          </VStack>

          {/* Featured Stories Grid */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} width="full">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <Box key={index}>
                  <Skeleton height="200px" mb={4} />
                  <SkeletonText noOfLines={3} spacing={3} />
                </Box>
              ))
            ) : (
              featuredStories.slice(0, 3).map((story) => {
                const imageUrl = getStoryImage(story);
                const excerpt = getStorySummary(story);

                return (
                  <Box
                    key={story.id}
                    bg={cardBg}
                    borderRadius="lg"
                    overflow="hidden"
                    borderWidth="1px"
                    borderColor={borderColor}
                    transition="all 0.3s"
                    _hover={{ 
                      transform: 'translateY(-4px)', 
                      shadow: 'lg',
                      borderColor: accentColor 
                    }}
                    cursor="pointer"
                    onClick={() => navigate(`/story/${story.id}`)}
                  >
                    {imageUrl && (
                      <AspectRatio ratio={16/9}>
                        <ImageWithFallback 
                          src={imageUrl} 
                          alt={story.Title}
                          objectFit="cover"
                          width="100%"
                          height="100%"
                        />
                      </AspectRatio>
                    )}
                    
                    <Box p={6}>
                      <VStack align="start" spacing={3}>
                        <Badge 
                          colorScheme="orange" 
                          px={2} 
                          py={1}
                          borderRadius="md"
                          bg={accentColor}
                          color="white"
                        >
                          Orange Sky
                        </Badge>
                        
                        <Heading size="md" noOfLines={2}>
                          {story.Title}
                        </Heading>
                        
                        <Text color="gray.600" noOfLines={3}>
                          {excerpt}
                        </Text>
                        
                        <Button
                          size="sm"
                          variant="link"
                          color={accentColor}
                          rightIcon={<ChevronRightIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/story/${story.id}`);
                          }}
                        >
                          Read Story
                        </Button>
                      </VStack>
                    </Box>
                  </Box>
                );
              })
            )}
          </SimpleGrid>

          {/* View All Button */}
          {!loading && featuredStories.length > 3 && (
            <Button
              size="lg"
              bg={accentColor}
              color="white"
              _hover={{ bg: '#E85A2C' }}
              rightIcon={<ChevronRightIcon />}
              onClick={() => navigate('/stories?orangeSky=true')}
            >
              View All Orange Sky Stories
            </Button>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default OrangeSkySection;