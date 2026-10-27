import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

export function ThemeToggle({ className = '' }) {
  const { toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#783751]/30 cursor-pointer ${
        isDark
          ? 'bg-stone-800 border-stone-700 text-amber-400 hover:bg-stone-700 hover:text-amber-300'
          : 'bg-white border-[#EAE2DE] text-[#39343A] hover:bg-[#F3E6E4] hover:text-[#4A252B]'
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
