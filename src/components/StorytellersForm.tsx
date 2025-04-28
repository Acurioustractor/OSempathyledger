import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  Textarea,
  useToast,
  Text,
  Alert,
  AlertIcon,
  HStack,
  InputGroup,
  InputRightElement,
  Spinner,
  useColorModeValue,
  FormHelperText,
  Link,
  Avatar,
  Flex,
  Image,
  Divider,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { Storyteller, createStoryteller, updateStoryteller, AirtableAttachment } from '../services/airtable';
import { getAvatarImageUrl } from '../services/imageUtils';

interface StorytellersFormData {
  Name: string;
  Project?: string;
  Location?: string;
  Summary?: string;
  Role?: string;
  profileImageUrl?: string;
}

interface StorytellersFormProps {
  onSubmit: (data: Storyteller) => void;
  initialData?: Partial<Storyteller>;
  isLoading?: boolean;
}

const MAX_SUMMARY_LENGTH = 500;
const IMAGE_URL_REGEX = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;

const StorytellersForm = ({ onSubmit, initialData, isLoading = false }: StorytellersFormProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.['File Profile Image'] && 
    initialData['File Profile Image'].length > 0 ? 
    initialData['File Profile Image'][0].url : null
  );
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const toast = useToast();
  const formBackground = useColorModeValue('white', 'gray.700');
  
  const { 
    handleSubmit, 
    register, 
    formState: { errors }, 
    watch,
    control,
    reset 
  } = useForm<StorytellersFormData>({
    defaultValues: {
      Name: initialData?.Name || '',
      Project: initialData?.Project || '',
      Location: initialData?.Location || '',
      Summary: initialData?.Summary || '',
      Role: initialData?.Role || '',
      profileImageUrl: initialData?.['File Profile Image'] && initialData['File Profile Image'].length > 0 
        ? initialData['File Profile Image'][0].url 
        : '',
    }
  });
  
  // Watch the summary to show character count
  const summary = watch('Summary', '');
  const profileImageUrl = watch('profileImageUrl', '');
  const name = watch('Name', '');
  
  // Generate avatar when name changes
  useEffect(() => {
    if (name) {
      setAvatarPreview(getAvatarImageUrl(name, 150));
    }
  }, [name]);
  
  // Handle image URL change for preview
  const handleImageUrlChange = (url: string) => {
    if (IMAGE_URL_REGEX.test(url)) {
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };
  
  const processSubmit = async (data: StorytellersFormData) => {
    setSubmitting(true);
    setError(null);
    
    try {
      // Prepare data for Airtable
      const submissionData: Partial<Storyteller> = {
        Name: data.Name,
        Project: data.Project,
        Location: data.Location,
        Summary: data.Summary,
        Role: data.Role,
      };
      
      // Handle profile image field
      if (data.profileImageUrl && IMAGE_URL_REGEX.test(data.profileImageUrl)) {
        // Create an attachment object for Airtable
        const attachment: AirtableAttachment = {
          id: Date.now().toString(),
          url: data.profileImageUrl,
          filename: data.profileImageUrl.split('/').pop() || 'profile_image',
        };
        
        submissionData['File Profile Image'] = [attachment];
      }
      
      let result: Storyteller;
      
      // Update or create based on whether we have an ID
      if (initialData?.id) {
        result = await updateStoryteller(initialData.id, submissionData);
        toast({
          title: 'Storyteller updated',
          description: `Successfully updated ${result.Name}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        result = await createStoryteller(submissionData as Omit<Storyteller, 'id' | 'createdTime'>);
        toast({
          title: 'Storyteller created',
          description: `Successfully created ${result.Name}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        
        // Reset form after successful creation
        reset();
        setImagePreview(null);
      }
      
      // Call the onSubmit callback with the result
      onSubmit(result);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      
      toast({
        title: 'Submission failed',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      
      console.error('Error submitting storyteller:', err);
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Box 
      as="form" 
      onSubmit={handleSubmit(processSubmit)}
      bg={formBackground}
      p={6}
      borderRadius="md"
      boxShadow="sm"
      width="100%"
    >
      <VStack spacing={6} align="stretch">
        <Heading size="md">{initialData?.id ? 'Edit' : 'Add'} Storyteller</Heading>
        
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        
        <FormControl isInvalid={!!errors.Name} isRequired>
          <FormLabel>Name</FormLabel>
          <Input
            {...register('Name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
            placeholder="Enter storyteller's name"
            isDisabled={submitting || isLoading}
          />
          <FormErrorMessage>{errors.Name?.message}</FormErrorMessage>
        </FormControl>
        
        <FormControl isInvalid={!!errors.Project}>
          <FormLabel>Project</FormLabel>
          <Input
            {...register('Project')}
            placeholder="Enter project name"
            isDisabled={submitting || isLoading}
          />
          <FormErrorMessage>{errors.Project?.message}</FormErrorMessage>
        </FormControl>
        
        <FormControl isInvalid={!!errors.Role}>
          <FormLabel>Role</FormLabel>
          <Input
            {...register('Role')}
            placeholder="Enter storyteller's role"
            isDisabled={submitting || isLoading}
          />
          <FormErrorMessage>{errors.Role?.message}</FormErrorMessage>
        </FormControl>
        
        <FormControl isInvalid={!!errors.Location}>
          <FormLabel>Location</FormLabel>
          <Input
            {...register('Location')}
            placeholder="Enter storyteller's location"
            isDisabled={submitting || isLoading}
          />
          <FormErrorMessage>{errors.Location?.message}</FormErrorMessage>
        </FormControl>
        
        <FormControl isInvalid={!!errors.Summary}>
          <FormLabel>Summary</FormLabel>
          <Textarea
            {...register('Summary', {
              maxLength: { 
                value: MAX_SUMMARY_LENGTH, 
                message: `Summary cannot exceed ${MAX_SUMMARY_LENGTH} characters`
              }
            })}
            placeholder="Enter a brief summary about the storyteller"
            rows={4}
            isDisabled={submitting || isLoading}
          />
          <FormHelperText>
            {`${summary.length}/${MAX_SUMMARY_LENGTH} characters`}
          </FormHelperText>
          <FormErrorMessage>{errors.Summary?.message}</FormErrorMessage>
        </FormControl>
        
        <FormControl isInvalid={!!errors.profileImageUrl}>
          <FormLabel>Profile Image</FormLabel>
          
          <HStack spacing={4} align="start">
            <Box flex="1">
              <Controller 
                name="profileImageUrl"
                control={control}
                rules={{
                  pattern: {
                    value: IMAGE_URL_REGEX,
                    message: 'Please enter a valid image URL (.jpg, .png, .gif, etc.)'
                  }
                }}
                render={({ field }) => (
                  <InputGroup>
                    <Input
                      {...field}
                      placeholder="Enter URL for the profile image"
                      isDisabled={submitting || isLoading}
                      onChange={(e) => {
                        field.onChange(e);
                        handleImageUrlChange(e.target.value);
                      }}
                    />
                    {field.value && (
                      <InputRightElement>
                        {imagePreview ? (
                          <Text color="green.500" fontSize="sm">✓</Text>
                        ) : (
                          <Text color="red.500" fontSize="sm">⚠️</Text>
                        )}
                      </InputRightElement>
                    )}
                  </InputGroup>
                )}
              />
              <FormHelperText>
                Enter a direct link to an image file
              </FormHelperText>
              <FormErrorMessage>{errors.profileImageUrl?.message}</FormErrorMessage>
            </Box>
            
            <Box 
              width="100px" 
              height="100px" 
              borderRadius="md" 
              overflow="hidden"
              borderWidth="1px"
              borderColor="gray.200"
              bg="gray.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {imagePreview ? (
                <Image 
                  src={imagePreview} 
                  alt="Profile preview" 
                  width="100%"
                  height="100%"
                  objectFit="cover"
                  onError={() => setImagePreview(null)}
                />
              ) : name ? (
                <Image
                  src={avatarPreview}
                  alt={`Avatar for ${name}`}
                  width="100%"
                  height="100%"
                  objectFit="cover"
                />
              ) : (
                <Text color="gray.400" fontSize="sm">Preview</Text>
              )}
            </Box>
          </HStack>
          
          <Box mt={3}>
            <Divider mb={3} />
            <Box fontSize="sm" color="gray.600">
              {!imagePreview && name ? (
                <Box>
                  No image URL provided. A generated avatar will be used based on the name.
                </Box>
              ) : null}
              
              <Box mt={2}>
                For a production app, we'd implement an image uploader. For now, you can use an image hosting service
                like{' '}
                <Link href="https://imgur.com/" isExternal color="blue.500">
                  Imgur
                </Link>
                {' '}or{' '}
                <Link href="https://cloudinary.com/" isExternal color="blue.500">
                  Cloudinary
                </Link>
              </Box>
            </Box>
          </Box>
        </FormControl>
        
        <HStack justify="space-between">
          <Button
            onClick={() => reset()}
            isDisabled={submitting || isLoading}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            colorScheme="blue"
            isLoading={submitting || isLoading}
            loadingText={initialData?.id ? 'Updating...' : 'Creating...'}
          >
            {initialData?.id ? 'Update' : 'Create'} Storyteller
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default StorytellersForm; 