// src/pages/Admin/UserManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  User, 
  Calendar,
  Trash2,
  Crown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  UserMinus
} from 'lucide-react';

import adminService from '../../services/adminService';
import type { User as UserType } from '../../services/adminService';
import AdminLayout from '../../components/Admin/AdminLayout';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  });
  const [totalCount, setTotalCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getUserManagement(filters);
      setUsers(data.users);
      setTotalCount(data.total_count);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleMakeAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to grant admin privileges to this user?')) return;

    setLoadingActions(prev => ({ ...prev, [userId]: 'making-admin' }));
    try {
      const response = await adminService.makeUserAdmin(userId);
      await fetchUsers(); // Refresh the list
      alert(response.message || 'User has been made an admin successfully!');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to make user admin. Please try again.';
      alert(errorMessage);
      console.error('Error making user admin:', err);
    } finally {
      setLoadingActions(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleRemoveAdmin = async (userId: string) => {
    if (!confirm('Are you sure you want to remove admin privileges from this user?')) return;

    setLoadingActions(prev => ({ ...prev, [userId]: 'removing-admin' }));
    try {
      const response = await adminService.removeUserAdmin(userId);
      await fetchUsers(); // Refresh the list
      alert(response.message || 'Admin privileges have been removed successfully!');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to remove admin privileges. Please try again.';
      alert(errorMessage);
      console.error('Error removing admin:', err);
    } finally {
      setLoadingActions(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

    setLoadingActions(prev => ({ ...prev, [userId]: 'deleting' }));
    try {
      const response = await adminService.deleteUser(userId);
      await fetchUsers(); // Refresh the list
      alert(response.message || 'User has been deleted successfully!');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to delete user. Please try again.';
      alert(errorMessage);
      console.error('Error deleting user:', err);
    } finally {
      setLoadingActions(prev => {
        const { [userId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const getStatusBadge = (user: UserType) => {
    if (!user.is_active) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Inactive
        </span>
      );
    }
    if (user.is_staff) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          Admin
        </span>
      );
    }
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Active
      </span>
    );
  };

  const getVerificationIcon = (isVerified: boolean) => {
    return isVerified ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-yellow-500" />
    );
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Users...</h2>
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
            <div className="py-6">
              <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-gray-600">Manage all platform users and their permissions</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
              <select
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">All Users</option>
                <option value="active">Active Users</option>
                <option value="inactive">Inactive Users</option>
                <option value="staff">Admin Users</option>
              </select>
            </div>

            {/* Results Count */}
            <div className="col-span-2 flex items-center justify-center md:justify-start">
              <span className="text-sm text-gray-600">
                {totalCount} users found
              </span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Verification
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                          {(user.first_name || user.last_name) && (
                            <div className="text-xs text-gray-400">
                              {user.first_name} {user.last_name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getVerificationIcon(user.is_verified)}
                        <span className="ml-2 text-sm text-gray-900">
                          {user.is_verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {user.last_login 
                          ? new Date(user.last_login).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {user.is_staff ? (
                          <button
                            onClick={() => handleRemoveAdmin(user.id)}
                            className="text-orange-600 hover:text-orange-900 flex items-center"
                            title="Remove Admin"
                          >
                            <UserMinus className="h-4 w-4 mr-1" />
                            Remove Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMakeAdmin(user.id)}
                            className="text-purple-600 hover:text-purple-900 flex items-center"
                            title="Make Admin"
                          >
                            <Crown className="h-4 w-4 mr-1" />
                            Make Admin
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 flex items-center"
                          title="Delete User"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-500">Try adjusting your filters or search terms.</p>
            </div>
          )}
        </div>

        {/* Loading overlay */}
        {loading && users.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-700">Updating users...</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
