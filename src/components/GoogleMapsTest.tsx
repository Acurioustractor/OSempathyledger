import React, { useState, useEffect } from 'react';
import { Box, Button, Heading, Text, Code, VStack, HStack, Badge, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription, Divider } from '@chakra-ui/react';
import runGoogleMapsTests, { testGoogleMapsAPI, testGoogleMapsJsAPI } from '../utils/googleMapsTest';

interface TestResult {
  running: boolean;
  success?: boolean;
  error?: string;
  details?: Record<string, any>;
}

const GoogleMapsTest: React.FC = () => {
  const [restApiTest, setRestApiTest] = useState<TestResult>({ running: false });
  const [jsApiTest, setJsApiTest] = useState<TestResult>({ running: false });
  
  const runTests = async () => {
    // Reset states
    setRestApiTest({ running: true });
    setJsApiTest({ running: true });
    
    try {
      // Test REST API
      const restResult = await testGoogleMapsAPI();
      setRestApiTest({ 
        running: false, 
        success: restResult.success, 
        error: restResult.error,
        details: restResult.details
      });
      
      // Test JavaScript API
      const jsResult = await testGoogleMapsJsAPI();
      setJsApiTest({ 
        running: false, 
        success: jsResult.success, 
        error: jsResult.error
      });
    } catch (error) {
      console.error('Error running tests:', error);
      setRestApiTest(prev => ({ ...prev, running: false, error: 'Test failed to run' }));
      setJsApiTest(prev => ({ ...prev, running: false, error: 'Test failed to run' }));
    }
  };
  
  useEffect(() => {
    // Run tests on component mount
    runTests();
  }, []);
  
  return (
    <Box p={5} borderWidth={1} borderRadius="lg" shadow="md" bg="white">
      <Heading size="md" mb={4}>Google Maps API Tests</Heading>
      
      <VStack spacing={6} align="stretch">
        {/* REST API Test */}
        <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
          <HStack mb={2} justify="space-between">
            <Heading size="sm">REST API Test</Heading>
            <Badge colorScheme={
              restApiTest.running ? 'blue' : 
              restApiTest.success ? 'green' : 'red'
            }>
              {restApiTest.running ? 'Running' : 
               restApiTest.success ? 'Success' : 'Failed'}
            </Badge>
          </HStack>
          
          {restApiTest.running ? (
            <HStack spacing={3}>
              <Spinner size="sm" />
              <Text>Testing Google Maps Geocoding API...</Text>
            </HStack>
          ) : restApiTest.success ? (
            <Alert status="success" variant="subtle" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                The Google Maps REST API is accessible and your API key is valid.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert status="error" variant="subtle" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {restApiTest.error || 'Unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}
          
          {restApiTest.details && (
            <Box mt={3} p={2} borderRadius="md" bg="gray.100" fontSize="sm">
              <Text fontWeight="bold" mb={1}>API Response Details:</Text>
              <Code display="block" whiteSpace="pre" p={2} borderRadius="md" bg="gray.700" color="white" fontSize="xs" overflowX="auto">
                {JSON.stringify(restApiTest.details, null, 2)}
              </Code>
            </Box>
          )}
        </Box>
        
        {/* JavaScript API Test */}
        <Box p={4} borderWidth={1} borderRadius="md" bg="gray.50">
          <HStack mb={2} justify="space-between">
            <Heading size="sm">JavaScript API Test</Heading>
            <Badge colorScheme={
              jsApiTest.running ? 'blue' : 
              jsApiTest.success ? 'green' : 'red'
            }>
              {jsApiTest.running ? 'Running' : 
               jsApiTest.success ? 'Success' : 'Failed'}
            </Badge>
          </HStack>
          
          {jsApiTest.running ? (
            <HStack spacing={3}>
              <Spinner size="sm" />
              <Text>Testing Google Maps JavaScript API...</Text>
            </HStack>
          ) : jsApiTest.success ? (
            <Alert status="success" variant="subtle" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                The Google Maps JavaScript API loaded successfully.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert status="error" variant="subtle" borderRadius="md">
              <AlertIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {jsApiTest.error || 'Unknown error occurred'}
              </AlertDescription>
            </Alert>
          )}
        </Box>
        
        {/* Global Status */}
        <Box p={4} borderWidth={1} borderRadius="md" bg={
          (restApiTest.success && jsApiTest.success) ? 'green.50' :
          (!restApiTest.running && !jsApiTest.running) ? 'red.50' : 'blue.50'
        }>
          <Heading size="sm" mb={2}>Overall Status</Heading>
          
          {(restApiTest.running || jsApiTest.running) ? (
            <Text>Tests in progress...</Text>
          ) : (restApiTest.success && jsApiTest.success) ? (
            <Text fontWeight="medium" color="green.600">
              ✅ All tests passed! Google Maps should work correctly in your application.
            </Text>
          ) : (
            <VStack align="stretch" spacing={2}>
              <Text fontWeight="medium" color="red.600">
                ❌ Some tests failed. Google Maps might not work correctly.
              </Text>
              <Divider />
              <Heading size="xs" mt={1}>Troubleshooting Steps:</Heading>
              <Box pl={4}>
                <Text fontSize="sm">1. Check that your API key is correct in .env file</Text>
                <Text fontSize="sm">2. Verify API key has proper permissions in Google Cloud Console</Text>
                <Text fontSize="sm">3. Check network connectivity to Google Maps servers</Text>
                <Text fontSize="sm">4. Check if ad blockers might be affecting Google Maps</Text>
              </Box>
            </VStack>
          )}
        </Box>
      </VStack>
      
      <Button 
        mt={5} 
        colorScheme="blue" 
        onClick={runTests}
        isLoading={restApiTest.running || jsApiTest.running}
        loadingText="Running Tests"
      >
        Run Tests Again
      </Button>
    </Box>
  );
};

export default GoogleMapsTest; 