// src/pages/Admin/CommentManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { uiActions } from '../../store/reducers/uiReducers';
import { 
  Search, 
  Eye, 
  MessageCircle, 
  User,
  Trash2,
  AlertTriangle,
  Flag,
  Shield,
  CheckCircle,
  XCircle,
  TrendingUp,
  Heart
} from 'lucide-react';

import AdminLayout from '../../components/Admin/AdminLayout';
import BulkActionsBar from '../../components/Admin/BulkActionsBar';
import ExportButton from '../../components/Admin/ExportButton';
import Pagination from '../../components/Common/Pagination';
import InputModal from '../../components/Common/InputModal';
import commentService, { type ModerationComment, type CommentModerationStats } from '../../services/commentService';

const CommentManagement: React.FC = () => {
  const dispatch = useDispatch();
  const [comments, setComments] = useState<ModerationComment[]>([]);
  const [stats, setStats] = useState<CommentModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    status: 'all',
    flagged: false,
    content_type: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Modal states for confirmation dialogs
  const [autoModerateModal, setAutoModerateModal] = useState(false);
  const [hideCommentModal, setHideCommentModal] = useState<string | null>(null);
  const [flagCommentModal, setFlagCommentModal] = useState<string | null>(null);
  const [softDeleteModal, setSoftDeleteModal] = useState<string | null>(null);
  const [hardDeleteModal, setHardDeleteModal] = useState<string | null>(null);
  const [hardDeleteReason, setHardDeleteReason] = useState('');
  
  // Bulk action modal states
  const [bulkActionModal, setBulkActionModal] = useState<{
    action: string;
    commentIds: string[];
    reason?: string;
  } | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await commentService.getModerationComments({
        status: filters.status !== 'all' ? filters.status : undefined,
        flagged: filters.flagged || undefined,
        content_type: filters.content_type || undefined,
        search: filters.search || undefined,
        page: currentPage,
        page_size: itemsPerPage,
      });
      
      setComments(data.results || []);
      setTotalCount(data.count || 0);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
    } catch (err) {
      setError('Failed to load comments. Please try again.');
      console.error('Error fetching comments:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, itemsPerPage]);

  const fetchStats = useCallback(async () => {
    try {
      const data = await commentService.getModerationStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [fetchComments, fetchStats]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (pageSize: number) => {
    setItemsPerPage(pageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleBulkAction = async (action: string, commentIds?: string[]) => {
    const idsToProcess = commentIds || selectedComments;
    
    if (idsToProcess.length === 0) {
      dispatch(uiActions.addNotification({
        message: 'Please select comments to moderate',
        type: 'warning'
      }));
      return;
    }

    // For actions that require a reason, show the modal
    if (action === 'delete' || action === 'hide') {
      setBulkActionModal({
        action,
        commentIds: idsToProcess
      });
      dispatch(uiActions.openModal('bulk-action-reason'));
      return;
    }

    // For other actions, proceed directly
    try {
      const result = await commentService.bulkModerateComments({
        comment_ids: idsToProcess,
        action: action as 'approve' | 'hide' | 'delete' | 'flag' | 'unflag'
      });

      dispatch(uiActions.addNotification({
        message: result.message,
        type: 'success'
      }));
      
      setSelectedComments([]);
      fetchComments();
      fetchStats();
    } catch (err) {
      console.error(`Error ${action}ing comments:`, err);
      dispatch(uiActions.addNotification({
        message: `Failed to ${action} comments. Please try again.`,
        type: 'error'
      }));
    }
  };

  const handleAutoModerate = async () => {
    setAutoModerateModal(true);
  };

  const confirmAutoModerate = async () => {
    try {
      const result = await commentService.autoModerateComments();
      dispatch(uiActions.addNotification({
        message: result.message,
        type: 'success'
      }));
      fetchComments();
      fetchStats();
      setAutoModerateModal(false);
    } catch (err) {
      console.error('Error auto-moderating:', err);
      dispatch(uiActions.addNotification({
        message: 'Failed to auto-moderate comments. Please try again.',
        type: 'error'
      }));
      setAutoModerateModal(false);
    }
  };

  const handleIndividualAction = async (commentId: string, action: string) => {
    // Use modals for destructive actions
    if (action === 'hide') {
      setHideCommentModal(commentId);
      return;
    }
    if (action === 'flag') {
      setFlagCommentModal(commentId);
      return;
    }
    if (action === 'delete') {
      setSoftDeleteModal(commentId);
      return;
    }
    
    // For non-destructive actions, proceed directly
    await handleBulkAction(action, [commentId]);
  };

  const confirmHideComment = async () => {
    if (!hideCommentModal) return;
    
    try {
      await handleBulkAction('hide', [hideCommentModal]);
      setHideCommentModal(null);
    } catch (err) {
      console.error('Error hiding comment:', err);
      setHideCommentModal(null);
    }
  };

  const confirmFlagComment = async () => {
    if (!flagCommentModal) return;
    
    try {
      await handleBulkAction('flag', [flagCommentModal]);
      setFlagCommentModal(null);
    } catch (err) {
      console.error('Error flagging comment:', err);
      setFlagCommentModal(null);
    }
  };

  const confirmSoftDelete = async () => {
    if (!softDeleteModal) return;
    
    try {
      await handleBulkAction('delete', [softDeleteModal]);
      setSoftDeleteModal(null);
    } catch (err) {
      console.error('Error soft deleting comment:', err);
      setSoftDeleteModal(null);
    }
  };

  const handleHardDelete = async (commentId: string) => {
    setHardDeleteModal(commentId);
    setHardDeleteReason('');
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteModal || !hardDeleteReason.trim()) return;

    try {
      const result = await commentService.hardDeleteComment(hardDeleteModal, hardDeleteReason.trim());
      dispatch(uiActions.addNotification({
        message: result.message,
        type: 'success'
      }));
      fetchComments();
      fetchStats();
      setHardDeleteModal(null);
      setHardDeleteReason('');
    } catch (err) {
      console.error('Error permanently deleting comment:', err);
      dispatch(uiActions.addNotification({
        message: 'Failed to permanently delete comment. Please try again.',
        type: 'error'
      }));
      setHardDeleteModal(null);
      setHardDeleteReason('');
    }
  };

  const confirmBulkAction = async (reason: string) => {
    if (!bulkActionModal) return;

    try {
      const result = await commentService.bulkModerateComments({
        comment_ids: bulkActionModal.commentIds,
        action: bulkActionModal.action as 'approve' | 'hide' | 'delete' | 'flag' | 'unflag',
        reason: reason || undefined
      });

      dispatch(uiActions.addNotification({
        message: result.message,
        type: 'success'
      }));
      
      setSelectedComments([]);
      fetchComments();
      fetchStats();
      setBulkActionModal(null);
      dispatch(uiActions.closeModal('bulk-action-reason'));
    } catch (err) {
      console.error(`Error ${bulkActionModal.action}ing comments:`, err);
      dispatch(uiActions.addNotification({
        message: `Failed to ${bulkActionModal.action} comments. Please try again.`,
        type: 'error'
      }));
      setBulkActionModal(null);
      dispatch(uiActions.closeModal('bulk-action-reason'));
    }
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return 'text-red-600';
    if (score >= 60) return 'text-orange-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusBadge = (status: string, isFlagged: boolean) => {
    if (isFlagged) {
      return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Flagged</span>;
    }
    
    const statusColors = {
      published: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      hidden: 'bg-gray-100 text-gray-800',
      deleted: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const bulkActions = [
    { id: 'approve', label: 'Approve', icon: CheckCircle, color: 'green' },
    { id: 'hide', label: 'Hide', icon: Eye, color: 'yellow' },
    { id: 'delete', label: 'Delete', icon: Trash2, color: 'red', destructive: true },
    { id: 'flag', label: 'Flag', icon: Flag, color: 'red' },
    { id: 'unflag', label: 'Unflag', icon: Shield, color: 'blue' }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Comment Management</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-500">
              Moderate and manage user comments across all content
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <button
              onClick={handleAutoModerate}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Shield className="h-4 w-4 mr-2" />
              Auto Moderate
            </button>
            <div className="inline-block">
              <ExportButton 
                data={comments.map(comment => ({
                  id: comment.id,
                  username: comment.user.username,
                  text: comment.text,
                  status: comment.status,
                  risk_score: comment.risk_score,
                  report_count: comment.report_count,
                  content_title: comment.content_title,
                  created_at: comment.created_at,
                  is_flagged: comment.is_flagged
                }))}
                filename="comments"
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center">
                <MessageCircle className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Total Comments</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total_comments.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center">
                <Flag className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Flagged</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.flagged_comments.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Pending Review</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.pending_comments.toLocaleString()}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
              <div className="flex items-center">
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Actions Today</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.moderation_actions_today.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="mt-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Search comments..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange({ status: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="published">Published</option>
                <option value="pending">Pending</option>
                <option value="hidden">Hidden</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
              <select
                value={filters.content_type}
                onChange={(e) => handleFilterChange({ content_type: e.target.value })}
                className="mt-1 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
              >
                <option value="">All Types</option>
                <option value="story">Stories</option>
                <option value="content">Films</option>
                <option value="podcast">Podcasts</option>
                <option value="animation">Animations</option>
                <option value="sneakpeek">Sneak Peeks</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="w-full">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.flagged}
                    onChange={(e) => handleFilterChange({ flagged: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Flagged only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedComments.length > 0 && (
          <BulkActionsBar
            selectedItems={selectedComments}
            totalItems={comments.length}
            actions={bulkActions}
            onBulkAction={handleBulkAction}
            onSelectAll={() => setSelectedComments(comments.map(c => c.id))}
            onClearSelection={() => setSelectedComments([])}
          />
        )}

        {/* Comments Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <p className="mt-2 text-gray-500">Loading comments...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
              <p className="mt-2 text-red-600">{error}</p>
              <button
                onClick={fetchComments}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-gray-500">No comments found</p>
            </div>
          ) : (
            <>
              {/* Mobile/Tablet Card View */}
              <div className="block 2xl:hidden">
                <div className="divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <div key={comment.id} className={`p-4 ${comment.is_flagged ? 'bg-red-50' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedComments.includes(comment.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedComments([...selectedComments, comment.id]);
                              } else {
                                setSelectedComments(selectedComments.filter(id => id !== comment.id));
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <div className="flex items-center">
                            {comment.user.avatar_url ? (
                              <img 
                                src={comment.user.avatar_url} 
                                alt={comment.user.username}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                            <div className="ml-2">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.user.username}
                                {comment.user.is_admin && (
                                  <span className="ml-1 text-xs text-blue-600">Admin</span>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(comment.status, comment.is_flagged)}
                          <span className={`text-xs font-medium ${getRiskScoreColor(comment.risk_score)}`}>
                            {comment.risk_score}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-gray-900 mb-2">
                          {comment.text.length > 150 ? `${comment.text.substring(0, 150)}...` : comment.text}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Heart className="h-3 w-3 mr-1" />
                              {comment.like_count}
                            </span>
                            <span className="flex items-center">
                              <MessageCircle className="h-3 w-3 mr-1" />
                              {comment.reply_count}
                            </span>
                            <span className="flex items-center">
                              <Flag className="h-3 w-3 mr-1" />
                              {comment.report_count}
                            </span>
                            {comment.is_edited && (
                              <span className="text-yellow-600">Edited</span>
                            )}
                          </div>
                          <span>{comment.time_since} ago</span>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 truncate">
                          Content: {comment.content_title}
                        </p>
                        {comment.moderated_by && (
                          <p className="text-xs text-gray-400">
                            Moderated by {comment.moderated_by.username}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {comment.status === 'pending' && (
                          <button
                            onClick={() => handleIndividualAction(comment.id, 'approve')}
                            className="flex items-center px-3 py-1 text-xs bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                            title="Approve"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </button>
                        )}
                        {comment.status === 'published' && (
                          <button
                            onClick={() => handleIndividualAction(comment.id, 'hide')}
                            className="flex items-center px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                            title="Hide"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Hide
                          </button>
                        )}
                        {!comment.is_flagged ? (
                          <button
                            onClick={() => handleIndividualAction(comment.id, 'flag')}
                            className="flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                            title="Flag"
                          >
                            <Flag className="h-3 w-3 mr-1" />
                            Flag
                          </button>
                        ) : (
                          <button
                            onClick={() => handleIndividualAction(comment.id, 'unflag')}
                            className="flex items-center px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                            title="Unflag"
                          >
                            <Shield className="h-3 w-3 mr-1" />
                            Unflag
                          </button>
                        )}
                        <button
                          onClick={() => handleIndividualAction(comment.id, 'delete')}
                          className="flex items-center px-3 py-1 text-xs bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                          title="Soft Delete"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </button>
                        <button
                          onClick={() => handleHardDelete(comment.id)}
                          className="flex items-center px-3 py-1 text-xs bg-red-200 text-red-800 rounded-md hover:bg-red-300"
                          title="Permanently Delete"
                        >
                          <XCircle className="h-3 w-3 mr-1" />
                          Permanent
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden 2xl:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={selectedComments.length === comments.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedComments(comments.map(c => c.id));
                            } else {
                              setSelectedComments([]);
                            }
                          }}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Comment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Author
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Content
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Reports
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
                    {comments.map((comment) => (
                      <tr key={comment.id} className={comment.is_flagged ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedComments.includes(comment.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedComments([...selectedComments, comment.id]);
                              } else {
                                setSelectedComments(selectedComments.filter(id => id !== comment.id));
                              }
                            }}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 truncate" title={comment.text}>
                              {comment.text.length > 100 ? `${comment.text.substring(0, 100)}...` : comment.text}
                            </p>
                            <div className="flex items-center mt-1 space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Heart className="h-3 w-3 mr-1" />
                                {comment.like_count}
                              </span>
                              <span className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                {comment.reply_count}
                              </span>
                              {comment.is_edited && (
                                <span className="text-yellow-600">Edited</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {comment.user.avatar_url ? (
                              <img 
                                src={comment.user.avatar_url} 
                                alt={comment.user.username}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-600" />
                              </div>
                            )}
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {comment.user.username}
                                {comment.user.is_admin && (
                                  <span className="ml-1 text-xs text-blue-600">Admin</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">
                                {comment.user.first_name} {comment.user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="max-w-xs">
                            <p className="text-sm text-gray-900 truncate" title={comment.content_title}>
                              {comment.content_title}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(comment.status, comment.is_flagged)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`text-sm font-medium ${getRiskScoreColor(comment.risk_score)}`}>
                            {comment.risk_score}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {comment.report_count}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <p>{comment.time_since} ago</p>
                            {comment.moderated_by && (
                              <p className="text-xs text-gray-400">
                                Moderated by {comment.moderated_by.username}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {comment.status === 'pending' && (
                              <button
                                onClick={() => handleIndividualAction(comment.id, 'approve')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                            )}
                            {comment.status === 'published' && (
                              <button
                                onClick={() => handleIndividualAction(comment.id, 'hide')}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Hide"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                            )}
                            {!comment.is_flagged ? (
                              <button
                                onClick={() => handleIndividualAction(comment.id, 'flag')}
                                className="text-red-600 hover:text-red-900"
                                title="Flag"
                              >
                                <Flag className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleIndividualAction(comment.id, 'unflag')}
                                className="text-blue-600 hover:text-blue-900"
                                title="Unflag"
                              >
                                <Shield className="h-4 w-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleIndividualAction(comment.id, 'delete')}
                              className="text-red-600 hover:text-red-900"
                              title="Soft Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleHardDelete(comment.id)}
                              className="text-red-800 hover:text-red-900"
                              title="Permanently Delete"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

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

      {/* Auto Moderate Modal */}
      {autoModerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Auto-Moderate Comments</h3>
            <p className="text-gray-600 mb-6">
              This will automatically flag potentially problematic comments based on our moderation algorithms. Do you want to continue?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmAutoModerate}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Auto-Moderate
              </button>
              <button
                onClick={() => setAutoModerateModal(false)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Comment Modal */}
      {hideCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Hide Comment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to hide this comment? It will no longer be visible to users, but can be restored later.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmHideComment}
                className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Hide Comment
              </button>
              <button
                onClick={() => setHideCommentModal(null)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Comment Modal */}
      {flagCommentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Flag Comment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to flag this comment as problematic? This will mark it for further review and potential action.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmFlagComment}
                className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Flag Comment
              </button>
              <button
                onClick={() => setFlagCommentModal(null)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Soft Delete Modal */}
      {softDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Delete Comment</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this comment? This will soft delete the comment, which can be restored if needed.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={confirmSoftDelete}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Comment
              </button>
              <button
                onClick={() => setSoftDeleteModal(null)}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hard Delete Modal */}
      {hardDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Permanently Delete Comment</h3>
            <p className="text-gray-600 mb-4">
              This will PERMANENTLY delete the comment. This action cannot be undone and will completely remove the comment from the database.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for permanent deletion (required):
              </label>
              <textarea
                value={hardDeleteReason}
                onChange={(e) => setHardDeleteReason(e.target.value)}
                placeholder="Enter the reason for permanent deletion..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                required
              />
            </div>
            <div className="flex space-x-4">
              <button
                onClick={confirmHardDelete}
                disabled={!hardDeleteReason.trim()}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Permanently Delete
              </button>
              <button
                onClick={() => {
                  setHardDeleteModal(null);
                  setHardDeleteReason('');
                }}
                className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Action Modal (for actions requiring reason) */}
      {bulkActionModal && (
        <InputModal
          modalId="bulk-action-reason"
          title={`${bulkActionModal.action.charAt(0).toUpperCase() + bulkActionModal.action.slice(1)} Comments`}
          message={`Enter reason for ${bulkActionModal.action}ing ${bulkActionModal.commentIds.length} comment(s):`}
          placeholder={`Reason for ${bulkActionModal.action}...`}
          confirmText={bulkActionModal.action.charAt(0).toUpperCase() + bulkActionModal.action.slice(1)}
          isRequired={true}
          inputType="textarea"
          onConfirm={confirmBulkAction}
          onCancel={() => {
            setBulkActionModal(null);
            dispatch(uiActions.closeModal('bulk-action-reason'));
          }}
        />
      )}
    </AdminLayout>
  );
};

export default CommentManagement;
