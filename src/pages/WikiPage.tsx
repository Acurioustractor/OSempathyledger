import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import WikiLayout from '../components/wiki/WikiLayout';
import WikiContent from '../components/wiki/WikiContent';
import WikiSidebar from '../components/wiki/WikiSidebar';

const WikiPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  return (
    <WikiLayout sidebar={<WikiSidebar />}>
      {slug ? (
        <WikiContent slug={slug} />
      ) : (
        <Box textAlign="center" mt={20}>
          <Heading mb={4}>Welcome to the Wiki</Heading>
          <Text>Please select an article from the sidebar to get started.</Text>
        </Box>
      )}
    </WikiLayout>
  );
};

export default WikiPage; 