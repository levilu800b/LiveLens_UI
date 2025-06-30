// src/pages/Admin/Analytics.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';

import BarChart from '../../components/Admin/charts/BarChart';
import PieChart from '../../components/Admin/charts/PieChart';
import LineChart from '../../components/Admin/charts/LineChart';
import MetricCard from '../../components/Admin/MetricCard';
import AdminNavigation from '../../components/Admin/AdminNavigation';
import DateRangePicker from '../../components/Admin/DateRangePicker';
import ExportButton from '../../components/Admin/ExportButton';
import adminService from '../../services/adminService';
import type { DashboardStats } from '../../services/adminService';

const Analytics: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
      console.error('Error fetching analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setRefreshing(false);
  };

  const handleDateRangeChange = (range: { startDate: string; endDate: string }) => {
    setDateRange(range);
    // In production, this would trigger a new API call with the date range
    console.log('Date range changed:', range);
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

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
    { label: 'Stories', value: stats.total_stories },
    { label: 'Films', value: stats.total_films },
    { label: 'Content', value: stats.total_content },
    { label: 'Podcasts', value: stats.total_podcasts },
    { label: 'Animations', value: stats.total_animations },
    { label: 'Sneak Peeks', value: stats.total_sneak_peeks },
    { label: 'Live Videos', value: stats.total_live_videos }
  ].filter(item => item.value > 0);

  const userEngagementData = [
    { label: 'Views', value: stats.total_views },
    { label: 'Likes', value: stats.total_likes },
    { label: 'Comments', value: stats.total_comments }
  ].filter(item => item.value > 0);

  // Top trending content for bar chart
  const trendingContentData = [
    ...stats.trending_stories.slice(0, 5).map(story => ({
      label: story.title.length > 15 ? story.title.substring(0, 15) + '...' : story.title,
      value: story.read_count || story.like_count
    })),
    ...stats.trending_films.slice(0, 5).map(film => ({
      label: film.title.length > 15 ? film.title.substring(0, 15) + '...' : film.title,
      value: film.view_count || film.like_count
    })),
    ...stats.trending_podcasts.slice(0, 5).map(podcast => ({
      label: podcast.title.length > 15 ? podcast.title.substring(0, 15) + '...' : podcast.title,
      value: podcast.play_count || podcast.like_count
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
    { label: 'Active Users', value: stats.active_users_today },
    { label: 'Verified Users', value: stats.verified_users },
    { label: 'New Users Today', value: stats.new_users_today },
    { label: 'Other Users', value: Math.max(0, stats.total_users - stats.active_users_today - stats.verified_users - stats.new_users_today) }
  ].filter(item => item.value > 0);

  // Export data for analytics
  const analyticsExportData = [
    {
      metric: 'Total Users',
      value: stats.total_users,
      period: `${dateRange.startDate} to ${dateRange.endDate}`
    },
    {
      metric: 'Total Content',
      value: stats.total_all_content,
      period: `${dateRange.startDate} to ${dateRange.endDate}`
    },
    {
      metric: 'Total Views',
      value: stats.total_views,
      period: `${dateRange.startDate} to ${dateRange.endDate}`
    },
    {
      metric: 'Total Likes',
      value: stats.total_likes,
      period: `${dateRange.startDate} to ${dateRange.endDate}`
    },
    {
      metric: 'Total Comments',
      value: stats.total_comments,
      period: `${dateRange.startDate} to ${dateRange.endDate}`
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-600">Comprehensive platform analytics and insights</p>
              </div>
              
              <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <div className="w-full sm:w-auto">
                  <DateRangePicker 
                    onDateRangeChange={handleDateRangeChange}
                    initialRange={dateRange}
                  />
                </div>
                <div className="flex space-x-2 sm:space-x-4">
                  <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                  </button>
                  <div className="flex-1 sm:flex-none">
                    <ExportButton 
                      data={analyticsExportData}
                      filename="livelens-analytics"
                      headers={['metric', 'value', 'period']}
                    />
                  </div>
                </div>
              </div>
            </div>
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
            title="Active Today"
            value={stats.active_users_today}
            change={`${((stats.active_users_today / stats.total_users) * 100).toFixed(1)}% of total`}
            changeType="positive"
            icon={TrendingUp}
            color="yellow"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Content Distribution */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Distribution</h3>
            <div className="h-80">
              {contentTypeData.length > 0 ? (
                <PieChart 
                  data={contentTypeData}
                  width={400}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No content data available
                </div>
              )}
            </div>
          </div>

          {/* User Engagement */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Engagement</h3>
            <div className="h-80">
              {userEngagementData.length > 0 ? (
                <PieChart 
                  data={userEngagementData}
                  width={400}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No engagement data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Time Series and Top Content */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* User Growth Trend */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth Trend (Last 30 Days)</h3>
            <div className="h-80">
              <LineChart 
                data={userGrowthData}
                width={500}
                height={300}
              />
            </div>
          </div>

          {/* Top Content */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Content</h3>
            <div className="h-80">
              {trendingContentData.length > 0 ? (
                <BarChart 
                  data={trendingContentData}
                  width={500}
                  height={300}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No trending content data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Status Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Status Distribution</h3>
          <div className="h-80">
            {userStatusData.length > 0 ? (
              <PieChart 
                data={userStatusData}
                width={800}
                height={300}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No user status data available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
