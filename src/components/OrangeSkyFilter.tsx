/**
 * Orange Sky Filter Component
 * Allows filtering content to show only Orange Sky related items
 */

import React from 'react';
import {
  Box,
  HStack,
  Switch,
  Text,
  Badge,
  FormControl,
  FormLabel,
  useColorModeValue,
} from '@chakra-ui/react';
import OrangeSkyBadge from './OrangeSkyBadge';

interface OrangeSkyFilterProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  count?: number;
  label?: string;
}

export const OrangeSkyFilter: React.FC<OrangeSkyFilterProps> = ({
  checked,
  onChange,
  count,
  label = 'Show Orange Sky content only'
}) => {
  const accentColor = '#FF6B35';
  const bgColor = useColorModeValue(
    checked ? 'orange.50' : 'transparent',
    checked ? 'whiteAlpha.100' : 'transparent'
  );

  return (
    <Box
      p={4}
      borderRadius="md"
      bg={bgColor}
      transition="background-color 0.3s ease"
      borderWidth="1px"
      borderColor={checked ? accentColor : 'transparent'}
    >
      <FormControl display="flex" alignItems="center">
        <HStack spacing={3} flex="1">
          <Switch
            id="orange-sky-filter"
            isChecked={checked}
            onChange={(e) => onChange(e.target.checked)}
            colorScheme="orange"
            sx={{
              '& .chakra-switch__track[data-checked]': {
                bg: accentColor,
              },
            }}
          />
          <FormLabel htmlFor="orange-sky-filter" mb="0" cursor="pointer">
            <HStack spacing={2}>
              <Text>{label}</Text>
              {checked && <OrangeSkyBadge size="sm" showTooltip={false} />}
            </HStack>
          </FormLabel>
        </HStack>
        {count !== undefined && (
          <Badge
            colorScheme={checked ? "orange" : "gray"}
            bg={checked ? accentColor : undefined}
            color={checked ? "white" : undefined}
            px={2}
            py={1}
            borderRadius="md"
          >
            {count} items
          </Badge>
        )}
      </FormControl>
    </Box>
  );
};

export default OrangeSkyFilter;