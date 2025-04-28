import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  Box,
  Checkbox,
  Grid,
  HStack,
  Select,
  Flex,
  Heading,
  Text,
  useToast
} from '@chakra-ui/react';
import { Story, Theme, Tag, Storyteller, createRecord, updateRecord } from '../services/airtable';

interface StoryFormProps {
  story: Story | null;
  onSubmit: (storyData: any) => Promise<void>;
  availableThemes: Theme[];
  availableTags: Tag[];
  availableStorytellers: Storyteller[];
}

const StoryForm: React.FC<StoryFormProps> = ({ 
  story, 
  onSubmit,
  availableThemes,
  availableTags,
  availableStorytellers
}) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedThemes, setSelectedThemes] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedStoryteller, setSelectedStoryteller] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const toast = useToast();

  // Initialize form with story data if editing
  useEffect(() => {
    if (story) {
      setTitle(story.Title || '');
      setDescription(story.Description || '');
      setLocation(story.Location || '');
      setSelectedThemes(story.Themes || []);
      setSelectedTags(story.Tags || []);
      setSelectedStoryteller(story.Storyteller_id || '');
    } else {
      // Reset form for new story
      setTitle('');
      setDescription('');
      setLocation('');
      setSelectedThemes([]);
      setSelectedTags([]);
      setSelectedStoryteller('');
    }
  }, [story]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!selectedStoryteller) newErrors.storyteller = 'Storyteller is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const storyData = {
        Title: title,
        Description: description,
        Location: location,
        Themes: selectedThemes,
        Tags: selectedTags,
        Storyteller_id: selectedStoryteller
      };
      
      if (story) {
        // Update existing story
        await updateRecord('Stories', story.id, storyData);
      } else {
        // Create new story
        await createRecord('Stories', storyData);
      }
      
      // Call the onSubmit callback
      await onSubmit(storyData);
      
    } catch (error) {
      console.error('Error saving story:', error);
      toast({
        title: 'Error',
        description: `Failed to ${story ? 'update' : 'create'} story.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle theme selection
  const handleThemeToggle = (themeId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedThemes(prev => [...prev, themeId]);
    } else {
      setSelectedThemes(prev => prev.filter(id => id !== themeId));
    }
  };

  // Handle tag selection
  const handleTagToggle = (tagId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedTags(prev => [...prev, tagId]);
    } else {
      setSelectedTags(prev => prev.filter(id => id !== tagId));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired isInvalid={!!errors.title}>
          <FormLabel>Title</FormLabel>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Story title"
          />
          {errors.title && <FormErrorMessage>{errors.title}</FormErrorMessage>}
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Story description"
            rows={4}
          />
        </FormControl>

        <FormControl>
          <FormLabel>Location</FormLabel>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Story location"
          />
        </FormControl>

        <FormControl isRequired isInvalid={!!errors.storyteller}>
          <FormLabel>Storyteller</FormLabel>
          <Select
            value={selectedStoryteller}
            onChange={(e) => setSelectedStoryteller(e.target.value)}
            placeholder="Select storyteller"
          >
            {availableStorytellers.map(storyteller => (
              <option key={storyteller.id} value={storyteller.id}>
                {storyteller.Name}
              </option>
            ))}
          </Select>
          {errors.storyteller && <FormErrorMessage>{errors.storyteller}</FormErrorMessage>}
        </FormControl>

        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          <Box>
            <Heading size="sm" mb={2}>Themes</Heading>
            <Box maxH="200px" overflowY="auto" p={2} borderWidth="1px" borderRadius="md">
              {availableThemes.map(theme => (
                <Checkbox
                  key={theme.id}
                  isChecked={selectedThemes.includes(theme.id)}
                  onChange={(e) => handleThemeToggle(theme.id, e.target.checked)}
                  mb={1}
                >
                  {theme['Theme Name']}
                </Checkbox>
              ))}
            </Box>
          </Box>

          <Box>
            <Heading size="sm" mb={2}>Tags</Heading>
            <Box maxH="200px" overflowY="auto" p={2} borderWidth="1px" borderRadius="md">
              {availableTags.map(tag => (
                <Checkbox
                  key={tag.id}
                  isChecked={selectedTags.includes(tag.id)}
                  onChange={(e) => handleTagToggle(tag.id, e.target.checked)}
                  mb={1}
                >
                  {tag['Tag Name']}
                </Checkbox>
              ))}
            </Box>
          </Box>
        </Grid>

        <Flex justify="flex-end" mt={4}>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Saving"
          >
            {story ? 'Update Story' : 'Create Story'}
          </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default StoryForm; 