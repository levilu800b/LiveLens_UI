// src/components/Admin/ActivityLog.tsx
import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  User, 
  Edit, 
  Trash2, 
  Shield, 
  Eye, 
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import moment from 'moment';

interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  target?: string;
  target_type?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'warning' | 'error';
  details?: Record<string, unknown>;
}

interface ActivityLogProps {
  entries: ActivityLogEntry[];
  loading?: boolean;
  onRefresh?: () => void;
  showPagination?: boolean;
  limit?: number;
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  entries,
  loading = false,
  onRefresh,
  showPagination = true,
  limit = 20
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState({
    action: '',
    user: '',
    status: ''
  });

  const getActionIcon = (action: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      create: Plus,
      edit: Edit,
      delete: Trash2,
      view: Eye,
      login: User,
      logout: User,
      admin: Shield,
      moderate: AlertTriangle,
      settings: Settings
    };

    const actionType = action.toLowerCase().split('_')[0];
    const Icon = iconMap[actionType] || Settings;
    return <Icon className="h-4 w-4" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const filteredEntries = entries.filter(entry => {
    const matchesAction = !filter.action || entry.action.toLowerCase().includes(filter.action.toLowerCase());
    const matchesUser = !filter.user || entry.user.toLowerCase().includes(filter.user.toLowerCase());
    const matchesStatus = !filter.status || entry.status === filter.status;
    return matchesAction && matchesUser && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEntries.length / limit);
  const startIndex = (currentPage - 1) * limit;
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + limit);

  const formatActionDescription = (entry: ActivityLogEntry) => {
    const { action, target, target_type } = entry;
    
    if (target && target_type) {
      return `${action.replace('_', ' ')} ${target_type}: ${target}`;
    }
    
    return action.replace('_', ' ');
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <h3 className="text-lg font-semibold text-gray-900">Activity Log</h3>
          
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Refresh
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Action
            </label>
            <input
              type="text"
              value={filter.action}
              onChange={(e) => setFilter(prev => ({ ...prev, action: e.target.value }))}
              placeholder="Filter by action..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              User
            </label>
            <input
              type="text"
              value={filter.user}
              onChange={(e) => setFilter(prev => ({ ...prev, user: e.target.value }))}
              placeholder="Filter by user..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.status}
              onChange={(e) => setFilter(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity List */}
      <div className="divide-y divide-gray-200">
        {paginatedEntries.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No activity logs found
          </div>
        ) : (
          paginatedEntries.map((entry) => (
            <div
              key={entry.id}
              className={`p-4 hover:bg-gray-50 transition-colors border-l-4 ${getStatusColor(entry.status)}`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 flex items-center space-x-2">
                  {getActionIcon(entry.action)}
                  {getStatusIcon(entry.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-semibold">{entry.user}</span>
                      {' '}
                      <span className="text-gray-600">
                        {formatActionDescription(entry)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 flex-shrink-0">
                      {moment(entry.timestamp).fromNow()}
                    </p>
                  </div>
                  
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="mt-2 text-xs text-gray-600">
                      <details className="cursor-pointer">
                        <summary className="hover:text-gray-800">View details</summary>
                        <div className="mt-2 p-2 bg-gray-100 rounded text-xs font-mono">
                          {JSON.stringify(entry.details, null, 2)}
                        </div>
                      </details>
                    </div>
                  )}
                  
                  {entry.ip_address && (
                    <p className="text-xs text-gray-500 mt-1">
                      IP: {entry.ip_address}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && (
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + limit, filteredEntries.length)} of{' '}
            {filteredEntries.length} entries
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLog;
