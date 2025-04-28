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
import { Theme, createRecord, updateRecord } from '../services/airtable';

interface ThemeFormProps {
  theme: Theme | null;
  onSubmit: (themeData: any) => Promise<void>;
}

const ThemeForm: React.FC<ThemeFormProps> = ({ theme, onSubmit }) => {
  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const toast = useToast();

  // Initialize form with theme data if editing
  useEffect(() => {
    if (theme) {
      setName(theme['Theme Name'] || '');
      setDescription(theme.Description || '');
    } else {
      // Reset form for new theme
      setName('');
      setDescription('');
    }
  }, [theme]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Theme name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const themeData = {
        'Theme Name': name,
        Description: description
      };
      
      if (theme) {
        // Update existing theme
        await updateRecord('Themes', theme.id, themeData);
      } else {
        // Create new theme
        await createRecord('Themes', themeData);
      }
      
      // Call the onSubmit callback
      await onSubmit(themeData);
      
    } catch (error) {
      console.error('Error saving theme:', error);
      toast({
        title: 'Error',
        description: `Failed to ${theme ? 'update' : 'create'} theme.`,
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
          <FormLabel>Theme Name</FormLabel>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter theme name"
          />
          {errors.name && <FormErrorMessage>{errors.name}</FormErrorMessage>}
        </FormControl>

        <FormControl>
          <FormLabel>Description</FormLabel>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Theme description (optional)"
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
            {theme ? 'Update Theme' : 'Create Theme'}
          </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default ThemeForm; 