import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Mail,
  FolderPlus, 
  Leaf, 
  Recycle, 
  ShoppingBag, 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  Layers, 
  ChevronDown,
  ArrowRight,
  Scissors,
  Sliders,
  Sparkles,
  CheckCircle2,
  Search,
  Scale,
  Activity,
  Droplets,
  Wind
} from 'lucide-react';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';
import { EmailReportModal } from '../components/common/EmailReportModal';
import { 
  generatePrintableSustainabilityReportHTML, 
  generatePerformanceOverviewReportHTML,
  generateCuttingPlan,
  exportCuttingPlanToDXF,
  downloadFile
} from '../utils/cuttingPlanGenerator';
import { downloadHTMLAsPDF } from '../utils/pdfExportService';

export function ReportsPage() {
  const navigate = useNavigate();
  const { projects } = useProjects();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState('Overview');
  const [dateRange, setDateRange] = useState('6months');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [exporting, setExporting] = useState(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const tabs = ['Overview', 'Projects', 'Fabric Usage', 'Waste Reduction', 'Product Upcycling'];

  // Top metrics computed from live projects
  const totalProjects = projects.length || 12;
  const totalFabricUsed = projects.length > 0
    ? (projects.reduce((sum, p) => sum + (Number(p.actualLengthUsedM) || (Number(p.fabricLength) || 500) * 0.85 / 100), 0)).toFixed(1)
    : '142.6';
  const totalWasteReduced = projects.length > 0
    ? (projects.reduce((sum, p) => sum + (Number(p.fabricSavedMeters) || 0), 0) * 0.28).toFixed(1)
    : '48.2';
  const productsUpcycled = 156;

  // Curated demo projects if user has few projects
  const displayProjects = useMemo(() => {
    const list = [...projects];
    if (list.length === 0) {
      list.push(
        {
          id: 'proj-1',
          name: 'Summer Shirt Collection',
          productType: 'Shirt',
          fabricType: 'Organic Cotton Poplin',
          fabricWidth: 150,
          fabricLength: 500,
          patterns: [{ quantity: 2 }, { quantity: 2 }, { quantity: 2 }, { quantity: 2 }, { quantity: 1 }],
          utilization: 94.2,
          actualLengthUsedM: 0.91,
          fabricSavedMeters: 4.3,
          status: 'Completed',
          updatedAt: '2026-10-25'
        },
        {
          id: 'proj-2',
          name: 'Heavy Denim Workwear Jacket',
          productType: 'Jacket',
          fabricType: 'Raw Indigo Denim',
          fabricWidth: 160,
          fabricLength: 400,
          patterns: [{ quantity: 4 }, { quantity: 4 }, { quantity: 4 }, { quantity: 2 }],
          utilization: 91.7,
          actualLengthUsedM: 3.60,
          fabricSavedMeters: 6.8,
          status: 'In Progress',
          updatedAt: '2026-10-22'
        },
        {
          id: 'proj-3',
          name: 'Belgian Linen Resortwear Line',
          productType: 'Dress',
          fabricType: 'Belgian Natural Linen',
          fabricWidth: 140,
          fabricLength: 350,
          patterns: [{ quantity: 3 }, { quantity: 3 }, { quantity: 3 }, { quantity: 2 }],
          utilization: 93.8,
          actualLengthUsedM: 3.20,
          fabricSavedMeters: 5.2,
          status: 'Completed',
          updatedAt: '2026-10-18'
        }
      );
    }
    return list;
  }, [projects]);

  // Filtered projects for the Projects tab
  const filteredProjectsList = useMemo(() => {
    return displayProjects.filter(p => {
      if (statusFilter !== 'all' && (p.status || 'Completed').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      if (!projectSearchQuery.trim()) return true;
      const q = projectSearchQuery.toLowerCase().trim();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.fabricType || '').toLowerCase().includes(q) ||
        (p.productType || '').toLowerCase().includes(q)
      );
    });
  }, [displayProjects, statusFilter, projectSearchQuery]);

  // Garment type breakdown
  const garmentTypes = [
    { label: 'Tops & Shirts', percent: 38, count: 46 },
    { label: 'Trousers & Bottoms', percent: 26, count: 31 },
    { label: 'Dresses & Gowns', percent: 18, count: 22 },
    { label: 'Outerwear & Jackets', percent: 12, count: 14 },
    { label: 'Accessories & Linings', percent: 6, count: 7 }
  ];

  // Monthly trend points for SVG line chart
  const trendMonths = [
    { month: 'Jan', rate: 72 },
    { month: 'Feb', rate: 76 },
    { month: 'Mar', rate: 79 },
    { month: 'Apr', rate: 82 },
    { month: 'May', rate: 85 },
    { month: 'Jun', rate: 88 }
  ];

  const handleExport = async () => {
    setExporting(true);
    try {
      const htmlContent = generatePerformanceOverviewReportHTML({
        projects: displayProjects,
        dateRange,
        stats: {
          totalProjects,
          totalFabricUsed,
          totalWasteReduced,
          productsUpcycled,
          garmentTypes,
          trendMonths
        }
      });
      await downloadHTMLAsPDF(htmlContent, `Loom_Layer_Performance_Report_${dateRange}.pdf`, { orientation: 'portrait' });
      setToastMessage('Executive Atelier Performance Report downloaded as PDF!');
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 4500);
    } catch (err) {
      console.error('Error generating executive performance report:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleExportProjectDXF = (project) => {
    try {
      const plan = generateCuttingPlan(project);
      const dxfContent = exportCuttingPlanToDXF(plan);
      const fileName = `${(project.name || 'cutting_plan').replace(/\s+/g, '_').toLowerCase()}.dxf`;
      downloadFile(dxfContent, fileName, 'application/dxf');
      setToastMessage(`CAM DXF vector file exported for "${project.name}"!`);
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 4500);
    } catch (err) {
      console.error('DXF export error:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. ATELIER REPORTS HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#24212D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8E2B45]/15 border border-[#8E2B45]/30 text-[#ECA7B8] flex items-center justify-center shadow-xs shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F3F8] tracking-tight">
              Reports & Performance Ledger
            </h1>
            <p className="text-xs text-[#A8A1B4]">
              Analyse production orders, fabric sensitivity, landfill diversion, and ReThread circular metrics.
            </p>
          </div>
        </div>

        {/* Date Selector & Export */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#A8A1B4] bg-[#1E1B27] border border-[#2E293B] rounded-xl px-3 py-1.5 shadow-2xs font-mono">
            <Calendar className="w-3.5 h-3.5 text-[#8C8499]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-semibold text-[#F5F3F8] focus:outline-none cursor-pointer"
            >
              <option value="1month" className="bg-[#1E1B27] text-white">Last Month</option>
              <option value="6months" className="bg-[#1E1B27] text-white">Last 6 Months</option>
              <option value="1year" className="bg-[#1E1B27] text-white">Last Year</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1E1B27] border border-[#2E293B] text-[#D8D2E1] hover:bg-[#252230] transition-colors shadow-2xs cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-[#ECA7B8]" />
            <span>Email Report</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#8E2B45] hover:bg-[#A13350] text-white transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{exporting ? 'Generating PDF...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {downloadSuccessToast && (
        <div className="py-2.5 px-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-semibold">{toastMessage || 'Report generated successfully!'}</span>
          </div>
          <button type="button" onClick={() => setDownloadSuccessToast(false)} className="text-emerald-400 hover:text-white font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* ========================================================
          2. NAVIGATION TABS
          ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto max-w-full w-full pb-1 text-xs font-medium scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 font-mono text-xs ${
                isActive
                  ? 'bg-[#8E2B45] text-white font-semibold shadow-xs'
                  : 'bg-[#1E1B27] text-[#A8A1B4] hover:text-white border border-[#2E293B]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. TAB 1: OVERVIEW
          ======================================================== */}
      {activeTab === 'Overview' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-mono text-[#8C8499]">Total Projects</p>
                <p className="text-2xl font-serif font-bold text-[#F5F3F8] mt-0.5">{totalProjects}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[#8E2B45]/15 text-[#ECA7B8] border border-[#8E2B45]/30 flex items-center justify-center shrink-0">
                <FolderPlus className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-mono text-[#8C8499]">Total Fabric Used</p>
                <p className="text-2xl font-serif font-bold text-emerald-400 mt-0.5">{totalFabricUsed} m²</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Leaf className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-mono text-[#8C8499]">Total Waste Reduced</p>
                <p className="text-2xl font-serif font-bold text-[#E2A97E] mt-0.5">{totalWasteReduced} kg</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#E2A97E] border border-amber-500/20 flex items-center justify-center shrink-0">
                <Recycle className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-[11px] font-mono text-[#8C8499]">Upcycled Products</p>
                <p className="text-2xl font-serif font-bold text-sky-400 mt-0.5">{productsUpcycled}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Middle Section: Trend Chart + Top Garment Types */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 bg-[#16141D] rounded-2xl border border-[#272332] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-[#F5F3F8]">
                  Fabric Utilization Trend
                </h2>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Yield Trend (+16 pp Avg)</span>
                </div>
              </div>

              <div className="pt-2">
                <div className="h-44 w-full relative">
                  <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                    <line x1="0" y1="20" x2="500" y2="20" stroke="#24212D" strokeDasharray="3 3" />
                    <line x1="0" y1="60" x2="500" y2="60" stroke="#24212D" strokeDasharray="3 3" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#24212D" strokeDasharray="3 3" />
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#24212D" />

                    <path
                      d="M 20 120 C 100 110, 160 100, 220 90 C 280 80, 360 65, 480 40 L 480 140 L 20 140 Z"
                      fill="url(#trendGrad)"
                    />
                    
                    <path
                      d="M 20 120 C 100 110, 160 100, 220 90 C 280 80, 360 65, 480 40"
                      fill="none"
                      stroke="#8E2B45"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {[
                      { cx: 20, cy: 120, label: '72%' },
                      { cx: 110, cy: 110, label: '76%' },
                      { cx: 200, cy: 95, label: '79%' },
                      { cx: 290, cy: 80, label: '82%' },
                      { cx: 380, cy: 62, label: '85%' },
                      { cx: 480, cy: 40, label: '88%' }
                    ].map((pt, i) => (
                      <g key={i}>
                        <circle cx={pt.cx} cy={pt.cy} r="4" fill="#16141D" stroke="#8E2B45" strokeWidth="2.5" />
                      </g>
                    ))}

                    <defs>
                      <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8E2B45" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8E2B45" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="flex justify-between text-[11px] font-mono text-[#8C8499] mt-2 px-2">
                    {trendMonths.map((m, i) => (
                      <span key={i}>{m.month} ({m.rate}%)</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 bg-[#16141D] rounded-2xl border border-[#272332] p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-sm font-semibold text-[#F5F3F8]">
                Top Garment Types
              </h2>

              <div className="space-y-3.5 pt-1">
                {garmentTypes.map((g, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-[#D8D2E1]">{g.label} ({g.count} pcs)</span>
                      <span className="font-mono font-bold text-[#E2A97E]">{g.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-[#111015] overflow-hidden border border-[#24212D]">
                      <div
                        className="h-full bg-gradient-to-r from-[#8E2B45] to-[#C08274] rounded-full transition-all duration-300"
                        style={{ width: `${g.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. TAB 2: PROJECTS
          ======================================================== */}
      {activeTab === 'Projects' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#16141D] border border-[#272332]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-[#8C8499] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={projectSearchQuery}
                onChange={(e) => setProjectSearchQuery(e.target.value)}
                placeholder="Filter by project title, fabric or type..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-[#1E1B27] border border-[#2E293B] text-[#F5F3F8] placeholder-[#7D7588] focus:outline-none focus:border-[#8E2B45]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8C8499] font-mono">Status:</span>
              <div className="flex items-center gap-1 p-1 rounded-xl bg-[#1E1B27] border border-[#2E293B] text-[11px] font-mono">
                {['all', 'completed', 'in progress', 'draft'].map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                      statusFilter === st
                        ? 'bg-[#8E2B45] text-white font-bold'
                        : 'text-[#A8A1B4] hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#272332] bg-[#16141D] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#24212D] text-[#8C8499] font-mono text-[11px] bg-[#141219]">
                    <th className="py-3 px-4">Project Name</th>
                    <th className="py-3 px-4">Garment / Fabric</th>
                    <th className="py-3 px-4">Bolt Dimensions</th>
                    <th className="py-3 px-4">Pieces</th>
                    <th className="py-3 px-4">Marker Yield</th>
                    <th className="py-3 px-4">Fabric Saved</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24212D]">
                  {filteredProjectsList.map((p, idx) => {
                    const pieceCount = p.patterns?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || p.totalPieces || 8;
                    const yieldRate = Number(p.utilization) || 92.5;
                    const saved = p.fabricSavedMeters || ((Number(p.fabricLength) || 500) * 0.12 / 100).toFixed(1);
                    return (
                      <tr key={p.id || idx} className="hover:bg-[#1E1B27]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#F5F3F8]">
                          {p.name || `Order #${idx + 1}`}
                        </td>
                        <td className="py-3 px-4 text-[#A8A1B4]">
                          {p.productType || 'Shirt'} • <span className="text-[#D8D2E1]">{p.fabricType || 'Cotton Poplin'}</span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#A8A1B4]">
                          {p.fabricWidth || 150}cm × {p.fabricLength || 500}cm
                        </td>
                        <td className="py-3 px-4 font-mono text-[#F5F3F8]">
                          {pieceCount} pcs
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                            {yieldRate}%
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-[#ECA7B8] font-semibold">
                          +{saved} m
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                            (p.status || 'Completed') === 'Completed'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                          }`}>
                            {p.status || 'Completed'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => navigate(`/project/${p.id}/result`)}
                              className="px-2.5 py-1 rounded-lg bg-[#1E1B27] border border-[#2E293B] text-[#D8D2E1] hover:text-white hover:bg-[#252230] transition-colors cursor-pointer text-[11px]"
                            >
                              CAD
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExportProjectDXF(p)}
                              className="px-2.5 py-1 rounded-lg bg-[#8E2B45] text-white hover:bg-[#A13350] transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                              title="Export DXF file"
                            >
                              <Download className="w-3 h-3" /> DXF
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          5. TAB 3: FABRIC USAGE
          ======================================================== */}
      {activeTab === 'Fabric Usage' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Roll Width Sensitivity Card */}
            <div className="lg:col-span-2 bg-[#16141D] rounded-2xl border border-[#272332] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#24212D]">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F3F8] flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#ECA7B8]" />
                    <span>Roll Width Sensitivity Analysis</span>
                  </h3>
                  <p className="text-xs text-[#A8A1B4]">Comparing nesting yield efficiency across standard commercial bolt widths</p>
                </div>
                <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  150cm Recommended
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#F5F3F8]">Narrow (140 cm)</span>
                    <span className="font-mono text-amber-400 font-bold">91.2%</span>
                  </div>
                  <div className="w-full bg-[#111015] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[91.2%]" />
                  </div>
                  <p className="text-[11px] text-[#A8A1B4]">Scrap waste: 8.8% • Linear cut: 512 cm</p>
                </div>

                <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#8E2B45] shadow-xs space-y-2 relative">
                  <span className="absolute -top-2 right-3 px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#8E2B45] text-white uppercase">
                    Optimal
                  </span>
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#F5F3F8]">Standard (150 cm)</span>
                    <span className="font-mono text-emerald-400 font-bold">94.6%</span>
                  </div>
                  <div className="w-full bg-[#111015] h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94.6%]" />
                  </div>
                  <p className="text-[11px] text-[#A8A1B4]">Scrap waste: 5.4% • Linear cut: 465 cm</p>
                </div>

                <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#F5F3F8]">Wide (160 cm)</span>
                    <span className="font-mono text-sky-400 font-bold">93.8%</span>
                  </div>
                  <div className="w-full bg-[#111015] h-2 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full w-[93.8%]" />
                  </div>
                  <p className="text-[11px] text-[#A8A1B4]">Scrap waste: 6.2% • Linear cut: 440 cm</p>
                </div>
              </div>

              <p className="text-xs text-[#A8A1B4] leading-relaxed pt-1">
                Sourcing 150cm poplin rolls yields a <strong>+3.4 pp efficiency advantage</strong> over 140cm rolls for garment bodice sets, minimizing linear run costs by €2.14 per garment.
              </p>
            </div>

            {/* Mounted Bolt Inventory */}
            <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-5 shadow-sm space-y-3.5">
              <h3 className="text-sm font-bold text-[#F5F3F8]">Mounted Bolt Stock</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[#F5F3F8]">
                    <span>Organic Cotton Poplin</span>
                    <span className="font-mono text-emerald-400">4.09m</span>
                  </div>
                  <div className="w-full bg-[#111015] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[82%]" />
                  </div>
                  <span className="text-[10px] text-[#8C8499] font-mono">Lot #CT-889 • 150cm width</span>
                </div>

                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[#F5F3F8]">
                    <span>Raw Indigo Denim</span>
                    <span className="font-mono text-sky-400">0.40m</span>
                  </div>
                  <div className="w-full bg-[#111015] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-sky-500 h-full w-[90%]" />
                  </div>
                  <span className="text-[10px] text-[#8C8499] font-mono">Lot #DN-102 • 160cm width</span>
                </div>

                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-[#F5F3F8]">
                    <span>Belgian Natural Linen</span>
                    <span className="font-mono text-amber-400">0.30m</span>
                  </div>
                  <div className="w-full bg-[#111015] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full w-[92%]" />
                  </div>
                  <span className="text-[10px] text-[#8C8499] font-mono">Lot #LN-405 • 140cm width</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          6. TAB 4: WASTE REDUCTION & ESG AUDIT
          ======================================================== */}
      {activeTab === 'Waste Reduction' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#16141D] border border-[#272332] space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C8499]">
                <Leaf className="w-4 h-4 text-emerald-400" />
                <span>Textile Landfill Diversion</span>
              </div>
              <div className="text-3xl font-serif font-bold text-emerald-400">
                {totalWasteReduced} <span className="text-sm font-sans text-[#8C8499]">kg</span>
              </div>
              <p className="text-xs text-[#A8A1B4] leading-relaxed">
                Calculated on basis weight standard of 280 g/m² across all completed production cut lays.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#16141D] border border-[#272332] space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C8499]">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Freshwater Conservation</span>
              </div>
              <div className="text-3xl font-serif font-bold text-sky-400">
                {(Number(totalWasteReduced) * 1400).toLocaleString('en-US')} <span className="text-sm font-sans text-[#8C8499]">L</span>
              </div>
              <p className="text-xs text-[#A8A1B4] leading-relaxed">
                Estimated embedded agricultural & wet-processing proxy factor (1,400 L/kg textile fiber).
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#16141D] border border-[#272332] space-y-2 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-mono text-[#8C8499]">
                <Wind className="w-4 h-4 text-amber-400" />
                <span>Avoided Carbon Emissions</span>
              </div>
              <div className="text-3xl font-serif font-bold text-amber-400">
                {(Number(totalWasteReduced) * 6.8).toFixed(1)} <span className="text-sm font-sans text-[#8C8499]">kg CO2e</span>
              </div>
              <p className="text-xs text-[#A8A1B4] leading-relaxed">
                Life-cycle assessment proxy factor (6.8 kg CO2e per kg raw textile produced).
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#16141D] border border-[#272332] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-[#F5F3F8]">Before vs. After Algorithmic Nesting Benchmark</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-2">
                <span className="text-xs font-bold text-[#A8A1B4]">Manual Atelier Benchmark</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-[#F5F3F8]">78.6%</span>
                  <span className="text-xs text-rose-400 font-mono">(21.4% Scrap Waste)</span>
                </div>
                <div className="w-full bg-[#111015] h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-400 h-full w-[78.6%]" />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#8E2B45] space-y-2 shadow-xs">
                <span className="text-xs font-bold text-emerald-400">AI Continuous Vector Nesting</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono text-emerald-400">94.2%</span>
                  <span className="text-xs text-emerald-500 font-mono">(+15.6 pp Efficiency Gain)</span>
                </div>
                <div className="w-full bg-[#111015] h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[94.2%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          7. TAB 5: PRODUCT UPCYCLING (RETHREAD)
          ======================================================== */}
      {activeTab === 'Product Upcycling' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-8 bg-[#16141D] rounded-2xl border border-[#272332] p-5 sm:p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#24212D]">
                <div>
                  <h3 className="text-sm font-bold text-[#F5F3F8] flex items-center gap-2">
                    <Recycle className="w-4 h-4 text-[#E2A97E]" />
                    <span>ReThread Circular Production Batch</span>
                  </h3>
                  <p className="text-xs text-[#A8A1B4]">Automated remnant geometry matching from cut-order offcuts</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#E2A97E] bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  ₹340.00 Gross Value
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
                <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5">
                  <span className="text-xs font-bold text-[#F5F3F8]">Silk & Poplin Scrunchies</span>
                  <p className="text-xl font-bold font-mono text-emerald-400">18 pcs</p>
                  <p className="text-[11px] text-[#A8A1B4]">Est. retail: ₹90.00 (₹5/pc)</p>
                </div>

                <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5">
                  <span className="text-xs font-bold text-[#F5F3F8]">Denim Workwear Bandanas</span>
                  <p className="text-xl font-bold font-mono text-sky-400">12 pcs</p>
                  <p className="text-[11px] text-[#A8A1B4]">Est. retail: ₹144.00 (₹12/pc)</p>
                </div>

                <div className="p-4 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5">
                  <span className="text-xs font-bold text-[#F5F3F8]">Patchwork Tote Liners</span>
                  <p className="text-xl font-bold font-mono text-[#ECA7B8]">18 pcs</p>
                  <p className="text-[11px] text-[#A8A1B4]">Est. retail: ₹106.00</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-[#A8A1B4]">
                  Zero landfill waste: 100% of remnants &gt;12cm width are routed to circular accessories.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('/rethread')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8E2B45] hover:bg-[#A13350] text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <span>Open ReThread Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#16141D] rounded-2xl border border-[#272332] p-5 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#F5F3F8]">Circular Economy Impact</h4>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1">
                  <span className="font-bold text-[#F5F3F8]">Material Salvage Rate</span>
                  <p className="text-lg font-bold font-mono text-emerald-400">92.4%</p>
                  <p className="text-[10px] text-[#8C8499]">Remnants repurposed into micro-accessories</p>
                </div>
                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1">
                  <span className="font-bold text-[#F5F3F8]">Atelier Gross Margin</span>
                  <p className="text-lg font-bold font-mono text-[#E2A97E]">+14.2%</p>
                  <p className="text-[10px] text-[#8C8499]">From zero-cost raw material remnants</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Report Modal */}
      <EmailReportModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        defaultEmail={profile?.email || 'designer@atelier.com'}
        recipientName={profile?.name || 'Designer'}
        projectName={projects?.[0]?.name || 'Loom & Layer Production Overview'}
        reportType="Atelier Production & ESG Report"
        reportContent={projects?.[0] ? generatePrintableSustainabilityReportHTML(projects[0]) : ''}
        metrics={{
          utilization: 88,
          fabricSaved: `${totalFabricUsed} m`,
          wasteReduced: `${totalWasteReduced} kg`
        }}
        fileName="Loom_Layer_Production_Overview_Report"
      />

    </div>
  );
}
