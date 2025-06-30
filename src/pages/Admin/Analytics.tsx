// src/pages/Admin/Analytics.tsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';

import BarChart from '../../components/Admin/charts/BarChart';
import PieChart from '../../components/Admin/charts/PieChart';
import LineChart from '../../components/Admin/charts/LineChart';
import MetricCard from '../../components/Admin/MetricCard';
import AdminNavigation from '../../components/Admin/AdminNavigation';
import adminService from '../../services/adminService';
import type { DashboardStats } from '../../services/adminService';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Loading Analytics...</h2>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-700">Error Loading Analytics</h2>
          <p className="text-gray-600 mt-2 mb-4">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const contentTypeData = [
    { label: 'Stories', value: stats.total_stories, color: '#3b82f6' },
    { label: 'Films', value: stats.total_films, color: '#ef4444' },
    { label: 'Content', value: stats.total_content, color: '#10b981' },
    { label: 'Podcasts', value: stats.total_podcasts, color: '#f59e0b' },
    { label: 'Animations', value: stats.total_animations, color: '#8b5cf6' },
    { label: 'Sneak Peeks', value: stats.total_sneak_peeks, color: '#06b6d4' },
    { label: 'Live Videos', value: stats.total_live_videos, color: '#84cc16' },
  ].filter(item => item.value > 0);

  const userEngagementData = [
    { label: 'Views', value: stats.total_views, color: '#3b82f6' },
    { label: 'Likes', value: stats.total_likes, color: '#ef4444' },
    { label: 'Comments', value: stats.total_comments, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Top trending content for bar chart
  const trendingContentData = [
    ...stats.trending_stories.slice(0, 5).map(story => ({
      label: story.title.length > 15 ? story.title.substring(0, 15) + '...' : story.title,
      value: story.read_count || story.like_count,
      color: '#3b82f6'
    })),
    ...stats.trending_films.slice(0, 5).map(film => ({
      label: film.title.length > 15 ? film.title.substring(0, 15) + '...' : film.title,
      value: film.view_count || film.like_count,
      color: '#ef4444'
    })),
    ...stats.trending_podcasts.slice(0, 5).map(podcast => ({
      label: podcast.title.length > 15 ? podcast.title.substring(0, 15) + '...' : podcast.title,
      value: podcast.play_count || podcast.like_count,
      color: '#f59e0b'
    }))
  ].slice(0, 10);

  // Generate some mock time series data for user growth
  const generateTimeSeriesData = () => {
    const data = [];
    const today = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const baseValue = stats.total_users - stats.new_users_today;
      const variance = Math.random() * 50 - 25; // Random variance
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.max(0, baseValue + (i * 2) + variance)
      });
    }
    return data;
  };

  const userGrowthData = generateTimeSeriesData();

  // User status breakdown
  const userStatusData = [
    { label: 'Active Users', value: stats.active_users_today, color: '#10b981' },
    { label: 'Verified Users', value: stats.verified_users, color: '#3b82f6' },
    { label: 'New Users Today', value: stats.new_users_today, color: '#f59e0b' },
    { label: 'Total Users', value: stats.total_users - stats.active_users_today - stats.verified_users - stats.new_users_today, color: '#6b7280' }
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-gray-600">Comprehensive platform analytics and insights</p>
            </div>
            <button
              onClick={fetchAnalyticsData}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Performance Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Users"
            value={stats.total_users}
            change={`+${stats.new_users_today} today`}
            changeType="positive"
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Total Content"
            value={stats.total_all_content}
            icon={BarChart3}
            color="green"
          />
          <MetricCard
            title="Total Views"
            value={stats.total_views}
            icon={Eye}
            color="purple"
          />
          <MetricCard
            title="Engagement Rate"
            value={`${((stats.total_likes + stats.total_comments) / Math.max(stats.total_views, 1) * 100).toFixed(1)}%`}
            icon={TrendingUp}
            color="indigo"
          />
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Content Type Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <PieChartIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Content Type Distribution</h3>
            </div>
            {contentTypeData.length > 0 ? (
              <PieChart
                data={contentTypeData}
                width={350}
                height={350}
                title=""
              />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No content data available
              </div>
            )}
          </div>

          {/* User Engagement Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Activity className="h-5 w-5 text-green-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Engagement Breakdown</h3>
            </div>
            {userEngagementData.length > 0 ? (
              <PieChart
                data={userEngagementData}
                width={350}
                height={350}
                title=""
              />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No engagement data available
              </div>
            )}
          </div>
        </div>

        {/* User Growth Trend */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">User Growth Trend (Last 30 Days)</h3>
          </div>
          <LineChart
            data={userGrowthData}
            width={800}
            height={400}
            title=""
            xAxisLabel="Date"
            yAxisLabel="Number of Users"
            color="#3b82f6"
          />
        </div>

        {/* Grid for smaller charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Trending Content */}
          {trendingContentData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <BarChart3 className="h-5 w-5 text-purple-500 mr-2" />
                <h3 className="text-lg font-semibold text-gray-800">Top Trending Content</h3>
              </div>
              <BarChart
                data={trendingContentData}
                width={500}
                height={400}
                title=""
                xAxisLabel="Content"
                yAxisLabel="Engagement"
              />
            </div>
          )}

          {/* User Status Distribution */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <Users className="h-5 w-5 text-indigo-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">User Status Distribution</h3>
            </div>
            {userStatusData.length > 0 ? (
              <PieChart
                data={userStatusData}
                width={400}
                height={400}
                title=""
              />
            ) : (
              <div className="flex items-center justify-center h-80 text-gray-500">
                No user status data available
              </div>
            )}
          </div>
        </div>

        {/* Analytics Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Analytics Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total_users}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{stats.total_all_content}</div>
              <div className="text-sm text-gray-600">Total Content</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {(stats.total_views + stats.total_likes + stats.total_comments).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Engagement</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {stats.avg_session_duration.toFixed(1)}m
              </div>
              <div className="text-sm text-gray-600">Avg Session Duration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
