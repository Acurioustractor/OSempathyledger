import React from 'react';
import {
  Box,
  Flex,
  Heading,
  Text,
  HStack,
  VStack,
  useColorModeValue
} from '@chakra-ui/react';
import { ChakraBreadcrumbs, ChakraBreadcrumbItem } from './ChakraBreadcrumbs';
import { ChakraQuickActions, ChakraQuickAction } from './ChakraQuickActions';

interface ChakraNavigationToolbarProps {
  title?: string;
  subtitle?: string;
  breadcrumbs?: ChakraBreadcrumbItem[];
  quickActions?: ChakraQuickAction[];
  showBreadcrumbs?: boolean;
  showQuickActions?: boolean;
  context?: {
    currentItem?: any;
    selectedItems?: any[];
    canEdit?: boolean;
    canDelete?: boolean;
  };
  onActionClick?: (actionId: string) => void;
}

export const ChakraNavigationToolbar: React.FC<ChakraNavigationToolbarProps> = ({
  title,
  subtitle,
  breadcrumbs,
  quickActions,
  showBreadcrumbs = true,
  showQuickActions = true,
  context,
  onActionClick
}) => {
  const bgColor = useColorModeValue('white', 'gray.900');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={{ base: 4, md: 6, lg: 8 }}
      py={4}
    >
      <VStack align="stretch" spacing={4}>
        {/* Breadcrumbs Row */}
        {showBreadcrumbs && (
          <Box>
            <ChakraBreadcrumbs items={breadcrumbs} />
          </Box>
        )}
        
        {/* Title and Actions Row */}
        <Flex align="center" justify="space-between">
          <Box flex="1" minW="0">
            {title && (
              <Heading
                size="lg"
                noOfLines={1}
                color={useColorModeValue('gray.900', 'white')}
              >
                {title}
              </Heading>
            )}
            {subtitle && (
              <Text
                mt={1}
                fontSize="sm"
                color={useColorModeValue('gray.600', 'gray.400')}
                noOfLines={2}
              >
                {subtitle}
              </Text>
            )}
          </Box>
          
          {showQuickActions && (
            <Box ml={4}>
              <ChakraQuickActions
                actions={quickActions}
                context={context}
                onActionClick={onActionClick}
              />
            </Box>
          )}
        </Flex>
      </VStack>
    </Box>
  );
}; 