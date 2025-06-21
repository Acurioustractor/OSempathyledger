import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Heading, 
  VStack, 
  Spinner, 
  Alert, 
  AlertIcon, 
  Link as ChakraLink,
  InputGroup,
  InputLeftElement,
  Input,
  Tag,
  Wrap,
  WrapItem
} from '@chakra-ui/react';
import { NavLink as RouterLink, useParams } from 'react-router-dom';
import { SearchIcon } from '@chakra-ui/icons';

interface Article {
  slug: string;
  title: string;
  tags: string[];
}

const WikiSidebar: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/docs/index.json');
        if (!response.ok) {
          throw new Error('Could not fetch article list.');
        }
        const data = await response.json();
        setArticles(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    articles.forEach(article => {
      if (article.tags) {
        article.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [articles]);

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesSearch = searchTerm
        ? article.title.toLowerCase().includes(searchTerm.toLowerCase())
        : true;
      const matchesTag = selectedTag
        ? article.tags?.includes(selectedTag)
        : true;
      return matchesSearch && matchesTag;
    });
  }, [articles, searchTerm, selectedTag]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert status="error" variant="subtle">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Heading size="md" mb={4}>
        Documentation
      </Heading>
      <InputGroup mb={4}>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input 
          placeholder="Search articles..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>
      
      <Heading size="sm" mb={3}>Tags</Heading>
      <Wrap mb={6}>
        <WrapItem>
            <Tag
              as="button"
              size="md"
              variant={!selectedTag ? 'solid' : 'outline'}
              colorScheme="orange"
              onClick={() => setSelectedTag(null)}
              _focus={{ boxShadow: 'outline' }}
            >
              All
            </Tag>
        </WrapItem>
        {allTags.map(tag => (
          <WrapItem key={tag}>
            <Tag
              as="button"
              size="md"
              variant={selectedTag === tag ? 'solid' : 'outline'}
              colorScheme="teal"
              onClick={() => setSelectedTag(tag)}
              _focus={{ boxShadow: 'outline' }}
            >
              {tag}
            </Tag>
          </WrapItem>
        ))}
      </Wrap>
      
      <Heading size="sm" mb={3}>Articles</Heading>
      <VStack align="stretch" spacing={1}>
        {filteredArticles.length > 0 ? (
          filteredArticles.map(article => (
            <ChakraLink
              key={article.slug}
              as={RouterLink}
              to={`/wiki/${article.slug}`}
              display="block"
              p={2}
              borderRadius="md"
              bg={slug === article.slug ? 'orange.100' : 'transparent'}
              fontWeight={slug === article.slug ? 'bold' : 'normal'}
              color={slug === article.slug ? 'orange.800' : 'inherit'}
              _hover={{
                bg: 'gray.100',
                textDecoration: 'none',
              }}
              _activeLink={{
                bg: 'orange.200',
                fontWeight: 'bold',
              }}
            >
              {article.title}
            </ChakraLink>
          ))
        ) : (
          <Box p={2} color="gray.500">No articles found.</Box>
        )}
      </VStack>
    </Box>
  );
};

export default WikiSidebar;
