// src/components/Header/Header.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Settings, 
  BookOpen, 
  Heart, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown,
  Film,
  FileText,
  LayoutDashboard
} from 'lucide-react';
import type { RootState } from '../../store';
import { userActions } from '../../store/reducers/userReducers';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMediaDropdownOpen, setIsMediaDropdownOpen] = useState(false);
  
  const { userInfo } = useSelector((state: RootState) => state.user) as {
    userInfo: {
      avatar?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      isAdmin?: boolean;
      // add other properties as needed
    } | null;
  };
  const isAuthenticated = !!userInfo;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Reordered navigation items - Media will be inserted between Stories and Podcasts
  const navItems = [
    { name: 'Stories', path: '/stories' },
    { name: 'Podcasts', path: '/podcasts' },
    { name: 'Animations', path: '/animations' },
    { name: 'Sneak Peeks', path: '/sneak-peeks' }
  ];

  const mediaItems = [
    { name: 'Films', path: '/media/films', icon: Film },
    { name: 'Contents', path: '/media/contents', icon: FileText }
  ];

  const profileMenuItems = [
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: BookOpen, label: 'My Library', path: '/library' },
    { icon: Heart, label: 'Favorites', path: '/favorites' },
    { icon: Settings, label: 'Settings', path: '/settings' }
  ];

  const adminMenuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' }
  ];

  const handleSignOut = () => {
    dispatch(userActions.resetUserInfo());
    localStorage.removeItem('account');
    navigate('/');
    setIsProfileDropdownOpen(false);
  };

  const handleMenuClick = () => {
    setIsProfileDropdownOpen(false);
    setIsMediaDropdownOpen(false);
  };

  const handleMediaClick = () => {
    navigate('/media');
    setIsMediaDropdownOpen(false);
  };

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              _livelens
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {/* Stories */}
              <Link
                to="/stories"
                className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105"
              >
                Stories
              </Link>
              
              {/* Media Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsMediaDropdownOpen(!isMediaDropdownOpen)}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105 flex items-center"
                >
                  Media
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isMediaDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {isMediaDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-md rounded-md shadow-lg border border-white/10 py-1 z-50">
                    {/* Media main link */}
                    <Link
                      to="/media"
                      onClick={() => setIsMediaDropdownOpen(false)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150 border-b border-white/10"
                    >
                      <FileText className="h-4 w-4 mr-3" />
                      All Media
                    </Link>
                    
                    {/* Media subcategories */}
                    {mediaItems.map((item) => (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setIsMediaDropdownOpen(false)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150"
                      >
                        <item.icon className="h-4 w-4 mr-3" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Rest of navigation items */}
              {navItems.slice(1).map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:scale-105"
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Auth Section */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-purple-500/25"
                >
                  Sign In
                </Link>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-800 rounded-full p-1 transition-all duration-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                      {userInfo?.avatar ? (
                        <img src={userInfo.avatar} alt="Profile" className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-slate-800/95 backdrop-blur-md rounded-md shadow-lg border border-white/10 py-1 z-50">
                      <div className="px-4 py-2 border-b border-white/10">
                        <p className="text-sm font-medium text-white">{userInfo?.firstName} {userInfo?.lastName}</p>
                        <p className="text-xs text-gray-400">{userInfo?.email}</p>
                      </div>
                      
                      {userInfo?.isAdmin && (
                        <>
                          {adminMenuItems.map((item) => (
                            <Link
                              key={item.label}
                              to={item.path}
                              onClick={handleMenuClick}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150"
                            >
                              <item.icon className="h-4 w-4 mr-3" />
                              {item.label}
                            </Link>
                          ))}
                          <div className="border-b border-white/10 my-1"></div>
                        </>
                      )}
                      
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={handleMenuClick}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150"
                        >
                          <item.icon className="h-4 w-4 mr-3" />
                          {item.label}
                        </Link>
                      ))}
                      
                      <div className="border-t border-white/10 mt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150"
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-slate-800/95 backdrop-blur-md border-t border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {/* Stories */}
            <Link
              to="/stories"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-white/10 transition-colors duration-150"
            >
              Stories
            </Link>
            
            {/* Mobile Media Menu */}
            <div className="px-3 py-2">
              <Link
                to="/media"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white block text-base font-medium mb-2 hover:bg-white/10 transition-colors duration-150 px-2 py-1 rounded"
              >
                Media
              </Link>
              <div className="ml-4 space-y-1">
                {mediaItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center text-gray-300 hover:text-white py-1 px-2 rounded text-sm hover:bg-white/10 transition-colors duration-150"
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Rest of navigation items */}
            {navItems.slice(1).map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-gray-300 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left hover:bg-white/10 transition-colors duration-150"
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile Auth Section */}
          <div className="pt-4 pb-3 border-t border-white/10">
            {!isAuthenticated ? (
              <div className="px-5">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-full font-medium transition-all duration-200 block text-center"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center px-5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center">
                    {userInfo?.avatar ? (
                      <img src={userInfo.avatar} alt="Profile" className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <User className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-white">{userInfo?.firstName} {userInfo?.lastName}</div>
                    <div className="text-sm font-medium text-gray-400">{userInfo?.email}</div>
                  </div>
                </div>
                
                <div className="mt-3 px-2 space-y-1">
                  {userInfo?.isAdmin && (
                    <>
                      {adminMenuItems.map((item) => (
                        <Link
                          key={item.label}
                          to={item.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150"
                        >
                          <item.icon className="h-5 w-5 mr-3" />
                          {item.label}
                        </Link>
                      ))}
                      <div className="border-b border-white/10 my-2"></div>
                    </>
                  )}
                  
                  {profileMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150"
                    >
                      <item.icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors duration-150"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Click outside handlers */}
      {(isProfileDropdownOpen || isMediaDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsProfileDropdownOpen(false);
            setIsMediaDropdownOpen(false);
          }}
        />
      )}
    </nav>
  );
};

export default Header;