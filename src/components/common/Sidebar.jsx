import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ArrowRight,
  LogOut,
  Camera,
  Cpu,
  BarChart3
} from 'lucide-react';
import { useProjects } from '../../context/useProjects';
import { useAuth } from '../../context/AuthContext';
import { useUserProfile } from '../../context/useUserProfile';
import { ThemeToggle } from './ThemeToggle';

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile } = useUserProfile();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { projects } = useProjects() || { projects: [] };
  
  const activeProjectId = projects?.[0]?.id || 'proj-1';

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      shortcut: '1',
      isActive: location.pathname === '/dashboard' || location.pathname === '/'
    },
    {
      id: 'new-project',
      label: 'New Project',
      path: '/project/new',
      icon: FolderPlus,
      shortcut: 'N',
      isActive: location.pathname === '/project/new'
    },
    {
      id: 'fabric-optimizer',
      label: 'Fabric Optimizer',
      path: location.pathname.includes('/optimize') || location.pathname.includes('/patterns') 
        ? location.pathname 
        : `/project/${activeProjectId}/optimize`,
      icon: Layers,
      shortcut: 'O',
      badge: 'AI',
      isActive: location.pathname.includes('/optimize') || location.pathname.includes('/patterns') || location.pathname === '/optimizer'
    },
    {
      id: 'cutting-layout',
      label: 'Cutting Layout',
      path: location.pathname.includes('/result') 
        ? location.pathname 
        : `/project/${activeProjectId}/result`,
      icon: Scissors,
      shortcut: 'C',
      isActive: location.pathname.includes('/result') || location.pathname === '/simulation'
    },
    {
      id: 'rethread',
      label: 'ReThread',
      path: '/rethread',
      icon: Recycle,
      badge: 'Eco',
      shortcut: 'R',
      isActive: location.pathname === '/rethread'
    },
    {
      id: 'sustainability',
      label: 'Sustainability',
      path: location.pathname.includes('/sustainability') 
        ? location.pathname 
        : `/project/${activeProjectId}/sustainability`,
      icon: Leaf,
      shortcut: 'S',
      isActive: location.pathname.includes('/sustainability')
    },
    {
      id: 'reports',
      label: 'Reports',
      path: '/reports',
      icon: FileText,
      shortcut: 'P',
      isActive: location.pathname === '/reports' || location.hash === '#reports'
    },
    {
      id: 'settings',
      label: 'Settings',
      path: '/settings',
      icon: Settings,
      shortcut: ',',
      isActive: location.pathname === '/settings' || location.pathname === '/profile'
    }
  ];

  return (
    <>
      {/* Mobile Sticky Bar */}
      <div className="lg:hidden sticky top-0 z-40 w-full shrink-0 bg-[#FAF8F5]/95 dark:bg-[#141219]/95 backdrop-blur-md border-b border-cream-200 dark:border-[#24212D] px-4 py-2.5 flex items-center justify-between shadow-2xs">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8E2B45] to-[#5C1B2C] text-white flex items-center justify-center shadow-xs">
            <Leaf className="w-4 h-4 text-[#F8D7E0]" />
          </div>
          <span className="font-serif text-base font-bold text-stone-900 dark:text-[#F5F3F8]">
            Loom & Layer
          </span>
        </Link>
        <div className="flex items-center gap-1.5">
          <ThemeToggle className="p-1.5 rounded-lg text-stone-600 dark:text-[#A8A1B4] hover:text-stone-900 dark:hover:text-[#F5F3F8]" />
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-xl border border-cream-200 dark:border-[#24212D] text-stone-800 dark:text-[#F5F3F8] hover:bg-cream-100 dark:hover:bg-[#1C1A24] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-[#FAF8F5] dark:bg-[#141219] border-r border-cream-200 dark:border-[#24212D] transform transition-transform duration-200 ease-in-out p-4 flex flex-col justify-between shadow-2xl ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-cream-200 dark:border-[#24212D]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8E2B45] to-[#5C1B2C] text-white flex items-center justify-center shadow-xs">
                <Leaf className="w-4 h-4 text-[#F8D7E0]" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-base font-bold text-stone-900 dark:text-[#F5F3F8]">Loom & Layer</span>
                <span className="text-[9px] font-mono text-[#8E2B45] dark:text-[#E2A97E] uppercase tracking-wider font-semibold">Maison Studio</span>
              </div>
            </div>
            <button 
              onClick={() => setMobileOpen(false)} 
              className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-[#F5F3F8]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <Link
            to="/project/new"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#8E2B45] to-[#732237] text-white font-semibold text-xs shadow-xs"
          >
            <FolderPlus className="w-3.5 h-3.5 shrink-0" />
            <span>New Project</span>
          </Link>

          <nav className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    active
                      ? 'bg-[#8E2B45] text-white shadow-xs'
                      : 'text-stone-600 dark:text-[#9B93A6] hover:bg-cream-100 dark:hover:bg-[#1C1A24]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-stone-400 dark:text-[#7D7588]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                      active
                        ? 'bg-white/20 text-white'
                        : 'bg-cream-200 dark:bg-[#252230] text-stone-700 dark:text-[#D8D2E1] border border-cream-300 dark:border-[#353043]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-t border-cream-200 dark:border-[#24212D] flex items-center justify-between">
          <Link 
            to="/profile" 
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 min-w-0"
          >
            <img 
              src={profile?.avatar || "/atelier/user_avatar.jpg"} 
              alt="" 
              className="w-7 h-7 rounded-lg object-cover border border-cream-200 dark:border-[#353043]" 
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-stone-900 dark:text-[#F5F3F8] block truncate leading-tight">
                {profile?.name || 'Nancy'}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-[#7D7588] font-mono block truncate">
                Atelier Director
              </span>
            </div>
          </Link>
          <button
            type="button"
            onClick={async () => {
              setMobileOpen(false);
              await signOut();
              navigate('/');
            }}
            className="p-1.5 text-stone-500 dark:text-[#7D7588] hover:text-rose-500 cursor-pointer transition-colors"
            title="Sign Out"
            aria-label="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Desktop Fixed Pro Navigation Rail — Zero Lag, Zero Reflow */}
      <aside 
        className="hidden lg:flex flex-col justify-between shrink-0 w-60 bg-[#FAF8F5] dark:bg-[#141219] border-r border-cream-200 dark:border-[#24212D] min-h-screen sticky top-0 h-screen z-30 shadow-md select-none transition-colors"
      >
        <div className="flex flex-col p-3.5 space-y-4">
          {/* Brand Logo Header */}
          <Link to="/dashboard" className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-cream-100 dark:hover:bg-[#1D1A25] transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8E2B45] to-[#5C1B2C] text-white flex items-center justify-center shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Leaf className="w-4 h-4 text-[#F8D7E0]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-sm font-bold text-stone-900 dark:text-[#F5F3F8] tracking-tight leading-tight">
                Loom & Layer
              </span>
              <span className="text-[10px] font-mono text-[#8E2B45] dark:text-[#E2A97E] uppercase tracking-wider font-semibold">
                Maison Studio • Paris
              </span>
            </div>
          </Link>

          {/* Primary Action Button */}
          <Link
            to="/project/new"
            className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-[#8E2B45] to-[#732237] hover:from-[#A13350] hover:to-[#85273F] text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
            title="Create New Project"
          >
            <FolderPlus className="w-3.5 h-3.5 shrink-0" />
            <span>New Project</span>
          </Link>

          {/* Navigation Items Rail */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors relative group ${
                    active
                      ? 'bg-[#8E2B45] text-white shadow-xs'
                      : 'text-stone-600 dark:text-[#9B93A6] hover:text-stone-900 dark:hover:text-[#F5F3F8] hover:bg-cream-100 dark:hover:bg-[#1C1A24]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                      active ? 'text-white' : 'text-stone-400 dark:text-[#7D7588] group-hover:text-stone-900 dark:group-hover:text-[#F5F3F8]'
                    }`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                      active 
                        ? 'bg-white/20 text-white' 
                        : 'bg-cream-200 dark:bg-[#252230] text-stone-700 dark:text-[#D8D2E1] border border-cream-300 dark:border-[#353043]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Rail: User Profile + Theme & Sign Out */}
        <div className="p-3 border-t border-cream-200 dark:border-[#24212D] space-y-2">
          <div className="flex items-center justify-between gap-2 px-1">
            <Link to="/profile" className="flex items-center gap-2 min-w-0 group">
              <img
                src={profile?.avatar || "/atelier/user_avatar.jpg"}
                alt=""
                className="w-7 h-7 rounded-lg object-cover border border-cream-200 dark:border-[#353043] shadow-2xs shrink-0 group-hover:border-[#8E2B45] transition-colors"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-stone-900 dark:text-[#F5F3F8] truncate leading-tight">
                  {profile?.name || "Nancy"}
                </p>
                <p className="text-[10px] text-stone-500 dark:text-[#7D7588] font-mono truncate">Atelier Director</p>
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <ThemeToggle className="p-1 rounded-lg text-stone-600 dark:text-[#9B93A6] hover:text-stone-900 dark:hover:text-[#F5F3F8]" />
              <button
                type="button"
                onClick={async () => {
                  await signOut();
                  navigate('/');
                }}
                className="p-1 text-stone-500 dark:text-[#7D7588] hover:text-rose-500 cursor-pointer transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
