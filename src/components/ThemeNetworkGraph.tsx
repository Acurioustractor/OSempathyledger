import React, { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { Box, useColorModeValue } from '@chakra-ui/react';

// Re-define types here or import from VisualisationsPage if modularized
interface GraphNode {
  id: string;
  name: string;
  frequency: number;
  // D3 simulation properties (will be added)
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  // For highlighting
  isNeighbor?: boolean; 
}

interface GraphLink {
  source: string | GraphNode; // D3 can populate this with the node object
  target: string | GraphNode; // D3 can populate this with the node object
  value: number;
  // D3 simulation properties (will be added)
  index?: number;
  // D3 populates these if source/target are IDs
  sourceNode?: GraphNode; 
  targetNode?: GraphNode;
  // For highlighting
  isHighlighted?: boolean;
}

interface ThemeNetworkGraphProps {
  data: {
    nodes: GraphNode[];
    links: GraphLink[];
  };
  width?: number;
  height?: number;
  focusedNodeId?: string | null; // Add prop for focused node ID
}

const ThemeNetworkGraph: React.FC<ThemeNetworkGraphProps> = ({ data, width = 800, height = 550, focusedNodeId = null }) => {
  const ref = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null); // Ref to store zoom behavior
  const nodeColor = useColorModeValue('#3182ce', '#63b3ed'); // Using default blue for non-focused
  const nodeHighlightColor = useColorModeValue('#DD6B20', '#F6AD55'); // orange.600 / orange.300
  const labelColor = useColorModeValue('#2D3748', '#E2E8F0'); // gray.700 / gray.200
  const linkColor = useColorModeValue('#cccccc', '#4a5568'); // gray.300 / gray.600
  const linkHighlightColor = useColorModeValue('#4a5568', '#a0aec0'); // gray.600 / gray.400
  const legendColor = useColorModeValue('gray.600', 'gray.400');

  // Use memoized copies to avoid mutating original data and for stability
  const nodes = useMemo(() => data.nodes.map(n => ({ ...n })), [data.nodes]);
  const links = useMemo(() => data.links.map(l => ({ ...l })), [data.links]);
  
  // Adjacency list for highlighting neighbors
  const linkedByIndex = useMemo(() => {
      const index: Record<string, Record<string, boolean>> = {};
      links.forEach(d => {
          const sourceId = typeof d.source === 'string' ? d.source : d.source.id;
          const targetId = typeof d.target === 'string' ? d.target : d.target.id;
          index[`${sourceId},${targetId}`] = true;
          index[`${targetId},${sourceId}`] = true;
      });
      return index;
  }, [links]);

  useEffect(() => {
    if (!ref.current || nodes.length === 0) return;

    const svgElement = d3.select(ref.current);
    svgElement.selectAll("*").remove(); // Clear previous render

    // --- Scales ---
    const maxFrequency = d3.max(nodes, d => d.frequency) || 1;
    const radiusScale = d3.scaleSqrt().domain([0, maxFrequency]).range([4, 18]);

    const maxLinkValue = d3.max(links, d => d.value) || 1;
    const linkScale = d3.scaleLinear().domain([1, maxLinkValue]).range([1, 6]);
    
    // Color scale based on frequency
    const colorScale = d3.scaleSequential(d3.interpolateBlues) // Use blues color scheme
                         .domain([0, maxFrequency]); // Base color on frequency range

    // Create main container group for zoom
    const container = svgElement.append("g");

    // --- Simulation ---
    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink<GraphNode, GraphLink>(links)
          .id(d => d.id)
          .distance(70) // Increased distance more
          .strength(link => Math.sqrt(link.value) * 0.3)) // Further reduced link strength
      .force("charge", d3.forceManyBody().strength(-250)) // Stronger repulsion
      .force("center", d3.forceCenter(width / 2, height / 2 - 20)) // Adjust center for legend space
      .force("collide", d3.forceCollide().radius(d => radiusScale((d as GraphNode).frequency) + 5).iterations(2)); // Adjust collision padding

    // --- Drawing Elements --- (Order matters: links first, then nodes, then labels)
    const link = container.append("g")
      .attr("class", "links")
      .attr("stroke", linkColor)
      .attr("stroke-opacity", 0.5) // Slightly more transparent
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => linkScale(d.value));

    const node = container.append("g")
      .attr("class", "nodes")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => radiusScale(d.frequency))
      .attr("fill", d => colorScale(d.frequency)) // Use color scale for fill
      .style("cursor", "pointer")
      .call(drag(simulation))
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
      .on("click", handleClick); // Add click handler

    const labels = container.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .text(d => d.name)
      .attr("x", d => radiusScale(d.frequency) + 2) // Position relative to node size
      .attr("y", 3)
      .attr("font-size", 10)
      .attr("fill", labelColor)
      .attr("pointer-events", "none")
      .style("visibility", "hidden"); // Initially hidden

    node.append("title") // Tooltip remains
      .text(d => `${d.name}\nFrequency: ${d.frequency}`);

    // --- Legend ---
    const legend = svgElement.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(20, ${height - 30})`); // Position bottom-left

    legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", 10)
      .attr("fill", legendColor)
      .text("Node Size: Theme Frequency");

    legend.append("text")
      .attr("x", 0)
      .attr("y", 15) // Next line
      .attr("font-size", 10)
      .attr("fill", legendColor)
      .text("Link Thickness: Co-occurrence Count");
      
    // --- Simulation Ticker ---
    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as GraphNode).x ?? 0)
        .attr("y1", d => (d.source as GraphNode).y ?? 0)
        .attr("x2", d => (d.target as GraphNode).x ?? 0)
        .attr("y2", d => (d.target as GraphNode).y ?? 0);

      node
        .attr("cx", d => d.x ?? 0)
        .attr("cy", d => d.y ?? 0);

      labels
        .attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`)
        .style("visibility", d => radiusScale(d.frequency) > 8 ? "visible" : "hidden"); // Show labels for slightly larger nodes by default
    });

    // --- Zoom Functionality ---
    const zoomHandler = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 8])
      .on("zoom", (event) => {
        container.attr("transform", event.transform);
        // Adjust label visibility on zoom
        const k = event.transform.k;
        labels.style("visibility", d => k > 0.6 && radiusScale(d.frequency) > 5 / k ? "visible" : "hidden");
      });

    svgElement.call(zoomHandler).call(zoomHandler.transform, d3.zoomIdentity);
    zoomRef.current = zoomHandler; // Store the zoom handler instance

    // --- Interaction Handlers ---
    function handleMouseOver(event: MouseEvent, d: GraphNode) {
      // Highlight the node itself
      d3.select(this)
        .transition().duration(150)
        .attr("fill", nodeHighlightColor) // Use highlight color
        .attr("r", radiusScale(d.frequency) * 1.2);

      // Dim others
      node.transition().duration(150).style("opacity", 0.2);
      link.transition().duration(150).style("opacity", 0.1);
      labels.transition().duration(150).style("opacity", 0.2).style("visibility", "hidden"); // Hide all labels first

      // Highlight neighbors and links
      node.filter(n => areLinked(d, n))
        .transition().duration(150)
        .style("opacity", 1)
        .attr("fill", n => n.id === d.id ? nodeHighlightColor : colorScale(n.frequency)); // Keep original color or highlight for self

      link.filter(l => {
           const source = l.source as GraphNode;
           const target = l.target as GraphNode;
           return source.id === d.id || target.id === d.id;
         })
        .transition().duration(150)
        .style("opacity", 0.8)
        .attr("stroke", linkHighlightColor);

      // Highlight self node fully
      d3.select(this).transition().duration(150).style("opacity", 1);

      // Show label of hovered node and neighbors CLEARLY
      labels.filter(l => l.id === d.id || areLinked(d, l))
        .transition().duration(150)
        .style("opacity", 1)
        .style("visibility", "visible");
    }

    function handleMouseOut(event: MouseEvent, d: GraphNode) {
      // Restore original appearance
      node.transition().duration(300)
        .style("opacity", 1)
        .attr("fill", n => colorScale(n.frequency)) // Restore original color
        .attr("r", n => radiusScale(n.frequency));

      link.transition().duration(300)
        .style("opacity", 0.5)
        .attr("stroke", linkColor);

      // Restore default label visibility
      labels.transition().duration(300)
        .style("opacity", 1)
        .style("visibility", l => radiusScale(l.frequency) > 8 ? "visible" : "hidden");
    }

    function handleClick(event: MouseEvent, d: GraphNode) {
        console.log("Clicked Theme:", d.name, "ID:", d.id, "Frequency:", d.frequency);
        // Future: Add logic here to display related content (stories, quotes, media)
        // For now, maybe a persistent highlight or selection state?
        // Example: toggle a 'selected' class or state
         d3.select(this).classed("selected", !d3.select(this).classed("selected"));
    }

    function areLinked(a: GraphNode, b: GraphNode): boolean {
      return linkedByIndex[`${a.id},${b.id}`] || a.id === b.id;
    }

    // Cleanup function
    return () => {
      simulation.stop();
    };

  }, [nodes, links, width, height, labelColor, linkColor, linkHighlightColor, nodeHighlightColor, legendColor, linkedByIndex]); // Updated dependencies

  // --- Effect for Programmatic Zoom --- 
  useEffect(() => {
    if (!focusedNodeId || !ref.current || !zoomRef.current) return;

    const svgElement = d3.select(ref.current);
    const targetNode = nodes.find(n => n.id === focusedNodeId);

    if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
      const targetX = targetNode.x;
      const targetY = targetNode.y;
      const scale = 2; // Zoom level to focus
      const transform = d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(scale)
        .translate(-targetX, -targetY);

      svgElement.transition()
        .duration(750) // Smooth transition
        .call(zoomRef.current.transform, transform);
    }
  }, [focusedNodeId, nodes, width, height]); // Rerun when focusedNodeId changes

  // --- Drag Functionality ---
  const drag = (simulation: d3.Simulation<GraphNode, GraphLink>) => {
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, GraphNode, any>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: d3.D3DragEvent<SVGCircleElement, GraphNode, any>, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: d3.D3DragEvent<SVGCircleElement, GraphNode, any>, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return d3.drag<SVGCircleElement, GraphNode>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
  }

  return (
    <Box border="1px" borderColor="gray.300" borderRadius="md" overflow="hidden" position="relative">
      <svg ref={ref} width={width} height={height} viewBox={`0 0 ${width} ${height}`}></svg>
    </Box>
  );
};

export default ThemeNetworkGraph; 