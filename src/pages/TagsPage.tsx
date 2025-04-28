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
} from '@chakra-ui/react'
import { useState, useEffect, useRef } from 'react'
import { Tag, fetchTags, createTag, updateTag, deleteRecord, AirtableError } from '../services/airtable'
import { AddIcon, DeleteIcon, EditIcon, SearchIcon } from '@chakra-ui/icons'
import { useForm } from 'react-hook-form'

interface TagFormData {
  name: string
  description?: string
}

const TagsPage = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [deleteTagId, setDeleteTagId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { 
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen, 
    onClose: onDeleteClose 
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
  } = useForm<TagFormData>()

  useEffect(() => {
    loadTags()
  }, [])

  useEffect(() => {
    if (editingTag) {
      reset({
        name: editingTag.name,
        description: editingTag.description
      })
    } else {
      reset({
        name: '',
        description: ''
      })
    }
  }, [editingTag, reset])

  const loadTags = async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await fetchTags()
      setTags(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load tags'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTag = (data: TagFormData) => {
    setIsSubmitting(true)

    createTag({
      name: data.name,
      description: data.description
    })
      .then(newTag => {
        setTags(prev => [...prev, newTag])
        onClose()
        toast({
          title: 'Success',
          description: 'Tag created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error creating tag:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to create tag',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditTag = (data: TagFormData) => {
    if (!editingTag) return

    setIsSubmitting(true)

    updateTag(editingTag.id, {
      name: data.name,
      description: data.description
    })
      .then(updatedTag => {
        setTags(prev => 
          prev.map(tag => tag.id === updatedTag.id ? updatedTag : tag)
        )
        setEditingTag(null)
        onClose()
        toast({
          title: 'Success',
          description: 'Tag updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error updating tag:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to update tag',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleDeleteTag = () => {
    if (!deleteTagId) return

    deleteRecord('Tags', deleteTagId)
      .then(() => {
        setTags(prev => prev.filter(tag => tag.id !== deleteTagId))
        setDeleteTagId(null)
        onDeleteClose()
        toast({
          title: 'Success',
          description: 'Tag deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        })
      })
      .catch(error => {
        console.error('Error deleting tag:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to delete tag',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      })
  }

  const openAddModal = () => {
    setEditingTag(null)
    onOpen()
  }

  const openEditModal = (tag: Tag) => {
    setEditingTag(tag)
    onOpen()
  }

  const openDeleteModal = (id: string) => {
    setDeleteTagId(id)
    onDeleteOpen()
  }

  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (tag.description && tag.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Flex justify="space-between" align="center">
          <Heading size="lg">Tags</Heading>
          <Button 
            leftIcon={<AddIcon />} 
            colorScheme="blue" 
            onClick={openAddModal}
          >
            Add Tag
          </Button>
        </Flex>

        <Flex>
          <Input
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            width={{ base: 'full', md: '300px' }}
            mr={4}
          />
          <Button 
            onClick={loadTags} 
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
        ) : filteredTags.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Text>No tags found</Text>
            <Button 
              mt={4} 
              leftIcon={<AddIcon />} 
              colorScheme="blue" 
              onClick={openAddModal}
            >
              Add Tag
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
            {filteredTags.map(tag => (
              <Box
                key={tag.id}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                p={5}
                bg={cardBg}
                borderColor={borderColor}
                boxShadow="sm"
                position="relative"
                transition="all 0.2s"
                _hover={{ shadow: "md" }}
              >
                <Flex justify="space-between" align="start" mb={3}>
                  <Heading size="md" fontWeight="semibold" flex="1" mr={2}>
                    {tag.name}
                  </Heading>
                  <HStack>
                    <Tooltip label="Edit">
                      <IconButton
                        icon={<EditIcon />}
                        aria-label={`Edit ${tag.name}`}
                        size="sm"
                        onClick={() => openEditModal(tag)}
                      />
                    </Tooltip>
                    <Tooltip label="Delete">
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label={`Delete ${tag.name}`}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => openDeleteModal(tag.id)}
                      />
                    </Tooltip>
                  </HStack>
                </Flex>
                
                {tag.description && (
                  <Text noOfLines={3} color="gray.600" fontSize="sm">
                    {tag.description}
                  </Text>
                )}
                
                <Box mt={3}>
                  <Badge colorScheme="green" px={2} py={1}>
                    {tag.name}
                  </Badge>
                </Box>
              </Box>
            ))}
          </Grid>
        )}
      </VStack>

      {/* Add/Edit Tag Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <form onSubmit={handleSubmit(editingTag ? handleEditTag : handleCreateTag)}>
            <ModalHeader>{editingTag ? 'Edit Tag' : 'Add Tag'}</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <FormControl isInvalid={!!errors.name} isRequired mb={4}>
                <FormLabel>Name</FormLabel>
                <Input
                  placeholder="Tag name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: { value: 2, message: 'Minimum length should be 2 characters' }
                  })}
                />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea
                  placeholder="Tag description (optional)"
                  {...register('description')}
                  rows={4}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button 
                colorScheme="blue" 
                mr={3} 
                type="submit"
                isLoading={isSubmitting}
              >
                {editingTag ? 'Update' : 'Create'}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
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
              Delete Tag
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this tag? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteTag} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}

export default TagsPage 