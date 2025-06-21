/**
 * Theme Frequency Chart Component
 * Displays the most common themes in a bar chart
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Box, Heading, useColorModeValue } from '@chakra-ui/react';
import { Theme } from '../../types';

interface ThemeFrequencyChartProps {
  themes: Theme[];
  quotes?: any[]; // Optional quotes for more accurate counting
  limit?: number;
  height?: number;
  title?: string;
}

const ThemeFrequencyChart: React.FC<ThemeFrequencyChartProps> = ({
  themes,
  quotes,
  limit = 10,
  height = 400,
  title = 'Top Themes'
}) => {
  const barColor = useColorModeValue('#FF6B35', '#FFA500');
  const gridColor = useColorModeValue('#E2E8F0', '#2D3748');
  const textColor = useColorModeValue('#2D3748', '#E2E8F0');

  const chartData = useMemo(() => {
    // If quotes are provided, count theme occurrences from quotes
    if (quotes) {
      const themeCounts = new Map<string, number>();
      
      quotes.forEach(quote => {
        if (quote.Theme) {
          const theme = themes.find(t => t.id === quote.Theme);
          if (theme) {
            const count = themeCounts.get(theme['Theme Name']) || 0;
            themeCounts.set(theme['Theme Name'], count + 1);
          }
        }
      });

      return Array.from(themeCounts.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
    }
    
    // Otherwise use the Story Count field from themes
    return themes
      .filter(theme => theme['Story Count'] > 0)
      .sort((a, b) => (b['Story Count'] || 0) - (a['Story Count'] || 0))
      .slice(0, limit)
      .map(theme => ({
        name: theme['Theme Name'],
        count: theme['Story Count'] || 0
      }));
  }, [themes, quotes, limit]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload[0]) {
      return (
        <Box
          bg={useColorModeValue('white', 'gray.800')}
          p={3}
          borderRadius="md"
          boxShadow="lg"
          borderWidth="1px"
        >
          <strong>{payload[0].payload.name}</strong>
          <br />
          Count: {payload[0].value}
        </Box>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Box p={8} textAlign="center" color="gray.500">
        No theme data available
      </Box>
    );
  }

  return (
    <Box>
      {title && (
        <Heading size="md" mb={4}>
          {title}
        </Heading>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: textColor }}
          />
          <YAxis tick={{ fill: textColor }} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={barColor}
                fillOpacity={1 - index * 0.05}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ThemeFrequencyChart;