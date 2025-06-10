// src/App.tsx
import { Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';

// Placeholder components for commented out routes
const ProfilePage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Profile Page - Coming Soon</h1></div>;
const LibraryPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Library Page - Coming Soon</h1></div>;
const FavoritesPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Favorites Page - Coming Soon</h1></div>;
const SettingsPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Settings Page - Coming Soon</h1></div>;
const StoryReaderPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Story Reader - Coming Soon</h1></div>;
const VideoPlayerPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Video Player - Coming Soon</h1></div>;

// Admin placeholder components
const AddStoryPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Add Story - Coming Soon</h1></div>;
const AddFilmPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Add Film - Coming Soon</h1></div>;
const AddContentPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Add Content - Coming Soon</h1></div>;
const AddPodcastPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Add Podcast - Coming Soon</h1></div>;
const AddAnimationPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Add Animation - Coming Soon</h1></div>;
const AddSneakPeekPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Add Sneak Peek - Coming Soon</h1></div>;
const CreateAIAnimationPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Create AI Animation - Coming Soon</h1></div>;
const CreateAIStoryPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>Create AI Story - Coming Soon</h1></div>;
const AllPostsPage = () => <div className="min-h-screen bg-gray-900 text-white p-8"><h1>All Posts - Coming Soon</h1></div>;

function App() {
  return (
    <div className="app min-h-screen bg-gray-900">
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
        
        {/* Protected User Routes */}
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
        <Route path="/admin/add-story" element={
          <AdminRoute>
            <AddStoryPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-film" element={
          <AdminRoute>
            <AddFilmPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-content" element={
          <AdminRoute>
            <AddContentPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-podcast" element={
          <AdminRoute>
            <AddPodcastPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-animation" element={
          <AdminRoute>
            <AddAnimationPage />
          </AdminRoute>
        } />
        <Route path="/admin/add-sneak-peek" element={
          <AdminRoute>
            <AddSneakPeekPage />
          </AdminRoute>
        } />
        <Route path="/admin/create-ai-animation" element={
          <AdminRoute>
            <CreateAIAnimationPage />
          </AdminRoute>
        } />
        <Route path="/admin/create-ai-story" element={
          <AdminRoute>
            <CreateAIStoryPage />
          </AdminRoute>
        } />
        <Route path="/admin/all-posts" element={
          <AdminRoute>
            <AllPostsPage />
          </AdminRoute>
        } />
        
        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-purple-500 mb-4">404</h1>
              <h2 className="text-2xl mb-4">Page Not Found</h2>
              <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
              <a 
                href="/" 
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;