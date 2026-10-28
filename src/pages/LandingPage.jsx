import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowRight, 
  Leaf, 
  Scissors, 
  Cpu, 
  ChevronRight,
  Layers,
  Compass,
  FileCheck2,
  Gauge,
  Sparkles,
  LogIn,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Recycle,
  Play,
  Maximize2,
  Package,
  Clock,
  Award
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { FabricCanvas } from '../components/fabric/FabricCanvas';
import { useProjects } from '../context/useProjects';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from '../components/common/AuthModal';

export function LandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { projects } = useProjects();
  const { isAuthenticated, signOut } = useAuth();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  useEffect(() => {
    if (searchParams.get('login') === 'true') {
      setIsAuthModalOpen(true);
      setAuthModalMode('signin');
    }
  }, [searchParams]);

  const demoProject = (projects.find(p => p.layoutPlacements && p.layoutPlacements.length > 0) || (projects[0]?.layoutPlacements?.length > 0 ? projects[0] : null)) || {
    id: 'proj-1',
    name: 'Summer Shirt Collection',
    productType: 'Shirt',
    fabricType: 'Organic Cotton Poplin',
    fabricWidth: 150,
    fabricLength: 500,
    patterns: [
      { id: 'p1', name: 'Front Bodice', width: 45, height: 60, quantity: 2, shapeType: 'front-bodice', color: '#78253B' },
      { id: 'p2', name: 'Back Bodice', width: 45, height: 62, quantity: 2, shapeType: 'back-bodice', color: '#4A1523' },
      { id: 'p3', name: 'Sleeve', width: 32, height: 48, quantity: 2, shapeType: 'sleeve', color: '#059669' },
      { id: 'p4', name: 'Collar & Stand', width: 38, height: 16, quantity: 2, shapeType: 'collar', color: '#D97706' },
      { id: 'p5', name: 'Yoke', width: 44, height: 18, quantity: 1, shapeType: 'yoke', color: '#0284C7' }
    ],
    status: 'Completed',
    utilization: 94.2,
    markerUtilization: 94.2,
    actualLengthUsedM: 0.91,
    fabricSavedMeters: 4.3,
    layoutPlacements: [
      { id: 'p1-1', name: 'Front Bodice (L)', x: 0.5, y: 0.5, width: 45, height: 60, rotation: 0, color: '#78253B' },
      { id: 'p1-2', name: 'Front Bodice (R)', x: 46.0, y: 0.5, width: 45, height: 60, rotation: 180, color: '#78253B' },
      { id: 'p2-1', name: 'Back Bodice (L)', x: 91.5, y: 0.5, width: 45, height: 62, rotation: 0, color: '#4A1523' },
      { id: 'p2-2', name: 'Back Bodice (R)', x: 0.5, y: 61.5, width: 45, height: 62, rotation: 180, color: '#4A1523' },
      { id: 'p3-1', name: 'Sleeve (L)', x: 46.0, y: 61.5, width: 32, height: 48, rotation: 0, color: '#059669' },
      { id: 'p3-2', name: 'Sleeve (R)', x: 78.5, y: 61.5, width: 32, height: 48, rotation: 180, color: '#059669' },
      { id: 'p4-1', name: 'Collar', x: 111.0, y: 63.0, width: 38, height: 16, rotation: 90, color: '#D97706' },
      { id: 'p4-2', name: 'Stand', x: 127.5, y: 63.0, width: 22, height: 14, rotation: 0, color: '#D97706' },
      { id: 'p5-1', name: 'Yoke', x: 91.5, y: 63.0, width: 44, height: 18, rotation: 0, color: '#0284C7' }
    ]
  };

  const handleEnterWorkspace = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF8F5] text-[#2E2219] selection:bg-[#FDF2F4] selection:text-[#78253B]">
      
      {/* ========================================================
          1. TOP ATELIER NAVIGATION BAR
          ======================================================== */}
      <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-cream-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-crimson-700 to-crimson-900 text-white flex items-center justify-center shadow-md shadow-crimson-900/10">
            <Leaf className="w-5 h-5 text-crimson-100" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-serif text-xl font-bold text-stone-900 tracking-tight">
              Loom & Layer
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cream-100 text-crimson-800 font-bold border border-cream-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              CAD Atelier
            </span>
          </div>
        </div>

        {/* Center: Anchor Links */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold text-stone-600">
          <a href="#nesting" className="hover:text-crimson-700 transition-colors">Nesting Engine</a>
          <a href="#features" className="hover:text-crimson-700 transition-colors">CAD Architecture</a>
          <a href="#workflow" className="hover:text-crimson-700 transition-colors">4-Step Workflow</a>
          <a href="#rethread" className="hover:text-crimson-700 transition-colors">Circular ReThread</a>
          <a href="#benchmarks" className="hover:text-crimson-700 transition-colors">ESG Benchmarks</a>
        </nav>

        {/* Right Corner: Workspace Access */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleEnterWorkspace}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-crimson-700 to-crimson-800 hover:from-crimson-800 hover:to-crimson-900 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-crimson-900/15 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <span>Launch Studio Atelier</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* ========================================================
          2. HAUTE ATELIER HERO SECTION
          ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-16 lg:pb-28 border-b border-cream-200/90 atelier-mesh-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
            
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-crimson-50 border border-crimson-200/80 text-crimson-800 text-xs font-mono font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-crimson-600" />
                <span>Next-Gen Irregular CAD Nesting Engine</span>
              </div>

              {/* Authoritative atelier headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-stone-900 tracking-tight leading-[1.12]">
                The Intelligent Cutting Room for Modern Apparel.
              </h1>

              <p className="text-base sm:text-lg text-stone-600 font-normal leading-relaxed max-w-xl">
                High-density 2D strip-packing for garment ateliers and industrial cutting rooms. Maximize roll yield, enforce warp and weft grainlines, bypass fabric defects, and export production-ready CAM DXF toolpaths.
              </p>

              {/* CTAs with cloth buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/project/new')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-crimson-700 to-crimson-800 hover:from-crimson-800 hover:to-crimson-900 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-crimson-900/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <span>Start a New Cut Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleEnterWorkspace}
                  className="px-5 py-3 rounded-xl bg-white border border-cream-200 hover:border-crimson-300 text-stone-800 font-semibold text-sm flex items-center gap-2 shadow-2xs hover:bg-cream-50 transition-all cursor-pointer"
                >
                  <span>Explore Atelier Dashboard</span>
                </button>
              </div>

              {/* Technical Benchmarks (Concrete & Attributed) */}
              <div className="pt-6 border-t border-cream-200 grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold font-mono text-stone-900">94.6%</div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">Peak Marker Yield</div>
                  <div className="text-[10px] text-emerald-700 font-mono font-bold">+12.4% vs manual</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold font-mono text-crimson-700">18.4 m</div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">Fabric Saved Along Bolt</div>
                  <div className="text-[10px] text-stone-500 font-mono">Zero waste target</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold font-mono text-stone-900">&lt; 0.5s</div>
                  <div className="text-xs text-stone-600 font-medium mt-0.5">SAT Convergence</div>
                  <div className="text-[10px] text-stone-500 font-mono">Client-side WebWorker</div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Fabric-Cutting Preview */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl bg-white border border-cream-200/90 shadow-atelier-lg overflow-hidden p-4 sm:p-5 transition-all">
                {/* Visual Header Pill */}
                <div className="flex items-center justify-between pb-3 px-1 border-b border-cream-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-crimson-700 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-stone-800 uppercase tracking-wider">
                      Live CAD Marker Canvas • 150cm Roll
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    94.2% Yield
                  </span>
                </div>

                {/* Interactive Fabric Canvas Preview */}
                <div className="mt-3.5 rounded-2xl overflow-hidden border border-cream-200">
                  <FabricCanvas
                    project={demoProject}
                    compact={true}
                    interactive={false}
                  />
                </div>

                {/* Pattern labels indicator */}
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 px-1 text-xs font-medium text-stone-500">
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="text-stone-400">Pieces:</span>
                    <span className="px-2 py-0.5 rounded-md bg-crimson-50 text-crimson-800 border border-crimson-200 font-bold">FRONT (2)</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 border border-stone-200 font-bold">BACK (2)</span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">SLEEVE (2)</span>
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-bold">COLLAR</span>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-crimson-700 hover:text-crimson-900 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Launch Full Canvas</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================
          3. INDUSTRY PROVEN STATS & CUTTER MARQUEE
          ======================================================== */}
      <section className="py-8 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-stone-400">
              Compatible Industrial CAM Cutters:
            </div>
            <div className="flex flex-wrap items-center gap-6 sm:gap-10 text-stone-500 font-serif font-bold text-base sm:text-lg">
              <span>GERBER Technology</span>
              <span>LECTRA Vector</span>
              <span>EASTMAN Cutting</span>
              <span>ZÜND Digital</span>
              <span>BULLMER CNC</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. FEATURE CARDS: ATELIER ARCHITECTURE
          ======================================================== */}
      <section id="features" className="py-20 bg-cream-50/60 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-crimson-700">
              Precision Engineering
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Engineered for Haute Couture & Apparel Production
            </h2>
            <p className="text-sm text-stone-600">
              Deterministic geometry packing algorithms built to reduce raw material expenditure and shorten cutting cycles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-3xl border border-cream-200 p-7 shadow-atelier flex flex-col justify-between hover:border-crimson-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-crimson-50 border border-crimson-200 flex items-center justify-center text-crimson-700 mb-6 group-hover:scale-110 transition-transform">
                  <Cpu className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                  Multi-Orientation Heuristic Nesting
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Evaluates candidate placements across allowed rotational increments (0°, 90°, 180°, 270°) to compact irregular garment pieces with millimeter clearance tolerances.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cream-100 flex items-center gap-2 text-xs font-mono font-bold text-crimson-700">
                <Layers className="w-4 h-4" />
                <span>Separation Axis Theorem (SAT)</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-3xl border border-cream-200 p-7 shadow-atelier flex flex-col justify-between hover:border-crimson-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-6 group-hover:scale-110 transition-transform">
                  <Scissors className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                  Warp & Weft Grainline Enforcement
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Preserves textile drape integrity by strictly respecting vertical, horizontal, or bias grain constraints. Avoids skewing in silks, denims, and woven poplins.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cream-100 flex items-center gap-2 text-xs font-mono font-bold text-emerald-700">
                <Compass className="w-4 h-4" />
                <span>Grainline Alignment Verification</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-3xl border border-cream-200 p-7 shadow-atelier flex flex-col justify-between hover:border-crimson-300 transition-all group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 mb-6 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">
                  Live Fabric Defect Avoidance
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Register weave defects, slubs, or oil marks on the textile roll. The nesting engine automatically calculates clearance buffers and navigates pattern pieces around obstacles.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-cream-100 flex items-center gap-2 text-xs font-mono font-bold text-amber-700">
                <FileCheck2 className="w-4 h-4" />
                <span>0 Defect Collisions Invariant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. BEFORE & AFTER COMPARISON: MANUAL VS AI NESTING
          ======================================================== */}
      <section id="nesting" className="py-20 bg-white border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-700">
              Yield Comparison
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              Manual Marker Layout vs. Loom & Layer AI
            </h2>
            <p className="text-sm text-stone-600">
              See how algorithmic continuous-strip packing recovers lost linear meters along the textile roll.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Manual Layout */}
            <div className="p-6 rounded-3xl border border-rose-200 bg-rose-50/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-rose-800">Standard Practice</span>
                  <h4 className="text-lg font-bold text-stone-900">Manual Cutting Room Layout</h4>
                </div>
                <div className="px-3 py-1 rounded-full bg-rose-100 text-rose-800 font-mono text-xs font-bold">
                  78.6% Yield
                </div>
              </div>

              <div className="h-44 rounded-2xl bg-white border border-rose-200/80 p-4 flex items-center justify-center relative overflow-hidden">
                <div className="w-full space-y-2 text-center">
                  <div className="flex justify-around items-center opacity-60">
                    <div className="w-20 h-24 bg-stone-300 rounded border border-stone-400" />
                    <div className="w-20 h-24 bg-stone-300 rounded border border-stone-400" />
                    <div className="w-20 h-24 bg-stone-300 rounded border border-stone-400" />
                  </div>
                  <p className="text-[11px] font-mono text-rose-700 font-bold">Large irregular scrap pockets • 491 cm cut length</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-stone-600 font-mono">
                <div>• Linear Fabric Cut: 491.0 cm</div>
                <div>• Off-Cut Scrap: 21.4%</div>
                <div>• Spacing: Variable (1.5 - 3.0cm)</div>
                <div>• Defect Check: Manual visual only</div>
              </div>
            </div>

            {/* Loom & Layer AI Layout */}
            <div className="p-6 rounded-3xl border border-emerald-300 bg-emerald-50/40 space-y-4 relative shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono font-bold uppercase text-emerald-800">Loom & Layer Optimizer</span>
                  <h4 className="text-lg font-bold text-stone-900">Autonomous Heuristic Nesting</h4>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-600 text-white font-mono text-xs font-bold shadow-xs">
                  94.2% Yield (+15.6 pp)
                </div>
              </div>

              <div className="h-44 rounded-2xl bg-white border border-emerald-200 p-4 flex items-center justify-center relative overflow-hidden">
                <div className="w-full space-y-2 text-center">
                  <div className="flex justify-around items-center">
                    <div className="w-20 h-24 bg-crimson-700/20 rounded border border-crimson-700/50 rotate-3" />
                    <div className="w-20 h-24 bg-stone-700/20 rounded border border-stone-700/50 -rotate-2" />
                    <div className="w-20 h-24 bg-emerald-700/20 rounded border border-emerald-700/50 rotate-1" />
                  </div>
                  <p className="text-[11px] font-mono text-emerald-700 font-bold">Interlocking contours • 465.5 cm cut length (25.5cm saved)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-stone-600 font-mono">
                <div>• Linear Fabric Cut: 465.5 cm</div>
                <div className="text-emerald-700 font-bold">• Off-Cut Scrap: 5.8% (Minimum)</div>
                <div>• Spacing: Exact 0.5cm clearance</div>
                <div className="text-emerald-700 font-bold">• Defect Check: Autonomous avoidance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FOUR-STEP ATELIER WORKFLOW
          ======================================================== */}
      <section id="workflow" className="py-20 bg-cream-50/50 border-b border-cream-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-crimson-700">
              Workflow Pipeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
              From Roll Specifications to CNC Cut Plan
            </h2>
            <p className="text-sm text-stone-600">
              Four deterministic steps to prepare, nest, and verify cutting markers.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-atelier space-y-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                01
              </div>
              <h3 className="font-bold text-stone-900 text-base">Define Fabric Roll</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Set roll width, total length, selvage offset margins, and textile characteristics (Poplin, Denim, Linen, or Silk).
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-atelier space-y-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                02
              </div>
              <h3 className="font-bold text-stone-900 text-base">Scan or Input Patterns</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Digitize paper patterns via web camera edge recognition or specify parametric garments with target bundle quantities.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-atelier space-y-3">
              <div className="w-9 h-9 rounded-xl bg-stone-900 text-white font-mono font-bold text-sm flex items-center justify-center">
                03
              </div>
              <h3 className="font-bold text-stone-900 text-base">Solve & Avoid Defects</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Execute heuristic 2D bin packing to compute collision-free, grainline-locked pattern layouts in under 0.5s.
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-cream-200 p-6 shadow-atelier space-y-3">
              <div className="w-9 h-9 rounded-xl bg-crimson-700 text-white font-mono font-bold text-sm flex items-center justify-center">
                04
              </div>
              <h3 className="font-bold text-stone-900 text-base">Export CAM & ReThread</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Download optimized AutoCAD DXF toolpaths for CNC cutting and automatically match scrap pieces with ReThread upcycling.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          7. BOTTOM INDUSTRIAL ATELIER CTA BANNER
          ======================================================== */}
      <section className="py-20 bg-stone-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-emerald-400 border border-stone-800 text-xs font-mono font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Industrial CAD Precision • Ready for Production</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Ready to eliminate fabric waste in your cutting room?
          </h2>

          <p className="text-stone-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Create your first automated marker project, evaluate pattern layouts, and measure fabric scrap reduction immediately.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/project/new')}
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-crimson-600 to-crimson-700 hover:from-crimson-700 hover:to-crimson-800 text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-crimson-900/30 hover:scale-[1.02] transition-all cursor-pointer"
            >
              <span>Launch First Cut Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleEnterWorkspace}
              className="px-6 py-3.5 rounded-xl bg-stone-900 text-stone-200 border border-stone-800 hover:bg-stone-850 hover:text-white font-semibold text-sm transition-all cursor-pointer"
            >
              Enter Atelier Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* Atelier Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
