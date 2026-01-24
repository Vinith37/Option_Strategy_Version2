import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    const success = await login(email, password);

    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 transition-all duration-300">
          {/* Logo and Title */}
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 transition-transform duration-300 hover:scale-105">
              <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-sm sm:text-base text-gray-600 text-center px-4">
              Sign in to continue to Options Strategy Builder
            </p>
          </div>

          {/* Error Message */}
          {errors.general && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            <div>
              <Label htmlFor="email" className="text-sm text-gray-700 mb-2 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`transition-all duration-200 ${errors.email ? 'border-red-300' : ''}`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.email}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="text-sm text-gray-700 mb-2 block">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`transition-all duration-200 ${errors.password ? 'border-red-300' : ''}`}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1 animate-in fade-in slide-in-from-top-1 duration-200">{errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 active:scale-95"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 active:scale-98 h-11 sm:h-12 text-base"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 sm:my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Create Account */}
          <Button
            variant="outline"
            onClick={() => navigate('/signup')}
            className="w-full transition-all duration-200 active:scale-98 h-11 sm:h-12"
          >
            Create New Account
          </Button>
        </div>

        {/* Demo Credentials */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100 transition-all duration-300 hover:shadow-md">
          <p className="text-xs text-blue-800 mb-2 font-medium">Demo Credentials:</p>
          <p className="text-xs text-blue-700">Email: demo@example.com</p>
          <p className="text-xs text-blue-700">Password: demo123</p>
          <p className="text-xs text-blue-600 mt-2 italic">
            Or create a new account to get started
          </p>
        </div>
      </div>
    </div>
  );
}