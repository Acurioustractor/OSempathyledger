import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Text, useColorModeValue } from '@chakra-ui/react';
import * as d3 from 'd3'; // For color scales

// Input data point structure (same as heatmap)
interface InputDataPoint {
  themeName: string;
  projectName: string;
  count: number;
}

// Structure for Recharts BarChart data
interface ChartDataPoint {
  projectName: string;
  [themeName: string]: number | string; // Each theme becomes a key
}

interface ThemeProjectBarChartProps {
  data: InputDataPoint[]; // Expects the array of { themeName, projectName, count }
}

const ThemeProjectBarChart: React.FC<ThemeProjectBarChartProps> = ({ data }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const gridColor = useColorModeValue('#e2e8f0', '#4a5568');
  const tooltipBg = useColorModeValue('white', 'gray.800');
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');

  // Process data for grouped bar chart
  const { chartData, themeNames } = useMemo(() => {
    if (!data || data.length === 0) return { chartData: [], themeNames: [] };

    const themes = Array.from(new Set(data.map(d => d.themeName)));
    const projects = Array.from(new Set(data.map(d => d.projectName))).sort();
    
    // Group data by project
    const groupedData: Record<string, ChartDataPoint> = {};

    projects.forEach(proj => {
        groupedData[proj] = { projectName: proj };
        // Initialize all themes for this project to 0
        themes.forEach(theme => {
            groupedData[proj][theme] = 0;
        });
    });

    data.forEach(item => {
      if (groupedData[item.projectName]) {
        groupedData[item.projectName][item.themeName] = item.count;
      }
    });

    return { chartData: Object.values(groupedData), themeNames: themes };
  }, [data]);

  // Generate distinct colors for themes
  const colorScale = useMemo(() => {
    // Using a categorical scale. Adjust scheme if needed (e.g., d3.schemeTableau10)
    return d3.scaleOrdinal(d3.schemeCategory10).domain(themeNames);
  }, [themeNames]);
  
  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box bg={tooltipBg} p={3} borderRadius="md" shadow="md" border="1px" borderColor={tooltipBorder}>
          <Text fontWeight="bold" mb={2}>{label}</Text> {/* Project Name */}
          {payload.map((entry: any) => (
            <Text key={entry.name} fontSize="xs" color={entry.color}>
              {entry.name}: {entry.value}
            </Text>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return <Text>No data available for bar chart.</Text>;
  }

  // Estimate dynamic height based on legend items
  const legendHeight = Math.ceil(themeNames.length / 4) * 25 + 40; // Estimate rows needed for legend
  const chartHeight = 400 + legendHeight; // Base chart height + legend height

  return (
    <Box width="100%" height={chartHeight} overflowX="auto">
      <ResponsiveContainer width="100%" height="100%" minWidth={600}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: legendHeight }} // Increased bottom margin for legend
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
          <XAxis 
             dataKey="projectName" 
             tick={{ fontSize: 11, fill: textColor }}
             angle={-30}
             textAnchor="end"
             height={50} // Adjust height for angled labels
             interval={0} // Ensure all project names are visible
          />
          <YAxis 
            allowDecimals={false} 
            tick={{ fontSize: 10, fill: textColor }}
            label={{ value: 'Frequency Count', angle: -90, position: 'insideLeft', fontSize: 12, fill: textColor, dy: 40 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(200,200,200,0.1)' }} />
          <Legend 
            verticalAlign="bottom" 
            wrapperStyle={{ bottom: 0, left: 20, paddingTop: 20 }} // Position legend below chart
            iconSize={10}
            payload={themeNames.map(theme => ({ value: theme, type: 'square', color: colorScale(theme) }))} // Custom legend payload
          />
          {themeNames.map((themeName) => (
            <Bar 
              key={themeName} 
              dataKey={themeName} 
              fill={colorScale(themeName)} 
              radius={[3, 3, 0, 0]} // Slightly rounded top corners
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ThemeProjectBarChart; 