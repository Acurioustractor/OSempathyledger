import React, { useState } from 'react';
import {
  Box,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Icon,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
  VStack,
  Text,
  useColorModeValue,
  FormControl,
  FormLabel,
  IconButton,
} from '@chakra-ui/react';
import { CalendarIcon, XIcon } from '@primer/octicons-react';
import { format, isValid } from 'date-fns';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (range: { start: Date | null; end: Date | null }) => void;
  placeholderText?: string;
}

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onChange,
  placeholderText = 'Select date range',
}) => {
  const [tempStart, setTempStart] = useState<string>(
    startDate ? format(startDate, 'yyyy-MM-dd') : ''
  );
  const [tempEnd, setTempEnd] = useState<string>(
    endDate ? format(endDate, 'yyyy-MM-dd') : ''
  );
  const [isOpen, setIsOpen] = useState(false);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const displayValue = () => {
    if (!startDate && !endDate) return placeholderText;
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
    }
    if (startDate) return `From ${format(startDate, 'MMM d, yyyy')}`;
    if (endDate) return `Until ${format(endDate, 'MMM d, yyyy')}`;
    return placeholderText;
  };

  const handleApply = () => {
    const start = tempStart ? new Date(tempStart) : null;
    const end = tempEnd ? new Date(tempEnd) : null;
    
    // Validate dates
    if (start && !isValid(start)) return;
    if (end && !isValid(end)) return;
    if (start && end && start > end) return;
    
    onChange({ start, end });
    setIsOpen(false);
  };

  const handleClear = () => {
    setTempStart('');
    setTempEnd('');
    onChange({ start: null, end: null });
    setIsOpen(false);
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setTempStart(format(start, 'yyyy-MM-dd'));
    setTempEnd(format(end, 'yyyy-MM-dd'));
    onChange({ start, end });
    setIsOpen(false);
  };

  return (
    <Popover isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom-start">
      <PopoverTrigger>
        <InputGroup cursor="pointer" onClick={() => setIsOpen(true)}>
          <InputLeftElement>
            <Icon as={CalendarIcon} color="gray.400" />
          </InputLeftElement>
          <Input
            readOnly
            value={displayValue()}
            placeholder={placeholderText}
            cursor="pointer"
            pr={startDate || endDate ? '2.5rem' : undefined}
          />
          {(startDate || endDate) && (
            <IconButton
              aria-label="Clear date range"
              icon={<XIcon />}
              size="sm"
              variant="ghost"
              position="absolute"
              right="8px"
              top="50%"
              transform="translateY(-50%)"
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
            />
          )}
        </InputGroup>
      </PopoverTrigger>

      <PopoverContent bg={bgColor} borderColor={borderColor} width="320px">
        <PopoverArrow bg={bgColor} />
        <PopoverCloseButton />
        <PopoverHeader fontWeight="semibold">Select Date Range</PopoverHeader>
        <PopoverBody>
          <VStack spacing={4} align="stretch">
            {/* Quick select options */}
            <HStack spacing={2}>
              <Button size="sm" variant="outline" onClick={() => handleQuickSelect(7)}>
                Last 7 days
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickSelect(30)}>
                Last 30 days
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleQuickSelect(90)}>
                Last 90 days
              </Button>
            </HStack>

            {/* Date inputs */}
            <FormControl>
              <FormLabel fontSize="sm">Start Date</FormLabel>
              <Input
                type="date"
                value={tempStart}
                onChange={(e) => setTempStart(e.target.value)}
                max={tempEnd || undefined}
              />
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">End Date</FormLabel>
              <Input
                type="date"
                value={tempEnd}
                onChange={(e) => setTempEnd(e.target.value)}
                min={tempStart || undefined}
              />
            </FormControl>

            {/* Action buttons */}
            <HStack justify="flex-end" spacing={2}>
              <Button size="sm" variant="ghost" onClick={handleClear}>
                Clear
              </Button>
              <Button 
                size="sm" 
                colorScheme="orange" 
                onClick={handleApply}
                isDisabled={!tempStart && !tempEnd}
              >
                Apply
              </Button>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;