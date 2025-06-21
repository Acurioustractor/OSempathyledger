import React from 'react';
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
  Tag,
} from '@chakra-ui/react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAirtableData } from '../context/AirtableDataContext';
import { Story, Storyteller, Theme, Media } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';
import YouMightAlsoLike from '../components/recommendations/YouMightAlsoLike';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import QuickActions from '../components/navigation/QuickActions';
import {
  ArrowLeftIcon,
  CalendarIcon,
  LocationIcon,
  PeopleIcon,
  TagIcon,
} from '@primer/octicons-react';

const StoryDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error: dataError } = useAirtableData();

  const story = data?.stories.find(s => s.id === id);
  const storyteller = story && data?.storytellers.find(s => s.id === story.Storytellers?.[0]);
  const themes = story && data?.themes.filter(t => story.Themes?.includes(t.id));
  const media = story && data?.media.filter(m => story.Media?.includes(m.id));

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const accentColor = useColorModeValue('orange.500', 'orange.300');
  
  if (isLoading) {
    return (
      <Container maxWidth="7xl" py={8}>
        <VStack spacing={8}>
          <Spinner size="xl" color={accentColor} />
          <Text>Loading story...</Text>
        </VStack>
      </Container>
    );
  }

  if (dataError || !story) {
    return (
      <Container maxWidth="7xl" py={8}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          {dataError?.message || 'Story not found.'}
        </Alert>
        <Button onClick={() => navigate('/stories')} leftIcon={<ArrowLeftIcon />}>
          Back to Stories
        </Button>
      </Container>
    );
  }

  const storyImage = story?.['Story Image']?.[0]?.url;

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxWidth="5xl" py={{ base: 6, md: 12 }}>
        <VStack spacing={8} align="stretch">
          <Breadcrumbs story={story} />
          
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
                   <HStack as={RouterLink} to={`/storyteller/${storyteller.id}`} spacing={3} _hover={{ textDecoration: 'underline' }}>
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

              {themes && themes.length > 0 && (
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

              {media && media.length > 0 && (
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
          
          <Divider />

          <YouMightAlsoLike currentItem={story} />

          <Button mt={8} onClick={() => navigate('/stories')} leftIcon={<ArrowLeftIcon />} variant="outline">
            Back to All Stories
          </Button>
        </VStack>
      </Container>
      <QuickActions context="story" storyId={story?.id} />
    </Box>
  );
};

export default StoryDetailPage;