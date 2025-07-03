// src/pages/User/ProfilePage.tsx - Fixed to use existing auth system with date handling fix
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User, Camera, Save, Edit3, X } from 'lucide-react';
import type { RootState } from '../../store';
import { userActions } from '../../store/reducers/userReducers';
import MainLayout from '../../components/MainLayout/MainLayout';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import { uiActions } from '../../store/reducers/uiReducers';
import unifiedAuth from '../../utils/unifiedAuth';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    gender: '',
    country: '',
    dateOfBirth: '',
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Initialize form data when userInfo changes
  useEffect(() => {
    if (userInfo) {
      // Convert backend gender values to frontend display values
      const displayGender = userInfo.gender === 'M' ? 'Male' : 
                           userInfo.gender === 'F' ? 'Female' : 
                           userInfo.gender || '';
      
      setFormData({
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        email: userInfo.email || '',
        phoneNumber: userInfo.phoneNumber || '',
        gender: displayGender,
        country: userInfo.country || '',
        dateOfBirth: userInfo.dateOfBirth || '',
      });
    }
  }, [userInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!userInfo) {
        throw new Error('User not found. Please login again.');
      }

      // Create FormData for file upload
      const formDataToSend = new FormData();
      
      // Send data with frontend field names - backend serializer handles conversion
      formDataToSend.append('firstName', formData.firstName.trim());
      formDataToSend.append('lastName', formData.lastName.trim());
      formDataToSend.append('phoneNumber', formData.phoneNumber.trim());
      formDataToSend.append('gender', formData.gender);
      formDataToSend.append('country', formData.country.trim());
      
      // ✅ CRITICAL FIX: Only send dateOfBirth if it has a valid value
      if (formData.dateOfBirth && formData.dateOfBirth.trim()) {
        formDataToSend.append('dateOfBirth', formData.dateOfBirth.trim());
      }

      if (avatarFile) {
        formDataToSend.append('avatar', avatarFile);
      }

      const responseData = await unifiedAuth.profile.updateProfile(formDataToSend);
      const updatedUser = responseData.user || responseData.updatedUser || responseData.data || null;
      
      if (updatedUser) {
        unifiedAuth.user.setUser(updatedUser);
        // Update Redux store
        dispatch(userActions.setUserInfo(updatedUser));
      }
      
      // Show success notification
      dispatch(uiActions.addNotification({
        type: 'success',
        message: responseData.message || 'Profile updated successfully!'
      }));
      
      // Reset form state
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
      
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      
      // If authentication error, redirect to login
      if (error.message.includes('authentication') || 
          error.message.includes('login') || 
          error.message.includes('session has expired') ||
          error.message.includes('expired')) {
        dispatch(uiActions.addNotification({
          type: 'error',
          message: 'Your session has expired. Please login again.'
        }));
        // Clear tokens and redirect to login
        unifiedAuth.clearTokens();
        unifiedAuth.user.clearUser();
        dispatch(userActions.clearUserInfo());
        navigate('/login');
      } else {
        // Provide better error messages for validation issues
        let errorMessage = error.message || 'Failed to update profile. Please try again.';
        
        // Handle specific validation errors
        if (error.message.includes('Date has wrong format')) {
          errorMessage = 'Please enter a valid date of birth or leave it empty.';
        } else if (error.message.includes('Validation errors')) {
          errorMessage = error.message; // Use the detailed validation message
        }
        
        dispatch(uiActions.addNotification({
          type: 'error',
          message: errorMessage
        }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    // Reset form data to current user info
    if (userInfo) {
      // Convert backend gender values to frontend display values
      const displayGender = userInfo.gender === 'M' ? 'Male' : 
                           userInfo.gender === 'F' ? 'Female' : 
                           userInfo.gender || '';
      
      setFormData({
        firstName: userInfo.firstName || '',
        lastName: userInfo.lastName || '',
        email: userInfo.email || '',
        phoneNumber: userInfo.phoneNumber || '',
        gender: displayGender,
        country: userInfo.country || '',
        dateOfBirth: userInfo.dateOfBirth || '',
      });
    }
    setAvatarFile(null);
    setAvatarPreview(null);
    setIsEditing(false);
  };

  if (!userInfo) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <button
                    onClick={cancelEdit}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                    {avatarPreview ? (
                      <img 
                        src={avatarPreview} 
                        alt="Avatar preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : userInfo.avatar ? (
                      <img 
                        src={userInfo.avatar} 
                        alt="Current avatar" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-purple-400 to-pink-400">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    )}
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-1 bg-white rounded-full shadow-lg cursor-pointer border-2 border-gray-200 hover:bg-gray-50 transition-colors">
                      <Camera className="h-4 w-4 text-gray-600" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {userInfo.firstName} {userInfo.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{userInfo.email}</p>
                  {userInfo.isAdmin && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                  {/* Google account indicator */}
                  {userInfo.email?.includes('@gmail.com') && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                      Google Account
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                  {/* Backend stores M/F, frontend displays Male/Female */}
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    placeholder="Enter your country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>

                {/* Date of Birth */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave empty if you prefer not to provide your date of birth
                  </p>
                </div>
              </div>

              {/* Save Button */}
              {isEditing && (
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;