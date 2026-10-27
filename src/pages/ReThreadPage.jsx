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
  X
} from 'lucide-react';
import { useUserProfile } from '../context/useUserProfile';
import { evaluateScrapRecommendations } from '../utils/rethreadCatalog';

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
  const sliderRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const dragDistanceRef = useRef(0);

  const scrollSlider = useCallback((direction) => {
    if (!sliderRef.current) return;
    const cardWidth = sliderRef.current.querySelector('[data-product-card]')?.offsetWidth || 300;
    const scrollAmount = cardWidth + 16; // card width + gap
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

  const primaryDisplayProducts = useMemo(() => {
    const defaultCatalog = [
      {
        id: 'coffee-sleeve',
        name: 'Coffee Cup Sleeve',
        category: 'Accessories',
        difficulty: 'Easy',
        image: '/rethread/rethread_cup_sleeve.jpg',
        description: 'Insulated reusable fabric cup sleeve with elastic band closure. Fits standard 12-16 oz takeaway coffee tumblers.',
        estimatedUnits: Math.max(1, Math.floor(((scrapInput.width * scrapInput.length) / (8 * 24)) * (scrapInput.quantity || 1))),
        piecesPerUnit: 2,
        minPieceWidth: 8,
        minPieceLength: 24,
        hardwareNeeded: 'Elastic cord or Velcro tab'
      },
      {
        id: 'scrunchies',
        name: 'Fabric Scrunchies',
        category: 'Accessories',
        difficulty: 'Easy',
        image: '/rethread/rethread_scrunchies.jpg',
        description: 'Classic ruched hair scrunchies with enclosed braided elastic. Excellent for small fabric remnant offcuts.',
        estimatedUnits: Math.max(1, Math.floor(((scrapInput.width * scrapInput.length) / (10 * 45)) * (scrapInput.quantity || 1))),
        piecesPerUnit: 1,
        minPieceWidth: 10,
        minPieceLength: 45,
        hardwareNeeded: '20 cm braided elastic band'
      },
      {
        id: 'patchwork-bandana',
        name: 'Patchwork Bandana',
        category: 'Accessories',
        difficulty: 'Medium',
        image: '/rethread/rethread_bandana.jpg',
        description: 'Artisanal square neckerchief pieced together from geometric remnant squares with hand-rolled hems.',
        estimatedUnits: Math.max(1, Math.floor(((scrapInput.width * scrapInput.length) / (25 * 25)) * (scrapInput.quantity || 1))),
        piecesPerUnit: 4,
        minPieceWidth: 25,
        minPieceLength: 25,
        hardwareNeeded: 'None (Self-bound fabric edge)'
      },
      {
        id: 'zip-pouch',
        name: 'Mini Zip Pouch',
        category: 'Bags & Storage',
        difficulty: 'Medium',
        image: '/rethread/rethread_zip_pouch.jpg',
        description: 'Compact zippered coin and card wallet lined with scrap interfacing for durability and structured form.',
        estimatedUnits: Math.max(1, Math.floor(((scrapInput.width * scrapInput.length) / (14 * 12)) * (scrapInput.quantity || 1))),
        piecesPerUnit: 2,
        minPieceWidth: 14,
        minPieceLength: 12,
        hardwareNeeded: '15 cm nylon coil zipper'
      },
      {
        id: 'coasters-set',
        name: 'Fabric Coasters (Set of 4)',
        category: 'Home & Kitchen',
        difficulty: 'Easy',
        image: '/rethread/rethread_coasters.jpg',
        description: 'Quilted circular table coasters featuring concentric topstitching and heat-resistant scrap fleece inner batting.',
        estimatedUnits: Math.max(1, Math.floor(((scrapInput.width * scrapInput.length) / (12 * 12)) * (scrapInput.quantity || 1))),
        piecesPerUnit: 2,
        minPieceWidth: 12,
        minPieceLength: 12,
        hardwareNeeded: 'Upcycled batting or denim layer'
      },
      {
        id: 'hair-bow',
        name: 'Hair Bow / Bow Clip',
        category: 'Accessories',
        difficulty: 'Easy',
        image: '/rethread/rethread_hair_bow.jpg',
        description: 'Hand-tied artisanal accent bow mounted onto alligator hair clips or headband fixtures.',
        estimatedUnits: Math.max(1, Math.floor(((scrapInput.width * scrapInput.length) / (8 * 18)) * (scrapInput.quantity || 1))),
        piecesPerUnit: 2,
        minPieceWidth: 8,
        minPieceLength: 18,
        hardwareNeeded: 'Alligator metal clip'
      }
    ];

    if (!searchQuery.trim()) return defaultCatalog;
    const q = searchQuery.toLowerCase().trim();
    return defaultCatalog.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.category.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [scrapInput, searchQuery]);

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
          <title>ReThread Cutting Ticket — ${plan.productName}</title>
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
            <p><strong>Target Product:</strong> ${plan.productName} <span class="badge">${plan.category}</span></p>
            <p><strong>Estimated Yield:</strong> ~${plan.estimatedUnits} units</p>
            <p><strong>Scrap Input:</strong> ${plan.scrapSpecs.width} × ${plan.scrapSpecs.length} cm (${plan.scrapSpecs.quantity} pieces, ${plan.scrapSpecs.fabricType})</p>
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
            placeholder="Search products, fabrics..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-[#EAE2DE] focus:outline-none focus:border-[#783751] text-[#4A252B] placeholder-stone-400 shadow-2xs transition-all"
          />
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          {/* Notification Bell with red indicator dot */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-xl border border-[#EAE2DE] bg-white flex items-center justify-center text-stone-600 hover:text-[#783751] shadow-2xs transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
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
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. RETHREAD COMPACT HEADER
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE2DE]">
        {/* Left Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center shadow-2xs shrink-0 border border-[#C08274]/30">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A252B] tracking-tight leading-none">
              ReThread
            </h1>
            <p className="text-xs text-[#81777B] font-sans mt-0.5">
              Transform leftover fabric scraps into useful, beautiful products.
            </p>
          </div>
        </div>

        {/* Right: Compact motto pill */}
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#F3E6E4] to-[#FBF7F5] border border-[#EAE2DE] shadow-2xs">
          <Leaf className="w-3.5 h-3.5 text-[#783751]" />
          <span className="font-serif italic text-xs text-[#4A252B]">Less waste. More possibilities.</span>
        </div>
      </div>

      {/* ========================================================
          3. COMPACT SCRAP INPUT STRIP
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 sm:p-5 shadow-2xs">
        
        {/* Section Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center text-xs font-bold shrink-0">
              1
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-[#4A252B] leading-tight">
                Enter Scrap Details
              </h2>
              <p className="text-[11px] text-[#81777B] font-sans">
                Add measurements to get product recommendations.
              </p>
            </div>
          </div>
        </div>

        {/* Inline Input Row: Width, Length, Quantity, Fabric Type, Button — all in one row on large screens */}
        <div className="flex flex-col lg:flex-row lg:items-end gap-3">
          {/* Width */}
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] font-medium text-[#81777B] mb-1 uppercase tracking-wide">
              Width (cm)
            </label>
            <div className="bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3 py-2 flex items-center gap-1.5 focus-within:border-[#783751] transition-colors">
              <Maximize2 className="w-3.5 h-3.5 text-[#C08274] shrink-0" />
              <input
                type="number"
                min="1"
                step="0.5"
                value={scrapInput.width || ''}
                onChange={(e) => setScrapInput({ ...scrapInput, width: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full text-xs font-mono font-bold text-[#4A252B] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Length */}
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] font-medium text-[#81777B] mb-1 uppercase tracking-wide">
              Length (cm)
            </label>
            <div className="bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3 py-2 flex items-center gap-1.5 focus-within:border-[#783751] transition-colors">
              <MoveHorizontal className="w-3.5 h-3.5 text-[#C08274] shrink-0" />
              <input
                type="number"
                min="1"
                step="0.5"
                value={scrapInput.length || ''}
                onChange={(e) => setScrapInput({ ...scrapInput, length: Math.max(0, Number(e.target.value) || 0) })}
                className="w-full text-xs font-mono font-bold text-[#4A252B] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Quantity */}
          <div className="flex-1 min-w-[100px]">
            <label className="block text-[10px] font-medium text-[#81777B] mb-1 uppercase tracking-wide">
              Quantity
            </label>
            <div className="bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3 py-2 flex items-center gap-1.5 focus-within:border-[#783751] transition-colors">
              <Layers className="w-3.5 h-3.5 text-[#C08274] shrink-0" />
              <input
                type="number"
                min="1"
                step="1"
                value={scrapInput.quantity || ''}
                onChange={(e) => setScrapInput({ ...scrapInput, quantity: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                className="w-full text-xs font-mono font-bold text-[#4A252B] bg-transparent outline-none"
              />
            </div>
          </div>

          {/* Divider on large screens */}
          <div className="hidden lg:block w-px h-9 bg-[#EAE2DE]" />

          {/* Fabric Type Inline Pills */}
          <div className="flex-shrink-0">
            <label className="block text-[10px] font-medium text-[#81777B] mb-1 uppercase tracking-wide">
              Fabric Type
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Cotton', 'Denim', 'Linen', 'Jersey', 'Mixed'].map((fabric) => {
                const isSelected = scrapInput.fabricType === fabric;
                return (
                  <button
                    key={fabric}
                    type="button"
                    onClick={() => setScrapInput({ ...scrapInput, fabricType: fabric })}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-[#783751] text-white border-[#783751] shadow-2xs font-semibold'
                        : 'bg-white hover:bg-[#F3E6E4]/40 border-[#EAE2DE] text-[#39343A]'
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
          <div className="hidden lg:block w-px h-9 bg-[#EAE2DE]" />

          {/* Find Button */}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('recommendations-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="py-2.5 px-5 rounded-xl bg-[#783751] hover:bg-[#642C43] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#F3E6E4]" />
            <span>Find Products</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          4. PRODUCT RECOMMENDATIONS — HORIZONTAL SLIDER
          ======================================================== */}
      <div id="recommendations-section" className="space-y-4">
        
        {/* Section Header with Slider Arrows */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center text-xs font-bold shrink-0">
              2
            </div>
            <div>
              <h2 className="font-serif text-base font-bold text-[#4A252B] leading-tight">
                Product Recommendations
              </h2>
              <p className="text-[11px] text-[#81777B] font-sans">
                Products you can make from your {scrapInput.width}×{scrapInput.length} cm {scrapInput.fabricType} scraps.
              </p>
            </div>
          </div>

          {/* Slider Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollSlider('left')}
              className="w-8 h-8 rounded-full border border-[#EAE2DE] bg-white flex items-center justify-center text-[#81777B] hover:text-[#783751] hover:border-[#783751]/50 shadow-2xs transition-all cursor-pointer"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollSlider('right')}
              className="w-8 h-8 rounded-full border border-[#EAE2DE] bg-white flex items-center justify-center text-[#81777B] hover:text-[#783751] hover:border-[#783751]/50 shadow-2xs transition-all cursor-pointer"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Horizontal Scrollable Slider */}
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
          {/* Hide webkit scrollbar */}
          <style>{`[data-slider-track]::-webkit-scrollbar { display: none; }`}</style>
          {primaryDisplayProducts.map((prod) => (
            <div
              key={prod.id}
              data-product-card
              onClick={() => {
                if (dragDistanceRef.current > 5) return;
                setSelectedProductModal(prod);
              }}
              className="bg-white rounded-2xl border border-[#EAE2DE] overflow-hidden shadow-2xs hover:border-[#C08274] hover:shadow-md transition-all cursor-pointer group snap-start shrink-0"
              style={{ width: 'calc(33.333% - 11px)', minWidth: '260px' }}
            >
              {/* Product Photo */}
              <div className="w-full aspect-4/3 overflow-hidden bg-[#FBF7F5] relative">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.src = "/atelier/swatches.jpg";
                  }}
                />
                {/* Yield badge overlay */}
                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-sm text-[#783751] px-2 py-0.5 rounded-lg text-[10px] font-bold border border-[#EAE2DE] shadow-xs">
                  ~{prod.estimatedUnits} units
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-2">
                <h3 className="text-sm font-bold text-[#4A252B] group-hover:text-[#783751] transition-colors leading-tight">
                  {prod.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="bg-[#FBF7F5] text-[#81777B] border border-[#EAE2DE] px-2 py-0.5 rounded-md text-[10px] font-medium">
                    {prod.category}
                  </span>
                  <span className="bg-[#F3E6E4] text-[#783751] px-2 py-0.5 rounded-md text-[10px] font-semibold">
                    {prod.difficulty}
                  </span>
                </div>
                <p className="text-[11px] text-[#81777B] leading-relaxed line-clamp-2">
                  {prod.description}
                </p>

                {/* Footer */}
                <div className="pt-2 border-t border-[#EAE2DE]/60 flex items-center justify-between text-[11px] font-semibold text-[#783751]">
                  <span className="group-hover:underline">View Details</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          PRODUCT DETAIL MODAL
          ======================================================== */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-stone-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-[#EAE2DE] max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE2DE]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3E6E4] text-[#783751] border border-[#C08274]">
                  {selectedProductModal.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F0DCD2] text-[#4A252B] border border-[#EAE2DE]">
                  {selectedProductModal.difficulty}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProductModal(null)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="aspect-4/3 rounded-2xl overflow-hidden border border-[#EAE2DE] bg-stone-100">
                <img
                  src={selectedProductModal.image}
                  alt={selectedProductModal.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2">
                <h3 className="font-serif text-lg font-bold text-[#4A252B]">
                  {selectedProductModal.name}
                </h3>
                <p className="text-xs text-[#81777B] leading-relaxed">
                  {selectedProductModal.description}
                </p>
                <div className="pt-2 text-xs space-y-1">
                  <p className="text-stone-800">
                    <strong>Estimated Yield:</strong> ~{selectedProductModal.estimatedUnits} units
                  </p>
                  <p className="text-stone-800">
                    <strong>Piece Min Size:</strong> {selectedProductModal.minPieceWidth}×{selectedProductModal.minPieceLength} cm
                  </p>
                  <p className="text-stone-600 text-[11px]">
                    <strong>Hardware:</strong> {selectedProductModal.hardwareNeeded}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#EAE2DE]">
              <button
                type="button"
                onClick={() => handlePrintPlan(selectedProductModal)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#FBF7F5] border border-[#EAE2DE] text-stone-800 hover:bg-[#F3E6E4] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-[#783751]" />
                <span>Print Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleSavePlan(selectedProductModal)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedPlans.some(p => p.productId === selectedProductModal.id) ? 'Saved' : 'Save Plan'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
