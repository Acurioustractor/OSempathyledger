import React, { useState, useEffect, useRef, useCallback, CSSProperties } from 'react';
import { Box, useColorModeValue } from '@chakra-ui/react';
import { calculateVisibleRange } from '../utils/performanceMonitor';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  height?: number | string;
  width?: string;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  estimatedItemHeight?: number;
}

export function VirtualScrollList<T>({
  items,
  itemHeight,
  renderItem,
  overscan = 3,
  height = '100%',
  width = '100%',
  onScroll,
  className,
  estimatedItemHeight = 100,
}: VirtualScrollListProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 10 });
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Calculate item heights and positions
  const getItemHeight = useCallback((index: number): number => {
    return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
  }, [itemHeight]);

  const calculateTotalHeight = useCallback((): number => {
    if (typeof itemHeight === 'number') {
      return items.length * itemHeight;
    }
    
    // For dynamic heights, calculate total
    let totalHeight = 0;
    for (let i = 0; i < items.length; i++) {
      totalHeight += getItemHeight(i);
    }
    return totalHeight;
  }, [items.length, itemHeight, getItemHeight]);

  const calculateItemPosition = useCallback((index: number): number => {
    if (typeof itemHeight === 'number') {
      return index * itemHeight;
    }
    
    // For dynamic heights, sum up to index
    let position = 0;
    for (let i = 0; i < index; i++) {
      position += getItemHeight(i);
    }
    return position;
  }, [itemHeight, getItemHeight]);

  // Update container height on mount and resize
  useEffect(() => {
    const updateContainerHeight = () => {
      if (scrollContainerRef.current) {
        setContainerHeight(scrollContainerRef.current.clientHeight);
      }
    };

    updateContainerHeight();
    
    const resizeObserver = new ResizeObserver(updateContainerHeight);
    if (scrollContainerRef.current) {
      resizeObserver.observe(scrollContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Calculate visible range based on scroll position
  useEffect(() => {
    if (typeof itemHeight === 'number') {
      // Simple calculation for fixed heights
      const range = calculateVisibleRange(
        scrollTop,
        items.length,
        {
          itemHeight,
          containerHeight,
          overscan,
        }
      );
      setVisibleRange(range);
    } else {
      // Complex calculation for dynamic heights
      let accumulatedHeight = 0;
      let start = 0;
      let end = items.length;

      // Find start index
      for (let i = 0; i < items.length; i++) {
        const height = getItemHeight(i);
        if (accumulatedHeight + height > scrollTop - overscan * estimatedItemHeight) {
          start = i;
          break;
        }
        accumulatedHeight += height;
      }

      // Find end index
      accumulatedHeight = 0;
      for (let i = start; i < items.length; i++) {
        if (accumulatedHeight > containerHeight + overscan * estimatedItemHeight) {
          end = i;
          break;
        }
        accumulatedHeight += getItemHeight(i);
      }

      setVisibleRange({ start: Math.max(0, start), end: Math.min(items.length, end) });
    }
  }, [scrollTop, containerHeight, items.length, itemHeight, overscan, getItemHeight, estimatedItemHeight]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  const totalHeight = calculateTotalHeight();
  const visibleItems = items.slice(visibleRange.start, visibleRange.end);

  return (
    <Box
      ref={scrollContainerRef}
      height={height}
      width={width}
      overflow="auto"
      bg={bgColor}
      borderRadius="md"
      borderWidth="1px"
      borderColor={borderColor}
      className={className}
      onScroll={handleScroll}
      position="relative"
    >
      {/* Total height container */}
      <Box
        height={`${totalHeight}px`}
        position="relative"
      >
        {/* Visible items */}
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.start + index;
          const itemTop = calculateItemPosition(actualIndex);
          const itemHeightValue = getItemHeight(actualIndex);

          return (
            <Box
              key={actualIndex}
              position="absolute"
              top={`${itemTop}px`}
              left={0}
              right={0}
              height={`${itemHeightValue}px`}
            >
              {renderItem(item, actualIndex)}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}

// Specialized version for uniform height items (better performance)
interface UniformVirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  gap?: number;
  columns?: number;
  overscan?: number;
  height?: number | string;
  width?: string;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

export function UniformVirtualScrollList<T>({
  items,
  itemHeight,
  renderItem,
  gap = 0,
  columns = 1,
  overscan = 3,
  height = '100%',
  width = '100%',
  onScroll,
  className,
}: UniformVirtualScrollListProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);
  
  const bgColor = useColorModeValue('white', 'gray.800');

  // Update container height
  useEffect(() => {
    const updateContainerHeight = () => {
      if (scrollContainerRef.current) {
        setContainerHeight(scrollContainerRef.current.clientHeight);
      }
    };

    updateContainerHeight();
    window.addEventListener('resize', updateContainerHeight);
    return () => window.removeEventListener('resize', updateContainerHeight);
  }, []);

  const rowHeight = itemHeight + gap;
  const rowCount = Math.ceil(items.length / columns);
  const totalHeight = rowCount * rowHeight - gap;

  const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endRow = Math.min(
    rowCount,
    Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan
  );

  const visibleRows = [];
  for (let row = startRow; row < endRow; row++) {
    const rowItems = [];
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col;
      if (index < items.length) {
        rowItems.push({ item: items[index], index });
      }
    }
    if (rowItems.length > 0) {
      visibleRows.push({ row, items: rowItems });
    }
  }

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  return (
    <Box
      ref={scrollContainerRef}
      height={height}
      width={width}
      overflow="auto"
      bg={bgColor}
      className={className}
      onScroll={handleScroll}
      css={{
        '&::-webkit-scrollbar': {
          width: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: useColorModeValue('#CBD5E0', '#4A5568'),
          borderRadius: '4px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: useColorModeValue('#A0AEC0', '#718096'),
        },
      }}
    >
      <Box height={`${totalHeight}px`} position="relative">
        {visibleRows.map(({ row, items: rowItems }) => (
          <Box
            key={row}
            position="absolute"
            top={`${row * rowHeight}px`}
            left={0}
            right={0}
            display="grid"
            gridTemplateColumns={`repeat(${columns}, 1fr)`}
            gap={`${gap}px`}
            height={`${itemHeight}px`}
          >
            {rowItems.map(({ item, index }) => (
              <Box key={index}>
                {renderItem(item, index)}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}