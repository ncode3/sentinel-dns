import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Region } from '../types';

interface Props {
  regions: Region[];
  isChaos: boolean;
}

export const NetworkMap: React.FC<Props> = ({ regions, isChaos }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Configuration
    const centerX = width / 2;
    const centerY = height / 2;
    const nodeRadius = 6;
    
    // Data Nodes positions
    const nodes = [
      { id: 'us-central1', x: centerX - 150, y: centerY + 40, label: 'US-Central' },
      { id: 'europe-west1', x: centerX + 80, y: centerY - 60, label: 'EU-West' },
      { id: 'asia-east1', x: centerX + 160, y: centerY + 60, label: 'Asia-East' },
      { id: 'TARGET', x: centerX, y: centerY, label: 'TARGET API' } // The target
    ];

    // Draw links
    const links = nodes.filter(n => n.id !== 'TARGET').map(n => ({ source: n, target: nodes[3] }));

    // Definitions for glows
    const defs = svg.append("defs");
    const filter = defs.append("filter").attr("id", "glow");
    filter.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "coloredBlur");
    const feMerge = filter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Draw Connections
    links.forEach(link => {
      const regionData = regions.find(r => r.id === link.source.id);
      const isError = regionData?.status !== 'HEALTHY';
      const color = isError ? '#ef4444' : '#38bdf8';

      // Path
      svg.append("line")
        .attr("x1", link.source.x)
        .attr("y1", link.source.y)
        .attr("x2", link.target.x)
        .attr("y2", link.target.y)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.3);

      // Animated Packet
      const packet = svg.append("circle")
        .attr("r", 3)
        .attr("fill", color)
        .attr("filter", "url(#glow)");

      const packetDuration = isError ? 4000 : Math.max(500, (regionData?.latency || 500) * 5); // Speed based on latency

      const repeat = () => {
        packet
          .attr("cx", link.source.x)
          .attr("cy", link.source.y)
          .transition()
          .duration(packetDuration)
          .ease(d3.easeLinear)
          .attr("cx", link.target.x)
          .attr("cy", link.target.y)
          .on("end", repeat);
      };
      repeat();
    });

    // Draw Nodes
    nodes.forEach(node => {
      const regionData = regions.find(r => r.id === node.id);
      const isTarget = node.id === 'TARGET';
      const color = isTarget 
        ? (isChaos ? '#ef4444' : '#ffffff') 
        : (regionData?.status === 'HEALTHY' ? '#38bdf8' : '#ef4444');

      // Node Group
      const g = svg.append("g");

      // Outer Pulse (only for active nodes)
      if (isTarget || regionData?.status === 'HEALTHY') {
         g.append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", nodeRadius)
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 1)
        .attr("opacity", 0.5)
        .transition()
        .duration(1500)
        .ease(d3.easeCubicOut)
        .attr("r", nodeRadius * 3)
        .attr("opacity", 0)
        .on("end", function() { d3.select(this).remove(); }) // This loop needs recursive setup in D3, simplified here for stability
        // In a real D3 pure implementation we'd loop this transition.
        // For this React wrapper, simple static or CSS animation is safer to avoid infinite hook loops if not careful.
      }

      // Core
      g.append("circle")
        .attr("cx", node.x)
        .attr("cy", node.y)
        .attr("r", isTarget ? 8 : nodeRadius)
        .attr("fill", color)
        .attr("filter", "url(#glow)");

      // Label
      g.append("text")
        .attr("x", node.x)
        .attr("y", node.y + 25)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .text(node.label);
        
      if (!isTarget && regionData) {
         g.append("text")
        .attr("x", node.x)
        .attr("y", node.y + 38)
        .attr("text-anchor", "middle")
        .attr("fill", regionData.status === 'HEALTHY' ? '#38bdf8' : '#ef4444')
        .attr("font-size", "10px")
        .attr("font-family", "monospace")
        .text(`${regionData.latency}ms`);
      }
    });

  }, [regions, isChaos]);

  return (
    <div ref={containerRef} className="w-full h-full bg-slate-900/50 relative">
      <svg ref={svgRef} width="100%" height="100%" className="absolute inset-0" />
    </div>
  );
};
