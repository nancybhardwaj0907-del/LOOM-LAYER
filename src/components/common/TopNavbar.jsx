import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useUserProfile } from '../../context/useUserProfile';

export function TopNavbar({ 
  searchQuery = '', 
  onSearchChange, 
  placeholder = 'Search projects, fabrics, products...',
  children 
}) {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2">
      {/* Search Input */}
      <div className="relative w-full max-w-sm sm:max-w-md">
        <Search className="w-4 h-4 text-[#81777B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white border border-[#EAE2DE] focus:outline-none focus:border-[#783751] text-[#39343A] placeholder-[#81777B] shadow-2xs transition-all"
        />
      </div>

      {/* Right Header Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="w-9 h-9 rounded-full border border-[#EAE2DE] bg-white flex items-center justify-center text-[#81777B] hover:text-[#783751] hover:border-[#783751]/50 shadow-2xs transition-all cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#783751] absolute top-2 right-2 ring-2 ring-white" />
        </button>

        {/* User Account Capsule Pill */}
        <button
          type="button"
          onClick={() => navigate('/settings')}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#EAE2DE] bg-white hover:border-[#783751]/40 shadow-2xs cursor-pointer transition-colors"
          title="Account Settings"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden bg-[#783751] text-white flex items-center justify-center font-medium text-xs shrink-0">
            {profile?.avatar && profile.avatar !== '/atelier/user_avatar.jpg' ? (
              <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'N'}</span>
            )}
          </div>
          <span className="text-xs font-semibold text-[#4A252B] max-w-[130px] truncate">
            {profile?.name || 'Nancy Bhardwaj'}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-[#81777B]" />
        </button>

        {/* Extra actions passed from page (e.g. New Project button) */}
        {children}
      </div>
    </div>
  );
}
