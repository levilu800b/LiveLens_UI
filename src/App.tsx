import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/Home/Homepage/HomePage';
import StoriesPage from './pages/Stories/StoriesPage';
// import MediaPage from './pages/Media/MediaPage';
// import FilmsPage from './pages/Media/FilmsPage';
// import ContentsPage from './pages/Media/ContentsPage';
// import PodcastsPage from './pages/Podcasts/PodcastsPage';
// import AnimationsPage from './pages/Animations/AnimationsPage';
// import SneakPeeksPage from './pages/SneakPeeks/SneakPeeksPage';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import VerifyEmailPage from './pages/Auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
// import ProfilePage from './pages/User/ProfilePage';
// import LibraryPage from './pages/User/LibraryPage';
// import FavoritesPage from './pages/User/FavoritesPage';
// import SettingsPage from './pages/User/SettingsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
// import AddStoryPage from './pages/Admin/AddStoryPage';
// import AddFilmPage from './pages/Admin/AddFilmPage';
// import AddContentPage from './pages/Admin/AddContentPage';
// import AddPodcastPage from './pages/Admin/AddPodcastPage';
// import AddAnimationPage from './pages/Admin/AddAnimationPage';
// import AddSneakPeekPage from './pages/Admin/AddSneakPeekPage';
// import CreateAIAnimationPage from './pages/Admin/CreateAIAnimationPage';
// import CreateAIStoryPage from './pages/Admin/CreateAIStoryPage';
// import AllPostsPage from './pages/Admin/AllPostsPage';
// import StoryReaderPage from './pages/Content/StoryReaderPage';
// import VideoPlayerPage from './pages/Content/VideoPlayerPage';
// import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';

function App() {
  return (
    <div className="app">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/stories" element={<StoriesPage />} />
        {/* <Route path="/media" element={<MediaPage />} /> */}
        {/* <Route path="/media/films" element={<FilmsPage />} /> */}
        {/* <Route path="/media/contents" element={<ContentsPage />} /> */}
        {/* <Route path="/podcasts" element={<PodcastsPage />} /> */}
        {/* <Route path="/animations" element={<AnimationsPage />} /> */}
        {/* <Route path="/sneak-peeks" element={<SneakPeeksPage />} /> */}
        
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        
        {/* Content Routes */}
        {/* <Route path="/story/:id" element={<StoryReaderPage />} /> */}
        {/* <Route path="/watch/:type/:id" element={<VideoPlayerPage />} /> */}
        
        {/* Protected User Routes */}
        {/* <Route path="/profile" element={
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
        } /> */}
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        {/* <Route path="/admin/add-story" element={
          <AdminRoute>
            <AddStoryPage />
          </AdminRoute>
        } /> */}
        {/* <Route path="/admin/add-film" element={
          <AdminRoute>
            <AddFilmPage />
          </AdminRoute>
        } /> */}
        {/* <Route path="/admin/add-content" element={
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
        } /> */}
      </Routes>
    </div>
  );
}

export default App;