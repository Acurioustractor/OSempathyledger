import React from 'react';
import { Box, VStack, Heading, Button, FormControl, FormLabel } from '@chakra-ui/react';
import Select, { MultiValue } from 'react-select';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useFilterStore } from '../../store/filterStore';
import { useAirtableData } from '../../context/AirtableDataContext';
import { Theme, Storyteller } from '../../types';

const UniversalFilter: React.FC = () => {
  const { data, isLoading } = useAirtableData();
  const {
    setSelectedThemes,
    setSelectedStorytellers,
    dateRange,
    setDateRange,
    clearFilters,
  } = useFilterStore();

  if (isLoading || !data) {
    return null; 
  }

  const themeOptions = data.themes.map(theme => ({
    value: theme,
    label: theme['Theme Name'],
  }));

  const storytellerOptions = data.storytellers.map(storyteller => ({
    value: storyteller,
    label: storyteller.Name,
  }));

  const handleThemeChange = (newValue: MultiValue<{ value: Theme; label: string }>) => {
    setSelectedThemes(newValue.map(item => item.value));
  };

  const handleStorytellerChange = (newValue: MultiValue<{ value: Storyteller; label: string }>) => {
    setSelectedStorytellers(newValue.map(item => item.value));
  };

  const handleDateChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setDateRange({ startDate: start, endDate: end });
  };

  return (
    <Box p={4} borderWidth="1px" borderRadius="lg">
      <VStack spacing={4} align="stretch">
        <Heading size="md">Filters</Heading>
        <Box>
            <Select
                isMulti
                options={themeOptions}
                onChange={handleThemeChange}
                placeholder="Select themes..."
            />
        </Box>
        <Box>
            <Select
                isMulti
                options={storytellerOptions}
                onChange={handleStorytellerChange}
                placeholder="Select storytellers..."
            />
        </Box>
        <FormControl>
            <FormLabel>Date Range</FormLabel>
            <DatePicker
                selectsRange
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onChange={handleDateChange}
                isClearable={true}
                placeholderText="Select a date range"
                customInput={<Button width="100%"> {dateRange.startDate && dateRange.endDate ? `${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}` : "Select a date range"} </Button>}
            />
        </FormControl>
        <Button onClick={clearFilters}>Clear Filters</Button>
      </VStack>
    </Box>
  );
};

export default UniversalFilter; 