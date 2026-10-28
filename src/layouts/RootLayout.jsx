import React from 'react';
import { Outlet, Navigate, useLocation, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/common/Sidebar';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useAuth } from '../context/AuthContext';
import { 
  Leaf, 
  Search, 
  Bell, 
  Plus, 
  LayoutDashboard, 
  Layers, 
  Scissors, 
  Recycle, 
  BarChart3, 
  FileText,
  Activity,
  Sliders,
  ChevronRight
} from 'lucide-react';
import { useUserProfile } from '../context/useUserProfile';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function RootLayout() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] dark:bg-[#1A1410] flex items-center justify-center">
        <div className="w-9 h-9 border-2 border-crimson-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If visitor is not authenticated, redirect to landing page with login prompt
  if (!isAuthenticated) {
    return <Navigate to="/?login=true" replace state={{ from: location }} />;
  }

  // Compute friendly contextual section label
  const getContextLabel = () => {
    if (location.pathname.includes('/optimize')) return 'Fabric Optimizer';
    if (location.pathname.includes('/result')) return 'Cutting Layout';
    if (location.pathname.includes('/rethread')) return 'ReThread';
    if (location.pathname.includes('/sustainability')) return 'Sustainability';
    if (location.pathname.includes('/reports')) return 'Reports';
    if (location.pathname.includes('/settings') || location.pathname.includes('/profile')) return 'Settings';
    if (location.pathname === '/project/new') return 'New Project';
    return 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 dark:bg-[#0D0C10] dark:text-[#F5F3F8] flex flex-col antialiased selection:bg-[#8E2B45] selection:text-white atelier-mesh-bg transition-colors duration-200">
      
      {/* ========================================================
          BODY LAYOUT: PRO COMPACT DOCK + FULL-SCREEN WORKBENCH
          ======================================================== */}
      <div className="flex-1 flex overflow-hidden">
        {/* Pro Fixed Tool Rail */}
        <Sidebar />

        {/* Right Content Column: Top Utility Bar + Scrollable Workbench */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Top Utility Strip */}
          <header className="h-13 bg-white/90 dark:bg-[#141219]/90 border-b border-cream-200 dark:border-[#24212D] px-4 sm:px-6 flex items-center justify-between shrink-0 select-none backdrop-blur-md transition-colors">
            {/* Left: Context Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#8E2B45]" />
              <span className="text-xs font-mono font-medium text-stone-600 dark:text-[#A8A1B4]">
                {getContextLabel()}
              </span>
            </div>

            {/* Right: Live Telemetry & Profile & Theme Switcher */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Cutter #1 Online (45m/min)</span>
              </div>

              {/* Instant Header Theme Switcher */}
              <ThemeToggle className="p-1.5 rounded-lg text-[#A8A1B4] hover:text-[#F5F3F8] hover:bg-white/5 transition-colors border border-transparent hover:border-[#353043]" />

              <Link 
                to="/profile" 
                className="flex items-center gap-2 pl-2 border-l border-[#24212D] hover:opacity-85 transition-opacity"
                title="View Profile & Settings"
              >
                <img 
                  src={profile?.avatar || "/atelier/user_avatar.jpg"} 
                  alt="" 
                  className="w-7 h-7 rounded-lg object-cover border border-[#353043] shadow-xs" 
                />
                <span className="hidden md:inline text-xs font-semibold text-[#F5F3F8]">
                  {profile?.name || 'Nancy'}
                </span>
              </Link>
            </div>
          </header>

          {/* Main Immersive Studio Workbench Canvas */}
          <main className="flex-1 p-4 sm:p-5 lg:p-6 overflow-y-auto overflow-x-hidden min-w-0 max-w-[1920px] w-full mx-auto space-y-5">
            <ErrorBoundary
              key={location.pathname}
              componentName="AtelierRouteView"
              title="Atelier Workspace Error"
              message="An error occurred while rendering this page. You can retry or navigate back to the dashboard."
              fallbackActionLabel="Back to Dashboard"
              onFallbackAction={() => { window.location.href = '/dashboard'; }}
            >
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
      </div>

    </div>
  );
}
