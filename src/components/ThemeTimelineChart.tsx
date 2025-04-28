import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import * as d3 from 'd3'; // For color scale

// Data point structure expected from VisualisationsPage
interface TimelineDataPoint {
  date: string; // "YYYY-MM"
  [themeName: string]: number | string; 
}

interface ThemeTimelineChartProps {
  data: TimelineDataPoint[];
  themes: string[]; // List of top theme names included in the data
}

const ThemeTimelineChart: React.FC<ThemeTimelineChartProps> = ({ data, themes }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const gridColor = useColorModeValue('#e2e8f0', '#4a5568');
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');

  // Generate distinct colors for themes
  const colorScale = useMemo(() => {
    return d3.scaleOrdinal(d3.schemeCategory10).domain(themes);
  }, [themes]);

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg={tooltipBg} p={3} borderRadius="md" shadow="md" border="1px" borderColor={tooltipBorder}>
          <Text fontWeight="bold" mb={2}>{label}</Text> {/* Date */}
          {/* Sort payload by value descending for tooltip readability */}
          {payload.sort((a: any, b: any) => b.value - a.value)
                  .map((entry: any) => (
            <Text key={entry.name} fontSize="xs" color={entry.color}>
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return <Text>No timeline data available.</Text>;
  }

  return (
    <Box width="100%" height={400}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: textColor }}
            // Can add formatting later if needed
            // tickFormatter={(tick) => format(parseISO(tick + '-01'), 'MMM yy')} 
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ fontSize: 10, fill: textColor }}
            label={{ value: 'Monthly Count', angle: -90, position: 'insideLeft', fontSize: 11, fill: textColor, dx: -10}}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: gridColor, strokeWidth: 1 }}/>
          <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
          {themes.map((themeName) => (
            <Line 
              key={themeName} 
              type="monotone" 
              dataKey={themeName} 
              stroke={colorScale(themeName)} 
              strokeWidth={2}
              dot={false} // Hide dots for cleaner lines
              activeDot={{ r: 4 }} // Show dot on hover
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ThemeTimelineChart; 