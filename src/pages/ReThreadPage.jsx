import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Scissors, 
  Layers, 
  Sparkles, 
  Leaf, 
  Search, 
  Bell,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Maximize2, 
  MoveHorizontal,
  Bookmark, 
  BookmarkCheck, 
  Printer, 
  Check, 
  X,
  LayoutGrid,
  Columns,
  SlidersHorizontal,
  CheckCircle2,
  Info,
  PackageCheck,
  Scale
} from 'lucide-react';
import { useUserProfile } from '../context/useUserProfile';
import { evaluateScrapRecommendations, RETHREAD_PRODUCTS } from '../utils/rethreadCatalog';

const SAVED_PLANS_KEY = 'rethread_saved_plans_v1';

export function ReThreadPage() {
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  const [scrapInput, setScrapInput] = useState({
    width: 24,
    length: 36,
    quantity: 35,
    fabricType: 'Cotton',
    shapeType: 'rectangular'
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'direct' | 'patchwork' | 'Accessories' | 'Home & Kitchen' | 'Bags & Storage'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'slider'
  const [isSearching, setIsSearching] = useState(false);
  const [searchFeedback, setSearchFeedback] = useState('');

  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const scrollSlider = useCallback((direction) => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.querySelector('[data-product-card]')?.offsetWidth || 300;
    const scrollAmount = cardWidth + 16;
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  }, []);

  const handleMouseDown = (e) => {
    if (!sliderRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftRef.current = sliderRef.current.scrollLeft;
    dragDistanceRef.current = 0;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !sliderRef.current) return;
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.3;
    dragDistanceRef.current = Math.abs(x - startXRef.current);
    sliderRef.current.scrollLeft = scrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
  };

  const [selectedProductModal, setSelectedProductModal] = useState(null);
  const [savedPlans, setSavedPlans] = useState(() => {
    try {
      const stored = localStorage.getItem(SAVED_PLANS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Dynamic evaluation using deterministic geometric matching
  const evaluationResult = useMemo(() => {
    return evaluateScrapRecommendations(scrapInput);
  }, [scrapInput]);

  // Filtered and searched products
  const displayProducts = useMemo(() => {
    let items = evaluationResult.recommendations || [];

    // Filter tab
    if (activeFilter === 'direct') {
      items = items.filter((p) => p.isDirectFit && p.estimatedUnits > 0);
    } else if (activeFilter === 'patchwork') {
      items = items.filter((p) => p.isPatchworkFit || p.calculationMethod === 'patchwork_pieced');
    } else if (activeFilter !== 'all') {
      items = items.filter((p) => p.category === activeFilter);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      items = items.filter((p) => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }

    return items;
  }, [evaluationResult, activeFilter, searchQuery]);

  const handleFindProducts = () => {
    setIsSearching(true);
    setSearchFeedback(`Analyzing scrap pattern for ${scrapInput.width}×${scrapInput.length} cm (${scrapInput.quantity} pcs, ${scrapInput.fabricType})...`);

    setTimeout(() => {
      setIsSearching(false);
      const feasibleCount = (evaluationResult.recommendations || []).filter(r => r.estimatedUnits > 0).length;
      setSearchFeedback(`✓ Evaluated! Found ${feasibleCount} viable circular products tailored to your ${scrapInput.fabricType} remnants.`);
      
      const el = document.getElementById('recommendations-section');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 350);
  };

  const handleToggleSavePlan = (product) => {
    const isAlreadySaved = savedPlans.some((p) => p.productId === product.id);
    if (isAlreadySaved) {
      const updated = savedPlans.filter((p) => p.productId !== product.id);
      setSavedPlans(updated);
      try { localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated)); } catch(e) { console.warn(e); }
    } else {
      const newPlan = {
        id: `plan-${Date.now()}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        estimatedUnits: product.estimatedUnits,
        difficulty: product.difficulty,
        hardwareNeeded: product.hardwareNeeded,
        scrapSpecs: { ...scrapInput }
      };
      const updated = [newPlan, ...savedPlans];
      setSavedPlans(updated);
      try { localStorage.setItem(SAVED_PLANS_KEY, JSON.stringify(updated)); } catch(e) { console.warn(e); }
    }
  };

  const handlePrintPlan = (plan) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ReThread Cutting Ticket — ${plan.productName || plan.name}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 40px; color: #4A252B; line-height: 1.5; }
            h1 { font-size: 20px; font-weight: bold; margin-bottom: 4px; }
            .meta { font-size: 12px; color: #81777B; margin-bottom: 24px; }
            .box { background: #FBF7F5; border: 1px solid #EAE2DE; padding: 16px; border-radius: 12px; margin-bottom: 20px; }
            .badge { display: inline-block; background: #F3E6E4; color: #783751; padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Loom & Layer — ReThread Cutting Ticket</h1>
          <div class="meta">Circular Atelier Remnant Spec • ${new Date().toLocaleDateString()}</div>
          <div class="box">
            <p><strong>Target Product:</strong> ${plan.productName || plan.name} <span class="badge">${plan.category}</span></p>
            <p><strong>Estimated Yield:</strong> ~${plan.estimatedUnits} units</p>
            <p><strong>Scrap Input:</strong> ${plan.scrapSpecs?.width || scrapInput.width} × ${plan.scrapSpecs?.length || scrapInput.length} cm (${plan.scrapSpecs?.quantity || scrapInput.quantity} pieces, ${plan.scrapSpecs?.fabricType || scrapInput.fabricType})</p>
            <p><strong>Hardware Needed:</strong> ${plan.hardwareNeeded || 'None'}</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 250);
  };

  return (
    <div className="space-y-6">

      {/* ========================================================
          1. RETHREAD COMPACT HEADER
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#272332]">
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center shrink-0 border border-[#272332]">
            <Scissors className="w-5 h-5 text-[#E2A97E]" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#F5F3F8] tracking-tight leading-none">
              ReThread
            </h1>
            <p className="text-xs text-[#9E97A9] font-sans mt-0.5">
              Transform cutting-room remnants into high-value circular products.
            </p>
          </div>
        </div>

        {/* Right: Motto pill */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E1B27] border border-[#272332]">
          <Leaf className="w-3.5 h-3.5 text-[#E2A97E]" />
          <span className="font-serif italic text-xs text-[#E2A97E]">Zero-waste. Infinite atelier possibilities.</span>
        </div>
      </div>

      {/* ========================================================
          2. INTERACTIVE SCRAP INPUT STRIP
          ======================================================== */}
      <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 sm:p-5 shadow-2xs space-y-3.5">
        
        {/* Section Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center text-xs font-bold shrink-0 border border-[#272332]">
              1
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-[#F5F3F8] leading-tight">
                Enter Scrap Measurements
              </h2>
              <p className="text-[11px] text-[#9E97A9] font-sans">
                Type dimensions and quantity to calculate compatible products.
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#9E97A9] flex-wrap">
            <span className="font-medium text-[#9E97A9]">Presets:</span>
            <button
              type="button"
              onClick={() => setScrapInput({ width: 24, length: 36, quantity: 35, fabricType: 'Cotton', shapeType: 'rectangular' })}
              className="px-2 py-0.5 rounded-md bg-[#1E1B27] border border-[#272332] hover:border-[#8E2B45] text-[#F5F3F8] transition-colors cursor-pointer"
            >
              24×36cm Cotton
            </button>
            <button
              type="button"
              onClick={() => setScrapInput({ width: 15, length: 45, quantity: 25, fabricType: 'Denim', shapeType: 'strips' })}
              className="px-2 py-0.5 rounded-md bg-[#1E1B27] border border-[#272332] hover:border-[#8E2B45] text-[#F5F3F8] transition-colors cursor-pointer"
            >
              15×45cm Denim
            </button>
            <button
              type="button"
              onClick={() => setScrapInput({ width: 12, length: 18, quantity: 50, fabricType: 'Linen', shapeType: 'rectangular' })}
              className="px-2 py-0.5 rounded-md bg-[#1E1B27] border border-[#272332] hover:border-[#8E2B45] text-[#F5F3F8] transition-colors cursor-pointer"
            >
              12×18cm Linen
            </button>
          </div>
        </div>

        {/* Inline Input Row */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-3 pt-1">
          {/* Width */}
          <div className="flex-1 min-w-[90px]">
            <label className="block text-[10px] font-medium text-[#9E97A9] mb-1 uppercase tracking-wide">
              Width (cm)
            </label>
            <div className="bg-[#1E1B27] border border-[#272332] rounded-xl px-3 py-2 flex items-center gap-1.5 focus-within:border-[#8E2B45] transition-colors">
              <Maximize2 className="w-3.5 h-3.5 text-[#E2A97E] shrink-0" />
              <input
                type="number"
                min="1"
                step="0.5"
                value={scrapInput.width || ''}
                onChange={(e) => setScrapInput({ ...scrapInput, width: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full text-xs font-mono font-bold text-[#F5F3F8] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Length */}
          <div className="flex-1 min-w-[90px]">
            <label className="block text-[10px] font-medium text-[#9E97A9] mb-1 uppercase tracking-wide">
              Length (cm)
            </label>
            <div className="bg-[#1E1B27] border border-[#272332] rounded-xl px-3 py-2 flex items-center gap-1.5 focus-within:border-[#8E2B45] transition-colors">
              <MoveHorizontal className="w-3.5 h-3.5 text-[#E2A97E] shrink-0" />
              <input
                type="number"
                min="1"
                step="0.5"
                value={scrapInput.length || ''}
                onChange={(e) => setScrapInput({ ...scrapInput, length: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full text-xs font-mono font-bold text-[#F5F3F8] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="flex-1 min-w-[90px]">
            <label className="block text-[10px] font-medium text-[#9E97A9] mb-1 uppercase tracking-wide">
              Quantity (pcs)
            </label>
            <div className="bg-[#1E1B27] border border-[#272332] rounded-xl px-3 py-2 flex items-center gap-1.5 focus-within:border-[#8E2B45] transition-colors">
              <Layers className="w-3.5 h-3.5 text-[#E2A97E] shrink-0" />
              <input
                type="number"
                min="1"
                step="1"
                value={scrapInput.quantity || ''}
                onChange={(e) => setScrapInput({ ...scrapInput, quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full text-xs font-mono font-bold text-[#F5F3F8] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Divider on large screens */}
          <div className="hidden lg:block w-px h-9 bg-[#272332]" />

          {/* Fabric Type Pills */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-medium text-[#9E97A9] mb-1 uppercase tracking-wide">
              Fabric Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Cotton', 'Denim', 'Linen', 'Jersey', 'Canvas', 'Silk', 'Mixed'].map((fabric) => {
                const isSelected = scrapInput.fabricType === fabric;
                return (
                  <button
                    key={fabric}
                    type="button"
                    onClick={() => setScrapInput({ ...scrapInput, fabricType: fabric })}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#8E2B45] text-white border-[#8E2B45] shadow-2xs font-semibold'
                        : 'bg-[#1E1B27] hover:bg-[#272332] border-[#272332] text-[#9E97A9]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-white inline mr-1" />}
                    {fabric}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider on large screens */}
          <div className="hidden lg:block w-px h-9 bg-[#272332]" />

          {/* Action Button: Find Products */}
          <button
            type="button"
            onClick={handleFindProducts}
            disabled={isSearching}
            className="py-2.5 px-5 rounded-xl bg-[#8E2B45] hover:bg-[#A33452] active:scale-98 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#8E2B45]/20 transition-all cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-70"
          >
            <Sparkles className={`w-3.5 h-3.5 text-white ${isSearching ? 'animate-spin' : ''}`} />
            <span>{isSearching ? 'Matching...' : 'Find Products'}</span>
          </button>
        </div>

        {/* Live Feedback Toast / Notification */}
        {searchFeedback && (
          <div className="mt-2 py-2 px-3.5 rounded-xl bg-[#8E2B45]/20 border border-[#8E2B45]/40 flex items-center justify-between text-xs text-[#E2A97E] animate-in fade-in duration-200">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{searchFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setSearchFeedback('')}
              className="text-[#9E97A9] hover:text-[#F5F3F8] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          3. METRICS STRIP: RECOVERED MATERIAL & YIELD
          ======================================================== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#16141D] rounded-xl border border-[#272332] p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-[#9E97A9] mb-1">
            <Layers className="w-3.5 h-3.5 text-[#E2A97E]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Total Scraps</span>
          </div>
          <p className="text-base font-serif font-bold text-[#F5F3F8]">
            {scrapInput.quantity || 0} pieces
          </p>
          <p className="text-[10px] text-[#9E97A9]">
            {scrapInput.width} × {scrapInput.length} cm each
          </p>
        </div>

        <div className="bg-[#16141D] rounded-xl border border-[#272332] p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-[#9E97A9] mb-1">
            <Maximize2 className="w-3.5 h-3.5 text-[#E2A97E]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Remnant Area</span>
          </div>
          <p className="text-base font-serif font-bold text-[#F5F3F8]">
            {evaluationResult.totalScrapAreaM2 || 0} m²
          </p>
          <p className="text-[10px] text-[#9E97A9]">
            ~{Math.round(evaluationResult.usableTotalAreaCm2 || 0)} cm² usable
          </p>
        </div>

        <div className="bg-[#16141D] rounded-xl border border-[#272332] p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-[#9E97A9] mb-1">
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Waste Diverted</span>
          </div>
          <p className="text-base font-serif font-bold text-emerald-400">
            {evaluationResult.textileWasteDivertedKg || 0} kg
          </p>
          <p className="text-[10px] text-[#9E97A9]">
            Prevented from landfill
          </p>
        </div>

        <div className="bg-[#16141D] rounded-xl border border-[#272332] p-3 shadow-2xs">
          <div className="flex items-center gap-2 text-[#9E97A9] mb-1">
            <PackageCheck className="w-3.5 h-3.5 text-[#E2A97E]" />
            <span className="text-[10px] font-semibold uppercase tracking-wider">Matching Goods</span>
          </div>
          <p className="text-base font-serif font-bold text-[#E2A97E]">
            {displayProducts.filter(p => p.estimatedUnits > 0).length} products
          </p>
          <p className="text-[10px] text-[#9E97A9]">
            {displayProducts.length} total options
          </p>
        </div>
      </div>

      {/* ========================================================
          4. PRODUCT RECOMMENDATIONS & VIEW CONTROLS
          ======================================================== */}
      <div id="recommendations-section" className="space-y-4 pt-1">
        
        {/* Controls Bar: Filters & View Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#16141D] p-3.5 rounded-2xl border border-[#272332] shadow-2xs">
          
          {/* Left: Section Title & Count */}
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center text-xs font-bold shrink-0 border border-[#272332]">
              2
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-[#F5F3F8] leading-tight">
                Recommended Upcycled Products
              </h2>
              <p className="text-[11px] text-[#9E97A9]">
                Showing {displayProducts.length} circular designs for your scraps
              </p>
            </div>
          </div>

          {/* Center / Right: Filter Tabs & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-[#1E1B27] p-1 rounded-xl border border-[#272332] text-[11px] overflow-x-auto max-w-full">
              {[
                { id: 'all', label: 'All Products' },
                { id: 'direct', label: 'Direct-Cut' },
                { id: 'patchwork', label: 'Patchwork' },
                { id: 'Accessories', label: 'Accessories' },
                { id: 'Home & Kitchen', label: 'Home' },
                { id: 'Bags & Storage', label: 'Bags' }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                    activeFilter === f.id
                      ? 'bg-[#8E2B45] text-white font-semibold shadow-2xs'
                      : 'text-[#9E97A9] hover:text-[#F5F3F8] hover:bg-[#272332]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View Mode Toggle: Grid vs Slider */}
            <div className="flex items-center gap-1 bg-[#1E1B27] p-1 rounded-xl border border-[#272332]">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-[#8E2B45] text-white'
                    : 'text-[#9E97A9] hover:text-[#F5F3F8]'
                }`}
                title="Grid View (All at once)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('slider')}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'slider'
                    ? 'bg-[#8E2B45] text-white'
                    : 'text-[#9E97A9] hover:text-[#F5F3F8]'
                }`}
                title="Horizontal Slider View"
              >
                <Columns className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Slider navigation buttons (only when in slider view) */}
            {viewMode === 'slider' && (
              <div className="flex items-center gap-1.5 ml-1">
                <button
                  type="button"
                  onClick={() => scrollSlider('left')}
                  className="w-7 h-7 rounded-lg border border-[#272332] bg-[#1E1B27] flex items-center justify-center text-[#9E97A9] hover:text-[#E2A97E] shadow-2xs transition-all cursor-pointer"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollSlider('right')}
                  className="w-7 h-7 rounded-lg border border-[#272332] bg-[#1E1B27] flex items-center justify-center text-[#9E97A9] hover:text-[#E2A97E] shadow-2xs transition-all cursor-pointer"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>

        {/* Empty State */}
        {displayProducts.length === 0 && (
          <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-12 text-center space-y-3">
            <Scissors className="w-10 h-10 text-[#635B70] mx-auto" />
            <h3 className="font-serif text-base font-bold text-[#F5F3F8]">
              No Products Match Current Filter
            </h3>
            <p className="text-xs text-[#9E97A9] max-w-sm mx-auto">
              Try adjusting your filter or increasing scrap dimensions to match more circular upcycling patterns.
            </p>
            <button
              type="button"
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-[#8E2B45] text-white text-xs font-semibold cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* GRID VIEW */}
        {viewMode === 'grid' && displayProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayProducts.map((prod) => (
              <div
                key={prod.id}
                data-product-card
                onClick={() => setSelectedProductModal(prod)}
                className="bg-[#16141D] rounded-2xl border border-[#272332] overflow-hidden shadow-2xs hover:border-[#8E2B45] hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Photo & Badges */}
                  <div className="w-full aspect-4/3 overflow-hidden bg-[#1E1B27] relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/atelier/swatches.jpg";
                      }}
                    />
                    
                    {/* Yield badge */}
                    <div className="absolute top-2.5 right-2.5 bg-[#16141D]/90 backdrop-blur-sm text-[#E2A97E] px-2.5 py-0.5 rounded-lg text-[10px] font-bold border border-[#272332] shadow-xs">
                      ~{prod.estimatedUnits} {prod.unitLabel || 'units'}
                    </div>

                    {/* Feasibility Tag */}
                    <div className="absolute bottom-2.5 left-2.5">
                      {prod.status === 'optimal' ? (
                        <span className="bg-emerald-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-xs">
                          Direct Cut Ready
                        </span>
                      ) : prod.status === 'patchwork' ? (
                        <span className="bg-amber-600/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-md text-[9px] font-bold shadow-xs">
                          Patchwork Piecing
                        </span>
                      ) : (
                        <span className="bg-[#1E1B27]/90 backdrop-blur-sm text-[#9E97A9] px-2 py-0.5 rounded-md text-[9px] font-medium shadow-xs border border-[#272332]">
                          {prod.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-semibold text-[#9E97A9] uppercase tracking-wide">
                        {prod.category}
                      </span>
                      <span className="bg-[#1E1B27] text-[#E2A97E] border border-[#272332] px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {prod.difficulty}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-[#F5F3F8] group-hover:text-[#E2A97E] transition-colors leading-tight line-clamp-1">
                      {prod.name}
                    </h3>

                    <p className="text-[11px] text-[#9E97A9] leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>

                    <div className="pt-1 text-[10px] text-[#9E97A9] space-y-0.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span>Piece requirement:</span>
                        <span className="font-semibold text-[#F5F3F8]">{prod.minPieceWidth}×{prod.minPieceLength} cm</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Sewing time:</span>
                        <span className="font-semibold text-[#F5F3F8]">~{prod.estimatedSewTimeMin || 8} min</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-3.5 pt-2 border-t border-[#272332] flex items-center justify-between text-[11px] font-semibold text-[#E2A97E] bg-[#1E1B27]/40">
                  <span className="group-hover:underline">View Cutting Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* SLIDER VIEW */}
        {viewMode === 'slider' && displayProducts.length > 0 && (
          <div
            ref={sliderRef}
            data-slider-track
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-3 -mb-3 cursor-grab active:cursor-grabbing select-none"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style>{`[data-slider-track]::-webkit-scrollbar { display: none; }`}</style>
            {displayProducts.map((prod) => (
              <div
                key={prod.id}
                data-product-card
                onClick={() => {
                  if (dragDistanceRef.current > 5) return;
                  setSelectedProductModal(prod);
                }}
                className="bg-[#16141D] rounded-2xl border border-[#272332] overflow-hidden shadow-2xs hover:border-[#8E2B45] hover:shadow-md transition-all cursor-pointer group snap-start shrink-0 flex flex-col justify-between"
                style={{ width: 'calc(33.333% - 11px)', minWidth: '270px' }}
              >
                <div>
                  <div className="w-full aspect-4/3 overflow-hidden bg-[#1E1B27] relative">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = "/atelier/swatches.jpg";
                      }}
                    />
                    <div className="absolute top-2.5 right-2.5 bg-[#16141D]/90 backdrop-blur-sm text-[#E2A97E] px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#272332] shadow-xs">
                      ~{prod.estimatedUnits} {prod.unitLabel || 'units'}
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <h3 className="text-sm font-bold text-[#F5F3F8] group-hover:text-[#E2A97E] transition-colors leading-tight line-clamp-1">
                      {prod.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-[#1E1B27] text-[#9E97A9] border border-[#272332] px-2 py-0.5 rounded-md text-[10px] font-medium">
                        {prod.category}
                      </span>
                      <span className="bg-[#1E1B27] text-[#E2A97E] border border-[#272332] px-2 py-0.5 rounded-md text-[10px] font-semibold">
                        {prod.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#9E97A9] leading-relaxed line-clamp-2">
                      {prod.description}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 pt-2 border-t border-[#272332] flex items-center justify-between text-[11px] font-semibold text-[#E2A97E] bg-[#1E1B27]/40">
                  <span className="group-hover:underline">View Cutting Plan</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ========================================================
          5. PRODUCT DETAIL & CUTTING TICKET MODAL
          ======================================================== */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs">
          <div className="bg-[#16141D] rounded-3xl border border-[#272332] max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#272332]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1E1B27] text-[#E2A97E] border border-[#272332]">
                  {selectedProductModal.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#1E1B27] text-[#9E97A9] border border-[#272332]">
                  {selectedProductModal.difficulty}
                </span>
                {selectedProductModal.isDirectFit && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800">
                    Direct Cut Compatible
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductModal(null)}
                className="p-1.5 rounded-lg text-[#9E97A9] hover:text-[#F5F3F8] hover:bg-[#1E1B27] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
              <div className="aspect-4/3 rounded-2xl overflow-hidden border border-[#272332] bg-[#1E1B27]">
                <img
                  src={selectedProductModal.image}
                  alt={selectedProductModal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-[#F5F3F8]">
                  {selectedProductModal.name}
                </h3>
                <p className="text-xs text-[#9E97A9] leading-relaxed">
                  {selectedProductModal.description}
                </p>
                <div className="pt-2 text-xs space-y-1.5 bg-[#1E1B27] p-3 rounded-xl border border-[#272332]">
                  <p className="text-[#F5F3F8] flex justify-between">
                    <span className="text-[#9E97A9]">Estimated Yield:</span>
                    <strong className="text-[#E2A97E]">~{selectedProductModal.estimatedUnits} {selectedProductModal.unitLabel || 'units'}</strong>
                  </p>
                  <p className="text-[#F5F3F8] flex justify-between">
                    <span className="text-[#9E97A9]">Min Pattern Size:</span>
                    <strong>{selectedProductModal.minPieceWidth} × {selectedProductModal.minPieceLength} cm</strong>
                  </p>
                  <p className="text-[#F5F3F8] flex justify-between">
                    <span className="text-[#9E97A9]">Pieces per Unit:</span>
                    <strong>{selectedProductModal.piecesPerUnit || 1} panel(s)</strong>
                  </p>
                  <p className="text-[#9E97A9] text-[11px] pt-1 border-t border-[#272332]">
                    <strong className="text-[#F5F3F8]">Hardware / Notions:</strong> {selectedProductModal.hardwareNeeded || 'None required'}
                  </p>
                </div>
              </div>
            </div>

            {/* Formula Explanation Callout */}
            {selectedProductModal.formulaExplanation && (
              <div className="bg-[#8E2B45]/15 border border-[#8E2B45]/30 rounded-xl p-3 text-xs text-[#E2A97E]">
                <p className="font-semibold text-[#E2A97E] mb-0.5">Yield Calculation Logic:</p>
                <p className="text-[11px] text-[#D8CFDC]">{selectedProductModal.formulaExplanation}</p>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#272332]">
              <button
                type="button"
                onClick={() => handlePrintPlan(selectedProductModal)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#1E1B27] border border-[#272332] text-[#F5F3F8] hover:bg-[#272332] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#E2A97E]" />
                <span>Print Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleSavePlan(selectedProductModal)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#8E2B45] text-white hover:bg-[#A33452] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedPlans.some(p => p.productId === selectedProductModal.id) ? 'Saved in Plans' : 'Save Plan'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
