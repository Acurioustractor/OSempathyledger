import React, { useState, useEffect } from 'react';
import { Box, Spinner, Alert, AlertIcon, useColorModeValue, VStack, Heading } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css'; // or any other theme

interface WikiContentProps {
  slug: string;
}

const WikiContent: React.FC<WikiContentProps> = ({ slug }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markdownContainerBg = useColorModeValue('white', 'gray.800');
  const markdownContainerStyles = {
    p: { marginBottom: '1rem' },
    h1: { fontSize: '2.5rem', fontWeight: 'bold', mb: '1.5rem', pb: '0.5rem', borderBottom: '1px solid #ddd' },
    h2: { fontSize: '2rem', fontWeight: 'bold', mb: '1.25rem', pb: '0.5rem', borderBottom: '1px solid #ddd' },
    h3: { fontSize: '1.75rem', fontWeight: 'bold', mb: '1rem' },
    h4: { fontSize: '1.5rem', fontWeight: 'bold', mb: '0.75rem' },
    ul: { pl: '2rem', mb: '1rem' },
    ol: { pl: '2rem', mb: '1rem' },
    li: { mb: '0.5rem' },
    code: { 
      bg: useColorModeValue('gray.100', 'gray.700'), 
      px: '0.4em', 
      py: '0.2em', 
      borderRadius: 'md',
      fontFamily: 'monospace',
    },
    pre: { 
      bg: useColorModeValue('gray.100', 'gray.700'), 
      p: 4, 
      borderRadius: 'md', 
      overflowX: 'auto' as 'auto',
      mb: '1rem'
    },
    blockquote: {
      borderLeft: '4px solid',
      borderColor: useColorModeValue('gray.300', 'gray.600'),
      pl: 4,
      py: 2,
      mb: '1rem',
      fontStyle: 'italic',
      bg: useColorModeValue('gray.50', 'gray.900'),
    },
    a: {
      color: useColorModeValue('blue.500', 'blue.300'),
      textDecoration: 'underline',
    },
  };

  useEffect(() => {
    if (!slug) return;

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/docs/${slug}.md`);
        if (!response.ok) {
          throw new Error(`Could not find article: ${slug}.md`);
        }
        const text = await response.text();
        setContent(text);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [slug]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" h="100%">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }
  
  // Extract title from markdown
  const titleMatch = content.match(/^# (.*)/);
  const title = titleMatch ? titleMatch[1] : 'Wiki Article';

  return (
    <Box bg={markdownContainerBg} p={8} borderRadius="lg" shadow="md">
        <Heading as="h1" size="2xl" mb={8}>{title}</Heading>
      <Box sx={markdownContainerStyles}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {content.replace(/^# (.*)\n/, '')}
        </ReactMarkdown>
      </Box>
    </Box>
  );
};

export default WikiContent; 