import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useAirtableData } from '../../context/AirtableDataContext';
import { useFilterStore } from '../../store/filterStore';
import { Theme, Story, Storyteller } from '../../types';

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  type: 'theme' | 'story' | 'storyteller';
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string;
  target: string;
}

const ThemeNetworkGraph: React.FC = () => {
  const { data, isLoading } = useAirtableData();
  const { selectedThemes, selectedStorytellers, dateRange } = useFilterStore();
  const d3Container = useRef<SVGSVGElement | null>(null);

  const filteredData = useMemo(() => {
    if (!data) return null;

    let filteredStories = data.stories;

    if (selectedThemes.length > 0) {
      const selectedThemeIds = new Set(selectedThemes.map(t => t.id));
      filteredStories = filteredStories.filter(story =>
        story['Themes']?.some((themeId: string) => selectedThemeIds.has(themeId))
      );
    }

    if (selectedStorytellers.length > 0) {
      const selectedStorytellerIds = new Set(selectedStorytellers.map(st => st.id));
      filteredStories = filteredStories.filter(story =>
        story['All Storytellers']?.some((storytellerId: string) => selectedStorytellerIds.has(storytellerId))
      );
    }

    if (dateRange.startDate && dateRange.endDate) {
        filteredStories = filteredStories.filter(story => {
            if (!story['Date']) return false;
            const storyDate = new Date(story['Date']);
            return storyDate >= dateRange.startDate! && storyDate <= dateRange.endDate!;
        });
    }

    const storyIds = new Set(filteredStories.map(s => s.id));
    const themeIds = new Set(filteredStories.flatMap(s => s['Themes'] || []));
    const storytellerIds = new Set(filteredStories.flatMap(s => s['All Storytellers'] || []));

    return {
      stories: filteredStories,
      themes: data.themes.filter(t => themeIds.has(t.id)),
      storytellers: data.storytellers.filter(st => storytellerIds.has(st.id)),
    };
  }, [data, selectedThemes, selectedStorytellers, dateRange]);

  useEffect(() => {
    if (filteredData && d3Container.current) {
      const { themes, stories, storytellers } = filteredData;

      const nodes: GraphNode[] = [
        ...themes.map((t: Theme) => ({ id: t.id, name: t['Theme Name'], type: 'theme' as const })),
        ...stories.map((s: Story) => ({ id: s.id, name: s['Title'], type: 'story' as const })),
        ...storytellers.map((st: Storyteller) => ({ id: st.id, name: st['Name'], type: 'storyteller' as const })),
      ];

      const links: GraphLink[] = [];
      stories.forEach(story => {
        if (story['Themes']) {
          story['Themes'].forEach((themeId: string) => {
            links.push({ source: story.id, target: themeId });
          });
        }
        if (story['All Storytellers']) {
          story['All Storytellers'].forEach((storytellerId: string) => {
            links.push({ source: story.id, target: storytellerId });
          });
        }
      });
      
      const svg = d3.select(d3Container.current);
      svg.selectAll("*").remove(); // Clear previous render
      const width = parseInt(svg.style('width'));
      const height = parseInt(svg.style('height'));

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id((d: any) => d.id).distance(50))
        .force('charge', d3.forceManyBody().strength(-150))
        .force('center', d3.forceCenter(width / 2, height / 2));

      const link = svg.append('g')
        .attr('stroke', '#999')
        .attr('stroke-opacity', 0.6)
        .selectAll('line')
        .data(links)
        .join('line');
        
      const node = svg.append('g')
        .selectAll('g')
        .data(nodes)
        .join('g');

      const circles = node.append('circle')
        .attr('r', 8)
        .attr('fill', (d: any) => d.type === 'theme' ? 'coral' : d.type === 'story' ? 'lightblue' : 'lightgreen');
      
      const labels = node.append('text')
        .text((d: any) => d.name)
        .attr('x', 12)
        .attr('y', 4);

      node.call(d3.drag<any, GraphNode>()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node
          .attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      });

      function dragstarted(event: any, d: GraphNode) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event: any, d: GraphNode) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event: any, d: GraphNode) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  }, [filteredData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <svg
      ref={d3Container}
      style={{ width: '100%', height: '500px', border: '1px solid #ccc' }}
    />
  );
};

export default ThemeNetworkGraph;
