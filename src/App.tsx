// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/Home/Homepage/HomePage';
import StoriesPage from './pages/Stories/StoriesPage';
import MediaPage from './pages/Media/MediaPage';
import FilmsPage from './pages/Media/FilmsPage';
import ContentsPage from './pages/Media/ContentsPage';
import PodcastsPage from './pages/Podcasts/PodcastsPage';
import AnimationsPage from './pages/Animations/AnimationsPage';
import SneakPeeksPage from './pages/SneakPeeks/SneakPeeksPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ContentManagement from './pages/Admin/ContentManagement';
import UserManagement from './pages/Admin/UserManagement';
import CommentManagement from './pages/Admin/CommentManagement';
import Analytics from './pages/Admin/Analytics';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import { useAuthInit } from './hooks/useAuthInit';
import ToastContainer from './components/Common/ToastContainer';

// Import the actual implemented user pages instead of placeholders
import ProfilePage from './pages/User/ProfilePage';
import LibraryPage from './pages/User/LibraryPage';
import FavoritesPage from './pages/User/FavoritesPage';
import SettingsPage from './pages/User/SettingsPage';

import StoryReaderPage from './pages/Stories/StoryReaderPage';
import VideoPlayerPage from './pages/Media/VideoPlayerPage';
import PodcastPlayerPage from './pages/Podcasts/PodcastPlayerPage';
import AnimationPlayerPage from './pages/Animations/AnimationPlayerPage';

// Import the implemented admin content creation pages
import AddStoryPage from './pages/Admin/AddStoryPage';
import EditStoryPage from './pages/Admin/EditStoryPage';
import AddFilmPage from './pages/Admin/AddFilmPage';
import EditFilmPage from './pages/Admin/EditFilmPage';
import AddContentPage from './pages/Admin/AddContentPage';
import EditContentPage from './pages/Admin/EditContentPage';
import AddPodcastPage from './pages/Admin/AddPodcastPage';
import EditPodcastPage from './pages/Admin/EditPodcastPage';
import AddAnimationPage from './pages/Admin/AddAnimationPage';
import EditAnimationPage from './pages/Admin/EditAnimationPage';
import AddSneakPeekPage from './pages/Admin/AddSneakPeekPage';
import EditSneakPeekPage from './pages/Admin/EditSneakPeekPage';
import AddLiveVideoPage from './pages/Admin/AddLiveVideoPage';

// Import sneak peek player page
import SneakPeekPlayerPage from './pages/SneakPeeks/SneakPeekPlayerPage';

// Placeholder components for admin pages not yet implemented

function App() {
  useAuthInit();

  useEffect(() => {  
  const originalClear = sessionStorage.clear;
  const originalRemove = sessionStorage.removeItem;
  
  sessionStorage.clear = function() {
    return originalClear.call(this);
  };
  
  sessionStorage.removeItem = function(key) {
    return originalRemove.call(this, key);
  };
  
  // Also monitor localStorage
  const originalLocalClear = localStorage.clear;
  const originalLocalRemove = localStorage.removeItem;
  
  localStorage.clear = function() {
    return originalLocalClear.call(this);
  };
  
  localStorage.removeItem = function(key) {
    return originalLocalRemove.call(this, key);
  };

  return () => {
    sessionStorage.clear = originalClear;
    sessionStorage.removeItem = originalRemove;
    localStorage.clear = originalLocalClear;
    localStorage.removeItem = originalLocalRemove;
  };
}, []);

  return (
    <div className="App">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        <Route path="/media" element={<MediaPage />} />
        <Route path="/media/films" element={<FilmsPage />} />
        <Route path="/media/contents" element={<ContentsPage />} />
        <Route path="/podcasts" element={<PodcastsPage />} />
        <Route path="/animations" element={<AnimationsPage />} />
        <Route path="/sneak-peeks" element={<SneakPeeksPage />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Content Routes */}
        <Route path="/story/:id" element={<StoryReaderPage />} />
        <Route path="/watch/:type/:id" element={<VideoPlayerPage />} />
        <Route path="/podcast/:id" element={<PodcastPlayerPage />} />
        <Route path="/animation/:id" element={<AnimationPlayerPage />} />
        <Route path="/sneak-peek/:slug" element={
          <ProtectedRoute>
            <SneakPeekPlayerPage />
          </ProtectedRoute>
        } />
        
        {/* Protected User Routes - These are now fully implemented! */}
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/library" element={
          <ProtectedRoute>
            <LibraryPage />
          </ProtectedRoute>
        } />
        <Route path="/favorites" element={
          <ProtectedRoute>
            <FavoritesPage />
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } />
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/dashboard" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/admin/content" element={
          <AdminRoute>
            <ContentManagement />
          </AdminRoute>
        } />
        <Route path="/admin/users" element={
          <AdminRoute>
            <UserManagement />
          </AdminRoute>
        } />
        <Route path="/admin/comments" element={
          <AdminRoute>
            <CommentManagement />
          </AdminRoute>
        } />
        <Route path="/admin/analytics" element={
          <AdminRoute>
            <Analytics />
          </AdminRoute>
        } />
        <Route path="/admin/add-story" element={
          <AdminRoute>
            <AddStoryPage />
          </AdminRoute>
        } />
        <Route path="/admin/edit-story/:id" element={
          <AdminRoute>
            <EditStoryPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-film" element={
          <AdminRoute>
            <AddFilmPage />
          </AdminRoute>
        } />
        <Route path="/admin/edit-film/:id" element={
          <AdminRoute>
            <EditFilmPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-content" element={
          <AdminRoute>
            <AddContentPage />
          </AdminRoute>
        } />
        <Route path="/admin/edit-content/:id" element={
          <AdminRoute>
            <EditContentPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-podcast" element={
          <AdminRoute>
            <AddPodcastPage />
          </AdminRoute>
        } />
        <Route path="/admin/edit-podcast/:id" element={
          <AdminRoute>
            <EditPodcastPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-animation" element={
          <AdminRoute>
            <AddAnimationPage />
          </AdminRoute>
        } />
        <Route path="/admin/edit-animation/:id" element={
          <AdminRoute>
            <EditAnimationPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-sneak-peek" element={
          <AdminRoute>
            <AddSneakPeekPage />
          </AdminRoute>
        } />
        <Route path="/admin/edit-sneak-peek/:slug" element={
          <AdminRoute>
            <EditSneakPeekPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-live-video" element={
          <AdminRoute>
            <AddLiveVideoPage />
          </AdminRoute>
        } />
        {/* Additional Admin Routes */}
      </Routes>
      <ToastContainer />
    </div>
  );
}

export default App;