import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Plus, 
  Leaf, 
  Folder, 
  Recycle, 
  Package, 
  Search, 
  Bell,
  ChevronDown,
  ArrowRight,
  MoreVertical,
  Trash2, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  X,
  FileText,
  BarChart3,
  Scissors,
  Layers,
  Sparkles
} from 'lucide-react';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';
import { Modal } from '../components/common/FeedbackAndNavigation';

export function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { projects, deleteProject } = useProjects();
  const { profile } = useUserProfile();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);

  // Close 3-dots action menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Smooth scroll to #projects anchor if requested
  useEffect(() => {
    if (location.hash === '#projects') {
      const timer = setTimeout(() => {
        const el = document.getElementById('projects');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash, location.pathname]);

  const handleOpenDelete = (project, e) => {
    e?.stopPropagation();
    setOpenMenuId(null);
    setProjectToDelete(project);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setProjectToDelete(null);
    setDeleteError(null);
  };

  const handleExecuteDelete = async () => {
    if (!projectToDelete || isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);

    const targetProject = projectToDelete;
    const res = await deleteProject(targetProject.id);

    setIsDeleting(false);

    if (res?.success) {
      setProjectToDelete(null);
      setDeleteNotification(`Project "${targetProject.name}" was deleted successfully.`);
      setTimeout(() => {
        setDeleteNotification((prev) => (prev?.includes(targetProject.name) ? null : prev));
      }, 5000);
    } else {
      setDeleteError(res?.error || 'Failed to delete project. Please try again.');
    }
  };

  // Aggregates derived from project data or curated defaults (matching Image 2)
  const totalProjectsCount = projects.length > 0 ? projects.length : 12;

  const totalSavedMeters = projects.length > 0
    ? projects
        .reduce((sum, p) => sum + (typeof p.fabricSavedMeters === 'number' ? p.fabricSavedMeters : (Number(p.fabricSavedMeters) || 0)), 0)
        .toFixed(1)
    : '24.6';

  const completedProjects = projects.filter(p => typeof p.utilization === 'number' && p.utilization > 0);
  const avgWasteReduction = completedProjects.length > 0
    ? (completedProjects.reduce((sum, p) => sum + (p.wasteDeltaPp || 8.2), 0) / completedProjects.length).toFixed(1)
    : '8.2';

  // Curated reference projects matching reference palette
  const defaultRecentProjects = [
    {
      id: 'proj-summer-col',
      name: 'Summer Collection',
      fabricType: 'Cotton',
      patterns: 8,
      status: 'Completed',
      lastUpdated: '25 Oct 2026',
      swatch: '/atelier/swatches.jpg',
      isDemo: true
    },
    {
      id: 'proj-patchwork-trial',
      name: 'Patchwork Trial',
      fabricType: 'Mixed Fabric',
      patterns: 5,
      status: 'In Progress',
      lastUpdated: '22 Oct 2026',
      swatch: '/rethread/rethread_hero_patchwork.jpg',
      isDemo: true
    },
    {
      id: 'proj-rethread-batch',
      name: 'ReThread Batch',
      fabricType: 'Linen',
      patterns: 6,
      status: 'Draft',
      lastUpdated: '18 Oct 2026',
      swatch: '/rethread/rethread_linen_preset.jpg',
      isDemo: true
    }
  ];

  // Map real projects and merge with reference defaults if needed
  const mappedRealProjects = projects.map((p, idx) => {
    let status = 'Completed';
    if (!p.utilization && !p.placements?.length) {
      status = p.patterns?.length ? 'In Progress' : 'Draft';
    }
    const patternCount = p.patterns?.length || p.totalPieces || (idx % 3 === 0 ? 8 : (idx % 2 === 0 ? 5 : 6));
    const swatchImg = p.fabricType === 'Denim' 
      ? '/rethread/rethread_denim_preset.jpg' 
      : (p.fabricType === 'Linen' ? '/rethread/rethread_linen_preset.jpg' : '/atelier/swatches.jpg');

    return {
      id: p.id,
      name: p.name || `Project ${idx + 1}`,
      fabricType: p.fabricType || 'Cotton',
      patterns: patternCount,
      status: p.status || status,
      lastUpdated: p.updatedAt 
        ? new Date(p.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '25 Oct 2026',
      swatch: swatchImg,
      isDemo: false
    };
  });

  const allProjects = [...mappedRealProjects];
  defaultRecentProjects.forEach(def => {
    if (!allProjects.some(p => p.name === def.name)) {
      allProjects.push(def);
    }
  });

  const filteredProjects = allProjects.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return p.name.toLowerCase().includes(q) || p.fabricType.toLowerCase().includes(q) || p.status.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. TOP HEADER BAR (Wine & Porcelain Palette)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
        {/* Search Bar */}
        <div className="relative w-full max-w-sm sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, fabrics, layouts..."
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

          {/* New Project CTA Button */}
          <button
            type="button"
            onClick={() => navigate('/project/new')}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. SUSTAINABLE FASHION HERO BANNER (Wine & Warm Cashmere)
          ======================================================== */}
      <div className="bg-gradient-to-r from-[#F3E6E4] to-[#FBF7F5] rounded-3xl border border-[#EAE2DE] p-6 sm:p-8 shadow-2xs relative overflow-hidden">
        {/* Subtle top right handwritten script label */}
        <div className="hidden sm:flex items-center gap-1.5 text-[#81777B] font-serif italic text-xs sm:text-sm absolute top-5 right-7 pointer-events-none select-none z-10">
          <span>Less waste, More possibilities</span>
          <Leaf className="w-3.5 h-3.5 text-[#783751]" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-3.5 sm:space-y-4">
            <p className="text-[11px] font-bold tracking-widest text-[#81777B] uppercase font-sans">
              SUSTAINABLE FASHION. SMARTER CUTTING.
            </p>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-serif font-bold text-[#4A252B] leading-[1.12] tracking-tight">
              Optimize. Create. <br />
              Reimagine.
            </h1>

            <p className="text-xs sm:text-sm text-[#81777B] leading-relaxed max-w-lg font-sans">
              Plan smarter, cut better, and give leftover fabric a new life with AI-powered optimization and circular design tools.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/project/new')}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-all shadow-xs cursor-pointer group"
              >
                <span>Start a New Project</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>

          {/* Right Image Column */}
          <div className="lg:col-span-5 relative mt-2 lg:mt-0">
            <div className="rounded-2xl overflow-hidden shadow-xs border border-[#EAE2DE] aspect-16/10 w-full max-w-md ml-auto relative bg-stone-100">
              <img
                src="/atelier/dashboard_hero_linen.jpg"
                alt="Neatly folded organic linen and eucalyptus branch"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/atelier/banner_craft.jpg";
                }}
              />

              {/* Floating Leaf Pill Badge */}
              <div className="absolute bottom-3 right-3 sm:bottom-3.5 sm:right-3.5 bg-white/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-xs border border-[#EAE2DE] flex items-center gap-1.5 text-[11px] font-medium text-[#39343A]">
                <Leaf className="w-3.5 h-3.5 text-[#783751]" />
                <span>Circular design for a greener tomorrow.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. FOUR STAT SUMMARY CARDS (Blush & Wine Accents)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Card 1: Total Projects */}
        <div 
          onClick={() => {
            const el = document.getElementById('projects');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white rounded-2xl border border-[#EAE2DE] p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:border-[#C08274] transition-all group cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#783751] flex items-center justify-center shrink-0 mb-3 border border-[#C08274]/30">
              <Folder className="w-5 h-5 text-[#783751]" />
            </div>
            <p className="text-xs font-medium text-[#81777B]">Total Projects</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">{totalProjectsCount}</p>
          </div>
          <div className="w-7 h-7 rounded-full border border-[#EAE2DE] flex items-center justify-center text-[#81777B] group-hover:text-[#783751] group-hover:border-[#783751] group-hover:bg-[#F3E6E4] transition-all shrink-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 2: Fabric Saved */}
        <div 
          onClick={() => navigate('/sustainability')}
          className="bg-white rounded-2xl border border-[#EAE2DE] p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:border-[#C08274] transition-all group cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#783751] flex items-center justify-center shrink-0 mb-3 border border-[#C08274]/30">
              <Leaf className="w-5 h-5 text-[#783751]" />
            </div>
            <p className="text-xs font-medium text-[#81777B]">Fabric Saved</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">{totalSavedMeters} m²</p>
          </div>
          <div className="w-7 h-7 rounded-full border border-[#EAE2DE] flex items-center justify-center text-[#81777B] group-hover:text-[#783751] group-hover:border-[#783751] group-hover:bg-[#F3E6E4] transition-all shrink-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 3: Waste Reduced */}
        <div 
          onClick={() => navigate('/sustainability')}
          className="bg-white rounded-2xl border border-[#EAE2DE] p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:border-[#C08274] transition-all group cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#783751] flex items-center justify-center shrink-0 mb-3 border border-[#C08274]/30">
              <Recycle className="w-5 h-5 text-[#783751]" />
            </div>
            <p className="text-xs font-medium text-[#81777B]">Waste Reduced</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">{avgWasteReduction} kg</p>
          </div>
          <div className="w-7 h-7 rounded-full border border-[#EAE2DE] flex items-center justify-center text-[#81777B] group-hover:text-[#783751] group-hover:border-[#783751] group-hover:bg-[#F3E6E4] transition-all shrink-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Card 4: Products Upcycled */}
        <div 
          onClick={() => navigate('/rethread')}
          className="bg-white rounded-2xl border border-[#EAE2DE] p-4 sm:p-5 flex items-center justify-between shadow-2xs hover:border-[#C08274] transition-all group cursor-pointer"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#783751] flex items-center justify-center shrink-0 mb-3 border border-[#C08274]/30">
              <Package className="w-5 h-5 text-[#783751]" />
            </div>
            <p className="text-xs font-medium text-[#81777B]">Products Upcycled</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">48</p>
          </div>
          <div className="w-7 h-7 rounded-full border border-[#EAE2DE] flex items-center justify-center text-[#81777B] group-hover:text-[#783751] group-hover:border-[#783751] group-hover:bg-[#F3E6E4] transition-all shrink-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

      </div>

      {/* ========================================================
          4. TWO-COLUMN LOWER SECTION
             Left: Recent Projects Table
             Right: "Every pattern has a purpose" Card
          ======================================================== */}
      <div id="projects" className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        
        {/* Left Column: Recent Projects Table (8 cols on lg) */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EAE2DE] p-5 sm:p-6 shadow-2xs relative">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base sm:text-lg font-serif font-bold text-[#4A252B]">
              Recent Projects
            </h2>
            <button
              type="button"
              onClick={() => navigate('/project/new')}
              className="text-xs font-semibold text-[#783751] hover:underline flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Deletion Toast */}
          {deleteNotification && (
            <div className="mb-4 p-3 rounded-xl bg-[#F3E6E4] border border-[#C08274]/40 text-[#783751] text-xs flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#783751] shrink-0" />
                <span>{deleteNotification}</span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteNotification(null)}
                className="text-[#81777B] hover:text-[#783751] p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Table Header */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-2 text-[11px] font-semibold text-[#81777B] uppercase tracking-wider pb-2.5 border-b border-[#EAE2DE] px-2">
            <div className="sm:col-span-4">Name</div>
            <div className="sm:col-span-2">Fabric Type</div>
            <div className="sm:col-span-2">Patterns</div>
            <div className="sm:col-span-2">Status</div>
            <div className="sm:col-span-2 text-right">Last Updated</div>
          </div>

          {/* Project Rows */}
          <div className="divide-y divide-[#EAE2DE]">
            {filteredProjects.map((p) => {
              const isMenuOpen = openMenuId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    if (p.isDemo) {
                      navigate(`/project/demo-proj-1/result`);
                    } else {
                      navigate(`/project/${p.id}/result`);
                    }
                  }}
                  className="py-3 px-2 rounded-xl flex flex-col sm:grid sm:grid-cols-12 gap-2 sm:items-center hover:bg-[#F3E6E4]/30 transition-colors cursor-pointer group"
                >
                  {/* Name + Swatch */}
                  <div className="sm:col-span-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-[#EAE2DE] shrink-0 bg-stone-100 flex items-center justify-center shadow-2xs">
                      <img
                        src={p.swatch}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/atelier/swatches.jpg";
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[#4A252B] group-hover:text-[#783751] transition-colors">
                        {p.name}
                      </p>
                      <p className="sm:hidden text-[11px] text-[#81777B]">
                        {p.fabricType} • {p.patterns} patterns
                      </p>
                    </div>
                  </div>

                  {/* Fabric Type */}
                  <div className="hidden sm:block sm:col-span-2 text-xs font-medium text-[#39343A]">
                    {p.fabricType}
                  </div>

                  {/* Patterns */}
                  <div className="hidden sm:block sm:col-span-2 text-xs font-medium text-[#39343A]">
                    {p.patterns}
                  </div>

                  {/* Status Pill Badge */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-start">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold inline-flex items-center ${
                      p.status === 'Completed'
                        ? 'bg-[#F3E6E4] text-[#783751] border border-[#C08274]/40'
                        : p.status === 'In Progress'
                        ? 'bg-sky-50 text-sky-800 border border-sky-200'
                        : 'bg-stone-100 text-stone-600 border border-stone-200'
                    }`}>
                      {p.status}
                    </span>

                    {/* Mobile date */}
                    <span className="sm:hidden text-[11px] text-[#81777B]">
                      {p.lastUpdated}
                    </span>
                  </div>

                  {/* Last Updated & 3-Dots Action */}
                  <div className="hidden sm:flex sm:col-span-2 items-center justify-end gap-2 relative">
                    <span className="text-xs text-[#81777B] font-sans">
                      {p.lastUpdated}
                    </span>

                    {/* Three-dots menu trigger */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(isMenuOpen ? null : p.id);
                      }}
                      className="p-1 rounded-lg text-[#81777B] hover:text-[#4A252B] hover:bg-[#F3E6E4]/40 transition-colors cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {/* Floating Dropdown Menu */}
                    {isMenuOpen && (
                      <div
                        ref={menuRef}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 z-30 w-44 rounded-xl bg-white border border-[#EAE2DE] shadow-lg py-1.5 animate-in fade-in"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/project/${p.id}/result`);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-[#39343A] hover:bg-[#F3E6E4]/40 flex items-center gap-2 cursor-pointer"
                        >
                          <Scissors className="w-3.5 h-3.5 text-[#783751]" />
                          <span>View Layout</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/project/${p.id}/optimize`);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-[#39343A] hover:bg-[#F3E6E4]/40 flex items-center gap-2 cursor-pointer"
                        >
                          <Layers className="w-3.5 h-3.5 text-[#783751]" />
                          <span>Fabric Optimizer</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            navigate(`/project/${p.id}/sustainability`);
                          }}
                          className="w-full px-3 py-1.5 text-left text-xs text-[#39343A] hover:bg-[#F3E6E4]/40 flex items-center gap-2 cursor-pointer"
                        >
                          <BarChart3 className="w-3.5 h-3.5 text-[#783751]" />
                          <span>Sustainability</span>
                        </button>
                        {!p.isDemo && (
                          <button
                            type="button"
                            onClick={(e) => handleOpenDelete(p, e)}
                            className="w-full px-3 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer border-t border-[#EAE2DE] mt-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: "Every pattern has a purpose" Card (4 cols on lg) */}
        <div className="lg:col-span-4 bg-gradient-to-br from-[#F3E6E4] to-[#FBF7F5] rounded-3xl border border-[#EAE2DE] p-6 sm:p-7 shadow-2xs flex flex-col justify-between overflow-hidden relative min-h-[380px]">
          
          {/* Top Text Content */}
          <div className="space-y-3 z-10">
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#4A252B] leading-snug tracking-tight">
              Every pattern <br />
              has a purpose.
            </h3>

            <p className="text-xs sm:text-sm text-[#81777B] leading-relaxed font-sans">
              Design smarter. <br />
              Use resources better. <br />
              Build a circular future.
            </p>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/sustainability')}
                className="w-9 h-9 rounded-full bg-white border border-[#EAE2DE] shadow-xs flex items-center justify-center text-[#783751] hover:scale-105 hover:bg-[#783751] hover:text-white transition-all cursor-pointer"
                title="Explore Sustainability"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Bottom Editorial Texture Photo */}
          <div className="rounded-2xl overflow-hidden border border-[#EAE2DE] shadow-2xs mt-6 aspect-4/3 w-full bg-stone-100">
            <img
              src="/atelier/dashboard_pattern_purpose.jpg"
              alt="Artisanal organic linen fabric draped in atelier"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/atelier/swatches.jpg";
              }}
            />
          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(projectToDelete)}
        onClose={handleCancelDelete}
        title="Delete Cutting Project"
        subtitle="Permanent removal of marker and project specifications"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-semibold text-stone-900">
                Are you sure you want to delete <span className="font-bold text-rose-900">"{projectToDelete?.name}"</span>?
              </p>
              <p className="text-stone-600 leading-relaxed">
                This action cannot be undone. All associated pattern piece specifications, nesting coordinates, cutting calculations, and sustainability statistics will be removed.
              </p>
            </div>
          </div>

          {deleteError && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{deleteError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE2DE]">
            <button
              type="button"
              onClick={handleCancelDelete}
              disabled={isDeleting}
              className="px-3.5 py-2 rounded-xl text-xs font-medium border border-[#EAE2DE] text-[#39343A] hover:bg-[#F3E6E4]/40 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleExecuteDelete}
              disabled={isDeleting}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-700 text-white hover:bg-rose-800 transition-colors shadow-xs cursor-pointer"
            >
              {isDeleting ? 'Deleting...' : 'Delete Project'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
