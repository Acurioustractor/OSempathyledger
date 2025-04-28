import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import * as d3 from 'd3'; // Import d3 for color scale
import { Box, Text, useColorModeValue, Tooltip as ChakraTooltip } from '@chakra-ui/react';

interface HeatmapDataPoint {
  themeName: string;
  projectName: string;
  count: number;
}

interface ThemeHeatmapProps {
  data: HeatmapDataPoint[];
}

// Custom Y-Axis Tick Component
const CustomYAxisTick = (props: any) => {
  const { x, y, payload, width } = props;
  const maxTickWidth = width - 10; // Allow some padding
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // Truncate long labels
  const truncateText = (text: string, maxWidth: number, fontSize: number = 11): string => {
    if (!text) return '';
    // Basic estimation: average char width ~ 0.6 * fontSize
    const avgCharWidth = fontSize * 0.6;
    const maxChars = Math.floor(maxWidth / avgCharWidth);
    if (text.length > maxChars) {
      return text.substring(0, maxChars - 1) + '…'; // Use ellipsis
    }
    return text;
  };

  const truncatedText = truncateText(payload.value, maxTickWidth);

  return (
    <ChakraTooltip label={payload.value} fontSize="xs" placement="right">
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={4} textAnchor="end" fill={textColor} fontSize={11}>
          {truncatedText}
        </text>
      </g>
    </ChakraTooltip>
  );
};

const ThemeHeatmap: React.FC<ThemeHeatmapProps> = ({ data }) => {
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const gridColor = useColorModeValue('#e2e8f0', '#4a5568');
  const tooltipBg = useColorModeValue('white', 'gray.800'); // Darker tooltip in dark mode
  const tooltipBorder = useColorModeValue('gray.200', 'gray.600');

  const { themes, projects, maxCount } = useMemo(() => {
    // Ensure themes are sorted correctly if they arrive pre-sorted from the parent
    const uniqueThemes = Array.from(new Map(data.map(d => [d.themeName, d])).keys());
    // Ensure projects are sorted alphabetically for consistent axis order
    const uniqueProjects = Array.from(new Set(data.map(d => d.projectName))).sort();
    const maxVal = Math.max(...data.map(d => d.count), 0);
    return { themes: uniqueThemes, projects: uniqueProjects, maxCount: maxVal };
  }, [data]);

  // Use a D3 sequential color scale (e.g., Blues)
  const colorScale = useMemo(() => {
      return d3.scaleSequential(d3.interpolateBlues)
               .domain([0, maxCount > 0 ? maxCount * 0.8 : 1]); // Scale to 80% of max for better contrast
  }, [maxCount]);

  // Define fixed size for heatmap cells
  const cellSize = 20; // Adjust as needed

  // Calculate dynamic height based on number of themes and cell size
  const yAxisWidth = 180; // Explicit width for Y axis label area
  const dynamicHeight = themes.length * (cellSize + 3) + 150; // Cell size + padding + margins

  // Custom Tooltip Content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as HeatmapDataPoint;
      return (
        <Box bg={tooltipBg} p={2} borderRadius="md" shadow="md" border="1px" borderColor={tooltipBorder}>
          <Text fontSize="sm" fontWeight="bold" mb={1}>{dataPoint.themeName}</Text>
          <Text fontSize="xs" color={textColor}>Project: {dataPoint.projectName}</Text>
          <Text fontSize="xs" color={textColor}>Count: {dataPoint.count}</Text>
        </Box>
      );
    }
    return null;
  };

  if (data.length === 0) {
    return <Text>No data available for heatmap.</Text>;
  }

  return (
    // Set explicit height based on calculation
    <Box width="100%" height={dynamicHeight} overflowX="auto" // Allow horizontal scroll if needed
         sx={{ 
           "& .recharts-cartesian-axis-tick-value": { fontSize: '11px' }, // Target tick labels
           "& .recharts-scatter-symbol": { stroke: 'rgba(128,128,128,0.2)', strokeWidth: '1px' } // Faint border for cells
         }} 
    > 
      <ResponsiveContainer width="100%" height="100%" minWidth={projects.length * (cellSize + 5) + yAxisWidth + 50}> {/* Adjust minWidth */} 
        <ScatterChart
          margin={{ top: 20, right: 30, bottom: 100, left: yAxisWidth }} // Use yAxisWidth for left margin
        >
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis 
            dataKey="projectName"
            type="category" 
            allowDuplicatedCategory={false} 
            axisLine={false} 
            tickLine={false} 
            interval={0} 
            tick={{
                angle: -45, 
                textAnchor: 'end', 
                fontSize: 11, // Slightly larger
                fill: textColor
            }}
            height={90} // Adjusted height
            name="Project"
            scale="point" // Use point scale for better centering
            padding={{ left: cellSize / 2, right: cellSize / 2 }} // Pad axis for cell centering
            domain={projects}
            ticks={projects}  // Explicitly provide the unique, sorted project names as ticks
          />
          <YAxis 
            dataKey="themeName"
            type="category" 
            allowDuplicatedCategory={false}
            axisLine={false}
            tickLine={false}
            width={yAxisWidth} // Use variable for width
            name="Theme"
            scale="point" // Use point scale
            padding={{ top: cellSize / 2, bottom: cellSize / 2 }} // Pad axis
            domain={themes}
            ticks={themes}  // Explicitly provide theme names as ticks
            tick={<CustomYAxisTick width={yAxisWidth} />} // Use the custom tick component
          />
          {/* Removed ZAxis - size is fixed */}
          <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />
          <Scatter 
            name="Theme Frequency"
            data={data} 
            shape="square" 
            fill="#8884d8" // Fallback fill
            isAnimationActive={false}
            nodeSize={cellSize * cellSize} // Use nodeSize for scatter squares (area)
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}-${entry.themeName}-${entry.projectName}`} // Make cell key more unique
                fill={entry.count > 0 ? colorScale(entry.count) : 'transparent'} // Use transparent for zero count
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default ThemeHeatmap; 