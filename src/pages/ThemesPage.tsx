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
import { deleteRecord, Theme, Media, Story, AirtableError } from '../services/airtable'
import ThemeForm from '../components/ThemeForm'
import { useNavigate } from 'react-router-dom'
import useThemesData from '../hooks/useThemesData'

const ThemesPage = () => {
  const [displayedThemes, setDisplayedThemes] = useState<Theme[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [sortField, setSortField] = useState<string>('Theme Name')
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
    themes, 
    stories,
    media,
    isLoading, 
    error, 
    refetchAll: refetchThemeData,
    refetchThemes 
  } = useThemesData(fetchOptions)
  
  // Update displayed themes when themes from the hook change
  useEffect(() => {
    setDisplayedThemes(themes)
  }, [themes])
  
  // Filter themes based on search term
  useEffect(() => {
    if (searchTerm && themes.length) {
      const filtered = themes.filter(
        theme => theme['Theme Name']?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                theme['Description']?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setDisplayedThemes(filtered)
    } else if (themes.length) {
      setDisplayedThemes(themes)
    }
  }, [searchTerm, themes])
  
  // Get related stories count for a theme
  const getRelatedStoriesCount = (themeId: string) => {
    return stories.filter(story => story.Themes?.includes(themeId)).length
  }
  
  // Get related media count for a theme
  const getRelatedMediaCount = (themeId: string) => {
    return media.filter(item => item.Themes?.includes(themeId)).length
  }
  
  const handleAddTheme = () => {
    setSelectedTheme(null)
    onOpen()
  }
  
  const handleEditTheme = (theme: Theme) => {
    setSelectedTheme(theme)
    onOpen()
  }
  
  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
    setIsDeleteConfirmOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!deleteId) return
    
    try {
      await deleteRecord('Themes', deleteId)
      toast({
        title: 'Theme deleted',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      refetchThemes() // Use the targeted refetch from the hook
    } catch (error) {
      console.error('Error deleting theme:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete theme',
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
  
  const handleThemeSubmit = async (themeData: any) => {
    try {
      // The form component will handle the actual create/update operations
      onClose()
      refetchThemes() // Use the targeted refetch from the hook
    } catch (error) {
      const errorMessage = error instanceof AirtableError 
        ? `Failed to ${selectedTheme ? 'update' : 'create'} theme: ${error.message}`
        : `Failed to ${selectedTheme ? 'update' : 'create'} theme`
        
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }
  
  const handleThemeView = (themeId: string) => {
    navigate(`/themes/${themeId}`)
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
          Error loading themes: {error}
        </Alert>
        <Button onClick={refetchThemeData} colorScheme="blue">
          Retry
        </Button>
      </Container>
    )
  }

  return (
    <Container maxW="container.xl" py={5}>
      {/* Page header with actions */}
      <Flex justifyContent="space-between" mb={5} flexWrap="wrap" gap={3}>
        <Heading size="lg">Themes</Heading>
        <HStack>
          <InputGroup w={{ base: 'full', md: '300px' }}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search themes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          <Button leftIcon={<AddIcon />} colorScheme="blue" onClick={handleAddTheme}>
            Add
          </Button>
        </HStack>
      </Flex>

      {/* Theme list */}
      {displayedThemes.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          No themes found.
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th cursor="pointer" onClick={() => handleSort('Theme Name')}>
                  Name {sortIndicator('Theme Name')}
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
              {displayedThemes.map((theme) => (
                <Tr key={theme.id} _hover={{ bg: 'gray.50' }}>
                  <Td fontWeight="medium">
                    <Text 
                      color="blue.600" 
                      cursor="pointer"
                      onClick={() => handleThemeView(theme.id)}
                    >
                      {theme['Theme Name']}
                    </Text>
                  </Td>
                  <Td>
                    <Text noOfLines={2}>{theme.Description}</Text>
                  </Td>
                  <Td>
                    <Badge colorScheme="blue">{getRelatedStoriesCount(theme.id)}</Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme="purple">{getRelatedMediaCount(theme.id)}</Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit theme"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEditTheme(theme)}
                      />
                      <IconButton
                        aria-label="Delete theme"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteClick(theme.id)}
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
            {selectedTheme ? 'Edit Theme' : 'Add New Theme'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ThemeForm 
              theme={selectedTheme} 
              onSubmit={handleThemeSubmit}
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
            Are you sure you want to delete this theme? This action cannot be undone.
            <Box mt={2} fontWeight="bold" color="red.500">
              Note: This will not remove the theme from associated stories or media.
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

export default ThemesPage 