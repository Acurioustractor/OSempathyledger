import React, { useState, useEffect } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  Code,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Badge,
  Divider,
} from '@chakra-ui/react'
import { fetchStories } from '../services/dataService'

const DebugStoriesPage = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stories, setStories] = useState<any[]>([])
  const [apiInfo, setApiInfo] = useState<any>({})
  const [rawResponse, setRawResponse] = useState<any>(null)

  const checkEnvironment = () => {
    const env = {
      VITE_DATA_PROVIDER: import.meta.env.VITE_DATA_PROVIDER || 'not set',
      VITE_AIRTABLE_API_KEY: import.meta.env.VITE_AIRTABLE_API_KEY ? '***' + import.meta.env.VITE_AIRTABLE_API_KEY.slice(-4) : 'not set',
      VITE_AIRTABLE_BASE_ID: import.meta.env.VITE_AIRTABLE_BASE_ID || 'not set',
      VITE_AIRTABLE_TABLE_NAME: import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'not set',
      VITE_DATA_SOURCE: import.meta.env.VITE_DATA_SOURCE || 'not set',
      VITE_ENABLE_DATA_FALLBACK: import.meta.env.VITE_ENABLE_DATA_FALLBACK || 'not set',
    }
    setApiInfo(env)
  }

  const testFetchStories = async () => {
    setLoading(true)
    setError(null)
    setStories([])
    setRawResponse(null)

    try {
      console.log('Starting fetchStories test...')
      
      // Add console logging to track the request
      const originalConsoleLog = console.log
      const logs: string[] = []
      console.log = (...args) => {
        logs.push(args.join(' '))
        originalConsoleLog(...args)
      }

      const startTime = Date.now()
      const result = await fetchStories({
        pageSize: 10,
        fields: ['Title', 'Status', 'Created', 'Story copy']
      })
      const endTime = Date.now()

      console.log = originalConsoleLog

      setRawResponse({
        logs,
        duration: endTime - startTime,
        resultType: typeof result,
        isArray: Array.isArray(result),
        length: Array.isArray(result) ? result.length : 0,
        firstRecord: result?.[0],
      })

      if (Array.isArray(result)) {
        setStories(result)
        console.log(`Successfully fetched ${result.length} stories`)
      } else {
        setError('Result is not an array: ' + typeof result)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(errorMessage)
      console.error('Error fetching stories:', err)
      
      // Check if it's a network error
      if (errorMessage.includes('fetch')) {
        setError(errorMessage + '\n\nThis might be a CORS issue or network problem.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkEnvironment()
  }, [])

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Debug Stories API</Heading>
        
        {/* Environment Variables */}
        <Box borderWidth="1px" borderRadius="md" p={4}>
          <Heading size="md" mb={3}>Environment Variables</Heading>
          <Code display="block" whiteSpace="pre" p={3}>
            {JSON.stringify(apiInfo, null, 2)}
          </Code>
        </Box>

        {/* Test Button */}
        <Box>
          <Button 
            colorScheme="blue" 
            onClick={testFetchStories}
            isLoading={loading}
            loadingText="Fetching stories..."
          >
            Test fetchStories()
          </Button>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert status="error">
            <AlertIcon />
            <Box>
              <Text fontWeight="bold">Error:</Text>
              <Code display="block" whiteSpace="pre-wrap" mt={2}>
                {error}
              </Code>
            </Box>
          </Alert>
        )}

        {/* Raw Response Info */}
        {rawResponse && (
          <Box borderWidth="1px" borderRadius="md" p={4}>
            <Heading size="md" mb={3}>Response Info</Heading>
            <VStack align="stretch" spacing={2}>
              <Text>Duration: <Badge>{rawResponse.duration}ms</Badge></Text>
              <Text>Result Type: <Badge>{rawResponse.resultType}</Badge></Text>
              <Text>Is Array: <Badge>{rawResponse.isArray ? 'Yes' : 'No'}</Badge></Text>
              <Text>Length: <Badge>{rawResponse.length}</Badge></Text>
              
              {rawResponse.logs && rawResponse.logs.length > 0 && (
                <>
                  <Divider my={2} />
                  <Text fontWeight="bold">Console Logs:</Text>
                  <Code display="block" whiteSpace="pre" p={3} fontSize="sm">
                    {rawResponse.logs.join('\n')}
                  </Code>
                </>
              )}

              {rawResponse.firstRecord && (
                <>
                  <Divider my={2} />
                  <Text fontWeight="bold">First Record:</Text>
                  <Code display="block" whiteSpace="pre" p={3} fontSize="sm">
                    {JSON.stringify(rawResponse.firstRecord, null, 2)}
                  </Code>
                </>
              )}
            </VStack>
          </Box>
        )}

        {/* Stories Display */}
        {stories.length > 0 && (
          <Box borderWidth="1px" borderRadius="md" p={4}>
            <Heading size="md" mb={3}>
              Stories ({stories.length})
            </Heading>
            <VStack align="stretch" spacing={4}>
              {stories.map((story, index) => (
                <Box key={story.id || index} p={3} bg="gray.50" borderRadius="md">
                  <Text fontWeight="bold">
                    {story.Title || story.fields?.Title || 'No title'}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    ID: {story.id || 'No ID'}
                  </Text>
                  <Code display="block" whiteSpace="pre" p={2} mt={2} fontSize="xs">
                    {JSON.stringify(story, null, 2)}
                  </Code>
                </Box>
              ))}
            </VStack>
          </Box>
        )}

        {/* Instructions */}
        <Alert status="info">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Debugging Steps:</Text>
            <Text mt={2}>
              1. Check the environment variables above
              <br />
              2. Click "Test fetchStories()" to make an API call
              <br />
              3. Check the browser console (F12) for detailed logs
              <br />
              4. Look for CORS errors in the Network tab
              <br />
              5. Verify the API response structure
            </Text>
          </Box>
        </Alert>
      </VStack>
    </Container>
  )
}

export default DebugStoriesPage