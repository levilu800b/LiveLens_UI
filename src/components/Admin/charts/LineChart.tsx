// src/components/Admin/charts/LineChart.tsx
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface LineChartData {
  date: string;
  value: number;
}

interface LineChartProps {
  data: LineChartData[];
  width?: number;
  height?: number;
  title?: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
  color?: string;
}

const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  width = 600, 
  height = 300, 
  title = "Chart",
  xAxisLabel = "",
  yAxisLabel = "",
  color = "#3b82f6"
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
    const responsiveHeight = Math.min(height, responsiveWidth * 0.5); // Maintain aspect ratio

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous chart

    const margin = { 
      top: 20, 
      right: Math.min(30, responsiveWidth * 0.05), 
      bottom: Math.min(60, responsiveWidth * 0.12), 
      left: Math.min(60, responsiveWidth * 0.12) 
    };
    const chartWidth = responsiveWidth - margin.left - margin.right;
    const chartHeight = responsiveHeight - margin.top - margin.bottom;

    const g = svg
      .attr("width", responsiveWidth)
      .attr("height", responsiveHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse("%Y-%m-%d");
    const parsedData = data.map(d => ({
      date: parseDate(d.date) || new Date(),
      value: d.value
    }));

    // Scales
    const xScale = d3.scaleTime()
      .domain(d3.extent(parsedData, d => d.date) as [Date, Date])
      .range([0, chartWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(parsedData, d => d.value) || 0])
      .nice()
      .range([chartHeight, 0]);

    // Line generator
    const line = d3.line<typeof parsedData[0]>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.value))
      .curve(d3.curveMonotoneX);

    // Add line
    const path = g.append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);

    // Animate line drawing
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);

    // Add dots
    const dots = g.selectAll(".dot")
      .data(parsedData)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d.date))
      .attr("cy", d => yScale(d.value))
      .attr("r", 0)
      .attr("fill", color)
      .style("cursor", "pointer");

    // Animate dots
    dots.transition()
      .delay((_, i) => i * 100)
      .duration(500)
      .attr("r", 4);

    // Add hover effects to dots
    dots
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 6);
        
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

        const formatDate = d3.timeFormat("%Y-%m-%d");
        tooltip
          .html(`Date: ${formatDate(d.date)}<br/>Value: ${d.value.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 10) + "px");
      })
      .on("mouseout", function() {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", 4);
        
        d3.selectAll(".tooltip").remove();
      });

    // Add X axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((domainValue) => {
        if (domainValue instanceof Date) {
          return d3.timeFormat("%m/%d")(domainValue);
        }
        return "";
      });
    
    g.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xAxis);

    // Add Y axis
    g.append("g")
      .call(d3.axisLeft(yScale));

    // Add grid lines
    const xGridAxis = d3.axisBottom(xScale)
      .tickSize(-chartHeight)
      .tickFormat(() => "");
    
    g.append("g")
      .attr("class", "grid")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(xGridAxis)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    const yGridAxis = d3.axisLeft(yScale)
      .tickSize(-chartWidth)
      .tickFormat(() => "");

    g.append("g")
      .attr("class", "grid")
      .call(yGridAxis)
      .style("stroke-dasharray", "3,3")
      .style("opacity", 0.3);

    // Add X axis label
    if (xAxisLabel) {
      g.append("text")
        .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + margin.bottom - 5})`)
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#666")
        .text(xAxisLabel);
    }

    // Add Y axis label
    if (yAxisLabel) {
      g.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#666")
        .text(yAxisLabel);
    }

  }, [data, width, height, xAxisLabel, yAxisLabel, color]);

  return (
    <div ref={containerRef} className="bg-white rounded-lg p-3 sm:p-4 shadow-md w-full">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">{title}</h3>
      <div className="flex justify-center">
        <svg ref={svgRef} className="max-w-full h-auto"></svg>
      </div>
    </div>
  );
};

export default LineChart;
