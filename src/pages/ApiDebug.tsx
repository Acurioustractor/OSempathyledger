import React, { useState, useEffect } from 'react';
import { Box, Button, VStack, Text, Heading, Code, Alert, AlertIcon, Spinner } from '@chakra-ui/react';
import { fetchMedia, fetchStories, fetchThemes, fetchStorytellers, fetchQuotes, fetchTags } from '../services/airtable';

type ApiState = {
  status: 'idle' | 'loading' | 'success' | 'error';
  data: any[] | null;
  error: string | null;
};

const ApiDebug: React.FC = () => {
  const [apiStates, setApiStates] = useState<Record<string, ApiState>>({
    media: { status: 'idle', data: null, error: null },
    stories: { status: 'idle', data: null, error: null },
    themes: { status: 'idle', data: null, error: null },
    storytellers: { status: 'idle', data: null, error: null },
    quotes: { status: 'idle', data: null, error: null },
    tags: { status: 'idle', data: null, error: null }
  });

  const [envVariables, setEnvVariables] = useState<Record<string, string>>({});

  // Check environment variables
  useEffect(() => {
    const env: Record<string, string> = {};
    if (import.meta.env.VITE_AIRTABLE_API_KEY) {
      env['VITE_AIRTABLE_API_KEY'] = `${import.meta.env.VITE_AIRTABLE_API_KEY.slice(0, 3)}...${import.meta.env.VITE_AIRTABLE_API_KEY.slice(-3)}`;
    } else {
      env['VITE_AIRTABLE_API_KEY'] = 'missing';
    }
    
    env['VITE_AIRTABLE_BASE_ID'] = import.meta.env.VITE_AIRTABLE_BASE_ID || 'missing';
    env['VITE_AIRTABLE_TABLE_NAME'] = import.meta.env.VITE_AIRTABLE_TABLE_NAME || 'missing';
    env['VITE_BASE_PATH'] = import.meta.env.VITE_BASE_PATH || 'missing';
    
    setEnvVariables(env);
  }, []);

  const testApi = async (name: string, fetchFn: () => Promise<any[]>) => {
    setApiStates(prev => ({
      ...prev,
      [name]: { ...prev[name], status: 'loading', error: null }
    }));

    try {
      const data = await fetchFn();
      console.log(`[Debug] ${name} data:`, data);
      setApiStates(prev => ({
        ...prev,
        [name]: { status: 'success', data, error: null }
      }));
    } catch (error: any) {
      console.error(`[Debug] ${name} error:`, error);
      setApiStates(prev => ({
        ...prev,
        [name]: { 
          status: 'error', 
          data: null, 
          error: error?.message || `Error fetching ${name}`
        }
      }));
    }
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Heading mb={4}>API Debug Page</Heading>
      <Text mb={6}>
        This page helps diagnose API connection issues with Airtable.
      </Text>

      <Heading size="md" mb={3}>Environment Variables</Heading>
      <Box p={4} bg="gray.50" borderRadius="md" mb={6}>
        <Code display="block" whiteSpace="pre" p={3}>
          {Object.entries(envVariables).map(([key, value]) => (
            `${key}: ${value}\n`
          ))}
        </Code>
      </Box>

      <Heading size="md" mb={3}>API Tests</Heading>
      <VStack spacing={4} align="stretch" mb={6}>
        {Object.entries(apiStates).map(([name, state]) => (
          <Box key={name} p={4} borderWidth={1} borderRadius="md" position="relative">
            <Heading size="sm" mb={2} textTransform="capitalize">{name}</Heading>
            <Button 
              size="sm" 
              colorScheme="blue" 
              isLoading={state.status === 'loading'}
              onClick={() => {
                switch(name) {
                  case 'media': return testApi(name, fetchMedia);
                  case 'stories': return testApi(name, fetchStories);
                  case 'themes': return testApi(name, fetchThemes);
                  case 'storytellers': return testApi(name, fetchStorytellers);
                  case 'quotes': return testApi(name, fetchQuotes);
                  case 'tags': return testApi(name, fetchTags);
                }
              }}
              mb={4}
            >
              Test {name} API
            </Button>

            {state.status === 'loading' && (
              <Box position="absolute" top={4} right={4}>
                <Spinner size="sm" />
              </Box>
            )}

            {state.status === 'success' && (
              <Alert status="success" mb={3}>
                <AlertIcon />
                Success! Retrieved {state.data?.length || 0} records.
              </Alert>
            )}

            {state.status === 'error' && (
              <Alert status="error" mb={3}>
                <AlertIcon />
                {state.error}
              </Alert>
            )}

            {state.status === 'success' && state.data && (
              <Box maxH="200px" overflowY="auto" p={2} bg="gray.50" borderRadius="md">
                <Code fontSize="xs" display="block" whiteSpace="pre" overflowX="auto">
                  {JSON.stringify(state.data.slice(0, 2), null, 2)}
                  {state.data.length > 2 ? '\n... and more records' : ''}
                </Code>
              </Box>
            )}
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

export default ApiDebug; 