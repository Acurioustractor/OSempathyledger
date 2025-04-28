import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  HStack,
  Input,
  IconButton,
  useToast,
  Flex,
  Tooltip,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  ModalFooter,
  Divider,
  useColorModeValue,
  Badge,
  Image,
  SimpleGrid,
  Checkbox,
  Stack,
  Wrap,
  WrapItem,
  Tag,
  TagCloseButton,
  TagLabel,
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { 
  Gallery, 
  Media,
  fetchGalleries, 
  fetchMedia,
  createGallery, 
  updateGallery, 
  deleteRecord
} from '../services/airtable'
import { AddIcon, DeleteIcon, EditIcon, SearchIcon, ViewIcon } from '@chakra-ui/icons'
import { useForm } from 'react-hook-form'

interface GalleryFormData {
  name: string
  description?: string
  media?: string[]
}

const GalleryPage = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([])
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMedia, setLoadingMedia] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingGallery, setEditingGallery] = useState<Gallery | null>(null)
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null)
  const [viewingGallery, setViewingGallery] = useState<Gallery | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
  } = useDisclosure()
  const { 
    isOpen: isViewOpen,
    onOpen: onViewOpen, 
    onClose: onViewClose 
  } = useDisclosure()
  
  const cancelRef = useRef<HTMLButtonElement>(null)
  const toast = useToast()
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  
  const {
    handleSubmit,
    register,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<GalleryFormData>()

  const selectedMedia = watch('media', [])

  useEffect(() => {
    loadGalleries()
    loadMedia() // Load all media for selection in forms
  }, [])

  useEffect(() => {
    if (editingGallery) {
      reset({
        name: editingGallery.name,
        description: editingGallery.description,
        media: editingGallery.media,
      })
    } else {
      reset({
        name: '',
        description: '',
        media: [],
      })
    }
  }, [editingGallery, reset])

  const loadGalleries = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchGalleries()
      setGalleries(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load galleries'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const loadMedia = async () => {
    setLoadingMedia(true)
    try {
      const result = await fetchMedia()
      setMediaItems(result)
    } catch (err) {
      console.error('Failed to load media:', err)
      toast({
        title: 'Error',
        description: 'Failed to load media items',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoadingMedia(false)
    }
  }

  const handleCreateGallery = (data: GalleryFormData) => {
    setIsSubmitting(true)

    createGallery({
      name: data.name,
      description: data.description,
      media: data.media,
    })
      .then(newGallery => {
        setGalleries(prev => [...prev, newGallery])
        onClose()
        toast({
          title: 'Success',
          description: 'Gallery created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error creating gallery:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create gallery',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditGallery = (data: GalleryFormData) => {
    if (!editingGallery) return

    setIsSubmitting(true)

    updateGallery(editingGallery.id, {
      name: data.name,
      description: data.description,
      media: data.media,
    })
      .then(updatedGallery => {
        setGalleries(prev => 
          prev.map(gallery => gallery.id === updatedGallery.id ? updatedGallery : gallery)
        )
        setEditingGallery(null)
        onClose()
        toast({
          title: 'Success',
          description: 'Gallery updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error updating gallery:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update gallery',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteGallery = () => {
    if (!deleteGalleryId) return

    deleteRecord('Galleries', deleteGalleryId)
      .then(() => {
        setGalleries(prev => prev.filter(gallery => gallery.id !== deleteGalleryId))
        setDeleteGalleryId(null)
        onDeleteClose()
        toast({
          title: 'Success',
          description: 'Gallery deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error deleting gallery:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete gallery',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const openAddModal = () => {
    setEditingGallery(null)
    onOpen()
  }

  const openEditModal = (gallery: Gallery) => {
    setEditingGallery(gallery)
    onOpen()
  }

  const openDeleteModal = (id: string) => {
    setDeleteGalleryId(id)
    onDeleteOpen()
  }

  const openViewModal = (gallery: Gallery) => {
    setViewingGallery(gallery)
    onViewOpen()
  }

  const filteredGalleries = galleries.filter(gallery => 
    (gallery['Gallery Name'] && gallery['Gallery Name'].toLowerCase().includes(searchTerm.toLowerCase())) ||
    (gallery.description && gallery.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleMediaToggle = (mediaId: string, isChecked: boolean) => {
    const currentMedia = selectedMedia || []
    
    if (isChecked) {
      setValue('media', [...currentMedia, mediaId])
    } else {
      setValue('media', currentMedia.filter(id => id !== mediaId))
    }
  }

  const removeMedia = (mediaId: string) => {
    const currentMedia = selectedMedia || []
    setValue('media', currentMedia.filter(id => id !== mediaId))
  }

  // Find media items for a gallery
  const getGalleryMedia = (galleryMediaIds: string[] = []) => {
    return mediaItems.filter(media => galleryMediaIds.includes(media.id))
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Galleries</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={openAddModal}
          >
            Add Gallery
          </Button>
        </Flex>

        <Flex>
          <Input
            placeholder="Search galleries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width={{ base: 'full', md: '300px' }}
            mr={4}
          />
          <Button 
            onClick={loadGalleries} 
            isLoading={loading}
          >
            Refresh
          </Button>
        </Flex>

        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
          </Box>
        ) : filteredGalleries.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>No galleries found</Text>
            <Button 
              mt={4} 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              onClick={openAddModal}
            >
              Add Gallery
            </Button>
          </Box>
        ) : (
          <Grid 
            templateColumns={{ 
              base: "repeat(1, 1fr)", 
              md: "repeat(2, 1fr)", 
              lg: "repeat(3, 1fr)" 
            }}
            gap={6}
          >
            {filteredGalleries.map(gallery => {
              const galleryMedia = getGalleryMedia(gallery.media)
              return (
                <Box
                  key={gallery.id}
                  borderWidth="1px"
                  borderRadius="lg"
                  overflow="hidden"
                  bg={cardBg}
                  borderColor={borderColor}
                  boxShadow="sm"
                  transition="all 0.2s"
                  _hover={{ shadow: "md" }}
                >
                  {/* Gallery Cover - Show first 4 media items or placeholder */}
                  <Box position="relative" height="200px" bg="gray.100">
                    {galleryMedia.length > 0 ? (
                      <SimpleGrid columns={2} spacing={1} height="100%">
                        {galleryMedia.slice(0, 4).map((media, index) => (
                          <Box 
                            key={media.id} 
                            height={galleryMedia.length === 1 ? "100%" : "100%"}
                            overflow="hidden"
                            position="relative"
                          >
                            <Image
                              src={media.url}
                              alt={media.title}
                              objectFit="cover"
                              height="100%"
                              width="100%"
                            />
                            {index === 3 && galleryMedia.length > 4 && (
                              <Box
                                position="absolute"
                                top={0}
                                left={0}
                                right={0}
                                bottom={0}
                                bg="blackAlpha.700"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                color="white"
                                fontWeight="bold"
                              >
                                +{galleryMedia.length - 4} more
                              </Box>
                            )}
                          </Box>
                        ))}
                      </SimpleGrid>
                    ) : (
                      <Flex 
                        height="100%" 
                        align="center" 
                        justify="center" 
                        direction="column"
                        color="gray.500"
                      >
                        <ViewIcon boxSize={8} mb={2} />
                        <Text>No media items</Text>
                      </Flex>
                    )}
                  </Box>

                  <Box p={5}>
                    <Flex justify="space-between" align="start" mb={3}>
                      <Heading size="md" fontWeight="semibold" flex="1" mr={2} noOfLines={1}>
                        {gallery['Gallery Name']}
                      </Heading>
                      <HStack>
                        <Tooltip label="View Gallery">
                          <IconButton
                            icon={<ViewIcon />}
                            aria-label={`View ${gallery['Gallery Name']}`}
                            size="sm"
                            onClick={() => openViewModal(gallery)}
                          />
                        </Tooltip>
                        <Tooltip label="Edit">
                          <IconButton
                            icon={<EditIcon />}
                            aria-label={`Edit ${gallery['Gallery Name']}`}
                            size="sm"
                            onClick={() => openEditModal(gallery)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete">
                          <IconButton
                            icon={<DeleteIcon />}
                            aria-label={`Delete ${gallery['Gallery Name']}`}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => openDeleteModal(gallery.id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Flex>
                    
                    {gallery.description && (
                      <Text noOfLines={2} color="gray.600" fontSize="sm" mb={3}>
                        {gallery.description}
                      </Text>
                    )}
                    
                    <HStack mt={2}>
                      <Badge colorScheme="purple">
                        {gallery.media?.length || 0} items
                      </Badge>
                    </HStack>
                  </Box>
                </Box>
              )
            })}
          </Grid>
        )}
      </VStack>

      {/* Add/Edit Gallery Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(editingGallery ? handleEditGallery : handleCreateGallery)}>
            <ModalHeader>{editingGallery ? 'Edit Gallery' : 'Add Gallery'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.name} isRequired mb={4}>
                <FormLabel>Gallery Name</FormLabel>
                <Input
                  placeholder="Enter gallery name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' }
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Enter gallery description (optional)"
                  {...register('description')}
                  rows={3}
                />
              </FormControl>

              <FormControl mb={4}>
                <FormLabel>Media Items</FormLabel>
                
                {selectedMedia && selectedMedia.length > 0 && (
                  <Box mb={4}>
                    <Text mb={2} fontSize="sm" fontWeight="medium">Selected media ({selectedMedia.length}):</Text>
                    <Wrap>
                      {selectedMedia.map(mediaId => {
                        const media = mediaItems.find(m => m.id === mediaId)
                        return (
                          <WrapItem key={mediaId}>
                            <Tag colorScheme="blue" size="md">
                              <TagLabel>{media?.title || mediaId}</TagLabel>
                              <TagCloseButton onClick={() => removeMedia(mediaId)} />
                            </Tag>
                          </WrapItem>
                        )
                      })}
                    </Wrap>
                  </Box>
                )}
                
                <Box borderWidth="1px" borderRadius="md" mt={4}>
                  <Box p={3} borderBottomWidth="1px">
                    <Input 
                      placeholder="Search media items..." 
                      size="sm"
                    />
                  </Box>
                  
                  <Box maxH="300px" overflowY="auto">
                    {loadingMedia ? (
                      <Flex justify="center" py={4}>
                        <Spinner size="sm" mr={2} />
                        <Text>Loading media...</Text>
                      </Flex>
                    ) : mediaItems.length === 0 ? (
                      <Box p={4} textAlign="center">
                        <Text color="gray.500">No media items available</Text>
                      </Box>
                    ) : (
                      <Stack spacing={0} divider={<Divider />}>
                        {mediaItems.map(media => (
                          <Checkbox
                            key={media.id}
                            isChecked={selectedMedia?.includes(media.id)}
                            onChange={e => handleMediaToggle(media.id, e.target.checked)}
                            p={3}
                          >
                            <HStack>
                              <Box 
                                width="40px" 
                                height="40px" 
                                borderRadius="md" 
                                overflow="hidden" 
                                mr={2}
                              >
                                {media.type === 'image' ? (
                                  <Image 
                                    src={media.url} 
                                    alt={media.title} 
                                    width="100%" 
                                    height="100%" 
                                    objectFit="cover"
                                    fallback={<Box bg="gray.100" width="100%" height="100%" />}
                                  />
                                ) : (
                                  <Flex 
                                    bg="gray.700" 
                                    width="100%" 
                                    height="100%" 
                                    align="center" 
                                    justify="center"
                                    color="white"
                                    fontSize="xs"
                                  >
                                    Video
                                  </Flex>
                                )}
                              </Box>
                              <Text noOfLines={1}>{media.title}</Text>
                            </HStack>
                          </Checkbox>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Box>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                {editingGallery ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* View Gallery Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{viewingGallery?.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {viewingGallery && (
              <VStack spacing={6} align="stretch">
                {viewingGallery.description && (
                  <Box>
                    <Text fontWeight="bold" mb={1}>Description</Text>
                    <Text>{viewingGallery.description}</Text>
                  </Box>
                )}
                
                <Divider />
                
                <Box>
                  <Heading size="sm" mb={4}>Gallery Items ({getGalleryMedia(viewingGallery.media).length})</Heading>
                  
                  {getGalleryMedia(viewingGallery.media).length === 0 ? (
                    <Box textAlign="center" py={8} bg="gray.50" borderRadius="md">
                      <Text color="gray.500">No media items in this gallery</Text>
                    </Box>
                  ) : (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                      {getGalleryMedia(viewingGallery.media).map(media => (
                        <Box
                          key={media.id}
                          borderWidth="1px"
                          borderRadius="md"
                          overflow="hidden"
                        >
                          <Box height="120px" position="relative">
                            {media.type === 'image' ? (
                              <Image
                                src={media.url}
                                alt={media.title}
                                height="100%"
                                width="100%"
                                objectFit="cover"
                                fallback={<Box bg="gray.100" height="100%" />}
                              />
                            ) : (
                              <Flex
                                bg="gray.700"
                                height="100%"
                                align="center"
                                justify="center"
                                color="white"
                              >
                                Video
                              </Flex>
                            )}
                            <Badge
                              position="absolute"
                              bottom={1}
                              right={1}
                              colorScheme={media.type === 'image' ? 'blue' : 'red'}
                            >
                              {media.type}
                            </Badge>
                          </Box>
                          <Box p={3}>
                            <Text fontWeight="medium" noOfLines={1}>
                              {media.title}
                            </Text>
                          </Box>
                        </Box>
                      ))}
                    </SimpleGrid>
                  )}
                </Box>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Gallery
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this gallery? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteGallery} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}

export default GalleryPage 