// src/pages/Admin/AdminDashboard.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import * as d3 from 'd3';
import {
  Users,
  FileText,
  Film,
  Headphones,
  Palette,
  Eye,
  Heart,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import type { RootState } from '../../store';
import { adminActions } from '../../store/reducers/adminReducers';
import MainLayout from '../../components/MainLayout/MainLayout';

interface StatCard {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  change: number;
  link: string;
}

const AdminDashboard: React.FC = () => {
  const dispatch = useDispatch();
  const { stats } = useSelector((state: RootState) => state.admin);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  
  // D3 chart refs
  const barChartRef = useRef<SVGSVGElement>(null);
  const pieChartRef = useRef<SVGSVGElement>(null);
  const lineChartRef = useRef<SVGSVGElement>(null);

  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      dispatch(adminActions.setStats({
        totalUsers: 1250,
        totalContent: 850,
        totalStories: 320,
        totalFilms: 185,
        totalPodcasts: 142,
        totalAnimations: 98,
        totalSneakPeeks: 105,
        totalViews: 45678,
        totalLikes: 12543,
        totalComments: 3421
      }));
    }, 1000);
  }, [dispatch]);

  const statCards: StatCard[] = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      change: 12.5,
      link: '/admin/users'
    },
    {
      title: 'Total Content',
      value: stats?.totalContent || 0,
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      change: 8.2,
      link: '/admin/all-posts'
    },
    {
      title: 'Stories',
      value: stats?.totalStories || 0,
      icon: FileText,
      color: 'from-green-500 to-green-600',
      change: 15.3,
      link: '/admin/stories'
    },
    {
      title: 'Films',
      value: stats?.totalFilms || 0,
      icon: Film,
      color: 'from-red-500 to-red-600',
      change: 6.7,
      link: '/admin/films'
    },
    {
      title: 'Contents',
      value: stats?.totalFilms || 0,
      icon: Film,
      color: 'from-red-500 to-red-600',
      change: 6.7,
      link: '/admin/contents'
    },
    {
      title: 'Sneak Peeks',
      value: stats?.totalSneakPeeks || 0,
      icon: Film,
      color: 'from-indigo-500 to-indigo-600',
      change: 9.4,
      link: '/admin/sneak-peeks'
    },
    {
      title: 'Podcasts',
      value: stats?.totalPodcasts || 0,
      icon: Headphones,
      color: 'from-yellow-500 to-yellow-600',
      change: 10.1,
      link: '/admin/podcasts'
    },
    {
      title: 'Animations',
      value: stats?.totalAnimations || 0,
      icon: Palette,
      color: 'from-pink-500 to-pink-600',
      change: 18.9,
      link: '/admin/animations'
    },
    {
      title: 'Total Views',
      value: stats?.totalViews || 0,
      icon: Eye,
      color: 'from-indigo-500 to-indigo-600',
      change: 22.4,
      link: '/admin/analytics'
    },
    {
      title: 'Total Likes',
      value: stats?.totalLikes || 0,
      icon: Heart,
      color: 'from-rose-500 to-rose-600',
      change: 14.8,
      link: '/admin/engagement'
    }
  ];

  // Bar Chart for Content Types
  useEffect(() => {
    if (!stats || !barChartRef.current) return;

    const svg = d3.select(barChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 40 };
    const width = 400 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    const data = [
      { name: 'Stories', value: stats.totalStories },
      { name: 'Films', value: stats.totalFilms },
      { name: 'Contents', value: stats.totalContent },
      { name: 'Podcasts', value: stats.totalPodcasts },
      { name: 'Animations', value: stats.totalAnimations },
      { name: 'Sneak Peeks', value: stats.totalSneakPeeks }
    ];

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.1);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value) || 0])
      .nice()
      .range([height, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Create gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'barGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', height)
      .attr('x2', 0).attr('y2', 0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#8b5cf6');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#a855f7');

    // Bars
    g.selectAll('.bar')
      .data(data)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name) || 0)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', 'url(#barGradient)')
      .attr('rx', 4)
      .transition()
      .duration(800)
      .attr('y', d => y(d.value))
      .attr('height', d => height - y(d.value));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '12px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '12px');

  }, [stats]);

  // Pie Chart for Content Distribution
  useEffect(() => {
    if (!stats || !pieChartRef.current) return;

    const svg = d3.select(pieChartRef.current);
    svg.selectAll('*').remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 10;

    const data = [
      { name: 'Stories', value: stats.totalStories, color: '#10b981' },
      { name: 'Films', value: stats.totalFilms, color: '#ef4444' },
      {name: 'Contents', value: stats.totalContent, color: '#3b82f6' },
      { name: 'Podcasts', value: stats.totalPodcasts, color: '#f59e0b' },
      { name: 'Animations', value: stats.totalAnimations, color: '#ec4899' },
      { name: 'Sneak Peeks', value: stats.totalSneakPeeks, color: '#6366f1' }
    ];

    type PieData = { name: string; value: number; color: string };

    const pie = d3.pie<PieData>()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc<d3.PieArcDatum<PieData>>()
      .innerRadius(0)
      .outerRadius(radius);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter().append('g')
      .attr('class', 'arc');

    arcs.append('path')
      .attr('d', arc)
      .attr('fill', d => d.data.color)
      .attr('stroke', '#1f2937')
      .attr('stroke-width', 2)
      .transition()
      .duration(800)
      .attrTween('d', function(d) {
        const i = d3.interpolate({startAngle: 0, endAngle: 0}, d);
        return function(t) { 
          const path = arc(i(t));
          return path ?? '';
        };
      });

    // Labels
    arcs.append('text')
      .attr('transform', d => `translate(${arc.centroid(d)})`)
      .attr('dy', '.35em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text(d => d.data.value > 10 ? d.data.value : '');

  }, [stats]);

  // Line Chart for Engagement Over Time
  useEffect(() => {
    if (!lineChartRef.current) return;

    const svg = d3.select(lineChartRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 300 - margin.bottom - margin.top;

    // Mock time series data
    const data = [
      { date: '2024-01-01', views: 1200, likes: 300 },
      { date: '2024-01-02', views: 1350, likes: 340 },
      { date: '2024-01-03', views: 1100, likes: 280 },
      { date: '2024-01-04', views: 1600, likes: 420 },
      { date: '2024-01-05', views: 1800, likes: 480 },
      { date: '2024-01-06', views: 2000, likes: 530 },
      { date: '2024-01-07', views: 2200, likes: 580 }
    ].map(d => ({
      ...d,
      date: new Date(d.date)
    }));

    const x = d3.scaleTime()
      .domain(d3.extent(data, d => d.date) as [Date, Date])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.views) || 0])
      .nice()
      .range([height, 0]);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Line generator
    const line = d3.line<{ date: Date; views: number; likes: number }>()
      .x(d => x(d.date))
      .y(d => y(d.views))
      .curve(d3.curveMonotoneX);

    // Add gradient
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'lineGradient')
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', width).attr('y2', 0);

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#06b6d4');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8b5cf6');

    // Add the line
    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#lineGradient)')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Animate the line
    const totalLength = path.node()?.getTotalLength() || 0;
    path
      .attr('stroke-dasharray', totalLength + ' ' + totalLength)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2000)
      .attr('stroke-dashoffset', 0);

    // Add dots
    g.selectAll('.dot')
      .data(data)
      .enter().append('circle')
      .attr('class', 'dot')
      .attr('cx', d => x(d.date))
      .attr('cy', d => y(d.views))
      .attr('r', 0)
      .attr('fill', '#8b5cf6')
      .transition()
      .delay(1500)
      .duration(500)
      .attr('r', 4);

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '12px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .attr('fill', '#9ca3af')
      .style('font-size', '12px');

  }, []);

  const quickActions = [
    { name: 'Add Story', icon: FileText, path: '/admin/add-story', color: 'bg-green-500' },
    { name: 'Add Film', icon: Film, path: '/admin/add-film', color: 'bg-red-500' },
    {name: 'Add Content', icon: FileText, path: '/admin/add-content', color: 'bg-purple-500' },
    { name: 'Add Sneak Peek', icon: Film, path: '/admin/add-sneak-peek', color: 'bg-indigo-500' },
    { name: 'Add Podcast', icon: Headphones, path: '/admin/add-podcast', color: 'bg-yellow-500' },
    { name: 'Add Animation', icon: Palette, path: '/admin/add-animation', color: 'bg-pink-500' },
    { name: 'Create AI Story', icon: Activity, path: '/admin/create-ai-story', color: 'bg-blue-500' },
    { name: 'Create AI Animation', icon: Activity, path: '/admin/create-ai-animation', color: 'bg-purple-500' }
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
            <p className="text-gray-300">Welcome back! Here's what's happening with your content platform.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((card) => (
              <Link
                key={card.title}
                to={card.link}
                className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-6 hover:bg-slate-700/50 transition-all duration-200 hover:scale-105 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">{card.title}</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      {card.value.toLocaleString()}
                    </p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 text-sm font-medium">
                        +{card.change}%
                      </span>
                    </div>
                  </div>
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-r ${card.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            
            {/* Content Types Bar Chart */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Content Distribution</h3>
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <svg ref={barChartRef} width="400" height="300" className="w-full h-auto"></svg>
            </div>

            {/* Content Types Pie Chart */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Content Types</h3>
                <PieChart className="h-5 w-5 text-purple-400" />
              </div>
              <svg ref={pieChartRef} width="300" height="300" className="w-full h-auto mx-auto"></svg>
            </div>

            {/* Engagement Line Chart */}
            <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Engagement Over Time</h3>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedTimeRange}
                    onChange={(e) => setSelectedTimeRange(e.target.value)}
                    className="bg-slate-700 border border-white/20 rounded-md px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                  <Activity className="h-5 w-5 text-purple-400" />
                </div>
              </div>
              <svg ref={lineChartRef} width="500" height="300" className="w-full h-auto"></svg>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Link
                  key={action.name}
                  to={action.path}
                  className="flex flex-col items-center p-4 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-all duration-200 hover:scale-105 group"
                >
                  <div className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-white text-sm font-medium text-center">{action.name}</span>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;