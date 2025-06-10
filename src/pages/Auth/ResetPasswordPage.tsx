// src/pages/Auth/ResetPasswordPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Loader2, ArrowLeft, Key } from 'lucide-react';
import { authAPI } from '../../services/auth';

const ResetPasswordPage = () => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [step, setStep] = useState(1); // 1: Code verification, 2: New password
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    if (error) setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleCodeVerification(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleCodeVerification = async (code: string) => {
  setIsLoading(true);
  setError('');

  try {
    // Make real API call to verify reset code
    await authAPI.verifyPasswordResetCode(email, code);
    setStep(2); // Move to password reset step
  } catch (error: any) {
    console.error('Code verification error:', error);
    setError(error.message || 'Invalid verification code. Please try again.');
    setVerificationCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  } finally {
    setIsLoading(false);
  }
};

  const handlePasswordChange = (field: 'newPassword' | 'confirmPassword', value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
    if (error) setError('');
  };

  const validatePasswords = () => {
    if (passwords.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validatePasswords()) return;

  setIsLoading(true);
  setError('');

  try {
    // Make real API call to reset password
    await authAPI.confirmPasswordReset(
      email,
      verificationCode.join(''),
      passwords.newPassword,
      passwords.confirmPassword
    );

    // Navigate to login with success message
    navigate('/login', { 
      state: { 
        message: 'Password reset successful! Please sign in with your new password.',
        email: email
      } 
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    setError(error.message || 'Failed to reset password. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setCanResend(false);
      setCountdown(60);
      setError('');

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setError('Failed to resend code. Please try again.');
    }
  };

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
              {step === 1 ? (
                <Key className="h-8 w-8 text-purple-400" />
              ) : (
                <Lock className="h-8 w-8 text-purple-400" />
              )}
            </div>
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-white">
            {step === 1 ? 'Enter verification code' : 'Create new password'}
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            {step === 1 
              ? `We've sent a 6-digit code to ${email}`
              : 'Your new password must be different from your previous password'
            }
          </p>
        </div>

        {/* Step 1: Code Verification */}
        {step === 1 && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-8">
            <div className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm text-center">{error}</p>
                </div>
              )}

              {/* Verification Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                  Enter the 6-digit code
                </label>
                <div className="flex justify-center space-x-3">
                  {verificationCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-xl font-bold border border-white/20 bg-slate-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {isLoading && (
                <div className="flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-400" />
                </div>
              )}

              {/* Resend Code */}
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-2">
                  Didn't receive the code?
                </p>
                <button
                  onClick={handleResendCode}
                  disabled={!canResend}
                  className={`text-sm font-medium ${
                    canResend 
                      ? 'text-purple-400 hover:text-purple-300 cursor-pointer' 
                      : 'text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {canResend ? 'Resend code' : `Resend in ${countdown}s`}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/forgot-password"
                  className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to forgot password
                </Link>
              </div>
            </div>

            {/* Demo Help */}
            <div className="text-center mt-4">
              <p className="text-xs text-gray-400">
                Enter "123456" for demo purposes
              </p>
            </div>
          </div>
        )}

        {/* Step 2: New Password */}
        {step === 2 && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-xl border border-white/10 p-8">
            <form onSubmit={handlePasswordReset} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* New Password Field */}
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.newPassword ? 'text' : 'password'}
                    required
                    value={passwords.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-white/20 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, newPassword: !prev.newPassword }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.newPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="appearance-none relative block w-full pl-10 pr-10 py-3 border border-white/20 bg-slate-700/50 text-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords(prev => ({ ...prev, confirmPassword: !prev.confirmPassword }))}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPasswords.confirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                    )}
                  </button>
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
                  'Reset Password'
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;