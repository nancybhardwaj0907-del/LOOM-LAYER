import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search,
  Bell,
  ChevronDown,
  Check, 
  UploadCloud, 
  Camera, 
  FileText, 
  Leaf, 
  Sparkles,
  Info,
  ChevronRight
} from 'lucide-react';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';
import { CameraCaptureModal } from '../components/fabric/CameraCaptureModal';

export function NewProjectPage() {
  const navigate = useNavigate();
  const { createProject } = useProjects();
  const { profile } = useUserProfile();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: 'Summer Collection',
    description: '',
    category: 'Tops',
    targetQuantity: 100,
    units: 'Pieces',
    fabricType: 'Cotton',
    fabricWidth: 150,
    fabricLength: 500,
    allowRotation: true,
    grainDirection: 'As per pattern',
    fabricImage: null
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [errors, setErrors] = useState({});

  const garmentTypes = [
    {
      id: 'Tops',
      label: 'Tops',
      description: 'T-shirts, blouses, shirts',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
          <path d="M12 2v20" />
        </svg>
      )
    },
    {
      id: 'Bottoms',
      label: 'Bottoms',
      description: 'Shorts, trousers, skirts',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 3h14l-1 18-5-1-1-9-1 9-5 1L5 3z" />
          <path d="M12 3v9" />
        </svg>
      )
    },
    {
      id: 'Dresses',
      label: 'Dresses',
      description: 'Casual & formal dresses',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 3h6l2 5-3 14H10L7 8l2-5z" />
          <path d="M9 3l3 4 3-4" />
        </svg>
      )
    },
    {
      id: 'Outerwear',
      label: 'Outerwear',
      description: 'Jackets, coats',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 4 2 9v11h6V10l4-3 4 3v10h6V9l-2-5-8-2-8 2z" />
          <path d="M12 7v13" />
        </svg>
      )
    },
    {
      id: 'Uniform',
      label: 'Uniform',
      description: 'Workwear sets',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="10" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    {
      id: 'Others',
      label: 'Others',
      description: 'Custom garments',
      icon: () => (
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="1" />
          <circle cx="19" cy="12" r="1" />
          <circle cx="5" cy="12" r="1" />
        </svg>
      )
    }
  ];

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setFormData(prev => ({
        ...prev,
        fabricImage: {
          imageUrl: event.target?.result,
          fileName: file.name
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (captured) => {
    if (captured?.dataUrl) {
      setFormData(prev => ({
        ...prev,
        fabricImage: {
          imageUrl: captured.dataUrl,
          fileName: 'camera_capture.jpg'
        }
      }));
    }
    setShowCameraModal(false);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name || !formData.name.trim()) {
      errs.name = 'Project name is required';
    }
    const widthNum = Number(formData.fabricWidth);
    if (!formData.fabricWidth || isNaN(widthNum) || widthNum < 20) {
      errs.fabricWidth = 'Width must be at least 20cm';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    try {
      const newProj = createProject({
        ...formData,
        fabricWidth: Number(formData.fabricWidth) || 150,
        fabricLength: Number(formData.fabricLength) || 500,
        targetQuantity: Number(formData.targetQuantity) || 100,
        productType: formData.category === 'Tops' ? 'Shirt' : formData.category
      });

      if (newProj && newProj.id) {
        navigate(`/project/${newProj.id}/patterns`);
      } else {
        navigate('/project/demo-proj-1/patterns');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
      navigate('/project/demo-proj-1/patterns');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. TOP HEADER BAR (Reference Mockup)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
        {/* Search Bar */}
        <div className="relative w-full max-w-sm sm:max-w-md">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, fabrics, products..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-white border border-[#E8E2D6] focus:outline-none focus:border-[#143823] text-stone-800 placeholder-stone-400 shadow-2xs transition-all"
          />
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          {/* Notification Bell with red indicator dot */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-xl border border-[#E8E2D6] bg-white flex items-center justify-center text-stone-600 hover:text-[#143823] shadow-2xs transition-all cursor-pointer relative"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2 ring-2 ring-white" />
          </button>

          {/* User Account Capsule Pill */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#E8E2D6] bg-white hover:border-[#143823]/40 shadow-2xs cursor-pointer transition-colors"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#6941C6] text-white flex items-center justify-center font-medium text-xs shrink-0">
              {profile?.avatar && profile.avatar !== '/atelier/user_avatar.jpg' ? (
                <img src={profile.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span>{profile?.name ? profile.name.charAt(0).toUpperCase() : 'N'}</span>
              )}
            </div>
            <span className="text-xs font-semibold text-stone-800 max-w-[130px] truncate">
              {profile?.name || 'Nancy Bhardwaj'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>
        </div>
      </div>

      {/* ========================================================
          2. PAGE TITLE & STEPPER HEADER (Reference Mockup)
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-[#F0EBE0]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#143823] tracking-tight">
            Create a New Project
          </h1>
          <p className="text-xs text-[#5C665F] font-sans mt-0.5">
            Set up your project details to start optimizing your fabric cutting plan.
          </p>
        </div>

        {/* Stepper (4 Steps) */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs self-start lg:self-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Step 1: Active */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#143823] text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <span className="font-bold text-[#143823] text-xs">Project Details</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-[#CCDCCD]" />

          {/* Step 2 */}
          <div className="flex items-center gap-2 shrink-0 opacity-60">
            <div className="w-6 h-6 rounded-full border border-stone-300 text-stone-600 flex items-center justify-center text-xs font-semibold">
              2
            </div>
            <span className="text-stone-600 text-xs font-medium">Fabric & Patterns</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-stone-200" />

          {/* Step 3 */}
          <div className="flex items-center gap-2 shrink-0 opacity-40">
            <div className="w-6 h-6 rounded-full border border-stone-300 text-stone-500 flex items-center justify-center text-xs font-semibold">
              3
            </div>
            <span className="text-stone-500 text-xs">Constraints</span>
          </div>
          <div className="w-6 sm:w-10 h-0.5 bg-stone-200" />

          {/* Step 4 */}
          <div className="flex items-center gap-2 shrink-0 opacity-40">
            <div className="w-6 h-6 rounded-full border border-stone-300 text-stone-500 flex items-center justify-center text-xs font-semibold">
              4
            </div>
            <span className="text-stone-500 text-xs">Review</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN TWO-COLUMN CONTENT
             Left: Form (1. Basic, 2. Garment, 3. Specs, 4. Reference)
             Right: Inspiration, Purpose Callout & Project Summary
          ======================================================== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-3.5 bg-white rounded-3xl border border-[#E8E2D6] p-5 sm:p-6 shadow-2xs">
            <h2 className="font-serif text-sm font-bold text-[#143823] flex items-center gap-2">
              <span>1. Basic Information</span>
            </h2>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Summer Collection"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white text-stone-900 focus:outline-none focus:border-[#143823] transition-all shadow-2xs ${
                  errors.name ? 'border-rose-500' : 'border-[#DDD5C7]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
                Description (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="E.g. Summer collection for women's tops and dresses..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white text-stone-900 focus:outline-none focus:border-[#143823] transition-all shadow-2xs resize-none"
              />
            </div>
          </div>

          {/* Section 2: Garment Type */}
          <div className="space-y-3.5 bg-white rounded-3xl border border-[#E8E2D6] p-5 sm:p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-sm font-bold text-[#143823]">
                  2. Garment Type
                </h2>
                <p className="text-xs text-stone-500 font-sans mt-0.5">
                  Select the type of garments included in this project.
                </p>
              </div>
              <span className="text-xs text-stone-400 font-sans hidden sm:inline-block">
                13 silhouettes &gt;
              </span>
            </div>

            {/* 6 Garment Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
              {garmentTypes.map((type) => {
                const isSelected = formData.category === type.id;
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: type.id })}
                    className={`p-3 rounded-2xl text-center flex flex-col items-center justify-between transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-[#143823] bg-[#E5EFE6]/50 text-[#143823] shadow-2xs ring-1 ring-[#143823]'
                        : 'border-[#E8E2D6] bg-white hover:bg-[#FAF8F5] text-stone-700'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                      isSelected ? 'bg-[#143823] text-white' : 'bg-[#FAF8F5] text-stone-600'
                    }`}>
                      <IconComponent />
                    </div>
                    <div>
                      <p className="text-xs font-bold leading-tight">{type.label}</p>
                      <p className="text-[10px] text-stone-400 leading-tight mt-1 truncate max-w-[100px]">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Project Specifications */}
          <div className="space-y-4 bg-white rounded-3xl border border-[#E8E2D6] p-5 sm:p-6 shadow-2xs">
            <h2 className="font-serif text-sm font-bold text-[#143823]">
              3. Project Specifications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Quantity */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
                  Target Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.targetQuantity}
                  onChange={(e) => setFormData({ ...formData, targetQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white text-stone-900 focus:outline-none focus:border-[#143823] transition-all shadow-2xs"
                />
              </div>

              {/* Units */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
                  Units
                </label>
                <select
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white text-stone-900 focus:outline-none focus:border-[#143823] transition-all shadow-2xs"
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Bundles">Bundles</option>
                  <option value="Sets">Sets</option>
                  <option value="Dozen">Dozen</option>
                </select>
              </div>

              {/* Fabric Type */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
                  Fabric Type *
                </label>
                <select
                  value={formData.fabricType}
                  onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white text-stone-900 focus:outline-none focus:border-[#143823] transition-all shadow-2xs"
                >
                  <option value="Cotton">Cotton</option>
                  <option value="Denim">Denim</option>
                  <option value="Linen">Linen</option>
                  <option value="Silk">Silk</option>
                  <option value="Wool">Wool</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Mixed">Mixed</option>
                </select>
              </div>

              {/* Fabric Width (cm) */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
                  Fabric Width (cm) *
                </label>
                <input
                  type="number"
                  min="20"
                  max="400"
                  value={formData.fabricWidth}
                  onChange={(e) => setFormData({ ...formData, fabricWidth: Number(e.target.value) || 150 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white text-stone-900 focus:outline-none focus:border-[#143823] transition-all shadow-2xs"
                />
              </div>

              {/* Allow Rotation Toggle */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-2 font-sans">
                  Allow Rotation
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div 
                    onClick={() => setFormData({ ...formData, allowRotation: !formData.allowRotation })}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      formData.allowRotation ? 'bg-[#143823]' : 'bg-stone-300'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formData.allowRotation ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="text-xs text-stone-700">
                    {formData.allowRotation ? 'Yes, allow pattern rotation' : 'Restricted (Fixed grainline)'}
                  </span>
                </label>
              </div>

              {/* Grain Direction */}
              <div>
                <label className="block text-xs font-semibold text-stone-800 mb-1.5 font-sans">
                  Grain Direction
                </label>
                <select
                  value={formData.grainDirection}
                  onChange={(e) => setFormData({ ...formData, grainDirection: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#DDD5C7] bg-white text-stone-900 focus:outline-none focus:border-[#143823] transition-all shadow-2xs"
                >
                  <option value="As per pattern">As per pattern</option>
                  <option value="Warp / Lengthwise">Warp / Lengthwise</option>
                  <option value="Weft / Crosswise">Weft / Crosswise</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Fabric Reference (Optional) */}
          <div className="space-y-3 bg-white rounded-3xl border border-[#E8E2D6] p-5 sm:p-6 shadow-2xs">
            <h2 className="font-serif text-sm font-bold text-[#143823]">
              4. Fabric Reference (Optional)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Upload Fabric Image */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-4 rounded-2xl border border-dashed border-[#DDD5C7] bg-[#FAF8F5] hover:bg-[#F2ECE1] transition-colors flex items-center justify-center gap-2.5 text-xs font-medium text-stone-700 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-stone-500" />
                <div className="text-left">
                  <p className="font-bold text-stone-900">Upload Fabric Image</p>
                  <p className="text-[10px] text-stone-400">JPG, PNG up to 5MB</p>
                </div>
              </button>

              {/* Take Photo */}
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="p-4 rounded-2xl border border-[#DDD5C7] bg-white hover:bg-[#FAF8F5] transition-colors flex items-center justify-center gap-2.5 text-xs font-medium text-stone-700 cursor-pointer shadow-2xs"
              >
                <Camera className="w-4 h-4 text-stone-500" />
                <span className="font-bold text-stone-900">Take Photo</span>
              </button>
            </div>

            {formData.fabricImage && (
              <div className="p-2.5 rounded-xl bg-[#E5EFE6] border border-[#CCDCCD] text-xs text-[#143823] flex items-center justify-between">
                <span>Fabric image attached: {formData.fabricImage.fileName}</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, fabricImage: null })}
                  className="font-bold hover:underline"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Inspiration Card, Purpose, and Summary (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Top Inspiration Photo Card with Script Note */}
          <div className="rounded-3xl overflow-hidden border border-[#E8E2D6] bg-stone-100 shadow-2xs relative aspect-16/10">
            <img
              src="/atelier/new_project_hero_fabrics.jpg"
              alt="Artisanal stacked fabrics"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/atelier/dashboard_hero_linen.jpg";
              }}
            />
            {/* Script Text Overlay */}
            <div className="absolute top-4 left-4 z-10 text-stone-800 select-none">
              <p className="font-serif italic text-base font-bold leading-tight">
                Same <br />
                Fabric. <br />
                <span className="font-normal text-stone-700">New Stories.</span>
              </p>
              <div className="w-8 h-0.5 bg-stone-600 mt-1" />
            </div>
          </div>

          {/* Middle Card: Plan with purpose */}
          <div className="rounded-2xl bg-[#FAF5EC] border border-[#E8E2D6] p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#E5EFE6] text-[#143823] flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-[#143823]" />
            </div>
            <div>
              <p className="font-serif text-sm font-bold text-[#143823]">
                Plan with purpose.
              </p>
              <p className="text-[11px] text-[#5C665F] leading-tight mt-0.5 font-sans">
                Optimize with intelligence. <br />
                Create a more sustainable future.
              </p>
            </div>
          </div>

          {/* Bottom Card: Project Summary */}
          <div className="bg-white rounded-3xl border border-[#E8E2D6] p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#F0EBE0]">
              <FileText className="w-4 h-4 text-[#143823]" />
              <h3 className="font-serif text-sm font-bold text-[#143823]">
                Project Summary
              </h3>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Project Name</span>
                <span className="font-semibold text-stone-800 truncate max-w-[150px]">{formData.name || 'Untitled'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Garment Type</span>
                <span className="font-semibold text-stone-800">{formData.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Target Quantity</span>
                <span className="font-semibold text-stone-800">{formData.targetQuantity} {formData.units}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Fabric Type</span>
                <span className="font-semibold text-stone-800">{formData.fabricType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Fabric Width</span>
                <span className="font-semibold text-stone-800">{formData.fabricWidth} cm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Rotation</span>
                <span className="font-semibold text-stone-800">{formData.allowRotation ? 'Allowed' : 'Restricted'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Grain Direction</span>
                <span className="font-semibold text-stone-800">{formData.grainDirection}</span>
              </div>
            </div>

            {/* Next Step CTA Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#143823] text-white hover:bg-[#1A452B] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span>Next: Fabric &amp; Patterns</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>

        </div>

      </form>

      {/* Camera Capture Modal */}
      {showCameraModal && (
        <CameraCaptureModal
          isOpen={showCameraModal}
          onClose={() => setShowCameraModal(false)}
          onCaptureConfirm={handleCameraCapture}
        />
      )}

    </div>
  );
}
