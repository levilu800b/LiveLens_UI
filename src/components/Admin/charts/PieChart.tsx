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
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const container = containerRef.current;
    if (!container) return;

    // Get responsive dimensions
    const containerWidth = container.offsetWidth;
    const responsiveWidth = Math.min(width, containerWidth);
    const responsiveHeight = Math.min(height, responsiveWidth * 0.8); // Maintain aspect ratio

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = Math.min(40, responsiveWidth * 0.1);
    const radius = Math.min(responsiveWidth, responsiveHeight) / 2 - margin;

    const g = svg
      .attr("width", responsiveWidth)
      .attr("height", responsiveHeight)
      .append("g")
      .attr("transform", `translate(${responsiveWidth / 2}, ${responsiveHeight / 2})`);

    // Color scale - use provided colors or fallback to d3 color scheme
    const getColor = (d: PieChartData, index: number) => {
      if (d.color) return d.color;
      const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6366F1', '#06B6D4', '#EC4899', '#84CC16', '#F97316'];
      return colors[index % colors.length];
    };

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
      .attr("fill", (d, i) => getColor(d.data, i))
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
    <div ref={containerRef} className="bg-white rounded-lg p-3 sm:p-4 shadow-md w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">{title}</h3>
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="flex justify-center flex-1">
          <svg ref={svgRef} className="max-w-full h-auto"></svg>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap lg:flex-col gap-2 justify-center lg:justify-start">
          {data.map((item, index) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: item.color || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#6366F1', '#06B6D4', '#EC4899', '#84CC16', '#F97316'][index % 10] }}
              ></div>
              <span className="text-gray-700 whitespace-nowrap">{item.label}</span>
              <span className="text-gray-500 font-medium">({item.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PieChart;
