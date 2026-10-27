import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scissors, Leaf, LayoutDashboard, FolderGit2, Recycle } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const location = useLocation();

  const handleProjectsClick = (e) => {
    if (location.pathname === '/dashboard') {
      e.preventDefault();
      const el = document.getElementById('projects');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.pushState(null, '', '/dashboard#projects');
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-cream-300 bg-cream-50/95 backdrop-blur-md transition-colors duration-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between relative">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-[#FCEEED] text-[#5C2434] flex items-center justify-center shadow-xs group-hover:bg-[#5C2434] group-hover:text-white transition-all border border-[#F0D0CB]">
              <Leaf className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-editorial text-xl font-bold tracking-tight text-[#2E1822] leading-none group-hover:text-[#5C2434] transition-colors">
                Loom & Layer
              </span>
              <span className="text-[10px] font-mono font-medium tracking-wider uppercase text-[#5C2434] mt-1 flex items-center gap-1">
                Circular Atelier
              </span>
            </div>
          </Link>

          {/* Centered Atelier Navigation Capsule */}
          <nav className="hidden md:flex items-center p-1 rounded-full bg-[#FAF7F4] dark:bg-stone-900 border border-[#EDE3DF] dark:border-stone-800 shadow-2xs md:absolute md:left-1/2 md:-translate-x-1/2 backdrop-blur-sm">
            <Link
              to="/dashboard"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/dashboard' && !location.hash
                  ? 'bg-[#FCEEED] text-[#5C2434] shadow-2xs border border-[#F0D0CB]'
                  : 'text-[#7A626C] hover:text-[#5C2434] hover:bg-[#FCEEED]/50'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-[#5C2434]" />
              Dashboard
            </Link>
            <Link
              to="/dashboard#projects"
              onClick={handleProjectsClick}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.hash === '#projects' || (location.pathname.startsWith('/project') && !location.pathname.includes('/new'))
                  ? 'bg-[#FCEEED] text-[#5C2434] shadow-2xs border border-[#F0D0CB]'
                  : 'text-[#7A626C] hover:text-[#5C2434] hover:bg-[#FCEEED]/50'
              }`}
            >
              <FolderGit2 className="w-3.5 h-3.5 text-[#7A626C]" />
              Projects
            </Link>
            <Link
              to="/rethread"
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                location.pathname === '/rethread'
                  ? 'bg-[#FCEEED] text-[#5C2434] shadow-2xs border border-[#F0D0CB]'
                  : 'text-[#7A626C] hover:text-[#5C2434] hover:bg-[#FCEEED]/50'
              }`}
            >
              <Recycle className="w-3.5 h-3.5 text-[#5C2434]" />
              ReThread
            </Link>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
