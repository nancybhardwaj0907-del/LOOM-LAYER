import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  Sparkles, 
  Leaf, 
  AlertCircle,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }) {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail, signUpWithEmail, loginWithDemo } = useAuth();
  
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const res = await signUpWithEmail(email, password, name);
        if (!res.success) {
          setError(res.error || 'Failed to create account.');
          setLoading(false);
          return;
        }
      } else {
        const res = await signInWithEmail(email, password);
        if (!res.success) {
          setError(res.error || 'Invalid email or password.');
          setLoading(false);
          return;
        }
      }

      onClose();
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.success) {
        onClose();
        navigate('/dashboard');
      } else {
        setError(res.error || 'Google sign-in could not be completed.');
      }
    } catch (err) {
      setError(err.message || 'Google sign-in error.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    loginWithDemo('Nancy Bhardwaj', 'nancy@atelier.com');
    onClose();
    navigate('/dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#EAE2DE] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Atelier Header */}
        <div className="bg-[#783751] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#F3E6E4]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg leading-tight">Loom & Layer</h3>
              <p className="text-[11px] text-[#F3E6E4]">Atelier Nesting & Sustainable Cutting</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          
          {/* Tabs */}
          <div className="flex rounded-xl bg-[#FBF7F5] border border-[#EAE2DE] p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-white text-[#783751] shadow-2xs' 
                  : 'text-[#81777B] hover:text-[#39343A]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-white text-[#783751] shadow-2xs' 
                  : 'text-[#81777B] hover:text-[#39343A]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Google Sign-in */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl border border-[#EAE2DE] bg-white hover:bg-[#FBF7F5] text-xs font-semibold text-[#39343A] flex items-center justify-center gap-2.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#EAE2DE] w-full" />
            <span className="bg-white px-2 text-[10px] uppercase font-bold text-[#81777B] tracking-wider absolute">
              or with email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-medium text-[#4A252B] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Nancy Bhardwaj"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3 py-2 text-xs text-[#39343A] focus:bg-white focus:border-[#783751] outline-none transition-colors"
                  />
                  <User className="w-3.5 h-3.5 text-[#81777B] absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-[#4A252B] mb-1">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="designer@atelier.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3 py-2 text-xs text-[#39343A] focus:bg-white focus:border-[#783751] outline-none transition-colors"
                />
                <Mail className="w-3.5 h-3.5 text-[#81777B] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#4A252B] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3 py-2 text-xs text-[#39343A] focus:bg-white focus:border-[#783751] outline-none transition-colors"
                />
                <Lock className="w-3.5 h-3.5 text-[#81777B] absolute right-3 top-2.5 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#783751] hover:bg-[#642C43] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-60 mt-1"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'signup' ? 'Create Atelier Account' : 'Sign In to Atelier'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="pt-2 border-t border-[#EAE2DE]">
            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-[#F3E6E4] hover:bg-[#eddcd9] text-[#783751] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#783751]" />
              <span>Instant Guest Access (Enter as Nancy)</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
