import {
  Box,
  Heading,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Radio,
  RadioGroup,
  Checkbox,
  CheckboxGroup,
  Stack,
  Text,
  Badge,
  Icon,
  Divider,
  Alert,
  AlertIcon,
  Progress,
  useColorModeValue,
  Grid,
  Select,
  Switch,
  FormHelperText,
} from '@chakra-ui/react'
import { 
  FiUser, 
  FiCamera, 
  FiMic, 
  FiFileText, 
  FiCheck,
  FiUpload,
  FiMapPin 
} from 'react-icons/fi'
import { useState } from 'react'
import MediaUploadWidget from '../components/MediaUploadWidget'

const StoryCapturePage = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [consentGiven, setConsentGiven] = useState(false)
  const [formData, setFormData] = useState({
    // Storyteller information
    firstName: '',
    lastName: '',
    preferredName: '',
    anonymityLevel: 'first-name',
    contactEmail: '',
    contactPhone: '',
    wantsUpdates: false,
    // Story content
    storyText: '',
    themes: [],
    location: '',
    mediaFiles: [],
    // Consent
    consentPhoto: false,
    consentVideo: false,
    consentAudio: false,
    consentQuotes: false,
    consentWebsite: false,
    consentSocial: false,
    consentPrint: false,
  })

  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  const totalSteps = 4
  const progressPercentage = (currentStep / totalSteps) * 100

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Handle form submission
    console.log('Submitting story:', formData)
    // Add actual submission logic here
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={2}>Storyteller Information</Heading>
              <Text color="gray.600">Basic information about the person sharing their story</Text>
            </Box>
            
            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
              <FormControl isRequired>
                <FormLabel>First Name</FormLabel>
                <Input
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  placeholder="Enter first name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Last Name</FormLabel>
                <Input
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  placeholder="Enter last name (optional)"
                />
              </FormControl>
            </Grid>

            <FormControl>
              <FormLabel>Preferred Name for Publication</FormLabel>
              <Input
                value={formData.preferredName}
                onChange={(e) => setFormData({...formData, preferredName: e.target.value})}
                placeholder="How they'd like to be known in the story"
              />
              <FormHelperText>
                This is how their name will appear in published stories
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Anonymity Level</FormLabel>
              <RadioGroup
                value={formData.anonymityLevel}
                onChange={(value) => setFormData({...formData, anonymityLevel: value})}
              >
                <Stack spacing={3}>
                  <Radio value="full-name">Use full name</Radio>
                  <Radio value="first-name">First name only</Radio>
                  <Radio value="initials">Initials only</Radio>
                  <Radio value="anonymous">Completely anonymous</Radio>
                </Stack>
              </RadioGroup>
            </FormControl>

            <Divider />

            <Box>
              <Heading size="sm" mb={3}>Optional Contact Information</Heading>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                    placeholder="email@example.com"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Phone</FormLabel>
                  <Input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                    placeholder="+61 400 000 000"
                  />
                </FormControl>
              </Grid>
              <FormControl mt={4}>
                <HStack>
                  <Switch
                    isChecked={formData.wantsUpdates}
                    onChange={(e) => setFormData({...formData, wantsUpdates: e.target.checked})}
                  />
                  <FormLabel mb={0}>Send me updates about Orange Sky</FormLabel>
                </HStack>
              </FormControl>
            </Box>
          </VStack>
        )

      case 2:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={2}>Consent & Permissions</Heading>
              <Text color="gray.600">What types of media and usage the storyteller consents to</Text>
            </Box>

            <Alert status="info">
              <AlertIcon />
              <Box>
                <Text fontWeight="medium">Important: Consent Requirements</Text>
                <Text fontSize="sm">
                  All storytellers must provide clear consent for how their story and media will be used.
                  This consent can be withdrawn at any time.
                </Text>
              </Box>
            </Alert>

            <Box>
              <Heading size="sm" mb={3}>Media Consent</Heading>
              <CheckboxGroup>
                <Stack spacing={3}>
                  <Checkbox
                    isChecked={formData.consentPhoto}
                    onChange={(e) => setFormData({...formData, consentPhoto: e.target.checked})}
                  >
                    <HStack>
                      <Icon as={FiCamera} />
                      <Text>Photos may be taken and used</Text>
                    </HStack>
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.consentVideo}
                    onChange={(e) => setFormData({...formData, consentVideo: e.target.checked})}
                  >
                    <HStack>
                      <Icon as={FiCamera} />
                      <Text>Video may be recorded and used</Text>
                    </HStack>
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.consentAudio}
                    onChange={(e) => setFormData({...formData, consentAudio: e.target.checked})}
                  >
                    <HStack>
                      <Icon as={FiMic} />
                      <Text>Audio may be recorded and used</Text>
                    </HStack>
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.consentQuotes}
                    onChange={(e) => setFormData({...formData, consentQuotes: e.target.checked})}
                  >
                    <HStack>
                      <Icon as={FiFileText} />
                      <Text>Quotes from my story may be used</Text>
                    </HStack>
                  </Checkbox>
                </Stack>
              </CheckboxGroup>
            </Box>

            <Box>
              <Heading size="sm" mb={3}>Usage Permissions</Heading>
              <CheckboxGroup>
                <Stack spacing={3}>
                  <Checkbox
                    isChecked={formData.consentWebsite}
                    onChange={(e) => setFormData({...formData, consentWebsite: e.target.checked})}
                  >
                    Orange Sky website and digital platforms
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.consentSocial}
                    onChange={(e) => setFormData({...formData, consentSocial: e.target.checked})}
                  >
                    Social media (Facebook, Instagram, LinkedIn)
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.consentPrint}
                    onChange={(e) => setFormData({...formData, consentPrint: e.target.checked})}
                  >
                    Print materials (brochures, reports, newsletters)
                  </Checkbox>
                </Stack>
              </CheckboxGroup>
            </Box>

            <Box p={4} bg="orange.50" borderRadius="md" borderLeft="4px" borderColor="orangeSky.primary">
              <Text fontSize="sm" fontWeight="medium" color="orangeSky.dark">
                Consent Confirmation Required
              </Text>
              <Text fontSize="sm" mt={1}>
                The storyteller must verbally confirm their understanding and agreement to these permissions.
                Document this confirmation in the story notes.
              </Text>
            </Box>
          </VStack>
        )

      case 3:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={2}>Story Content</Heading>
              <Text color="gray.600">Capture the story details and context</Text>
            </Box>

            <FormControl isRequired>
              <FormLabel>Story Content</FormLabel>
              <Textarea
                value={formData.storyText}
                onChange={(e) => setFormData({...formData, storyText: e.target.value})}
                placeholder="Write or transcribe the storyteller's story here..."
                rows={8}
              />
              <FormHelperText>
                Include key quotes, themes, and important details. This can be edited later.
              </FormHelperText>
            </FormControl>

            <FormControl>
              <FormLabel>Location Context</FormLabel>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Civic Square Canberra, or general area"
                leftElement={<Icon as={FiMapPin} />}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Story Themes</FormLabel>
              <CheckboxGroup>
                <Grid templateColumns="repeat(2, 1fr)" gap={2}>
                  {[
                    'Community', 'Hope', 'Resilience', 'Support',
                    'Growth', 'Connection', 'Change', 'Gratitude',
                    'Challenge', 'Achievement', 'Family', 'Work'
                  ].map((theme) => (
                    <Checkbox key={theme} size="sm">
                      {theme}
                    </Checkbox>
                  ))}
                </Grid>
              </CheckboxGroup>
              <FormHelperText>
                Select themes that best represent this story
              </FormHelperText>
            </FormControl>

            <Box>
              <Heading size="sm" mb={3}>Quick Notes</Heading>
              <Textarea
                placeholder="Additional context, photographer observations, or notes for the content team..."
                rows={3}
              />
            </Box>
          </VStack>
        )

      case 4:
        return (
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={2}>Media Upload</Heading>
              <Text color="gray.600">Upload photos, videos, and audio files for this story</Text>
            </Box>

            <MediaUploadWidget
              maxFiles={8}
              acceptedTypes={['image/*', 'video/*', 'audio/*']}
              maxFileSize={25}
              onFilesUploaded={(files) => {
                console.log('Files uploaded:', files)
                // In a real app, you'd update the form state here
              }}
              onFileRemoved={(fileId) => {
                console.log('File removed:', fileId)
              }}
            />

            <Box>
              <Heading size="sm" mb={3}>Story Summary</Heading>
              <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <VStack align="start" spacing={3}>
                    <HStack>
                      <Text fontWeight="medium">Storyteller:</Text>
                      <Text>{formData.firstName} {formData.lastName}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">Publication Name:</Text>
                      <Text>{formData.preferredName || 'Not specified'}</Text>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">Anonymity:</Text>
                      <Badge>{formData.anonymityLevel}</Badge>
                    </HStack>
                    <HStack>
                      <Text fontWeight="medium">Consent Status:</Text>
                      <Badge colorScheme="green">
                        <Icon as={FiCheck} mr={1} />
                        Confirmed
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </Box>
          </VStack>
        )

      default:
        return null
    }
  }

  return (
    <Box maxW="800px" mx="auto">
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color="orangeSky.primary">
            Capture New Story
          </Heading>
          <Text color="gray.600">
            Step {currentStep} of {totalSteps}: Story Collection Process
          </Text>
        </Box>

        {/* Progress Bar */}
        <Box>
          <Progress value={progressPercentage} colorScheme="brand" size="md" borderRadius="md" />
          <HStack justify="space-between" mt={2}>
            <Text fontSize="sm" color="gray.600">Information</Text>
            <Text fontSize="sm" color="gray.600">Consent</Text>
            <Text fontSize="sm" color="gray.600">Content</Text>
            <Text fontSize="sm" color="gray.600">Media</Text>
          </HStack>
        </Box>

        {/* Step Content */}
        <Card bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            {renderStepContent()}
          </CardBody>
        </Card>

        {/* Navigation */}
        <HStack justify="space-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            isDisabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <HStack spacing={2}>
            <Button variant="ghost" size="sm">
              Save Draft
            </Button>
            {currentStep < totalSteps ? (
              <Button colorScheme="brand" onClick={handleNext}>
                Next Step
              </Button>
            ) : (
              <Button colorScheme="brand" onClick={handleSubmit}>
                Submit Story
              </Button>
            )}
          </HStack>
        </HStack>
      </VStack>
    </Box>
  )
}

export default StoryCapturePage