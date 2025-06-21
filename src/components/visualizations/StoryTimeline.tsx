import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Story } from '../../types';
import { cachedDataService } from '../../services/cachedDataService';
import { useFilterStore } from '../../store/filterStore';
import { Box } from '@chakra-ui/react';

const StoryTimeline: React.FC = () => {
  const d3Container = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { selectedThemes, selectedStorytellers, dateRange } = useFilterStore();
  const [dimensions, setDimensions] = useState({ width: 0, height: 400 });

  const filteredStories = useMemo(() => {
    let stories = cachedDataService.getAllStoriesSync();

    if (selectedThemes.length > 0) {
        const selectedThemeIds = new Set(selectedThemes.map(t => t.id));
        stories = stories.filter(story =>
            story['Themes']?.some(themeId => selectedThemeIds.has(themeId))
        );
    }

    if (selectedStorytellers.length > 0) {
        const selectedStorytellerIds = new Set(selectedStorytellers.map(st => st.id));
        stories = stories.filter(story =>
            story['All Storytellers']?.some(storytellerId => selectedStorytellerIds.has(storytellerId))
        );
    }

    if (dateRange.startDate && dateRange.endDate) {
        stories = stories.filter(story => {
            if (!story['Date']) return false;
            const storyDate = new Date(story['Date']);
            return storyDate >= dateRange.startDate! && storyDate <= dateRange.endDate!;
        });
    }

    return stories;
  }, [selectedThemes, selectedStorytellers, dateRange]);

  useEffect(() => {
    const observer = new ResizeObserver(() => {
        if (containerRef.current) {
            setDimensions({
                width: containerRef.current.clientWidth,
                height: 400,
            });
        }
    });
    if (containerRef.current) {
      observer.observe(containerRef.current);
      setDimensions({
        width: containerRef.current.clientWidth,
        height: 400,
      });
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (filteredStories.length > 0 && d3Container.current && dimensions.width > 0) {
      const svg = d3.select(d3Container.current);
      svg.selectAll('*').remove();

      const margin = { top: 20, right: 30, bottom: 30, left: 40 };
      const width = dimensions.width - margin.left - margin.right;
      const height = dimensions.height - margin.top - margin.bottom;

      svg
        .attr('width', dimensions.width)
        .attr('height', dimensions.height);

      const g = svg
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      const storyDates = filteredStories
        .map(d => new Date(d['Date']))
        .filter(d => !isNaN(d.getTime()));

      if (storyDates.length === 0) {
        return;
      }
        
      const xScale = d3.scaleTime()
        .domain(d3.extent(storyDates) as [Date, Date])
        .range([0, width]);

      const xAxis = d3.axisBottom(xScale);

      g.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(xAxis);

      const simulation = d3.forceSimulation(filteredStories as d3.SimulationNodeDatum[])
        .force('x', d3.forceX((d: any) => xScale(new Date(d['Date']))).strength(1))
        .force('y', d3.forceY(height / 2).strength(0.1))
        .force('collide', d3.forceCollide(7))
        .stop();

      for (let i = 0; i < 120; ++i) simulation.tick();

      const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', 'solid')
        .style('border-width', '1px')
        .style('border-radius', '5px')
        .style('padding', '10px');

      const circles = g.selectAll('circle')
        .data(filteredStories)
        .enter()
        .append('circle')
        .attr('cx', (d: any) => d.x)
        .attr('cy', (d: any) => d.y)
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .on('mouseover', (event, d) => {
            tooltip.transition().duration(200).style('opacity', .9);
            tooltip.html(d['Title'])
                .style('left', (event.pageX + 5) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', () => {
            tooltip.transition().duration(500).style('opacity', 0);
        });
    }
  }, [filteredStories, dimensions]);

  return (
    <Box ref={containerRef} width="100%">
      <svg
        ref={d3Container}
      />
    </Box>
  );
};

export default StoryTimeline; 