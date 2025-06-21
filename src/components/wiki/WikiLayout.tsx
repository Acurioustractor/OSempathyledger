import React from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';

interface WikiLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

const WikiLayout: React.FC<WikiLayoutProps> = ({ sidebar, children }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const sidebarBgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Flex h="calc(100vh - 4rem)" bg={bgColor}>
      <Box
        as="aside"
        w={{ base: 'full', md: '280px' }}
        h="full"
        bg={sidebarBgColor}
        borderRight="1px solid"
        borderColor={borderColor}
        p={5}
        overflowY="auto"
        display={{ base: 'none', md: 'block' }}
      >
        {sidebar}
      </Box>
      <Box as="main" flex="1" p={8} overflowY="auto">
        {children}
      </Box>
    </Flex>
  );
};

export default WikiLayout; 