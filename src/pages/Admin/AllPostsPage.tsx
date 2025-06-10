// src/pages/Admin/AllPostsPage.tsx
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Eye, 
  MoreVertical,
  BookOpen,
  Film,
  Headphones,
  Palette,
  Zap
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { ContentItem, PaginatedResponse } from '../../types';
import { uiActions } from '../../store/reducers/uiReducers';
import MainLayout from '../../components/MainLayout/MainLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const AllPostsPage: React.FC = () => {
  const dispatch = useDispatch();
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const contentTypes = [
    { key: 'all', label: 'All Content', icon: Eye },
    { key: 'story', label: 'Stories', icon: BookOpen },
    { key: 'film', label: 'Films', icon: Film },
    { key: 'content', label: 'Content', icon: Film },
    { key: 'podcast', label: 'Podcasts', icon: Headphones },
    { key: 'animation', label: 'Animations', icon: Palette },
    { key: 'sneak-peek', label: 'Sneak Peeks', icon: Zap },
  ];

  const statusOptions = [
    { key: 'all', label: 'All Status' },
    { key: 'published', label: 'Published' },
    { key: 'draft', label: 'Draft' },
    { key: 'archived', label: 'Archived' },
  ];

  useEffect(() => {
    fetchPosts();
  }, [currentPage, selectedType, selectedStatus, searchQuery]);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const filters: any = {
        page: currentPage,
        search: searchQuery,
      };

      if (selectedType !== 'all') {
        filters.contentType = selectedType;
      }
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      const response = await adminService.getAllContent(filters);
      setPosts(response.items);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to load posts'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (contentType: string, contentId: string) => {
    if (!window.confirm('Are you sure you want to delete this content? This action cannot be undone.')) {
      return;
    }

    try {
      await adminService.deleteContent(contentType, contentId);
      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Content deleted successfully'
      }));
      fetchPosts(); // Refresh the list
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to delete content'
      }));
    }
  };

  const handleStatusChange = async (contentType: string, contentId: string, newStatus: string) => {
    try {
      await adminService.updateContentStatus(contentType, contentId, newStatus);
      dispatch(uiActions.addNotification({
        type: 'success',
        message: `Content ${newStatus} successfully`
      }));
      fetchPosts(); // Refresh the list
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to update content status'
      }));
    }
  };

  const handleFeatureToggle = async (contentType: string, contentId: string, featured: boolean) => {
    try {
      await adminService.featureContent(contentType, contentId, featured);
      dispatch(uiActions.addNotification({
        type: 'success',
        message: `Content ${featured ? 'featured' : 'unfeatured'} successfully`
      }));
      fetchPosts(); // Refresh the list
    } catch (error: any) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error.message || 'Failed to update content'
      }));
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      story: BookOpen,
      film: Film,
      content: Film,
      podcast: Headphones,
      animation: Palette,
      'sneak-peek': Zap,
    };

    const Icon = icons[type as keyof typeof icons] || Eye;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">All Posts</h1>
                <p className="text-gray-600">Manage all your content in one place</p>
              </div>
              
              <div className="flex space-x-3">
                <div className="relative">
                  <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
                  </button>
                  {/* Dropdown menu for different content types */}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {contentTypes.map(type => (
                    <option key={type.key} value={type.key}>
                      {type.label}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {statusOptions.map(status => (
                    <option key={status.key} value={status.key}>
                      {status.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-sm text-gray-500">
                {posts.length} items found
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : posts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {posts.map((post) => (
                      <tr key={post.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img 
                              src={post.thumbnail || '/api/placeholder/60/60'} 
                              alt={post.title}
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {post.title}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {post.description}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(post.type)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">
                              {post.type.replace('-', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(post.status || 'draft')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="space-y-1">
                            <div>{post.views.toLocaleString()} views</div>
                            <div>{post.likes} likes</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdown(openDropdown === post.id ? null : post.id)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {openDropdown === post.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                <div className="py-1">
                                  <Link
                                    to={`/admin/edit-${post.type}/${post.id}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Edit3 className="h-4 w-4 mr-2" />
                                    Edit
                                  </Link>
                                  <Link
                                    to={`/${post.type}/${post.id}`}
                                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </Link>
                                  <button
                                    onClick={() => handleFeatureToggle(post.type, post.id, !post.isFeatured)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    {post.isFeatured ? 'Unfeature' : 'Feature'}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(post.type, post.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || selectedType !== 'all' || selectedStatus !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Start creating content to see it here'
                  }
                </p>
                <Link
                  to="/admin/add-story"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create First Post
                </Link>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default AllPostsPage;