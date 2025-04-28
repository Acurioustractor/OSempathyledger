import React, { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { Box, useColorModeValue, Tooltip } from '@chakra-ui/react';

interface WordData {
  text: string;
  value: number; // Frequency
  // Properties added by d3-cloud
  size?: number;
  x?: number;
  y?: number;
  rotate?: number;
  font?: string;
}

interface ThemeWordCloudProps {
  words: { text: string; value: number }[]; // Expecting input with text and value
  width?: number;
  height?: number;
}

const ThemeWordCloud: React.FC<ThemeWordCloudProps> = ({ words, width = 500, height = 300 }) => {
  const [layoutWords, setLayoutWords] = useState<cloud.Word[]>([]);
  const fill = useColorModeValue('gray.700', 'gray.300');
  const hoverFill = useColorModeValue('blue.500', 'blue.300');
  const fontFamily = "Impact, sans-serif"; // Choose a suitable font

  // Memoize the font size scale
  const fontSizeScale = useMemo(() => {
    const maxFrequency = Math.max(...words.map(w => w.value), 0);
    // Scale font size from 10px to ~50px based on frequency (adjust range as needed)
    return d3.scaleSqrt().domain([0, maxFrequency]).range([12, 50]).clamp(true);
  }, [words]);

  useEffect(() => {
    if (!words || words.length === 0) {
        setLayoutWords([]);
        return;
    }

    // Ensure words have size calculated before passing to layout
    const wordsWithSize = words.map(d => ({ 
        ...d, 
        size: fontSizeScale(d.value) 
    }));

    const layout = cloud()
      .size([width, height])
      .words(wordsWithSize)
      .padding(3) // Adjust padding between words
      .rotate(() => (Math.random() > 0.7 ? 90 : 0)) // More horizontal words
      .font(fontFamily)
      .fontSize(d => d.size || 10)
      .on("end", calculatedWords => {
        // d3-cloud might return words without size if they didn't fit
        setLayoutWords(calculatedWords.filter(w => w.size)); 
      });

    layout.start();

  }, [words, width, height, fontSizeScale, fontFamily]); // Rerun layout if data or dimensions change

  return (
    <Box position="relative" width={width} height={height} border="1px" borderColor="gray.300" borderRadius="md" overflow="hidden">
      <svg width={width} height={height}>
        <g transform={`translate(${width / 2},${height / 2})`}>
          {layoutWords.map((word, i) => (
            <Tooltip key={word.text + i} label={`Frequency: ${word.value}`} fontSize="xs">
              <text
                textAnchor="middle"
                transform={`translate(${word.x ?? 0}, ${word.y ?? 0}) rotate(${word.rotate ?? 0})`}
                fontSize={word.size}
                fontFamily={word.font || fontFamily}
                fill={fill}
                style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.fill = hoverFill}
                onMouseOut={(e) => e.currentTarget.style.fill = fill}
                // TODO: Add onClick later to show related quotes/stories
              >
                {word.text}
              </text>
            </Tooltip>
          ))}
        </g>
      </svg>
    </Box>
  );
};

export default ThemeWordCloud; 