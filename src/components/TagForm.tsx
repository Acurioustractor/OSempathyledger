import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Button,
  Flex,
  useToast
} from '@chakra-ui/react';
import { Tag, createRecord, updateRecord } from '../services/airtable';

interface TagFormProps {
  tag: Tag | null;
  onSubmit: (tagData: any) => Promise<void>;
}

const TagForm: React.FC<TagFormProps> = ({ tag, onSubmit }) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const toast = useToast();

  // Initialize form with tag data if editing
  useEffect(() => {
    if (tag) {
      setName(tag['Tag Name'] || '');
      setDescription(tag.Description || '');
    } else {
      // Reset form for new tag
      setName('');
      setDescription('');
    }
  }, [tag]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Tag name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const tagData = {
        'Tag Name': name,
        Description: description
      };
      
      if (tag) {
        // Update existing tag
        await updateRecord('Tags', tag.id, tagData);
      } else {
        // Create new tag
        await createRecord('Tags', tagData);
      }
      
      // Call the onSubmit callback
      await onSubmit(tagData);
      
    } catch (error) {
      console.error('Error saving tag:', error);
      toast({
        title: 'Error',
        description: `Failed to ${tag ? 'update' : 'create'} tag.`,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4} align="stretch">
        <FormControl isRequired isInvalid={!!errors.name}>
          <FormLabel>Tag Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter tag name"
          />
          {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tag description (optional)"
            rows={4}
          />
        </FormControl>

        <Flex justify="flex-end" mt={4}>
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={isSubmitting}
            loadingText="Saving"
          >
            {tag ? 'Update Tag' : 'Create Tag'}
          </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default TagForm; 