import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Leaf, 
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AuthModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res?.success) {
        // If OAuth starts a full-page redirect to Google, browser navigates away.
        // If local demo fallback triggers, navigate to /dashboard.
        if (!res.data?.url) {
          onClose();
          navigate('/dashboard');
        }
      } else {
        setError(res?.error || 'Google sign-in could not be completed.');
        setLoading(false);
      }
    } catch (err) {
      setError(err?.message || 'Google sign-in error.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#EAE2DE] rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#783751] px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-[#F3E6E4]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base leading-tight">Loom & Layer</h3>
              <p className="text-[11px] text-[#F3E6E4]">Circular Atelier Workspace</p>
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

        {/* Content */}
        <div className="p-6 text-center space-y-5">
          <div className="space-y-1.5 pt-1">
            <h4 className="font-serif font-bold text-xl text-[#4A252B]">
              Sign in to Loom & Layer
            </h4>
            <p className="text-xs text-[#81777B] leading-relaxed max-w-xs mx-auto">
              Continue with your Google account to access your fabric cutting projects, nested markers, and atelier dashboard.
            </p>
          </div>

          {/* Google Sign-in Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl border border-[#EAE2DE] bg-white hover:bg-[#FBF7F5] hover:border-[#783751]/40 text-xs font-semibold text-[#39343A] flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#783751]" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span className="text-sm">Continue with Google</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 border-t border-[#EAE2DE]/60 flex items-center justify-center gap-1.5 text-[11px] text-[#81777B]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Secure authentication via Google SSO</span>
          </div>
        </div>
      </div>
    </div>
  );
}
