import React, { useState, useEffect, useMemo } from 'react'
import {
  Container,
  VStack,
  HStack,
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Badge,
  useToast,
} from '@chakra-ui/react'
import { AddIcon, SearchIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons'
import { deleteRecord, Tag, AirtableError } from '../services/airtable'
import TagForm from '../components/TagForm'
import { useNavigate } from 'react-router-dom'
import useTagsData from '../hooks/useTagsData'

const TagsPage = () => {
  const [displayedTags, setDisplayedTags] = useState<Tag[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>('Tag Name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const navigate = useNavigate()
  const toast = useToast()
  
  // Form modal disclosure
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Use the standardized data fetching hook
  const fetchOptions = useMemo(() => ({ 
    sort: [{ field: sortField, direction: sortDirection }] 
  }), [sortField, sortDirection])
  
  const { 
    tags, 
    stories,
    media,
    isLoading, 
    error, 
    refetchAll: refetchTagData,
    refetchTags 
  } = useTagsData(fetchOptions)
  
  // Update displayed tags when tags from the hook change
  useEffect(() => {
    setDisplayedTags(tags)
  }, [tags])
  
  // Filter tags based on search term
  useEffect(() => {
    if (searchTerm && tags.length) {
      const filtered = tags.filter(
        tag => tag['Tag Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              tag['Description']?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setDisplayedTags(filtered)
    } else if (tags.length) {
      setDisplayedTags(tags)
    }
  }, [searchTerm, tags])
  
  // Get related stories count for a tag
  const getRelatedStoriesCount = (tagId: string) => {
    return stories.filter(story => story.Tags?.includes(tagId)).length
  }
  
  // Get related media count for a tag
  const getRelatedMediaCount = (tagId: string) => {
    return media.filter(item => item.Tags?.includes(tagId)).length
  }
  
  const handleAddTag = () => {
    setSelectedTag(null)
    onOpen()
  }
  
  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag)
    onOpen()
  }
  
  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteConfirmOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    
    try {
      await deleteRecord('Tags', deleteId)
      toast({
        title: 'Tag deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      refetchTags() // Use the targeted refetch from the hook
    } catch (error) {
      console.error('Error deleting tag:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete tag',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
    
    setIsDeleteConfirmOpen(false)
    setDeleteId(null)
  }
  
  const handleDeleteCancel = () => {
    setIsDeleteConfirmOpen(false)
    setDeleteId(null)
  }
  
  const handleTagSubmit = async (tagData: any) => {
    try {
      // The form component will handle the actual create/update operations
      onClose()
      refetchTags() // Use the targeted refetch from the hook
    } catch (error) {
      const errorMessage = error instanceof AirtableError 
        ? `Failed to ${selectedTag ? 'update' : 'create'} tag: ${error.message}`
        : `Failed to ${selectedTag ? 'update' : 'create'} tag`
        
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  
  const handleTagView = (tagId: string) => {
    navigate(`/tags/${tagId}`)
  }
  
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }
  
  // Determine sort indicator
  const sortIndicator = (field: string) => {
    if (field !== sortField) return null
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={5}>
        <Flex justify="center" align="center" h="50vh">
          <Spinner size="xl" />
        </Flex>
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={5}>
        <Alert status="error" mb={4}>
          <AlertIcon />
          Error loading tags: {error}
        </Alert>
        <Button onClick={refetchTagData} colorScheme="blue">
          Retry
        </Button>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={5}>
      {/* Page header with actions */}
      <Flex justifyContent="space-between" mb={5} flexWrap="wrap" gap={3}>
        <Heading size="lg">Tags</Heading>
        <HStack>
          <InputGroup w={{ base: 'full', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddTag}>
            Add
          </Button>
        </HStack>
      </Flex>

      {/* Tag list */}
      {displayedTags.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No tags found.
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th cursor="pointer" onClick={() => handleSort('Tag Name')}>
                  Name {sortIndicator('Tag Name')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('Description')}>
                  Description {sortIndicator('Description')}
                </Th>
                <Th>Stories</Th>
                <Th>Media</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {displayedTags.map((tag) => (
                <Tr key={tag.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">
                    <Text 
                      color="blue.600" 
                      cursor="pointer"
                      onClick={() => handleTagView(tag.id)}
                    >
                      {tag['Tag Name']}
                    </Text>
                  </Td>
                  <Td>
                    <Text noOfLines={2}>{tag.Description}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">{getRelatedStoriesCount(tag.id)}</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple">{getRelatedMediaCount(tag.id)}</Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit tag"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEditTag(tag)}
                      />
                      <IconButton
                        aria-label="Delete tag"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(tag.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedTag ? 'Edit Tag' : 'Add New Tag'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <TagForm 
              tag={selectedTag} 
              onSubmit={handleTagSubmit}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Modal isOpen={isDeleteConfirmOpen} onClose={handleDeleteCancel}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            Are you sure you want to delete this tag? This action cannot be undone.
            <Box mt={2} fontWeight="bold" color="red.500">
              Note: This will not remove the tag from associated stories or media.
            </Box>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleDeleteCancel}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default TagsPage