import React from 'react';
import { Badge, HStack, Icon, Tooltip, Text } from '@chakra-ui/react';
import { HeartIcon } from '@primer/octicons-react';

interface OrangeSkyBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  variant?: 'badge' | 'text';
}

const OrangeSkyBadge: React.FC<OrangeSkyBadgeProps> = ({ 
  size = 'md', 
  showIcon = true,
  variant = 'badge'
}) => {
  const content = (
    <HStack spacing={1}>
      {showIcon && <Icon as={HeartIcon} />}
      <Text>Orange Sky</Text>
    </HStack>
  );

  if (variant === 'text') {
    return (
      <Tooltip label="This story is part of the Orange Sky project">
        <HStack spacing={1} color="orange.500" fontSize={size}>
          {content}
        </HStack>
      </Tooltip>
    );
  }

  return (
    <Tooltip label="This story is part of the Orange Sky project">
      <Badge 
        colorScheme="orange" 
        size={size}
        display="inline-flex"
        alignItems="center"
        gap={1}
      >
        {content}
      </Badge>
    </Tooltip>
  );
};

export default OrangeSkyBadge;