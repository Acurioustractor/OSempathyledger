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
  Grid,
  GridItem,
  AspectRatio,
  Link,
  Tag,
  TagLabel,
  Divider,
  Button,
  useToast,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExternalLinkIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { Story } from '../services/airtable';
import useStoriesData from '../hooks/useStoriesData';

const StoryDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const { stories, storytellers, themes, isLoading, error } = useStoriesData();
  const [story, setStory] = useState<Story | null>(null);
  
  useEffect(() => {
    if (stories.length && id) {
      const foundStory = stories.find(s => s.id === id);
      if (foundStory) {
        setStory(foundStory);
      } else {
        toast({
          title: 'Story not found',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        navigate('/stories');
      }
    }
  }, [stories, id, navigate, toast]);

  const getStorytellers = () => {
    if (!story?.Storyteller_id) return [];
    const ids = Array.isArray(story.Storyteller_id) ? story.Storyteller_id : [story.Storyteller_id];
    return ids
      .map(id => storytellers.find(s => s.id === id))
      .filter(s => s)
      .map(s => ({
        id: s!.id,
        name: s!.Name || 'Unknown',
        image: s!['Profile Image']?.[0]?.url
      }));
  };

  const getThemes = () => {
    if (!story?.Themes) return [];
    const themeIds = Array.isArray(story.Themes) ? story.Themes : [story.Themes];
    return themeIds
      .map(id => themes.find(t => t.id === id))
      .filter(t => t)
      .map(t => ({
        id: t!.id,
        name: t!.Name || 'Unnamed Theme'
      }));
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={5}>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={5}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!story) {
    return (
      <Container maxW="container.xl" py={5}>
        <Alert status="info">
          <AlertIcon />
          Story not found
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={5}>
      <Button
        leftIcon={<ArrowBackIcon />}
        onClick={() => navigate('/stories')}
        mb={5}
      >
        Back to Stories
      </Button>

      <Grid templateColumns="repeat(12, 1fr)" gap={6}>
        {/* Main Content */}
        <GridItem colSpan={{ base: 12, md: 8 }}>
          <VStack align="stretch" spacing={6}>
            <Box>
              <Badge colorScheme={story.Status?.toLowerCase() === 'draft' ? 'orange' : 'green'} mb={2}>
                {story.Status || 'Unknown Status'}
              </Badge>
              <Heading size="xl" mb={2}>{story.Title || 'Untitled Story'}</Heading>
              <Text color="gray.600">{new Date(story.Created).toLocaleDateString()}</Text>
            </Box>

            {story['Video URL'] && (
              <Box>
                <Heading size="md" mb={4}>Video</Heading>
                <AspectRatio ratio={16/9}>
                  <iframe
                    src={story['Video URL']}
                    title="Story Video"
                    allowFullScreen
                  />
                </AspectRatio>
              </Box>
            )}

            {story.Description && (
              <Box>
                <Heading size="md" mb={4}>Description</Heading>
                <Text whiteSpace="pre-wrap">{story.Description}</Text>
              </Box>
            )}

            {story.Transcript && (
              <Box>
                <Heading size="md" mb={4}>Transcript</Heading>
                <Text whiteSpace="pre-wrap">{story.Transcript}</Text>
              </Box>
            )}
          </VStack>
        </GridItem>

        {/* Sidebar */}
        <GridItem colSpan={{ base: 12, md: 4 }}>
          <VStack align="stretch" spacing={6}>
            {/* Storytellers */}
            <Box>
              <Heading size="md" mb={4}>Storytellers</Heading>
              <VStack align="stretch">
                {getStorytellers().map(storyteller => (
                  <HStack key={storyteller.id} spacing={3}>
                    {storyteller.image && (
                      <Avatar size="md" src={storyteller.image} name={storyteller.name} />
                    )}
                    <Text fontWeight="medium">{storyteller.name}</Text>
                  </HStack>
                ))}
              </VStack>
            </Box>

            <Divider />

            {/* Location */}
            {(story.Location || story['Location (from Media)']) && (
              <Box>
                <Heading size="md" mb={4}>Location</Heading>
                <Text>{story['Location (from Media)'] || story.Location}</Text>
              </Box>
            )}

            <Divider />

            {/* Themes */}
            {getThemes().length > 0 && (
              <Box>
                <Heading size="md" mb={4}>Themes</Heading>
                <HStack spacing={2} flexWrap="wrap">
                  {getThemes().map(theme => (
                    <Tag
                      key={theme.id}
                      size="md"
                      borderRadius="full"
                      variant="subtle"
                      colorScheme="blue"
                    >
                      <TagLabel>{theme.name}</TagLabel>
                    </Tag>
                  ))}
                </HStack>
              </Box>
            )}

            {/* Links */}
            {(story['Video URL'] || story['Audio URL']) && (
              <>
                <Divider />
                <Box>
                  <Heading size="md" mb={4}>Media Links</Heading>
                  <VStack align="stretch" spacing={2}>
                    {story['Video URL'] && (
                      <Link href={story['Video URL']} isExternal>
                        Video Link <ExternalLinkIcon mx="2px" />
                      </Link>
                    )}
                    {story['Audio URL'] && (
                      <Link href={story['Audio URL']} isExternal>
                        Audio Link <ExternalLinkIcon mx="2px" />
                      </Link>
                    )}
                  </VStack>
                </Box>
              </>
            )}
          </VStack>
        </GridItem>
      </Grid>
    </Container>
  );
};

export default StoryDetailPage; 