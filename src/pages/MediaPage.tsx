import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Image,
  HStack,
  Select,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { fetchMedia } from '../services/airtable';
import { Media } from '../types';
import MediaCard from '../components/MediaCard';

const MediaPage: React.FC = () => {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setLoading(true);
        const mediaData = await fetchMedia();
        setMedia(mediaData);
      } catch (err) {
        setError('Failed to load media.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadMedia();
  }, []);

  const handleCardClick = (mediaItem: Media) => {
    setSelectedMedia(mediaItem);
    onOpen();
  };

  const filteredMedia = useMemo(() => {
    return media.filter(item => {
      const matchesType = selectedType ? item.Type === selectedType : true;
      const matchesSearch = searchTerm
        ? item.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.Description?.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      return matchesType && matchesSearch;
    });
  }, [media, searchTerm, selectedType]);

  const mediaTypes = useMemo(() => [...new Set(media.map(item => item.Type).filter(Boolean))], [media]);

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading Media...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading>Media Gallery</Heading>
            <Text color={useColorModeValue('gray.600', 'gray.400')}>
              Explore photos and videos from our community.
            </Text>
          </Box>

          <HStack spacing={4}>
            <InputGroup flex={1}>
              <InputLeftElement pointerEvents="none">
                <Icon as={SearchIcon} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg={useColorModeValue('white', 'gray.800')}
              />
            </InputGroup>
            <Select
              placeholder="Filter by type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              maxW="200px"
              bg={useColorModeValue('white', 'gray.800')}
            >
              {mediaTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </Select>
          </HStack>
          
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
            {filteredMedia.map((item) => (
              <MediaCard key={item.id} media={item} onClick={() => handleCardClick(item)} />
            ))}
          </SimpleGrid>

           {filteredMedia.length === 0 && !loading && (
            <Box textAlign="center" py={10}>
              <Text>No media found matching your criteria.</Text>
            </Box>
          )}

        </VStack>
      </Container>

      {/* Lightbox Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
        <ModalOverlay bg="blackAlpha.800" />
        <ModalContent bg="transparent" boxShadow="none">
          <ModalCloseButton color="white" bg="blackAlpha.500" _hover={{ bg: "blackAlpha.700" }} />
          <ModalBody p={0}>
            {selectedMedia && (
              <Image
                src={selectedMedia['File attachment']?.[0]?.url}
                alt={selectedMedia.Title || 'Media'}
                maxH="90vh"
                w="auto"
                mx="auto"
                objectFit="contain"
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default MediaPage; 