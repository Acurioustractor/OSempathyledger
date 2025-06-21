import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Spinner,
  Alert,
  AlertIcon,
  Image,
  AspectRatio,
  Button,
  Divider,
  Wrap,
  WrapItem,
  Icon,
  useColorModeValue,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  SimpleGrid,
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  LocationIcon,
  PeopleIcon,
  TagIcon,
} from '@primer/octicons-react';
import {
  fetchRecordById,
} from '../services/airtable';
import { Story, Storyteller, Theme, Media } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [storyteller, setStoryteller] = useState<Storyteller | null>(null);
  const [themes, setThemes] = useState<Theme[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const accentColor = useColorModeValue('orange.500', 'orange.300');
  
  useEffect(() => {
    if (!id) {
      setError("No story ID provided.");
      setLoading(false);
      return;
    }
    
    const loadStoryData = async () => {
      try {
        setLoading(true);
        const storyData = await fetchRecordById<Story>('Stories', id);
        setStory(storyData);

        // Fetch linked records
        const fetchPromises = [];

        if (storyData.Storytellers && storyData.Storytellers.length > 0) {
          fetchPromises.push(
            fetchRecordById<Storyteller>('Storytellers', storyData.Storytellers[0])
              .then(setStoryteller)
          );
        }

        if (storyData.Themes && storyData.Themes.length > 0) {
          fetchPromises.push(
            Promise.all(storyData.Themes.map(themeId => fetchRecordById<Theme>('Themes', themeId)))
              .then(setThemes)
          );
        }

        if (storyData.Media && storyData.Media.length > 0) {
          fetchPromises.push(
            Promise.all(storyData.Media.map(mediaId => fetchRecordById<Media>('Media', mediaId)))
              .then(setMedia)
          );
        }

        await Promise.all(fetchPromises);

      } catch (err) {
        console.error('Error loading story:', err);
        setError('Failed to load story data. It may have been deleted or the link is incorrect.');
      } finally {
        setLoading(false);
      }
    };

    loadStoryData();
  }, [id]);

  const storyImage = story?.['Story Image']?.[0]?.url;

  if (loading) {
    return (
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8}>
          <Spinner size="xl" color={accentColor} />
          <Text>Loading story...</Text>
        </VStack>
      </Container>
    );
  }

  if (error || !story) {
    return (
      <Container maxWidth="7xl" py={8}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error || 'Story not found.'}
        </Alert>
        <Button onClick={() => navigate('/stories')} leftIcon={<ArrowLeftIcon />}>
          Back to Stories
        </Button>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxWidth="5xl" py={{ base: 6, md: 12 }}>
        <VStack spacing={8} align="stretch">
          <Breadcrumb>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/">Home</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem>
              <BreadcrumbLink as={RouterLink} to="/stories">Stories</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbItem isCurrentPage>
              <Text noOfLines={1}>{story.Title}</Text>
            </BreadcrumbItem>
          </Breadcrumb>
          
          <article>
            <VStack spacing={8} align="stretch">
              <Heading as="h1" size="2xl" fontWeight="bold">{story.Title}</Heading>
              
              {storyImage && (
                <AspectRatio ratio={16 / 9} borderRadius="lg" overflow="hidden">
                  <ImageWithFallback src={storyImage} alt={story.Title} />
                </AspectRatio>
              )}

              <HStack spacing={4} align="center">
                {storyteller && (
                   <HStack as={RouterLink} to={`/storytellers/${storyteller.id}`} spacing={3} _hover={{ textDecoration: 'underline' }}>
                    <Avatar size="md" name={storyteller.Name} src={storyteller.Avatar?.[0]?.url} />
                    <VStack align="start" spacing={0}>
                      <Text fontWeight="bold">{storyteller.Name}</Text>
                      <Text fontSize="sm" color="gray.500">Storyteller</Text>
                    </VStack>
                  </HStack>
                )}
                <HStack>
                  <Icon as={CalendarIcon} color="gray.500" />
                  <Text fontSize="sm" color="gray.500">{new Date(story.Created).toLocaleDateString()}</Text>
                </HStack>
              </HStack>

              <Divider />
              
              <Box className="story-content" lineHeight="tall" fontSize="lg">
                <Text whiteSpace="pre-wrap">{story['Story copy'] || story['Story Transcript']}</Text>
              </Box>

              {themes.length > 0 && (
                <>
                  <Divider />
                  <VStack align="start" spacing={3}>
                    <Heading size="md">Related Themes</Heading>
                    <Wrap>
                      {themes.map(theme => (
                        <WrapItem key={theme.id}>
                          <Tag as={RouterLink} to={`/themes/${theme.id}`} size="lg" colorScheme="orange">
                            {theme['Theme Name']}
                          </Tag>
                        </WrapItem>
                      ))}
                    </Wrap>
                  </VStack>
                </>
              )}

              {media.length > 0 && (
                 <>
                  <Divider />
                  <VStack align="start" spacing={3}>
                    <Heading size="md">Media Gallery</Heading>
                    <SimpleGrid columns={{ base: 2, md: 3, lg: 4 }} spacing={4} w="full">
                      {media.map(mediaItem => (
                        <AspectRatio key={mediaItem.id} ratio={1}>
                          <ImageWithFallback 
                            src={mediaItem['File attachment']?.[0].url} 
                            alt={mediaItem.Title || 'Story media'} 
                            objectFit="cover"
                            borderRadius="md"
                          />
                        </AspectRatio>
                      ))}
                    </SimpleGrid>
                  </VStack>
                </>
              )}
            </VStack>
          </article>

          <Button mt={8} onClick={() => navigate('/stories')} leftIcon={<ArrowLeftIcon />} variant="outline">
            Back to All Stories
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default StoryDetailPage;