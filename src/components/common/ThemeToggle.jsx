import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export function ThemeToggle({ className = '' }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8E2B45]/30 cursor-pointer shadow-2xs ${
        isDark
          ? 'bg-[#1E1B27] border-[#2E293B] text-amber-400 hover:bg-[#252230] hover:text-amber-300'
          : 'bg-white border-cream-200 text-stone-700 hover:bg-cream-100 hover:text-[#78253B]'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 transition-transform duration-200 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-200 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
