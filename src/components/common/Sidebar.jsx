import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Leaf, 
  LayoutDashboard, 
  FolderPlus, 
  Layers, 
  Scissors, 
  Recycle, 
  FileText, 
  Settings, 
  Menu, 
  X,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useProjects } from '../../context/useProjects';

export function Sidebar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { projects } = useProjects() || { projects: [] };
  
  // Use first project ID or demo fallback for optimizer/simulation links
  const activeProjectId = projects?.[0]?.id || 'demo-proj-1';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      isActive: location.pathname === '/dashboard' || location.pathname === '/'
    },
    {
      id: 'new-project',
      label: 'New Project',
      path: '/project/new',
      icon: FolderPlus,
      isActive: location.pathname === '/project/new'
    },
    {
      id: 'fabric-optimizer',
      label: 'Fabric Optimizer',
      path: location.pathname.includes('/optimize') || location.pathname.includes('/patterns') 
        ? location.pathname 
        : `/project/${activeProjectId}/optimize`,
      icon: Layers,
      isActive: location.pathname.includes('/optimize') || location.pathname.includes('/patterns') || location.pathname === '/optimizer'
    },
    {
      id: 'cutting-layout',
      label: 'Cutting Layout',
      path: location.pathname.includes('/result') 
        ? location.pathname 
        : `/project/${activeProjectId}/result`,
      icon: Scissors,
      isActive: location.pathname.includes('/result') || location.pathname === '/simulation'
    },
    {
      id: 'rethread',
      label: 'ReThread',
      path: '/rethread',
      icon: Recycle,
      isActive: location.pathname === '/rethread'
    },
    {
      id: 'sustainability',
      label: 'Sustainability',
      path: location.pathname.includes('/sustainability') 
        ? location.pathname 
        : `/project/${activeProjectId}/sustainability`,
      icon: Leaf,
      isActive: location.pathname.includes('/sustainability')
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: FileText,
      isActive: location.pathname === '/reports' || location.hash === '#reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      isActive: location.pathname === '/settings' || location.pathname === '/profile'
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full p-4 select-none">
      <div className="space-y-6">
        {/* Brand Logo & Title */}
        <Link 
          to="/dashboard" 
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-2.5 px-2 py-1 group"
        >
          <div className="w-8 h-8 rounded-lg bg-[#5C2434] text-white flex items-center justify-center shadow-xs">
            <Leaf className="w-4 h-4 text-[#FCEEED]" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-tight text-[#2E1822] leading-none group-hover:text-[#5C2434] transition-colors">
              Loom & Layer
            </span>
            <span className="text-[10px] text-[#7A626C] font-sans mt-0.5">
              Circular Atelier
            </span>
          </div>
        </Link>

        {/* Navigation Menu Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.isActive;
            return (
              <Link
                key={item.id}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[#FCEEED] text-[#5C2434] font-semibold shadow-2xs border border-[#F0D0CB]'
                    : 'text-[#6E5660] hover:text-[#2E1822] hover:bg-[#F9ECEB]'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#5C2434]' : 'text-stone-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Circular Atelier Card with Rose Watercolor Artwork (Reference User Mockup) */}
      <div className="mt-8 rounded-2xl border border-[#EDE3DF] p-4 text-[#2E1822] relative overflow-hidden shadow-2xs group min-h-[170px] flex flex-col justify-between bg-white">
        {/* Watercolor Rose Botanical Background */}
        <img
          src="/atelier/sidebar_rose_botanical.jpg"
          alt="Dusty rose watercolor botanical leaves"
          className="absolute inset-0 w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
        />
        {/* Soft gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-1">
          <p className="font-serif text-sm font-bold text-[#2E1822] leading-tight">
            Less <br />
            Waste. <br />
            More <br />
            Possibilities.
          </p>
        </div>

        <div className="relative z-10 pt-2">
          <Link
            to="/sustainability"
            className="w-8 h-8 rounded-full bg-white text-[#2E1822] border border-stone-200/90 shadow-xs flex items-center justify-center hover:bg-[#5C2434] hover:text-white hover:scale-110 transition-all cursor-pointer inline-flex"
            title="Sustainability"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Header Bar with Menu Toggle */}
      <div className="md:hidden sticky top-0 z-40 bg-[#FAF7F4] border-b border-[#EFE6E2] px-4 py-3 flex items-center justify-between shadow-2xs">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#5C2434] text-white flex items-center justify-center">
            <Leaf className="w-3.5 h-3.5 text-[#FCEEED]" />
          </div>
          <span className="font-serif text-base font-bold text-[#2E1822]">
            Loom & Layer
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg border border-[#DDD5C7] text-stone-700 hover:bg-[#F2ECE1]"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-stone-900/40 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <div className={`md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#FAF7F4] border-r border-[#EFE6E2] transform transition-transform duration-200 ease-in-out ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {sidebarContent}
      </div>

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex w-56 lg:w-60 shrink-0 bg-[#FAF7F4] border-r border-[#EFE6E2] min-h-screen sticky top-0 h-screen overflow-y-auto">
        {sidebarContent}
      </aside>
    </>
  );
}
