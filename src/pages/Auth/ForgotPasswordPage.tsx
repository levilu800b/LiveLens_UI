// src/pages/Auth/ForgotPasswordPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Loader2, ArrowLeft, Check } from 'lucide-react';
import { uiActions } from '../../store/reducers/uiReducers';
import unifiedAuth from '../../utils/unifiedAuth';


const ForgotPasswordPage = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);
  setError('');

  try {
    // Make real API call to request password reset
    await unifiedAuth.requestPasswordReset(email);
    
    // Show success toast
    dispatch(uiActions.addNotification({
      message: 'Password reset instructions sent to your email!',
      type: 'success'
    }));
    
    setIsSubmitted(true);
    // Navigate to reset password page after a delay
    setTimeout(() => {
      navigate('/reset-password', { state: { email } });
    }, 2000);

  } catch (error: any) {
    console.error('Password reset request error:', error);
    setError(error.message || 'Failed to send reset email. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Header */}
          <div className="text-center">
            <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              _livelens
            </Link>
            
            <div className="mt-8 flex justify-center">
              <div className="bg-green-500/20 rounded-full p-3">
                <Check className="h-8 w-8 text-green-400" />
              </div>
            </div>
            
            <h2 className="mt-6 text-3xl font-bold text-white">
              Check your email
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              We've sent a password reset link to
            </p>
            <p className="text-purple-400 font-medium">
              {email}
            </p>
          </div>

          {/* Success Message */}
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-8">
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                If an account with that email exists, you'll receive a password reset link shortly.
              </p>
              <p className="text-sm text-gray-400">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm text-purple-400 hover:text-purple-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to sign in
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            _livelens
          </Link>
          
          <div className="mt-8 flex justify-center">
            <div className="bg-purple-500/20 rounded-full p-3">
              <Mail className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-white">
            Forgot your password?
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-white/20 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Send Reset Link'
              )}
            </button>

            {/* Back to Login */}
            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;