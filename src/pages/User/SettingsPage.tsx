// src/pages/User/SettingsPage.tsx
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Shield,
  Bell,
  Trash2,
  Key,
  User,
  Save,
  AlertTriangle
} from 'lucide-react';
import type { RootState } from '../../store';
import { userActions } from '../../store/reducers/userReducers';
import { uiActions } from '../../store/reducers/uiReducers';
import secureAuth from '../../utils/secureAuth';
import MainLayout from '../../components/MainLayout/MainLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const { theme } = useSelector((state: RootState) => state.ui);
  
  const [activeTab, setActiveTab] = useState('preferences');
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Password Change State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preferences State
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    autoPlayVideos: true,
    preferredVideoQuality: 'auto',
    darkMode: theme === 'dark'
  });
  
  // Delete Account State
  const [deletePassword, setDeletePassword] = useState('');
  
  const tabs = [
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: User },
  ];

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Passwords do not match'
      }));
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Password must be at least 8 characters long'
      }));
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/set-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          new_password: passwordData.newPassword,
          new_password_confirm: passwordData.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set password');
      }

      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Password set successfully! You can now log in with email and password.'
      }));
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: unknown) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to set password'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'New passwords do not match'
      }));
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 8) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'New password must be at least 8 characters long'
      }));
      return;
    }

    // Validate current password is not empty
    if (!passwordData.currentPassword) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Please enter your current password'
      }));
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/change-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          old_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
          new_password_confirm: passwordData.confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }

      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Password changed successfully'
      }));
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
    } catch (error: unknown) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to change password'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/preferences/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          email_notifications: preferences.emailNotifications,
          push_notifications: preferences.pushNotifications,
          auto_play_videos: preferences.autoPlayVideos,
          preferred_video_quality: preferences.preferredVideoQuality,
          dark_mode: preferences.darkMode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update preferences');
      }
      
      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Preferences updated successfully'
      }));
    } catch (error: unknown) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to update preferences'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const isGoogleUser = userInfo?.googleId;
    
    if (!isGoogleUser && !deletePassword) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: 'Please enter your password to confirm'
      }));
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/auth/delete-account/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          password: isGoogleUser ? '' : deletePassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Clear all auth data
      secureAuth.user.clearUser();
      await secureAuth.auth.logout();
      dispatch(userActions.resetUserInfo());
      
      dispatch(uiActions.addNotification({
        type: 'success',
        message: 'Account deleted successfully'
      }));
      
      navigate('/');
    } catch (error: unknown) {
      dispatch(uiActions.addNotification({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to delete account'
      }));
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderPreferences = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">App Preferences</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Dark Mode</label>
            <p className="text-sm text-gray-500">Use dark theme across the app</p>
          </div>
          <button
            onClick={() => setPreferences(prev => ({ ...prev, darkMode: !prev.darkMode }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.darkMode ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.darkMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Auto-play Videos</label>
            <p className="text-sm text-gray-500">Automatically play videos when viewing</p>
          </div>
          <button
            onClick={() => setPreferences(prev => ({ ...prev, autoPlayVideos: !prev.autoPlayVideos }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.autoPlayVideos ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.autoPlayVideos ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Video Quality
          </label>
          <select
            value={preferences.preferredVideoQuality}
            onChange={(e) => setPreferences(prev => ({ ...prev, preferredVideoQuality: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="auto">Auto</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="480p">480p</option>
            <option value="360p">360p</option>
          </select>
        </div>
      </div>

      <button
        onClick={handlePreferencesUpdate}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Preferences
      </button>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Notification Settings</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Email Notifications</label>
            <p className="text-sm text-gray-500">Receive notifications via email</p>
          </div>
          <button
            onClick={() => setPreferences(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.emailNotifications ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <label className="text-sm font-medium text-gray-700">Push Notifications</label>
            <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
          </div>
          <button
            onClick={() => setPreferences(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              preferences.pushNotifications ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                preferences.pushNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <button
        onClick={handlePreferencesUpdate}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
      >
        {isLoading ? (
          <LoadingSpinner size="sm" className="mr-2" />
        ) : (
          <Save className="h-4 w-4 mr-2" />
        )}
        Save Notifications
      </button>
    </div>
  );

  const renderSecurity = () => {
    const isGoogleUser = userInfo?.googleId;
    const hasPassword = !isGoogleUser; // Google users don't have passwords initially
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
        
        {isGoogleUser && !hasPassword && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-blue-600 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Google Account</h4>
                <p className="text-sm text-blue-700">
                  You signed in with Google. You can set a password to also log in with email/password.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {isGoogleUser && !hasPassword ? (
          // Google user - show set password form
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set Password (Optional)
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter new password"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm new password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Set Password
            </button>
          </form>
        ) : (
          // Regular user or Google user with password - show change password form
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
                minLength={8}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Key className="h-4 w-4 mr-2" />
              )}
              Change Password
            </button>
          </form>
        )}
      </div>
    );
  };

  const renderAccount = () => {
    const isGoogleUser = userInfo?.googleId;
    
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Account Management</h3>
        
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
            <div className="flex-1">
              <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-700 mt-1">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </button>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleDeleteAccount(); }} className="mt-4 space-y-3">
                  {!isGoogleUser && (
                    <div>
                      <label className="block text-sm font-medium text-red-800 mb-1">
                        Enter your password to confirm:
                      </label>
                      <input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                  )}
                  
                  {isGoogleUser && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">
                        You are about to delete your Google account. This action cannot be undone.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <Trash2 className="h-4 w-4 mr-2" />
                      )}
                      Permanently Delete Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeletePassword('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return renderPreferences();
      case 'notifications':
        return renderNotifications();
      case 'security':
        return renderSecurity();
      case 'account':
        return renderAccount();
      default:
        return renderPreferences();
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-gray-400 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-gray-600">
                  Manage your account preferences and privacy settings
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <nav className="space-y-2">
                {tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              <div className="bg-white shadow rounded-lg p-6">
                {renderTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SettingsPage;