import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { HomeIcon } from '@primer/octicons-react';

export interface ChakraBreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
  icon?: React.ComponentType<any>;
}

interface ChakraBreadcrumbsProps {
  items?: ChakraBreadcrumbItem[];
}

const routeLabels: Record<string, string> = {
  '': 'Home',
  'stories': 'Stories',
  'storytellers': 'Storytellers',
  'themes': 'Themes',
  'media': 'Media',
  'gallery': 'Gallery',
  'quotes': 'Quotes',
  'shifts': 'Shifts',
  'visualizations': 'Visualizations',
  'analysis': 'Analysis',
  'wiki': 'Wiki',
  'impact': 'Impact Analytics',
  'team-experience': 'Team Experience',
  'vision': 'Vision',
  'tags': 'Tags',
  'debug': 'Debug',
  'story-capture': 'Story Capture',
  'photographer': 'Photographer Dashboard'
};

export const ChakraBreadcrumbs: React.FC<ChakraBreadcrumbsProps> = ({ items: customItems }) => {
  const location = useLocation();
  const linkColor = useColorModeValue('gray.600', 'gray.400');
  const currentColor = useColorModeValue('gray.900', 'white');
  
  const generateBreadcrumbs = (): ChakraBreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: ChakraBreadcrumbItem[] = [
      { label: 'Home', href: '/', icon: HomeIcon }
    ];
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Handle dynamic segments (IDs)
      const label = routeLabels[segment] || 
        (segment.length > 10 ? `${segment.substring(0, 10)}...` : segment);
      
      breadcrumbs.push({
        label,
        href: isLast ? undefined : currentPath,
        current: isLast
      });
    });
    
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
      {breadcrumbs.map((item, index) => (
        <BreadcrumbItem key={index} isCurrentPage={item.current}>
          {item.current ? (
            <BreadcrumbLink
              color={currentColor}
              fontWeight="medium"
              display="flex"
              alignItems="center"
            >
              {item.icon && <Icon as={item.icon} mr={1} boxSize={4} />}
              {item.label}
            </BreadcrumbLink>
          ) : (
            <BreadcrumbLink
              as={RouterLink}
              to={item.href!}
              color={linkColor}
              _hover={{ color: 'orange.500' }}
              display="flex"
              alignItems="center"
            >
              {item.icon && <Icon as={item.icon} mr={1} boxSize={4} />}
              {item.label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}; 