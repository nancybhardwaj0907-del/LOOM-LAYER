import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, CheckCircle2, ChevronDown, LayoutDashboard, FolderGit2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/useAuth';

export function AuthButton({ className = '' }) {
  const navigate = useNavigate();
  const { user, loading, isConfigured, signInWithGoogle, signOut, error } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState(null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isConfigured) return null;

  if (loading) {
    return (
      <div className="w-8 h-8 rounded-full bg-[#F3E6E4] animate-pulse border border-[#EAE2DE]" />
    );
  }

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogle();
      if (res && !res.success && res.error) {
        setAuthError(res.error);
      }
    } catch (err) {
      setAuthError(err.message || 'Google sign-in could not be completed.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleGoTo = (path) => {
    setIsOpen(false);
    navigate(path);
  };

  // 1. Signed-out state: Google Sign In Button
  if (!user) {
    return (
      <div className="relative inline-block">
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#EAE2DE] text-[#39343A] hover:bg-[#F3E6E4]/40 hover:border-[#783751]/50 shadow-2xs transition-all cursor-pointer disabled:opacity-50 ${className}`}
          title="Sign in with your Google Account"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.04h3.88c2.27-2.09 3.665-5.17 3.665-9.14z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.04c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.13C3.29 21.43 7.37 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.59H1.26C.46 8.18 0 9.99 0 12s.46 3.82 1.26 5.41l4.02-3.13z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.59l4.02 3.13c.95-2.83 3.6-4.97 6.72-4.97z"
            />
          </svg>
          <span className="hidden sm:inline">
            {isSigningIn ? 'Connecting...' : 'Sign in with Google'}
          </span>
          <span className="sm:hidden">
            {isSigningIn ? '...' : 'Sign In'}
          </span>
        </button>

        {authError && (
          <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-white border border-[#EAE2DE] rounded-xl shadow-lg z-50 text-[11px] text-[#783751] space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-[#C08274]" />
              <span>Authentication Error</span>
            </div>
            <p className="text-[#81777B] leading-tight">{authError}</p>
          </div>
        )}
      </div>
    );
  }

  // 2. Signed-in state: Profile avatar with dropdown
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Atelier Designer';
  const email = user.email || '';
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full sm:rounded-xl bg-white border border-[#EAE2DE] hover:border-[#783751] hover:bg-[#F3E6E4]/30 transition-colors cursor-pointer text-left shadow-2xs"
        title={`Signed in as ${email}`}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full object-cover border border-[#EAE2DE]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-[#783751] text-white flex items-center justify-center text-xs font-bold font-serif">
            {initial}
          </div>
        )}
        <span className="hidden sm:inline text-xs font-medium text-[#39343A] max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown className="hidden sm:inline w-3 h-3 text-[#81777B]" />
      </button>

      {/* Profile & Session Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#EAE2DE] shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          {/* Header row linking directly to Profile */}
          <button
            type="button"
            onClick={() => handleGoTo('/profile')}
            className="w-full text-left px-4 py-3 border-b border-[#EAE2DE] hover:bg-[#F3E6E4]/40 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-10 h-10 rounded-full object-cover border border-[#EAE2DE]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[#783751] text-white flex items-center justify-center text-sm font-bold font-serif">
                  {initial}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[#4A252B] truncate">{displayName}</p>
                <p className="text-[11px] text-[#81777B] truncate font-mono">{email}</p>
                <span className="inline-block mt-0.5 text-[10px] text-[#783751] font-semibold bg-[#F3E6E4] px-1.5 py-0.2 rounded border border-[#C08274]/30">Google Verified</span>
              </div>
            </div>
          </button>

          {/* Navigation Links in Dropdown */}
          <div className="px-2 py-1.5 space-y-0.5 border-b border-[#EAE2DE]">
            <button
              type="button"
              onClick={() => handleGoTo('/profile')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#39343A] hover:bg-[#F3E6E4]/50 hover:text-[#783751] transition-colors cursor-pointer text-left"
            >
              <User className="w-3.5 h-3.5 text-[#783751]" />
              <span>Atelier Profile</span>
            </button>

            <button
              type="button"
              onClick={() => handleGoTo('/dashboard')}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-[#39343A] hover:bg-[#F3E6E4]/50 hover:text-[#783751] transition-colors cursor-pointer text-left"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#81777B]" />
              <span>Dashboard</span>
            </button>
          </div>

          <div className="px-2 pt-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#783751] hover:bg-[#F3E6E4] hover:text-[#642C43] transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
