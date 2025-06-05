// src/pages/Auth/LoginPage.tsx
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Mail, Lock, LogIn, Chrome } from 'lucide-react';
import { userActions } from '../../store/reducers/userReducers';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data - replace with real API response
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: formData.email,
        isAdmin: formData.email === 'admin@livelens.com',
        isVerified: true,
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      dispatch(userActions.setUserInfo(mockUser));
      localStorage.setItem('account', JSON.stringify(mockUser));
      
      navigate(from, { replace: true });
    } catch {
      setErrors({ submit: 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Implement Google OAuth
    console.log('Google Sign In clicked');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            _livelens
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-white">Welcome back</h2>
          <p className="mt-2 text-gray-300">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm">
                {errors.submit}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.email ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-12 py-3 bg-slate-700/50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors ${
                    errors.password ? 'border-red-500' : 'border-white/20'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-purple-500/25 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign in
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800/50 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <Chrome className="h-5 w-5 mr-2" />
              Continue with Google
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;