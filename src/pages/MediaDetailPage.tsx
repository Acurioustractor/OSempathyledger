import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Container, Heading, Text, VStack, Spinner, Alert, AlertIcon, Image, Link } from '@chakra-ui/react';
import { Media } from '../types';
import { cachedDataService } from '../services/cachedDataService';
import { Link as RouterLink } from 'react-router-dom';
import Breadcrumbs from '../components/navigation/Breadcrumbs';
import QuickActions from '../components/navigation/QuickActions';

const MediaDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [media, setMedia] = useState<Media | null>(null);
  const [recommendations, setRecommendations] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      try {
        const mediaData = cachedDataService.getAllMediaSync().find(m => m.id === id);
        if (mediaData) {
          setMedia(mediaData);
          const recs = cachedDataService.getMediaRecommendations(mediaData);
          setRecommendations(recs);
        } else {
          setError('Media not found.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load media data.');
      }
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container centerContent>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  if (!media) {
    return null;
  }

  return (
    <Box minH="100vh">
      <Container maxW="container.lg" py={10}>
        <VStack spacing={8} align="stretch">
          <Breadcrumbs />
          <Box>
          <Heading as="h1" size="2xl" mb={4}>{media['File Name']}</Heading>
          {media.Attachments && media.Attachments.length > 0 && (
            <Image src={media.Attachments[0].url} alt={media['File Name']} />
          )}
          <Text fontSize="xl">{media.Notes}</Text>
        </Box>
        
        {recommendations.length > 0 && (
            <Box mt={8}>
                <Heading size="md" mb={4}>Related Media</Heading>
                <VStack spacing={2} align="start">
                    {recommendations.map(rec => (
                        <Link as={RouterLink} to={`/media/${rec.id}`} key={rec.id}>
                            {rec['File Name']}
                        </Link>
                    ))}
                </VStack>
            </Box>
        )}

        </VStack>
      </Container>
      <QuickActions context="gallery" />
    </Box>
  );
};

export default MediaDetailPage; 