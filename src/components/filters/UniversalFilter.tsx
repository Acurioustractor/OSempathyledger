import React, { useMemo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Text,
  Icon,
  Flex,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Collapse,
  useDisclosure,
  IconButton,
  Badge,
  useColorModeValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from '@chakra-ui/react';
import {
  SearchIcon,
  FilterIcon,
  CalendarIcon,
  TagIcon,
  PeopleIcon,
  LocationIcon,
  ImageIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@primer/octicons-react';
import { useFilters } from '../../context/FilterContext';
import DateRangePicker from './DateRangePicker';
import OrangeSkyFilter from '../OrangeSkyFilter';
import { chakraSelectStyles } from './selectStyles';
import ReactSelect, { MultiValue } from 'react-select';

interface UniversalFilterProps {
  availableThemes?: Array<{ id: string; name: string }>;
  availableStorytellers?: Array<{ id: string; name: string }>;
  availableLocations?: string[];
  availableTags?: Array<{ id: string; name: string }>;
  availableMediaTypes?: string[];
  showMediaTypeFilter?: boolean;
  showDateFilter?: boolean;
  showOrangeSkyFilter?: boolean;
  compactMode?: boolean;
}

export const UniversalFilter: React.FC<UniversalFilterProps> = ({
  availableThemes = [],
  availableStorytellers = [],
  availableLocations = [],
  availableTags = [],
  availableMediaTypes = ['image', 'video', 'audio'],
  showMediaTypeFilter = false,
  showDateFilter = true,
  showOrangeSkyFilter = true,
  compactMode = false,
}) => {
  const { filters, updateFilter, updateFilters, resetFilters, activeFilterCount } = useFilters();
  const { isOpen, onToggle } = useDisclosure({ defaultIsOpen: !compactMode });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const tagBg = useColorModeValue('gray.100', 'gray.700');

  // Convert data for react-select
  const themeOptions = useMemo(() => 
    availableThemes.map(theme => ({ value: theme.id, label: theme.name })),
    [availableThemes]
  );

  const storytellerOptions = useMemo(() => 
    availableStorytellers.map(st => ({ value: st.id, label: st.name })),
    [availableStorytellers]
  );

  const locationOptions = useMemo(() => 
    availableLocations.map(loc => ({ value: loc, label: loc })),
    [availableLocations]
  );

  const tagOptions = useMemo(() => 
    availableTags.map(tag => ({ value: tag.id, label: tag.name })),
    [availableTags]
  );

  const mediaTypeOptions = useMemo(() => 
    availableMediaTypes.map(type => ({ value: type, label: type.charAt(0).toUpperCase() + type.slice(1) })),
    [availableMediaTypes]
  );

  const sortOptions = [
    { value: 'date', label: 'Date' },
    { value: 'title', label: 'Title' },
    { value: 'storyteller', label: 'Storyteller' },
    { value: 'location', label: 'Location' },
  ];

  const handleThemeChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    updateFilter('themes', newValue.map(item => item.value));
  };

  const handleStorytellerChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    updateFilter('storytellers', newValue.map(item => item.value));
  };

  const handleLocationChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    updateFilter('locations', newValue.map(item => item.value));
  };

  const handleTagChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    updateFilter('tags', newValue.map(item => item.value));
  };

  const handleMediaTypeChange = (newValue: MultiValue<{ value: string; label: string }>) => {
    updateFilter('mediaTypes', newValue.map(item => item.value));
  };

  const removeFilter = (filterType: keyof typeof filters, value?: string) => {
    if (Array.isArray(filters[filterType]) && value) {
      updateFilter(filterType as any, (filters[filterType] as string[]).filter(v => v !== value));
    } else {
      updateFilter(filterType as any, Array.isArray(filters[filterType]) ? [] : '');
    }
  };

  const activeFilters = useMemo(() => {
    const active: Array<{ type: string; value: string; label: string }> = [];
    
    if (filters.themes.length > 0) {
      filters.themes.forEach(id => {
        const theme = availableThemes.find(t => t.id === id);
        if (theme) active.push({ type: 'themes', value: id, label: `Theme: ${theme.name}` });
      });
    }
    
    if (filters.storytellers.length > 0) {
      filters.storytellers.forEach(id => {
        const storyteller = availableStorytellers.find(s => s.id === id);
        if (storyteller) active.push({ type: 'storytellers', value: id, label: `Storyteller: ${storyteller.name}` });
      });
    }
    
    if (filters.locations.length > 0) {
      filters.locations.forEach(loc => {
        active.push({ type: 'locations', value: loc, label: `Location: ${loc}` });
      });
    }
    
    if (filters.tags.length > 0) {
      filters.tags.forEach(id => {
        const tag = availableTags.find(t => t.id === id);
        if (tag) active.push({ type: 'tags', value: id, label: `Tag: ${tag.name}` });
      });
    }
    
    if (filters.mediaTypes.length > 0) {
      filters.mediaTypes.forEach(type => {
        active.push({ type: 'mediaTypes', value: type, label: `Type: ${type}` });
      });
    }
    
    if (filters.dateRange.start || filters.dateRange.end) {
      const dateLabel = filters.dateRange.start && filters.dateRange.end
        ? `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`
        : filters.dateRange.start
        ? `After ${filters.dateRange.start.toLocaleDateString()}`
        : `Before ${filters.dateRange.end!.toLocaleDateString()}`;
      active.push({ type: 'dateRange', value: 'dateRange', label: `Date: ${dateLabel}` });
    }
    
    return active;
  }, [filters, availableThemes, availableStorytellers, availableTags]);

  return (
    <Box
      bg={bgColor}
      p={4}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={borderColor}
      shadow={compactMode ? 'sm' : 'md'}
    >
      <VStack spacing={4} align="stretch">
        {/* Header with toggle */}
        <Flex justify="space-between" align="center">
          <HStack>
            <Icon as={FilterIcon} />
            <Text fontWeight="semibold">Filters</Text>
            {activeFilterCount > 0 && (
              <Badge colorScheme="orange" borderRadius="full">
                {activeFilterCount}
              </Badge>
            )}
          </HStack>
          
          <HStack>
            {activeFilterCount > 0 && (
              <Button size="sm" variant="ghost" onClick={resetFilters}>
                Clear all
              </Button>
            )}
            {compactMode && (
              <IconButton
                aria-label={isOpen ? 'Collapse filters' : 'Expand filters'}
                icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                size="sm"
                variant="ghost"
                onClick={onToggle}
              />
            )}
          </HStack>
        </Flex>

        {/* Search Input - Always visible */}
        <InputGroup>
          <InputLeftElement>
            <Icon as={SearchIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Search..."
            value={filters.searchTerm}
            onChange={(e) => updateFilter('searchTerm', e.target.value)}
          />
        </InputGroup>

        {/* Collapsible Filters */}
        <Collapse in={isOpen} animateOpacity>
          <VStack spacing={4} align="stretch">
            {/* Multi-select Filters */}
            {availableThemes.length > 0 && (
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  <Icon as={TagIcon} /> Themes
                </Text>
                <ReactSelect
                  isMulti
                  options={themeOptions}
                  value={themeOptions.filter(opt => filters.themes.includes(opt.value))}
                  onChange={handleThemeChange}
                  placeholder="Select themes..."
                  styles={chakraSelectStyles}
                />
              </Box>
            )}

            {availableStorytellers.length > 0 && (
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  <Icon as={PeopleIcon} /> Storytellers
                </Text>
                <ReactSelect
                  isMulti
                  options={storytellerOptions}
                  value={storytellerOptions.filter(opt => filters.storytellers.includes(opt.value))}
                  onChange={handleStorytellerChange}
                  placeholder="Select storytellers..."
                  styles={chakraSelectStyles}
                />
              </Box>
            )}

            {availableLocations.length > 0 && (
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  <Icon as={LocationIcon} /> Locations
                </Text>
                <ReactSelect
                  isMulti
                  options={locationOptions}
                  value={locationOptions.filter(opt => filters.locations.includes(opt.value))}
                  onChange={handleLocationChange}
                  placeholder="Select locations..."
                  styles={chakraSelectStyles}
                />
              </Box>
            )}

            {availableTags.length > 0 && (
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  <Icon as={TagIcon} /> Tags
                </Text>
                <ReactSelect
                  isMulti
                  options={tagOptions}
                  value={tagOptions.filter(opt => filters.tags.includes(opt.value))}
                  onChange={handleTagChange}
                  placeholder="Select tags..."
                  styles={chakraSelectStyles}
                />
              </Box>
            )}

            {showMediaTypeFilter && (
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  <Icon as={ImageIcon} /> Media Types
                </Text>
                <ReactSelect
                  isMulti
                  options={mediaTypeOptions}
                  value={mediaTypeOptions.filter(opt => filters.mediaTypes.includes(opt.value))}
                  onChange={handleMediaTypeChange}
                  placeholder="Select media types..."
                  styles={chakraSelectStyles}
                />
              </Box>
            )}

            {/* Date Range Filter */}
            {showDateFilter && (
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  <Icon as={CalendarIcon} /> Date Range
                </Text>
                <DateRangePicker
                  startDate={filters.dateRange.start}
                  endDate={filters.dateRange.end}
                  onChange={(range) => updateFilter('dateRange', range)}
                />
              </Box>
            )}

            {/* Sort Options */}
            <HStack spacing={4}>
              <Box flex="1">
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Sort By
                </Text>
                <ReactSelect
                  value={sortOptions.find(opt => opt.value === filters.sortBy)}
                  onChange={(newValue) => newValue && updateFilter('sortBy', newValue.value)}
                  options={sortOptions}
                  placeholder="Sort by..."
                  styles={chakraSelectStyles}
                />
              </Box>
              <Box>
                <Text fontSize="sm" mb={2} fontWeight="medium">
                  Direction
                </Text>
                <HStack>
                  <Button
                    size="sm"
                    variant={filters.sortDirection === 'asc' ? 'solid' : 'outline'}
                    onClick={() => updateFilter('sortDirection', 'asc')}
                  >
                    Asc
                  </Button>
                  <Button
                    size="sm"
                    variant={filters.sortDirection === 'desc' ? 'solid' : 'outline'}
                    onClick={() => updateFilter('sortDirection', 'desc')}
                  >
                    Desc
                  </Button>
                </HStack>
              </Box>
            </HStack>

            {/* Orange Sky Filter */}
            {showOrangeSkyFilter && (
              <OrangeSkyFilter
                checked={filters.showOrangeSkyOnly}
                onChange={(checked) => updateFilter('showOrangeSkyOnly', checked)}
              />
            )}
          </VStack>
        </Collapse>

        {/* Active Filters Tags */}
        {activeFilters.length > 0 && (
          <Wrap spacing={2}>
            {activeFilters.map((filter, index) => (
              <WrapItem key={`${filter.type}-${filter.value}-${index}`}>
                <Tag size="sm" bg={tagBg} borderRadius="full">
                  <TagLabel>{filter.label}</TagLabel>
                  <TagCloseButton
                    onClick={() => removeFilter(filter.type as any, filter.value)}
                  />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        )}
      </VStack>
    </Box>
  );
};

export default UniversalFilter;