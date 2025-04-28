import React, { useEffect, useState } from 'react'
import { 
  FormControl, 
  FormLabel, 
  Input, 
  Button, 
  VStack, 
  useToast, 
  FormErrorMessage, 
  Select,
  Textarea,
  Box,
  RadioGroup,
  Radio,
  Stack,
  HStack,
  Checkbox,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  InputGroup,
  InputLeftElement,
  Icon,
  Divider,
  Heading,
  Text,
  Badge
} from '@chakra-ui/react'
import { useForm, Controller } from 'react-hook-form'
import { Media, Theme, Tag as TagType, fetchThemes, fetchTags } from '../services/airtable'
import { SearchIcon } from '@chakra-ui/icons'

export interface MediaFormData {
  title: string
  url: string
  type: 'image' | 'video'
  description?: string
  themes?: string[]
  tags?: string[]
}

export interface MediaFormProps {
  onSubmit: (data: MediaFormData) => Promise<void>
  initialData?: Media
  isLoading?: boolean
}

const MediaForm: React.FC<MediaFormProps> = ({ onSubmit, initialData, isLoading = false }) => {
  const [themes, setThemes] = useState<Theme[]>([])
  const [tags, setTags] = useState<TagType[]>([])
  const [themeSearchTerm, setThemeSearchTerm] = useState('')
  const [tagSearchTerm, setTagSearchTerm] = useState('')
  const [isLoadingOptions, setIsLoadingOptions] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  
  const toast = useToast()
  
  const { 
    handleSubmit, 
    register, 
    control,
    formState: { errors, isSubmitting }, 
    reset,
    setValue,
    watch
  } = useForm<MediaFormData>({
    defaultValues: initialData ? {
      title: initialData.title,
      url: initialData.url,
      type: initialData.type,
      description: initialData.description,
      themes: initialData.themes,
      tags: initialData.tags
    } : {
      title: '',
      url: '',
      type: 'image',
      description: '',
      themes: [],
      tags: []
    }
  })

  // Watch form values
  const selectedThemes = watch('themes') || []
  const selectedTags = watch('tags') || []

  // Fetch themes and tags on component mount
  useEffect(() => {
    const loadOptions = async () => {
      setIsLoadingOptions(true)
      setLoadError(null)
      
      try {
        const [themesData, tagsData] = await Promise.all([
          fetchThemes(),
          fetchTags()
        ])
        
        setThemes(themesData)
        setTags(tagsData)
      } catch (error) {
        console.error('Error loading form options:', error)
        setLoadError('Failed to load themes and tags. Please try again.')
        toast({
          title: 'Error',
          description: 'Failed to load form options',
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoadingOptions(false)
      }
    }
    
    loadOptions()
  }, [toast])

  const handleFormSubmit = async (data: MediaFormData) => {
    try {
      await onSubmit(data)
      if (!initialData) {
        reset() // Only reset the form if this is a new media item
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const filteredThemes = themes.filter(theme => 
    theme.name.toLowerCase().includes(themeSearchTerm.toLowerCase())
  )
  
  const filteredTags = tags.filter(tag => 
    tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
  )

  const removeTheme = (theme: string) => {
    setValue(
      'themes', 
      (selectedThemes || []).filter(t => t !== theme),
      { shouldValidate: true }
    )
  }

  const removeTag = (tag: string) => {
    setValue(
      'tags', 
      (selectedTags || []).filter(t => t !== tag),
      { shouldValidate: true }
    )
  }

  const handleThemeToggle = (theme: string, isChecked: boolean) => {
    if (isChecked) {
      setValue('themes', [...(selectedThemes || []), theme], { shouldValidate: true })
    } else {
      removeTheme(theme)
    }
  }

  const handleTagToggle = (tag: string, isChecked: boolean) => {
    if (isChecked) {
      setValue('tags', [...(selectedTags || []), tag], { shouldValidate: true })
    } else {
      removeTag(tag)
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)}>
      <VStack spacing={6} align="start">
        <FormControl isInvalid={!!errors.title} isRequired>
          <FormLabel htmlFor="title">Title</FormLabel>
          <Input
            id="title"
            placeholder="Enter a title"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
            })}
          />
          <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isInvalid={!!errors.url} isRequired>
          <FormLabel htmlFor="url">URL</FormLabel>
          <Input
            id="url"
            placeholder="https://example.com/image.jpg"
            {...register('url', {
              required: 'URL is required',
              pattern: {
                value: /^(https?:\/\/)?.+/i,
                message: 'Please enter a valid URL',
              },
            })}
          />
          <FormErrorMessage>{errors.url?.message}</FormErrorMessage>
        </FormControl>

        <FormControl isRequired>
          <FormLabel htmlFor="type">Type</FormLabel>
          <Controller
            name="type"
            control={control}
            rules={{ required: 'Please select a type' }}
            render={({ field }) => (
              <RadioGroup {...field}>
                <Stack direction="row">
                  <Radio value="image">Image</Radio>
                  <Radio value="video">Video</Radio>
                </Stack>
              </RadioGroup>
            )}
          />
          <FormErrorMessage>{errors.type?.message}</FormErrorMessage>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="description">Description</FormLabel>
          <Textarea
            id="description"
            placeholder="Enter a description"
            {...register('description')}
          />
        </FormControl>

        <Divider />

        <FormControl>
          <FormLabel htmlFor="themes">Themes</FormLabel>
          
          {selectedThemes.length > 0 && (
            <Box mb={4}>
              <Wrap spacing={2}>
                {selectedThemes.map((theme) => (
                  <WrapItem key={theme}>
                    <Tag size="md" borderRadius="full" variant="solid" colorScheme="blue">
                      <TagLabel>{theme}</TagLabel>
                      <TagCloseButton onClick={() => removeTheme(theme)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}
          
          <InputGroup mb={2}>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filter themes..."
              value={themeSearchTerm}
              onChange={(e) => setThemeSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Box maxH="200px" overflowY="auto" borderWidth="1px" borderRadius="md">
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {filteredThemes.length > 0 ? (
                filteredThemes.map((theme) => (
                  <Checkbox
                    key={theme.id}
                    isChecked={selectedThemes?.includes(theme.name)}
                    onChange={(e) => handleThemeToggle(theme.name, e.target.checked)}
                    p={2}
                  >
                    {theme.name}
                  </Checkbox>
                ))
              ) : (
                <Box p={2} textAlign="center">
                  <Text color="gray.500">
                    {isLoadingOptions ? 'Loading themes...' : 'No themes found'}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </FormControl>

        <FormControl>
          <FormLabel htmlFor="tags">Tags</FormLabel>
          
          {selectedTags.length > 0 && (
            <Box mb={4}>
              <Wrap spacing={2}>
                {selectedTags.map((tag) => (
                  <WrapItem key={tag}>
                    <Tag size="md" borderRadius="full" variant="solid" colorScheme="green">
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => removeTag(tag)} />
                    </Tag>
                  </WrapItem>
                ))}
              </Wrap>
            </Box>
          )}
          
          <InputGroup mb={2}>
            <InputLeftElement pointerEvents="none">
              <Icon as={SearchIcon} color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Filter tags..."
              value={tagSearchTerm}
              onChange={(e) => setTagSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Box maxH="200px" overflowY="auto" borderWidth="1px" borderRadius="md">
            <VStack spacing={0} align="stretch" divider={<Divider />}>
              {filteredTags.length > 0 ? (
                filteredTags.map((tag) => (
                  <Checkbox
                    key={tag.id}
                    isChecked={selectedTags?.includes(tag.name)}
                    onChange={(e) => handleTagToggle(tag.name, e.target.checked)}
                    p={2}
                  >
                    {tag.name}
                  </Checkbox>
                ))
              ) : (
                <Box p={2} textAlign="center">
                  <Text color="gray.500">
                    {isLoadingOptions ? 'Loading tags...' : 'No tags found'}
                  </Text>
                </Box>
              )}
            </VStack>
          </Box>
        </FormControl>

        {loadError && (
          <Box w="100%" p={3} bg="red.50" color="red.500" borderRadius="md">
            <Text>{loadError}</Text>
          </Box>
        )}

        <HStack spacing={4} width="100%" justify="flex-end">
          <Button
            type="button"
            onClick={() => reset()}
            isDisabled={isSubmitting || isLoading}
          >
            Reset
          </Button>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting || isLoading}
            loadingText="Submitting"
          >
            {initialData ? 'Update' : 'Add'} Media
          </Button>
        </HStack>
      </VStack>
    </form>
  )
}

export default MediaForm 