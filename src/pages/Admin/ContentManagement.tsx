// src/pages/Admin/ContentManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Eye, 
  Heart, 
  MessageCircle, 
  Calendar,
  User,
  Trash2,
  Edit,
  Star,
  AlertTriangle
} from 'lucide-react';

import adminService from '../../services/adminService';
import type { ContentItem } from '../../services/adminService';
import AdminLayout from '../../components/Admin/AdminLayout';
import BulkActionsBar from '../../components/Admin/BulkActionsBar';
import ExportButton from '../../components/Admin/ExportButton';
import Pagination from '../../components/Common/Pagination';
import { commonBulkActions } from '../../constants/bulkActions';

const ContentManagement: React.FC = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    content_type: '',
    status: '',
    search: ''
  });
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);

  const fetchContent = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getContentManagement({
        ...filters,
        page: currentPage,
        page_size: itemsPerPage
      });
      setContent(data.content);
      setTotalCount(data.total_count);
      setTotalPages(data.total_pages || Math.ceil(data.total_count / itemsPerPage));
    } catch (err) {
      setError('Failed to load content. Please try again.');
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleSelectItem = (contentId: string) => {
    setSelectedItems(prev => 
      prev.includes(contentId) 
        ? prev.filter(id => id !== contentId)
        : [...prev, contentId]
    );
  };

  const handleSelectAll = () => {
    setSelectedItems(content.map(item => item.content_id));
  };

  const handleClearSelection = () => {
    setSelectedItems([]);
  };

  const handleBulkAction = async (actionId: string, selectedIds: string[]) => {
    try {
      if (actionId === 'delete') {
        const contentToDelete = content
          .filter(item => selectedIds.includes(item.content_id))
          .map(item => ({ content_type: item.content_type, content_id: item.content_id }));
        
        await adminService.bulkDeleteContent(contentToDelete);
        await fetchContent(); // Refresh the list
      }
      // Add more bulk actions as needed
    } catch (err) {
      console.error('Bulk action error:', err);
      alert('Failed to complete bulk action. Please try again.');
    }
  };

  const handleDeleteContent = async (contentType: string, contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      await adminService.deleteContent(contentType, contentId);
      await fetchContent(); // Refresh the list
    } catch (err) {
      alert('Failed to delete content. Please try again.');
      console.error('Error deleting content:', err);
    }
  };

  const handleEditContent = (contentType: string, contentId: string) => {
    // Navigate to appropriate edit page based on content type
    switch (contentType) {
      case 'stories':
        navigate(`/admin/edit-story/${contentId}`);
        break;
      case 'films':
        navigate(`/admin/edit-film/${contentId}`);
        break;
      case 'content':
        navigate(`/admin/edit-content/${contentId}`);
        break;
      case 'podcasts':
        navigate(`/admin/edit-podcast/${contentId}`);
        break;
      case 'animations':
        navigate(`/admin/edit-animation/${contentId}`);
        break;
      case 'sneak_peeks':
        navigate(`/admin/edit-sneak-peek/${contentId}`);
        break;
      default:
        alert('Edit functionality not available for this content type');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'stories': return <Edit className="h-4 w-4" />;
      case 'films': return <Eye className="h-4 w-4" />;
      case 'podcasts': return <MessageCircle className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const bulkActions = [
    commonBulkActions.delete,
    commonBulkActions.feature
  ];

  // Prepare export data
  const exportData = content.map(item => ({
    content_id: item.content_id,
    content_type: item.content_type,
    title: item.title,
    author: item.author,
    status: item.status,
    views: item.views,
    likes: item.likes,
    comments: item.comments,
    created_at: item.created_at
  }));

  if (loading && content.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Content...</h2>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="py-4 sm:py-6">
              <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Content Management</h1>
                  <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                    Manage all platform content ({totalCount.toLocaleString()} total items)
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <ExportButton 
                    data={exportData}
                    filename="livelens-content"
                    headers={['content_id', 'content_type', 'title', 'author', 'status', 'views', 'likes', 'comments', 'created_at']}
                  />
                </div>
              </div>
              {/* Mobile menu padding */}
              <div className="lg:hidden h-4"></div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        <BulkActionsBar
          selectedItems={selectedItems}
          totalItems={content.length}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onBulkAction={handleBulkAction}
          actions={bulkActions}
        />

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Search content..."
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filters.content_type}
                  onChange={(e) => handleFilterChange('content_type', e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="stories">Stories</option>
                  <option value="films">Films</option>
                  <option value="contents">Contents</option>
                  <option value="podcasts">Podcasts</option>
                  <option value="animations">Animations</option>
                  <option value="sneak_peeks">Sneak Peeks</option>
                  <option value="live_videos">Live Videos</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ content_type: '', status: '', search: '' })}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Mobile/Tablet View */}
          <div className="block 2xl:hidden">
            {content.map((item) => (
              <div key={item.content_id} className="border-b border-gray-200 p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.content_id)}
                      onChange={() => handleSelectItem(item.content_id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    />
                    <div className="flex items-center space-x-2">
                      {getContentTypeIcon(item.content_type)}
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {item.content_type}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEditContent(item.content_type, item.content_id)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                      title="Edit content"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50">
                      <Star className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteContent(item.content_type, item.content_id)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                      title="Delete content"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                <div className="mb-2">
                  <h3 className="font-medium text-gray-900 line-clamp-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">ID: {item.content_id}</p>
                </div>
                
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-1" />
                    <span className="truncate">{item.author}</span>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {item.views.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {item.likes.toLocaleString()}
                    </div>
                    <div className="flex items-center">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {item.comments.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden 2xl:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedItems.length === content.length && content.length > 0}
                      onChange={selectedItems.length === content.length ? handleClearSelection : handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Content
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Engagement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {content.map((item) => (
                  <tr key={item.content_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.content_id)}
                        onChange={() => handleSelectItem(item.content_id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getContentTypeIcon(item.content_type)}
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.content_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {item.content_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{item.author}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(item.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {item.views.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {item.likes.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {item.comments.toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(item.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleEditContent(item.content_type, item.content_id)}
                          className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                          title="Edit content"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50">
                          <Star className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteContent(item.content_type, item.content_id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {content.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {filters.search || filters.content_type || filters.status 
                  ? 'No content matches your filters' 
                  : 'No content found'
                }
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              showPageSizeSelector={true}
              showItemsInfo={true}
            />
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;
