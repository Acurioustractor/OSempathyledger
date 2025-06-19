import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  Progress,
  Badge,
  Icon,
  useColorModeValue,
  Alert,
  AlertIcon,
  Image,
  Grid,
  Flex,
  IconButton,
  useToast,
} from '@chakra-ui/react'
import { 
  FiUpload, 
  FiX, 
  FiCheck, 
  FiCamera, 
  FiMic, 
  FiFileText,
  FiPlay,
  FiPause,
  FiVideo
} from 'react-icons/fi'
import { useState, useRef, useCallback } from 'react'

interface MediaFile {
  id: string
  file: File
  type: 'image' | 'video' | 'audio' | 'document'
  preview?: string
  uploadProgress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

interface MediaUploadWidgetProps {
  onFilesUploaded?: (files: MediaFile[]) => void
  onFileRemoved?: (fileId: string) => void
  maxFiles?: number
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  showPreview?: boolean
}

const MediaUploadWidget = ({
  onFilesUploaded,
  onFileRemoved,
  maxFiles = 10,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  maxFileSize = 50,
  showPreview = true
}: MediaUploadWidgetProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()
  
  const cardBg = useColorModeValue('white', 'gray.700')
  const borderColor = useColorModeValue('gray.200', 'gray.600')
  const dragBorderColor = useColorModeValue('blue.300', 'blue.500')

  const getFileType = (file: File): MediaFile['type'] => {
    if (file.type.startsWith('image/')) return 'image'
    if (file.type.startsWith('video/')) return 'video'
    if (file.type.startsWith('audio/')) return 'audio'
    return 'document'
  }

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return FiCamera
      case 'video': return FiVideo
      case 'audio': return FiMic
      case 'document': return FiFileText
      default: return FiFileText
    }
  }

  const createPreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.readAsDataURL(file)
      } else {
        resolve(undefined)
      }
    })
  }

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return { valid: false, error: `File size exceeds ${maxFileSize}MB limit` }
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''))
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase())
    })

    if (!isValidType) {
      return { valid: false, error: 'File type not supported' }
    }

    return { valid: true }
  }

  const handleFileUpload = useCallback(async (files: FileList) => {
    if (mediaFiles.length + files.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `Maximum ${maxFiles} files allowed`,
        status: 'warning',
        duration: 3000,
      })
      return
    }

    const newFiles: MediaFile[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const validation = validateFile(file)
      
      if (!validation.valid) {
        toast({
          title: 'Invalid file',
          description: `${file.name}: ${validation.error}`,
          status: 'error',
          duration: 3000,
        })
        continue
      }

      const preview = await createPreview(file)
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
        file,
        type: getFileType(file),
        preview,
        uploadProgress: 0,
        status: 'pending'
      }

      newFiles.push(mediaFile)
    }

    setMediaFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload process
    newFiles.forEach(mediaFile => {
      simulateUpload(mediaFile.id)
    })

    if (onFilesUploaded) {
      onFilesUploaded(newFiles)
    }
  }, [mediaFiles.length, maxFiles, onFilesUploaded, toast])

  const simulateUpload = (fileId: string) => {
    setMediaFiles(prev => 
      prev.map(file => 
        file.id === fileId 
          ? { ...file, status: 'uploading' }
          : file
      )
    )

    // Simulate progressive upload
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      
      setMediaFiles(prev => 
        prev.map(file => 
          file.id === fileId 
            ? { ...file, uploadProgress: Math.min(progress, 100) }
            : file
        )
      )

      if (progress >= 100) {
        clearInterval(interval)
        setMediaFiles(prev => 
          prev.map(file => 
            file.id === fileId 
              ? { ...file, status: 'completed', uploadProgress: 100 }
              : file
          )
        )
      }
    }, 500)
  }

  const removeFile = (fileId: string) => {
    setMediaFiles(prev => prev.filter(file => file.id !== fileId))
    if (onFileRemoved) {
      onFileRemoved(fileId)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files)
    }
  }

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      setRecordingType(type)
      setIsRecording(true)
      
      // In a real implementation, this would use MediaRecorder API
      toast({
        title: `${type} recording started`,
        description: 'Recording functionality would be implemented here',
        status: 'info',
        duration: 2000,
      })
      
      // Simulate recording
      setTimeout(() => {
        setIsRecording(false)
        setRecordingType(null)
        toast({
          title: 'Recording completed',
          description: 'Recording saved successfully',
          status: 'success',
          duration: 2000,
        })
      }, 3000)
    } catch (error) {
      console.error('Recording error:', error)
      toast({
        title: 'Recording failed',
        description: 'Could not start recording',
        status: 'error',
        duration: 3000,
      })
    }
  }

  const stopRecording = () => {
    setIsRecording(false)
    setRecordingType(null)
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Upload Area */}
      <Card
        bg={cardBg}
        borderColor={isDragOver ? dragBorderColor : borderColor}
        borderWidth="2px"
        borderStyle={isDragOver ? 'solid' : 'dashed'}
        _hover={{ borderColor: dragBorderColor }}
        transition="all 0.2s"
      >
        <CardBody
          textAlign="center"
          py={12}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <VStack spacing={4}>
            <Icon as={FiUpload} size="3xl" color="gray.400" />
            <VStack spacing={2}>
              <Heading size="md" color={isDragOver ? 'blue.500' : 'gray.600'}>
                {isDragOver ? 'Drop files here' : 'Upload Media Files'}
              </Heading>
              <Text color="gray.500" fontSize="sm">
                Drag and drop files here, or click to browse
              </Text>
              <Text color="gray.400" fontSize="xs">
                Supported: Images, Videos, Audio, Documents (max {maxFileSize}MB each)
              </Text>
            </VStack>
            
            <HStack spacing={4}>
              <Button
                colorScheme="brand"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Icon as={FiUpload} />}
              >
                Choose Files
              </Button>
              
              <Button
                variant="outline"
                onClick={() => startRecording('audio')}
                leftIcon={<Icon as={FiMic} />}
                isLoading={isRecording && recordingType === 'audio'}
                loadingText="Recording..."
              >
                Record Audio
              </Button>
              
              <Button
                variant="outline"
                onClick={() => startRecording('video')}
                leftIcon={<Icon as={FiVideo} />}
                isLoading={isRecording && recordingType === 'video'}
                loadingText="Recording..."
              >
                Record Video
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* Recording Status */}
      {isRecording && (
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={1} flex={1}>
            <Text fontWeight="medium">
              Recording {recordingType}... 
            </Text>
            <HStack w="full">
              <Progress size="sm" isIndeterminate flex={1} />
              <Button size="xs" colorScheme="red" onClick={stopRecording}>
                Stop
              </Button>
            </HStack>
          </VStack>
        </Alert>
      )}

      {/* File List */}
      {mediaFiles.length > 0 && (
        <Box>
          <Heading size="sm" mb={4}>
            Uploaded Files ({mediaFiles.length}/{maxFiles})
          </Heading>
          
          <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={4}>
            {mediaFiles.map(file => (
              <Card key={file.id} bg={cardBg} borderColor={borderColor} borderWidth="1px">
                <CardBody>
                  <Flex align="start" gap={3}>
                    {/* Preview or Icon */}
                    <Box flexShrink={0}>
                      {showPreview && file.preview ? (
                        <Image
                          src={file.preview}
                          alt={file.file.name}
                          boxSize="60px"
                          objectFit="cover"
                          borderRadius="md"
                        />
                      ) : (
                        <Flex
                          boxSize="60px"
                          bg="gray.100"
                          borderRadius="md"
                          align="center"
                          justify="center"
                        >
                          <Icon as={getFileIcon(file.type)} size="lg" color="gray.500" />
                        </Flex>
                      )}
                    </Box>

                    {/* File Info */}
                    <VStack align="start" spacing={1} flex={1} minW={0}>
                      <Text fontWeight="medium" fontSize="sm" noOfLines={1}>
                        {file.file.name}
                      </Text>
                      <HStack spacing={2}>
                        <Badge size="sm" colorScheme={
                          file.type === 'image' ? 'blue' :
                          file.type === 'video' ? 'purple' :
                          file.type === 'audio' ? 'green' : 'gray'
                        }>
                          {file.type}
                        </Badge>
                        <Text fontSize="xs" color="gray.500">
                          {(file.file.size / 1024 / 1024).toFixed(1)}MB
                        </Text>
                      </HStack>
                      
                      {/* Upload Progress */}
                      {file.status === 'uploading' && (
                        <Box w="full">
                          <Progress
                            value={file.uploadProgress}
                            size="sm"
                            colorScheme="blue"
                            borderRadius="sm"
                          />
                          <Text fontSize="xs" color="gray.500" mt={1}>
                            {Math.round(file.uploadProgress)}% uploaded
                          </Text>
                        </Box>
                      )}
                      
                      {/* Status */}
                      {file.status === 'completed' && (
                        <HStack>
                          <Icon as={FiCheck} color="green.500" size="sm" />
                          <Text fontSize="xs" color="green.500">
                            Upload complete
                          </Text>
                        </HStack>
                      )}
                      
                      {file.status === 'error' && (
                        <Text fontSize="xs" color="red.500">
                          {file.error || 'Upload failed'}
                        </Text>
                      )}
                    </VStack>

                    {/* Remove Button */}
                    <IconButton
                      aria-label="Remove file"
                      icon={<Icon as={FiX} />}
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => removeFile(file.id)}
                    />
                  </Flex>
                </CardBody>
              </Card>
            ))}
          </Grid>
        </Box>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(',')}
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files) {
            handleFileUpload(e.target.files)
          }
        }}
      />
    </VStack>
  )
}

export default MediaUploadWidget