import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Code,
  Alert,
  AlertIcon,
  Spinner,
  Button,
  Collapse,
  useDisclosure,
  Divider,
  Badge,
  Image,
  Container,
  HStack,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'
import {
  fetchMedia,
  fetchThemes,
  fetchQuotes,
  fetchGalleries,
  fetchStories,
  fetchTags,
  fetchStorytellers,
  AirtableError,
  Storyteller,
} from '../services/airtable'
import { getProfileImageOrFallback } from '../services/imageUtils'

// Import the BASE_URL from environment variables
const API_KEY = import.meta.env.VITE_AIRTABLE_API_KEY;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const BASE_URL = `https://api.airtable.com/v0/${BASE_ID}`;

interface TestResult {
  tableName: string
  status: 'loading' | 'success' | 'error'
  data?: any[]
  error?: any
  errorMessage?: string
  count?: number
  timing?: number
}

const TestConnection = () => {
  const [results, setResults] = useState<TestResult[]>([])
  const [showDebug, setShowDebug] = useState(false)
  const [storytellers, setStorytellers] = useState<Storyteller[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const testTable = async (
    tableName: string,
    fetchFn: () => Promise<any[]>,
    index: number
  ) => {
    setResults(prev => [
      ...prev,
      { tableName, status: 'loading' }
    ])
    
    const startTime = performance.now()
    
    try {
      const data = await fetchFn()
      const endTime = performance.now()
      const timing = Math.round(endTime - startTime)
      
      setResults(prev => 
        prev.map(result => 
          result.tableName === tableName 
            ? { 
                tableName,
                status: 'success', 
                data, 
                count: data.length,
                timing 
              }
            : result
        )
      )
      
    } catch (error) {
      setResults(prev => 
        prev.map(result => 
          result.tableName === tableName 
            ? { 
                tableName,
                status: 'error', 
                error, 
                errorMessage: error instanceof AirtableError
                  ? error.message
                  : error instanceof Error 
                    ? error.message
                    : 'Unknown error' 
              }
            : result
        )
      )
    }
  }
  
  const runTests = async () => {
    setResults([])
    testTable('Media', fetchMedia, 1)
    testTable('Themes', fetchThemes, 2) 
    testTable('Quotes', fetchQuotes, 3)
    testTable('Galleries', fetchGalleries, 4)
    testTable('Stories', fetchStories, 5)
    testTable('Tags', fetchTags, 6)
  }
  
  const toggleDebug = () => {
    setShowDebug(!showDebug)
  }
  
  const anyLoading = results.some(r => r.status === 'loading')

  const testStorytellers = async () => {
    setLoading(true)
    try {
      const result = await fetchStorytellers()
      console.log("Raw storytellers data:", result)
      setStorytellers(result)
      setError(null)
    } catch (err) {
      setError(`${err}`)
      console.error("Error fetching storytellers:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  return (
    <Container maxW="container.lg" py={8}>
      <Heading as="h1" mb={4}>Airtable Connection Test</Heading>
      <Text mb={6}>Testing connection to all Airtable tables and displaying results</Text>
      
      <HStack spacing={4} mb={6}>
        <Button onClick={runTests} colorScheme="blue" isLoading={anyLoading}>
          Run Tests Again
        </Button>
        
        <Button onClick={toggleDebug} variant="outline">
          {showDebug ? "Hide Debug Info" : "Show Debug Info"}
        </Button>
      </HStack>
      
      <VStack spacing={6} align="stretch">
        {results.map((result) => (
          <TableTest 
            key={result.tableName} 
            result={result} 
            showDebug={showDebug} 
          />
        ))}
      </VStack>
    </Container>
  )
}

// Component to display a table test result
const TableTest = ({ result, showDebug }: { result: TestResult, showDebug: boolean }) => {
  return (
    <Box 
      p={4} 
      borderWidth="1px" 
      borderRadius="lg" 
      backgroundColor={useColorModeValue('white', 'gray.700')}
    >
      <HStack justify="space-between" mb={2}>
        <Heading size="md">{result.tableName}</Heading>
        {result.timing && <Badge colorScheme="blue">{result.timing}MS</Badge>}
      </HStack>
      
      <Box p={4} bg="green.100" borderRadius="md">
        {result.status === 'loading' ? (
          <HStack>
            <Spinner size="sm" />
            <Text>Testing connection...</Text>
          </HStack>
        ) : result.status === 'error' ? (
          <Alert status="error">
            <AlertIcon />
            {result.errorMessage}
          </Alert>
        ) : (
          <HStack>
            <Box color="green.600" fontWeight="bold">✓</Box>
            <Text>Successfully connected. Found {result.count} records.</Text>
          </HStack>
        )}
      </Box>
      
      {showDebug && result.status === 'success' && (
        <Accordion allowToggle mt={4}>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                View Data Sample
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4} maxH="400px" overflow="auto">
              <Code display="block" whiteSpace="pre" p={2} borderRadius="md">
                {JSON.stringify(result.data?.slice(0, 3), null, 2)}
              </Code>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      )}
    </Box>
  )
}

export default TestConnection 