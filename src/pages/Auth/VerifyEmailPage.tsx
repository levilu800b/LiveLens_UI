// src/pages/Auth/VerifyEmailPage.tsx
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { userActions } from '../../store/reducers/userReducers';
import { uiActions } from '../../store/reducers/uiReducers';
import { authAPI } from '../../services/api';

const VerifyEmailPage = () => {
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      navigate('/signup');
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

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Clear error when user starts typing
    if (error) setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleVerification(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newCode = pastedData.split('');
      setVerificationCode(newCode);
      handleVerification(pastedData);
    }
  };

  const handleVerification = async (code: string) => {
  setIsLoading(true);
  setError('');

  try {
    // Make real API call to verify the code
    const response = await authAPI.verifyEmail(email, code);
    
    // Success - create user data and navigate
    const userData = {
      id: response.user_id || '1',
      firstName: response.first_name || 'User',
      lastName: response.last_name || '',
      email: email,
      isEmailVerified: true, // ✅ Fixed property name
      isAdmin: response.is_admin ?? false,
      createdAt: response.created_at ?? new Date().toISOString(),
      updatedAt: response.updated_at ?? new Date().toISOString(), // ✅ Added missing field
    };

    dispatch(userActions.setUserInfo(userData));
    localStorage.setItem('account', JSON.stringify(userData));
    
    // Show success toast
    dispatch(uiActions.addNotification({
      message: 'Email verified successfully! You can now log in.',
      type: 'success'
    }));
    
    // Navigate to login page with success message
    navigate('/login', {
      state: {
        message: 'Email verified successfully! Please log in.',
        email: email
      }
    });

  } catch (error) {
    console.error('Verification error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Invalid verification code. Please try again.';
    setError(errorMessage);
    setVerificationCode(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
  } finally {
    setIsLoading(false);
  }
};

  const handleResendCode = async () => {
    if (!canResend) return;

    try {
      setIsLoading(true);
      
      // Call the actual resend API
      await authAPI.resendVerificationCode(email);

      setCanResend(false);
      setCountdown(60);
      setError('');

      // Show success message
      dispatch(uiActions.addNotification({
        message: 'Verification code resent successfully!',
        type: 'success'
      }));

      // Restart countdown
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

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification code';
      setError(errorMessage);
      
      dispatch(uiActions.addNotification({
        message: errorMessage,
        type: 'error'
      }));
    } finally {
      setIsLoading(false);
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
              <Mail className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-white">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            We've sent a 6-digit verification code to
          </p>
          <p className="text-purple-400 font-medium">
            {email}
          </p>
        </div>

        {/* Form */}
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
                Enter verification code
              </label>
              <div className="flex justify-center space-x-3">
                {verificationCode.map((digit, index) => (
                  <input
                    key={index}
                    ref={el => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold border border-white/20 bg-slate-700/50 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                    disabled={isLoading}
                  />
                ))}
              </div>
            </div>

            {/* Loading State */}
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

            {/* Back to Signup */}
            <div className="text-center">
              <Link
                to="/signup"
                className="inline-flex items-center text-sm text-gray-400 hover:text-gray-300"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to signup
              </Link>
            </div>
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Enter the code "123456" for demo purposes
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;