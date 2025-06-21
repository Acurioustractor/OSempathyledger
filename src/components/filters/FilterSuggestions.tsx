import React, { useMemo } from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Button,
  Tag,
  TagLabel,
  TagLeftIcon,
  Wrap,
  WrapItem,
  useColorModeValue,
  Icon,
  Tooltip,
} from '@chakra-ui/react';
import {
  LightBulbIcon,
  TagIcon,
  PeopleIcon,
  LocationIcon,
  CalendarIcon,
  VideoIcon,
} from '@primer/octicons-react';
import { useLocation } from 'react-router-dom';
import { useAirtableData } from '../../context/AirtableDataContext';
import { useFilters } from '../../context/FilterContext';
import { filterSuggestionsService, FilterSuggestion } from '../../services/filterSuggestionsService';

interface FilterSuggestionsProps {
  maxSuggestions?: number;
  compact?: boolean;
  onSuggestionClick?: (suggestion: FilterSuggestion) => void;
}

export const FilterSuggestions: React.FC<FilterSuggestionsProps> = ({
  maxSuggestions = 5,
  compact = false,
  onSuggestionClick,
}) => {
  const location = useLocation();
  const { data } = useAirtableData();
  const { filters, updateFilter } = useFilters();
  
  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconColor = useColorModeValue('gray.500', 'gray.400');
  
  // Generate suggestions based on current context
  const suggestions = useMemo(() => {
    if (!data) return [];
    
    const context = {
      stories: data.stories,
      storytellers: data.storytellers,
      themes: data.themes,
      media: data.media,
      tags: data.tags,
      currentPath: location.pathname,
    };
    
    return filterSuggestionsService.generateSuggestions(
      context,
      filters,
      maxSuggestions
    );
  }, [data, filters, location.pathname, maxSuggestions]);
  
  const handleSuggestionClick = (suggestion: FilterSuggestion) => {
    // Apply the suggested filter
    switch (suggestion.type) {
      case 'themes':
        updateFilter('themes', [...filters.themes, suggestion.value as string]);
        break;
      case 'storytellers':
        updateFilter('storytellers', [...filters.storytellers, suggestion.value as string]);
        break;
      case 'locations':
        updateFilter('locations', [...filters.locations, suggestion.value as string]);
        break;
      case 'mediaTypes':
        updateFilter('mediaTypes', [...filters.mediaTypes, suggestion.value as string]);
        break;
      case 'dateRange':
        const [start, end] = suggestion.value as string[];
        updateFilter('dateRange', {
          start: new Date(start),
          end: new Date(end),
        });
        break;
    }
    
    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'themes':
        return TagIcon;
      case 'storytellers':
        return PeopleIcon;
      case 'locations':
        return LocationIcon;
      case 'dateRange':
        return CalendarIcon;
      case 'mediaTypes':
        return VideoIcon;
      default:
        return TagIcon;
    }
  };
  
  const getColorScheme = (type: string) => {
    switch (type) {
      case 'themes':
        return 'purple';
      case 'storytellers':
        return 'blue';
      case 'locations':
        return 'green';
      case 'dateRange':
        return 'orange';
      case 'mediaTypes':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  if (suggestions.length === 0) {
    return null;
  }
  
  if (compact) {
    return (
      <Wrap spacing={2}>
        {suggestions.map((suggestion, index) => (
          <WrapItem key={`${suggestion.type}-${suggestion.value}-${index}`}>
            <Tooltip label={suggestion.reason} hasArrow>
              <Tag
                size="sm"
                colorScheme={getColorScheme(suggestion.type)}
                cursor="pointer"
                onClick={() => handleSuggestionClick(suggestion)}
                _hover={{ opacity: 0.8 }}
              >
                <TagLeftIcon as={getIcon(suggestion.type)} />
                <TagLabel>
                  {suggestion.label}
                  {suggestion.count && ` (${suggestion.count})`}
                </TagLabel>
              </Tag>
            </Tooltip>
          </WrapItem>
        ))}
      </Wrap>
    );
  }
  
  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
    >
      <VStack align="stretch" spacing={3}>
        <HStack>
          <Icon as={LightBulbIcon} color={iconColor} />
          <Text fontSize="sm" fontWeight="medium">
            Suggested Filters
          </Text>
        </HStack>
        
        <VStack align="stretch" spacing={2}>
          {suggestions.map((suggestion, index) => (
            <Button
              key={`${suggestion.type}-${suggestion.value}-${index}`}
              variant="ghost"
              size="sm"
              justifyContent="space-between"
              onClick={() => handleSuggestionClick(suggestion)}
              leftIcon={<Icon as={getIcon(suggestion.type)} />}
              rightIcon={
                suggestion.count ? (
                  <Tag size="sm" colorScheme={getColorScheme(suggestion.type)}>
                    {suggestion.count}
                  </Tag>
                ) : undefined
              }
            >
              <VStack align="start" spacing={0} flex={1}>
                <Text>{suggestion.label}</Text>
                <Text fontSize="xs" color="gray.500">
                  {suggestion.reason}
                </Text>
              </VStack>
            </Button>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
};

export default FilterSuggestions;