// src/pages/Admin/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Eye, 
  Heart, 
  MessageCircle, 
  TrendingUp,
  Clock,
  Shield,
  Mail,
  Activity,
  Play,
  Film,
  Headphones,
  Sparkles,
  Video,
  AlertTriangle
} from 'lucide-react';

import MetricCard from '../../components/Admin/MetricCard';
import PieChart from '../../components/Admin/charts/PieChart';
import BarChart from '../../components/Admin/charts/BarChart';
import AdminLayout from '../../components/Admin/AdminLayout';
import adminService from '../../services/adminService';
import type { DashboardStats } from '../../services/adminService';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
      // Check if we're using demo data (simple heuristic)
      setIsUsingDemoData(data.total_users === 1250);
    } catch (err) {
      setError('Failed to load dashboard data. Please check your connection and try again.');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Loading Dashboard...</h2>
            <p className="text-gray-500 mt-2">Fetching real-time data from the server</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-700">Error Loading Dashboard</h2>
            <p className="text-gray-600 mt-2 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats) return null;

  // Prepare chart data
  const contentTypeData = [
    { label: 'Stories', value: stats.total_stories, color: '#3b82f6' },
    { label: 'Films', value: stats.total_films, color: '#ef4444' },
    { label: 'Content', value: stats.total_content, color: '#10b981' },
    { label: 'Podcasts', value: stats.total_podcasts, color: '#f59e0b' },
    { label: 'Animations', value: stats.total_animations, color: '#8b5cf6' },
    { label: 'Sneak Peeks', value: stats.total_sneak_peeks, color: '#06b6d4' },
    { label: 'Live Videos', value: stats.total_live_videos, color: '#84cc16' },
  ].filter(item => item.value > 0);

  const engagementData = [
    { label: 'Views', value: stats.total_views, color: '#3b82f6' },
    { label: 'Likes', value: stats.total_likes, color: '#ef4444' },
    { label: 'Comments', value: stats.total_comments, color: '#10b981' },
  ].filter(item => item.value > 0);

  // Top content data for bar chart
  const topContentData = [
    ...stats.trending_stories.slice(0, 5).map(story => ({
      label: story.title.substring(0, 20) + '...',
      value: story.read_count || story.like_count,
      color: '#3b82f6'
    })),
    ...stats.trending_films.slice(0, 5).map(film => ({
      label: film.title.substring(0, 20) + '...',
      value: film.view_count || film.like_count,
      color: '#ef4444'
    }))
  ].slice(0, 10);

  return (
    <AdminLayout>
      {/* Demo Data Banner */}
      {isUsingDemoData && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Demo Mode:</strong> Backend not available. Displaying sample data for demonstration purposes. 
                Start your Django backend server to see real data.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">Real-time platform analytics and management</p>
              </div>
              {/* Mobile menu padding to avoid overlay with mobile menu button */}
              <div className="lg:hidden h-4"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6 sm:space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
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
            icon={FileText}
            color="green"
          />
          <MetricCard
            title="Total Engagement"
            value={stats.total_views + stats.total_likes + stats.total_comments}
            icon={TrendingUp}
            color="purple"
          />
          <MetricCard
            title="Active Users Today"
            value={stats.active_users_today}
            icon={Activity}
            color="indigo"
          />
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
          <MetricCard
            title="Total Views"
            value={stats.total_views}
            icon={Eye}
            color="blue"
          />
          <MetricCard
            title="Total Likes"
            value={stats.total_likes}
            icon={Heart}
            color="red"
          />
          <MetricCard
            title="Total Comments"
            value={stats.total_comments}
            icon={MessageCircle}
            color="green"
          />
          <MetricCard
            title="Verified Users"
            value={stats.verified_users}
            icon={Shield}
            color="yellow"
          />
          <MetricCard
            title="Pending Moderation"
            value={stats.pending_moderation}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Content Type Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-3 sm:gap-4 lg:gap-6">
          <MetricCard
            title="Stories"
            value={stats.total_stories}
            icon={FileText}
            color="blue"
          />
          <MetricCard
            title="Films"
            value={stats.total_films}
            icon={Film}
            color="red"
          />
          <MetricCard
            title="Content"
            value={stats.total_content}
            icon={Play}
            color="green"
          />
          <MetricCard
            title="Podcasts"
            value={stats.total_podcasts}
            icon={Headphones}
            color="yellow"
          />
          <MetricCard
            title="Animations"
            value={stats.total_animations}
            icon={Sparkles}
            color="purple"
          />
          <MetricCard
            title="Sneak Peeks"
            value={stats.total_sneak_peeks}
            icon={Eye}
            color="indigo"
          />
          <MetricCard
            title="Live Videos"
            value={stats.total_live_videos}
            icon={Video}
            color="green"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Content Distribution Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <PieChart
              data={contentTypeData}
              title="Content Distribution"
              width={400}
              height={300}
            />
          </div>

          {/* Engagement Breakdown */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <PieChart
              data={engagementData}
              title="Engagement Breakdown"
              width={400}
              height={300}
            />
          </div>
        </div>

        {/* Top Content Performance */}
        {topContentData.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <BarChart
              data={topContentData}
              title="Top Performing Content"
              width={800}
              height={300}
              xAxisLabel="Content"
              yAxisLabel="Engagement"
            />
          </div>
        )}

        {/* Platform Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Session Metrics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-500" />
              Session Metrics
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Avg Session Duration</span>
                <span className="font-semibold">{stats.avg_session_duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bounce Rate</span>
                <span className="font-semibold">{stats.bounce_rate}%</span>
              </div>
            </div>
          </div>

          {/* Email Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-green-500" />
              Email Notifications
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Subscribers</span>
                <span className="font-semibold">{stats.email_stats?.total_subscribers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verified Subscribers</span>
                <span className="font-semibold">{stats.email_stats?.verified_subscribers || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Emails Sent Today</span>
                <span className="font-semibold">{stats.email_stats?.emails_sent_today || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Failed Today</span>
                <span className="font-semibold text-red-600">{stats.email_stats?.failed_emails_today || 0}</span>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2 xl:col-span-1">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Recent Admin Activities
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {stats.recent_activities?.slice(0, 5).map((activity) => (
                <div key={activity.id} className="border-l-2 border-blue-500 pl-3 py-2">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.admin?.username}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              )) || (
                <p className="text-gray-500 text-sm">No recent activities</p>
              )}
            </div>
          </div>
        </div>

        {/* Most Active Users */}
        {stats.most_active_users && stats.most_active_users.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              Most Active Content Creators
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Content Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.most_active_users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username}
                        </div>
                        <div className="text-xs text-gray-500">
                          {user.first_name} {user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.content_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Refresh Button */}
        <div className="mt-8 text-center">
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center mx-auto"
            disabled={loading}
          >
            <Activity className="h-4 w-4 mr-2" />
            Refresh Dashboard
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;