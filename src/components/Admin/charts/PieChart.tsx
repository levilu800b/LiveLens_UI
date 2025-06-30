// src/components/Admin/charts/PieChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface PieChartData {
  label: string;
  value: number;
  color?: string;
}

interface PieChartProps {
  data: PieChartData[];
  width?: number;
  height?: number;
  title?: string;
}

const PieChart: React.FC<PieChartProps> = ({ 
  data, 
  width = 400, 
  height = 400, 
  title = "Chart" 
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = 40;
    const radius = Math.min(width, height) / 2 - margin;

    const g = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Color scale
    const colorScale = d3.scaleOrdinal()
      .domain(data.map(d => d.label))
      .range(data.map(d => d.color) || d3.schemeCategory10);

    // Pie generator
    const pie = d3.pie<PieChartData>()
      .value(d => d.value)
      .sort(null);

    // Arc generator
    const arc = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc<d3.PieArcDatum<PieChartData>>()
      .innerRadius(0)
      .outerRadius(radius + 10);

    // Create arcs
    const arcs = g.selectAll(".arc")
      .data(pie(data))
      .enter()
      .append("g")
      .attr("class", "arc");

    // Add paths
    const paths = arcs.append("path")
      .attr("d", arc)
      .attr("fill", d => colorScale(d.data.label) as string)
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");

    // Add hover effects
    paths
      .on("mouseover", function(event, d) {
        // Get the current path data
        const currentPath = d3.select(this);
        currentPath.attr("d", arcHover(d) || "");
        
        // Tooltip
        const tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip")
          .style("position", "absolute")
          .style("background", "rgba(0, 0, 0, 0.8)")
          .style("color", "white")
          .style("padding", "8px")
          .style("border-radius", "4px")
          .style("font-size", "12px")
          .style("pointer-events", "none")
          .style("z-index", "1000");

        tooltip
          .html(`${d.data.label}: ${d.data.value}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function(_, d) {
        const currentPath = d3.select(this);
        currentPath.attr("d", arc(d) || "");
        
        d3.selectAll(".tooltip").remove();
      });

    // Add labels
    arcs.append("text")
      .attr("transform", d => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .text(d => {
        const total = d3.sum(data, d => d.value) || 1;
        const percentage = (d.data.value / total) * 100;
        return percentage > 5 ? `${percentage.toFixed(1)}%` : ''; // Only show label if slice is large enough
      });

  }, [data, width, height]);

  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">{title}</h3>
      <svg ref={svgRef} className="mx-auto"></svg>
    </div>
  );
};

export default PieChart;
