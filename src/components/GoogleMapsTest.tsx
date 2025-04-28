import React, { useState } from 'react';
import runGoogleMapsTests, { testGoogleMapsAPI, testGoogleMapsJsAPI, testWithNewApiKey } from '../utils/googleMapsTest';
import { 
  Box, 
  Button, 
  Heading, 
  Text, 
  VStack, 
  HStack, 
  Code, 
  Divider, 
  useToast,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from '@chakra-ui/react';
import GoogleMapsKeyManager from './GoogleMapsKeyManager';
import googleMapsLoader from '../services/googleMapsLoader';

/**
 * A component to test Google Maps API functionality
 */
const GoogleMapsTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  // Run all tests
  const handleRunTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const results = await runGoogleMapsTests();
      setTestResults(results);
      
      // Show toast notification with results
      toast({
        title: results.allTestsPassed ? 'All tests passed!' : 'Test failed',
        description: results.allTestsPassed 
          ? 'Google Maps API is working correctly' 
          : 'Some tests failed. Check the results for details.',
        status: results.allTestsPassed ? 'success' : 'error',
        duration: 5000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error running tests:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      
      toast({
        title: 'Error',
        description: 'Failed to run Google Maps tests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Format test result as a human-readable string
  const formatTestResult = (result: any): string => {
    return JSON.stringify(result, null, 2);
  };

  return (
    <Box p={6} borderWidth="1px" borderRadius="lg" maxW="800px" mx="auto" my={8}>
      <Heading as="h1" size="lg" mb={4}>Google Maps API Test</Heading>
      
      <Text mb={4}>
        This component tests if the Google Maps API is accessible and the API key is valid.
      </Text>
      
      <Accordion allowToggle mb={6}>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box flex="1" textAlign="left" fontWeight="bold">
                Manage Google Maps API Key
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Text mb={4}>
              Current API Key: <Code>{googleMapsLoader.getApiKey() || '[Not Set]'}</Code>
            </Text>
            
            <GoogleMapsKeyManager 
              onKeyChanged={(newKey) => {
                toast({
                  title: 'API Key Updated',
                  description: 'The Google Maps API key has been updated.',
                  status: 'info',
                  duration: 3000,
                  isClosable: true,
                });
                
                // Clear previous test results
                setTestResults(null);
              }}
            />
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
      
      <VStack spacing={4} align="stretch" mb={6}>
        <HStack justify="center" spacing={4}>
          <Button 
            colorScheme="blue" 
            onClick={handleRunTests}
            isLoading={isLoading}
            loadingText="Running Tests"
          >
            Run All Tests
          </Button>
        </HStack>

        {error && (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {testResults && (
          <Box mt={4}>
            <Heading size="md" mb={2}>Test Results</Heading>
            
            <Divider my={4} />
            
            <Box bg="gray.50" p={4} borderRadius="md" overflowX="auto">
              <Heading size="sm" mb={2}>REST API Test</Heading>
              <Text color={testResults.restApiTest.success ? 'green.500' : 'red.500'} fontWeight="bold">
                {testResults.restApiTest.success ? 'Success ✅' : 'Failed ❌'}
              </Text>
              {testResults.restApiTest.error && (
                <Text color="red.500" mt={2}>Error: {testResults.restApiTest.error}</Text>
              )}
              <Text fontSize="sm" mt={2}>
                <pre>{formatTestResult(testResults.restApiTest)}</pre>
              </Text>
            </Box>
            
            <Divider my={4} />
            
            <Box bg="gray.50" p={4} borderRadius="md" overflowX="auto">
              <Heading size="sm" mb={2}>JavaScript API Test</Heading>
              <Text color={testResults.jsApiTest.success ? 'green.500' : 'red.500'} fontWeight="bold">
                {testResults.jsApiTest.success ? 'Success ✅' : 'Failed ❌'}
              </Text>
              {testResults.jsApiTest.error && (
                <Text color="red.500" mt={2}>Error: {testResults.jsApiTest.error}</Text>
              )}
              <Text fontSize="sm" mt={2}>
                <pre>{formatTestResult(testResults.jsApiTest)}</pre>
              </Text>
            </Box>
            
            <Divider my={4} />
            
            <Alert 
              status={testResults.allTestsPassed ? 'success' : 'error'}
              variant="subtle"
              borderRadius="md"
              mt={4}
            >
              <AlertIcon />
              <Box>
                <AlertTitle>
                  {testResults.allTestsPassed ? 'All Tests Passed!' : 'Some Tests Failed'}
                </AlertTitle>
                <AlertDescription>
                  {testResults.allTestsPassed 
                    ? 'Google Maps API is working correctly with your API key.' 
                    : 'Please check the test results and update your API key if needed.'}
                </AlertDescription>
              </Box>
            </Alert>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default GoogleMapsTest; 