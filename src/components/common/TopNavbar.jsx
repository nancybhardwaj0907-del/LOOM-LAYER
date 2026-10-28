import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useUserProfile } from '../../context/useUserProfile';

export function TopNavbar({ 
  searchQuery = '', 
  onSearchChange, 
  placeholder = 'Search projects, fabrics, markers, DXF plans... (⌘K)',
  children 
}) {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-cream-200/80 dark:border-stone-800">
      {/* Left: Search Bar with Keyboard Shortcut */}
      <div className="relative w-full max-w-md lg:max-w-lg">
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-16 py-2.5 text-xs rounded-xl bg-white/90 dark:bg-stone-900/90 border border-cream-200 dark:border-stone-800 focus:outline-none focus:ring-2 focus:ring-crimson-700/20 focus:border-crimson-700 text-stone-900 dark:text-stone-100 placeholder-stone-400 shadow-xs transition-all font-sans"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none text-[10px] font-mono text-stone-400 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-stone-700">
          <span>⌘</span>
          <span>K</span>
        </div>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap lg:flex-nowrap">
        {/* CNC / CAD Engine Status Pill */}
        <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono font-medium shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>CNC Cutter Online</span>
        </div>

        {/* Notification Bell with Badge */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-xl border border-cream-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:text-crimson-700 hover:border-crimson-300 shadow-2xs transition-all cursor-pointer relative"
          title="Atelier Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-crimson-600 absolute top-2 right-2 ring-2 ring-white dark:ring-stone-900 animate-pulse" />
        </button>

        {/* User Account Capsule Pill */}
        <button
          type="button"
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cream-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 hover:border-crimson-400/60 shadow-2xs cursor-pointer transition-all group"
          title="Account Profile & Settings"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-gradient-to-tr from-crimson-700 to-crimson-900 text-white flex items-center justify-center font-medium text-xs shrink-0 shadow-2xs">
            {profile?.avatar && profile.avatar !== '/atelier/user_avatar.jpg' ? (
              <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'E'}</span>
            )}
          </div>
          <span className="text-xs font-bold text-stone-900 dark:text-stone-100 max-w-[130px] truncate group-hover:text-crimson-700 transition-colors">
            {profile?.name || 'Elena Rostova'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 transition-colors" />
        </button>

        {/* Action children (e.g. New Project button) */}
        {children}
      </div>
    </div>
  );
}
