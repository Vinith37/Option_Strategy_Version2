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

    if (!validateForm()) return;

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      navigate('/dashboard');
    } else {
      setErrors({ general: 'Invalid email or password' });
    }
  };

  // 🔥 Social Providers
  const providers = [
    {
      name: "Google",
      url: "https://api.optionsstrategies.in/auth/google",
      bg: "bg-black hover:bg-gray-900",
      text: "text-gray-800",
    },
    {
      name: "Microsoft",
      url: "https://api.optionsstrategies.in/auth/microsoft",
      bg: "bg-blue-600 hover:bg-blue-700",
      text: "text-white",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">

          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 text-center">
              Sign in to continue to Options Strategy Builder
            </p>
          </div>

          {/* Error */}
          {errors.general && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <p className="text-sm text-red-800">{errors.general}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? 'border-red-300' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <Label>Password</Label>
              <Input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? 'border-red-300' : ''}
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 h-12"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* OR Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-500">OR WITH</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* 🔥 Social Buttons */}
          <div className="space-y-3">
            {providers.map((provider) => (
              <button
                key={provider.name}
                onClick={() => (window.location.href = provider.url)}
                className={`w-full py-3 rounded-lg font-medium transition ${provider.bg} ${provider.text}`}
              >
                Continue with {provider.name}
              </button>
            ))}
          </div>

          {/* Register */}
          <div className="mt-6 text-center text-sm">
            Don’t have account?{" "}
            <span
              onClick={() => navigate('/signup')}
              className="text-blue-600 cursor-pointer font-medium"
            >
              Register
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
