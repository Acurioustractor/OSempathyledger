import React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Text,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { HomeIcon, ChevronRightIcon } from '@primer/octicons-react';
import { Story, Storyteller, Theme } from '../../services/airtable';

export interface BreadcrumbSegment {
  label: string;
  path: string;
  icon?: React.ComponentType;
  count?: number;
}

interface BreadcrumbsProps {
  segments?: BreadcrumbSegment[];
  story?: Story;
  storyteller?: Storyteller;
  theme?: Theme;
  showHome?: boolean;
  maxItems?: number;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  segments = [],
  story,
  storyteller,
  theme,
  showHome = true,
  maxItems = 5,
}) => {
  const location = useLocation();
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const activeColor = useColorModeValue('gray.800', 'gray.200');
  const separatorColor = useColorModeValue('gray.400', 'gray.600');
  
  // Auto-generate breadcrumbs from current path if no segments provided
  const generateBreadcrumbs = (): BreadcrumbSegment[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbSegment[] = [];
    
    if (showHome) {
      breadcrumbs.push({ label: 'Home', path: '/', icon: HomeIcon });
    }
    
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      
      // Special handling for known routes
      switch (segment) {
        case 'stories':
          label = 'Stories';
          break;
        case 'storytellers':
          label = 'Storytellers';
          break;
        case 'themes':
          label = 'Themes';
          break;
        case 'gallery':
          label = 'Gallery';
          break;
        case 'wiki':
          label = 'Documentation';
          break;
        case 'analysis':
          label = 'Analysis';
          break;
        default:
          // For IDs, use entity names if provided
          if (index === pathSegments.length - 1) {
            if (story) label = story.Title;
            else if (storyteller) label = storyteller.Name;
            else if (theme) label = theme['Theme Name'] || theme.Name || label;
          }
      }
      
      breadcrumbs.push({ label, path: currentPath });
    });
    
    return breadcrumbs;
  };
  
  const finalSegments = segments.length > 0 ? segments : generateBreadcrumbs();
  
  // Truncate if too many items
  const displaySegments = finalSegments.length > maxItems
    ? [
        finalSegments[0],
        { label: '...', path: '#' },
        ...finalSegments.slice(-(maxItems - 2))
      ]
    : finalSegments;
  
  return (
    <Breadcrumb
      spacing={2}
      separator={<Icon as={ChevronRightIcon} color={separatorColor} />}
    >
      {displaySegments.map((segment, index) => {
        const isLast = index === displaySegments.length - 1;
        const isEllipsis = segment.label === '...';
        
        return (
          <BreadcrumbItem key={segment.path} isCurrentPage={isLast}>
            {isEllipsis ? (
              <Text color={textColor}>...</Text>
            ) : (
              <BreadcrumbLink
                as={RouterLink}
                to={segment.path}
                color={isLast ? activeColor : textColor}
                fontWeight={isLast ? 'medium' : 'normal'}
                _hover={{ color: activeColor, textDecoration: 'none' }}
              >
                <HStack spacing={1}>
                  {segment.icon && index === 0 && (
                    <Icon as={segment.icon} />
                  )}
                  <Text>{segment.label}</Text>
                  {segment.count !== undefined && (
                    <Text fontSize="sm" color="gray.500">
                      ({segment.count})
                    </Text>
                  )}
                </HStack>
              </BreadcrumbLink>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
};

export default Breadcrumbs;