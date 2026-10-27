import React, { useState } from 'react';
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
  ChevronDown 
} from 'lucide-react';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';
import { EmailReportModal } from '../components/common/EmailReportModal';
import { generatePrintableSustainabilityReportHTML } from '../utils/cuttingPlanGenerator';

export function ReportsPage() {
  const { projects } = useProjects();
  const { profile } = useUserProfile();
  const [activeTab, setActiveTab] = useState('Overview');
  const [dateRange, setDateRange] = useState('6months');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const tabs = ['Overview', 'Projects', 'Fabric Usage', 'Waste Reduction', 'Product Upcycling'];

  // Top metrics
  const totalProjects = projects.length || 12;
  const totalFabricUsed = '142.6';
  const totalWasteReduced = '48.2';
  const productsUpcycled = 156;

  // Garment type breakdown
  const garmentTypes = [
    { label: 'Tops', percent: 38, count: 46 },
    { label: 'Bottoms', percent: 26, count: 31 },
    { label: 'Dresses', percent: 18, count: 22 },
    { label: 'Outerwear', percent: 12, count: 14 },
    { label: 'Others', percent: 6, count: 7 }
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

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. HEADER BAR (Reference Screen 7)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#EAE2DE] shadow-xs bg-[#F3E6E4] shrink-0">
            <img
              src={profile?.avatar || "/atelier/user_avatar.jpg"}
              alt={profile?.name || "Designer"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/atelier/user_avatar.jpg";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#4A252B] tracking-tight">
              Reports
            </h1>
            <p className="text-xs text-[#81777B]">
              Analyse project insights, fabric usage, and sustainability impact.
            </p>
          </div>
        </div>

        {/* Date Selector & Export */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-white border border-[#EAE2DE] rounded-xl px-3 py-1.5 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[#81777B]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent font-semibold text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="1month">Last Month</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#EAE2DE] text-[#783751] hover:bg-[#F3E6E4]/40 transition-colors shadow-2xs cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Report</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. NAVIGATION TABS (Reference Screen 7)
          ======================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-medium scrollbar-none">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-[#783751] text-white font-semibold shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-[#FBF7F5] border border-[#EAE2DE]'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ========================================================
          3. METRIC CARDS ROW (Reference Screen 7)
          ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        
        {/* Total Projects */}
        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-medium text-[#81777B]">Total Projects</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">{totalProjects}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#783751] flex items-center justify-center shrink-0">
            <FolderPlus className="w-5 h-5 text-[#783751]" />
          </div>
        </div>

        {/* Total Fabric Used */}
        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-medium text-[#81777B]">Total Fabric Used</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">{totalFabricUsed} m²</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#783751] flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 text-[#783751]" />
          </div>
        </div>

        {/* Total Waste Reduced */}
        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-medium text-[#81777B]">Total Waste Reduced</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">{totalWasteReduced} kg</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#C08274] flex items-center justify-center shrink-0">
            <Recycle className="w-5 h-5 text-[#C08274]" />
          </div>
        </div>

        {/* Upcycled Products */}
        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-medium text-[#81777B]">Upcycled Products</p>
            <p className="text-2xl font-serif font-bold text-[#4A252B] mt-0.5">{productsUpcycled}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#F0DCD2] text-[#783751] flex items-center justify-center shrink-0">
            <ShoppingBag className="w-5 h-5 text-[#783751]" />
          </div>
        </div>

      </div>

      {/* ========================================================
          4. MIDDLE SECTION: TREND CHART + TOP GARMENT TYPES
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Fabric Utilization Trend (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#EAE2DE] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#4A252B]">
              Fabric Utilization Trend
            </h2>
            <div className="flex items-center gap-1.5 text-[11px] text-[#783751] font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#783751]" />
              <span>Utilization Rate</span>
            </div>
          </div>

          {/* SVG Smooth Curve Line Chart */}
          <div className="pt-2">
            <div className="h-44 w-full relative">
              <svg viewBox="0 0 500 160" className="w-full h-full overflow-visible">
                {/* Horizontal Grid lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#EAE2DE" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="500" y2="60" stroke="#EAE2DE" strokeDasharray="3 3" />
                <line x1="0" y1="100" x2="500" y2="100" stroke="#EAE2DE" strokeDasharray="3 3" />
                <line x1="0" y1="140" x2="500" y2="140" stroke="#EAE2DE" />

                {/* Shaded Area */}
                <path
                  d="M 20 120 C 100 110, 160 100, 220 90 C 280 80, 360 65, 480 40 L 480 140 L 20 140 Z"
                  fill="url(#trendGrad)"
                />
                
                {/* Curve Line */}
                <path
                  d="M 20 120 C 100 110, 160 100, 220 90 C 280 80, 360 65, 480 40"
                  fill="none"
                  stroke="#783751"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Circular Nodes */}
                {[
                  { cx: 20, cy: 120, label: '72%' },
                  { cx: 110, cy: 110, label: '76%' },
                  { cx: 200, cy: 95, label: '79%' },
                  { cx: 290, cy: 80, label: '82%' },
                  { cx: 380, cy: 62, label: '85%' },
                  { cx: 480, cy: 40, label: '88%' }
                ].map((pt, i) => (
                  <g key={i}>
                    <circle cx={pt.cx} cy={pt.cy} r="4" fill="white" stroke="#783751" strokeWidth="2.5" />
                  </g>
                ))}

                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#783751" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#783751" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Month Labels */}
              <div className="flex justify-between text-[11px] font-mono text-[#81777B] mt-2 px-2">
                {trendMonths.map((m, i) => (
                  <span key={i}>{m.month}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Garment Types (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#EAE2DE] p-5 sm:p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-semibold text-[#4A252B]">
            Top Garment Types
          </h2>

          <div className="space-y-3.5 pt-1">
            {garmentTypes.map((g, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-stone-800">{g.label}</span>
                  <span className="font-mono font-bold text-stone-900">{g.percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#FBF7F5] overflow-hidden border border-[#EAE2DE]">
                  <div
                    className="h-full bg-[#783751] rounded-full transition-all duration-300"
                    style={{ width: `${g.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

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
          wasteReduced: `${totalWasteReduced} m²`
        }}
        fileName="Loom_Layer_Production_Overview_Report"
      />

    </div>
  );
}
