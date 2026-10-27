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
  Leaf
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
          1. TOP HEADER BAR (Matching Mockup)
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-1">
        {/* Search Bar - Pill rounded with subtle border */}
        <div className="relative w-full max-w-sm sm:max-w-md">
          <Search className="w-4 h-4 text-[#81777B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects, fabrics, products..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-full bg-white border border-[#EAE2DE] focus:outline-none focus:border-[#783751] text-[#39343A] placeholder-[#81777B] shadow-2xs transition-all"
          />
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3 self-end sm:self-auto">
          {/* Notification Bell with red indicator dot */}
          <button
            type="button"
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full border border-[#EAE2DE] bg-white flex items-center justify-center text-[#81777B] hover:text-[#783751] hover:border-[#783751]/50 shadow-2xs transition-all cursor-pointer relative"
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
        </div>
      </div>

      {/* ========================================================
          2. PAGE TITLE & HORIZONTAL STEPPER (Matching Mockup)
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-[#EAE2DE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center shadow-2xs shrink-0 border border-[#C08274]/30">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#4A252B] tracking-tight">
              Create a New Project
            </h1>
            <p className="text-xs text-[#81777B] font-sans mt-0.5">
              Set up your project details to start optimizing your fabric cutting plan.
            </p>
          </div>
        </div>

        {/* 4-Step Stepper with circles on top and labels below */}
        <div className="flex items-center gap-1 sm:gap-2 self-start lg:self-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Step 1: Active */}
          <div className="flex flex-col items-center min-w-[75px] sm:min-w-[90px]">
            <div className="w-7 h-7 rounded-full bg-[#783751] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              1
            </div>
            <span className="text-[11px] font-bold text-[#4A252B] mt-1 text-center whitespace-nowrap">
              Project Details
            </span>
          </div>

          {/* Connector 1-2 */}
          <div className="w-8 sm:w-14 h-0.5 bg-[#783751] -mt-4" />

          {/* Step 2 */}
          <div className="flex flex-col items-center min-w-[75px] sm:min-w-[95px] opacity-75">
            <div className="w-7 h-7 rounded-full border border-[#D9D4D6] bg-white text-[#81777B] flex items-center justify-center text-xs font-medium">
              2
            </div>
            <span className="text-[11px] font-medium text-[#81777B] mt-1 text-center whitespace-nowrap">
              Fabric &amp; Patterns
            </span>
          </div>

          {/* Connector 2-3 */}
          <div className="w-8 sm:w-14 h-0.5 bg-[#EAE2DE] -mt-4" />

          {/* Step 3 */}
          <div className="flex flex-col items-center min-w-[65px] sm:min-w-[80px] opacity-60">
            <div className="w-7 h-7 rounded-full border border-[#D9D4D6] bg-white text-[#81777B] flex items-center justify-center text-xs font-medium">
              3
            </div>
            <span className="text-[11px] font-medium text-[#81777B] mt-1 text-center whitespace-nowrap">
              Constraints
            </span>
          </div>

          {/* Connector 3-4 */}
          <div className="w-8 sm:w-14 h-0.5 bg-[#EAE2DE] -mt-4" />

          {/* Step 4 */}
          <div className="flex flex-col items-center min-w-[55px] sm:min-w-[70px] opacity-60">
            <div className="w-7 h-7 rounded-full border border-[#D9D4D6] bg-white text-[#81777B] flex items-center justify-center text-xs font-medium">
              4
            </div>
            <span className="text-[11px] font-medium text-[#81777B] mt-1 text-center whitespace-nowrap">
              Review
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. MAIN TWO-COLUMN CONTENT
             Left: Form (1. Basic, 2. Garment, 3. Specs, 4. Reference)
             Right: Inspiration, Sustainability Callout & Project Summary
          ======================================================== */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form Column (8 cols on lg) - Form sections inside cohesive white card */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#EAE2DE] p-5 sm:p-7 space-y-6 shadow-2xs">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center text-xs font-bold shrink-0 border border-[#C08274]/30">
                1
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#4A252B]">
                  Basic Information
                </h2>
                <p className="text-[11px] text-[#81777B] font-sans">
                  Give your project a name and a short description.
                </p>
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-[#39343A] mb-1.5 font-sans">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Collection"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-white text-[#39343A] focus:outline-none focus:border-[#783751] transition-all shadow-2xs ${
                  errors.name ? 'border-rose-500' : 'border-[#EAE2DE]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#39343A] font-sans">
                  Description (Optional)
                </label>
                <span className="text-[10px] text-[#81777B]">0/200</span>
              </div>
              <textarea
                rows={2}
                maxLength={200}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="E.g. Summer collection for women's tops and dresses..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-white text-[#39343A] focus:outline-none focus:border-[#783751] transition-all shadow-2xs resize-none"
              />
            </div>
          </div>

          <div className="border-t border-[#EAE2DE]/70 pt-2" />

          {/* Section 2: Garment Type */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center text-xs font-bold shrink-0 border border-[#C08274]/30">
                  2
                </div>
                <div>
                  <h2 className="font-serif text-sm font-bold text-[#4A252B]">
                    Garment Type
                  </h2>
                  <p className="text-[11px] text-[#81777B] font-sans">
                    Select the type of garments included in this project.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#783751] bg-[#F3E6E4] px-2.5 py-0.5 rounded-full border border-[#C08274]/30 cursor-pointer">
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
                    className={`p-3 rounded-2xl text-center flex flex-col items-center justify-between transition-all cursor-pointer border relative min-h-[110px] ${
                      isSelected
                        ? 'border-[#C08274] bg-[#F3E6E4] text-[#783751] shadow-2xs ring-1 ring-[#C08274]'
                        : 'border-[#EAE2DE] bg-white hover:bg-[#F3E6E4]/30 text-[#39343A]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#783751] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 ${
                      isSelected ? 'text-[#783751]' : 'text-[#81777B]'
                    }`}>
                      <IconComponent />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#4A252B] leading-tight">{type.label}</p>
                      <p className="text-[10px] text-[#81777B] leading-tight mt-1">
                        {type.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-[#EAE2DE]/70 pt-2" />

          {/* Section 3: Project Specifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center text-xs font-bold shrink-0 border border-[#C08274]/30">
                3
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#4A252B]">
                  Project Specifications
                </h2>
                <p className="text-[11px] text-[#81777B] font-sans">
                  Add production details and fabric settings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[#39343A] mb-1.5 font-sans">
                  Target Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.targetQuantity}
                  onChange={(e) => setFormData({ ...formData, targetQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-white text-[#39343A] focus:outline-none focus:border-[#783751] transition-all shadow-2xs"
                />
              </div>

              {/* Units */}
              <div>
                <label className="block text-xs font-semibold text-[#39343A] mb-1.5 font-sans">
                  Units
                </label>
                <select
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-white text-[#39343A] focus:outline-none focus:border-[#783751] transition-all shadow-2xs"
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Bundles">Bundles</option>
                  <option value="Sets">Sets</option>
                  <option value="Dozen">Dozen</option>
                </select>
              </div>

              {/* Fabric Type */}
              <div>
                <label className="block text-xs font-semibold text-[#39343A] mb-1.5 font-sans">
                  Fabric Type *
                </label>
                <select
                  value={formData.fabricType}
                  onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-white text-[#39343A] focus:outline-none focus:border-[#783751] transition-all shadow-2xs"
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
                <label className="block text-xs font-semibold text-[#39343A] mb-1.5 font-sans">
                  Fabric Width (cm) *
                </label>
                <input
                  type="number"
                  min="20"
                  max="400"
                  value={formData.fabricWidth}
                  onChange={(e) => setFormData({ ...formData, fabricWidth: Number(e.target.value) || 150 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-white text-[#39343A] focus:outline-none focus:border-[#783751] transition-all shadow-2xs"
                />
              </div>

              {/* Allow Rotation Toggle */}
              <div>
                <label className="block text-xs font-semibold text-[#39343A] mb-2 font-sans">
                  Allow Rotation
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div 
                    onClick={() => setFormData({ ...formData, allowRotation: !formData.allowRotation })}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      formData.allowRotation ? 'bg-[#783751]' : 'bg-[#D9D4D6]'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formData.allowRotation ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="text-xs text-[#39343A]">
                    {formData.allowRotation ? 'Yes, allow pattern rotation' : 'Restricted (Fixed grainline)'}
                  </span>
                </label>
              </div>

              {/* Grain Direction */}
              <div>
                <label className="block text-xs font-semibold text-[#39343A] mb-1.5 font-sans">
                  Grain Direction
                </label>
                <select
                  value={formData.grainDirection}
                  onChange={(e) => setFormData({ ...formData, grainDirection: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#EAE2DE] bg-white text-[#39343A] focus:outline-none focus:border-[#783751] transition-all shadow-2xs"
                >
                  <option value="As per pattern">As per pattern</option>
                  <option value="Warp / Lengthwise">Warp / Lengthwise</option>
                  <option value="Weft / Crosswise">Weft / Crosswise</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#EAE2DE]/70 pt-2" />

          {/* Section 4: Fabric Reference (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center text-xs font-bold shrink-0 border border-[#C08274]/30">
                4
              </div>
              <h2 className="font-serif text-sm font-bold text-[#4A252B]">
                Fabric Reference (Optional)
              </h2>
            </div>

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
                className="p-4 rounded-2xl border border-dashed border-[#C08274]/50 bg-[#F3E6E4]/70 hover:bg-[#F3E6E4] transition-colors flex items-center justify-center gap-2.5 text-xs font-medium text-[#783751] cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[#783751]" />
                <div className="text-left">
                  <p className="font-bold text-[#783751]">Upload Fabric Image</p>
                  <p className="text-[10px] text-[#81777B]">JPG, PNG up to 5MB</p>
                </div>
              </button>

              {/* Take Photo */}
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="p-4 rounded-2xl border border-[#EAE2DE] bg-white hover:bg-[#F3E6E4]/30 transition-colors flex items-center justify-center gap-2.5 text-xs font-medium text-[#39343A] cursor-pointer shadow-2xs"
              >
                <Camera className="w-4 h-4 text-[#783751]" />
                <span className="font-bold text-[#4A252B]">Take Photo</span>
              </button>
            </div>

            {formData.fabricImage && (
              <div className="p-2.5 rounded-xl bg-[#F3E6E4] border border-[#C08274]/40 text-xs text-[#783751] flex items-center justify-between">
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

        {/* Right Column: Inspiration Card, Sustainability Callout, and Summary (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Top Inspiration Photo Card: Folded Fabrics with Script Note */}
          <div className="rounded-3xl overflow-hidden border border-[#EAE2DE] shadow-2xs relative" style={{ minHeight: '220px' }}>
            {/* Background image */}
            <img
              src="/atelier/rose_fabrics_stack.jpg"
              alt="Artisanal stacked fabrics in dusty rose and mauve"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/atelier/dashboard_hero_linen.jpg";
              }}
            />
            {/* Gradient overlay from left for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#F0DCD2]/95 via-[#F0DCD2]/70 to-transparent" />
            {/* Script Text - positioned on the left over the gradient */}
            <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-center h-full" style={{ minHeight: '220px' }}>
              <p className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#4A252B]">
                Same <br />
                Fabric. <br />
                <span className="italic text-[#783751]">New Stories.</span>
              </p>
              <p className="text-[11px] text-[#4A252B]/70 mt-3 font-sans font-medium max-w-[180px] leading-relaxed">
                Plan. Optimize. Create a more sustainable future.
              </p>
            </div>
          </div>

          {/* Middle Card: Turn fabric waste into new possibilities */}
          <div className="rounded-2xl bg-gradient-to-r from-[#F3E6E4] to-[#FBF7F5] border border-[#EAE2DE] p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-white text-[#783751] border border-[#C08274]/30 flex items-center justify-center shrink-0 shadow-2xs">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <p className="font-serif text-xs sm:text-sm font-bold text-[#4A252B]">
                Turn fabric waste into new possibilities.
              </p>
              <p className="text-[11px] text-[#81777B] leading-tight mt-0.5 font-sans">
                Create optimized cutting plans and give leftover fabric a second life.
              </p>
            </div>
          </div>

          {/* Bottom Card: Project Summary */}
          <div className="bg-white rounded-3xl border border-[#EAE2DE] p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#EAE2DE]">
              <div className="w-6 h-6 rounded-lg bg-[#F3E6E4] text-[#783751] flex items-center justify-center">
                <FileText className="w-3.5 h-3.5" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#4A252B]">
                Project Summary
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#81777B]">Project Name</span>
                <span className="font-semibold text-[#4A252B] truncate max-w-[150px]">{formData.name || 'Summer Collection'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#81777B]">Garment Type</span>
                <span className="font-semibold text-[#4A252B]">{formData.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#81777B]">Target Quantity</span>
                <span className="font-semibold text-[#4A252B]">{formData.targetQuantity} {formData.units}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#81777B]">Fabric Type</span>
                <span className="font-semibold text-[#4A252B]">{formData.fabricType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#81777B]">Fabric Width</span>
                <span className="font-semibold text-[#4A252B]">{formData.fabricWidth} cm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#81777B]">Rotation</span>
                <span className="font-semibold text-[#4A252B]">{formData.allowRotation ? 'Allowed' : 'Restricted'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#81777B]">Grain Direction</span>
                <span className="font-semibold text-[#4A252B]">{formData.grainDirection}</span>
              </div>
            </div>

            {/* Next Step CTA Button with subtle watermark / elegance */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer group relative overflow-hidden"
              >
                {/* Subtle botanical line art flourish background on right */}
                <svg className="absolute -right-2 -bottom-2 w-16 h-16 text-white/10 pointer-events-none" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                <span className="relative z-10 font-bold">Next: Fabric &amp; Patterns</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 relative z-10" />
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
