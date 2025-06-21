import React from 'react';
import { Flex, Box } from '@chakra-ui/react';
import Breadcrumbs from './Breadcrumbs';
import { QuickActions } from './QuickActions';

export const NavigationToolbar = () => {
  return (
    <Flex justify="space-between" align="center" p={4} bg="gray.50" borderRadius="md">
      <Box>
        <Breadcrumbs />
      </Box>
      <Box>
        <QuickActions />
      </Box>
    </Flex>
  );
}; 