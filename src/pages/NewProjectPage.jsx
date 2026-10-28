import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  UploadCloud, 
  Camera, 
  FileText, 
  Leaf
} from 'lucide-react';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';
import { CameraCaptureModal } from '../components/fabric/CameraCaptureModal';
import { FabricIdentificationCard } from '../components/fabric/FabricIdentificationCard';
import { identifyFabricFromImage } from '../utils/fabricIdentificationEngine';

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
    reader.onload = async (event) => {
      const dataUrl = event.target?.result;
      let idResult = null;
      try {
        idResult = await identifyFabricFromImage(dataUrl);
      } catch (err) {
        console.warn('AI identification on file upload failed:', err);
      }
      setFormData(prev => ({
        ...prev,
        fabricType: (idResult?.isClear && idResult?.fabricName) ? idResult.fabricName : prev.fabricType,
        fabricImage: {
          imageUrl: dataUrl,
          fileName: file.name,
          fabricIdentification: idResult
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (captured) => {
    if (captured?.dataUrl) {
      const idResult = captured.fabricIdentification;
      setFormData(prev => ({
        ...prev,
        fabricType: (idResult?.isClear && idResult?.fabricName) ? idResult.fabricName : prev.fabricType,
        fabricImage: {
          imageUrl: captured.dataUrl,
          fileName: 'camera_capture.jpg',
          fabricIdentification: idResult || null
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
          1. PAGE TITLE & HORIZONTAL STEPPER
          ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 pb-4 border-b border-[#272332]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center shrink-0 border border-[#272332]">
            <Leaf className="w-5 h-5 text-[#E2A97E]" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-3xl font-bold text-[#F5F3F8] tracking-tight">
              Create a New Project
            </h1>
            <p className="text-xs text-[#9E97A9] font-sans mt-0.5">
              Set up your project details to start optimizing your fabric cutting plan.
            </p>
          </div>
        </div>

        {/* 4-Step Stepper with circles on top and labels below */}
        <div className="flex items-center gap-1 sm:gap-2 self-start lg:self-auto overflow-x-auto max-w-full pb-1 sm:pb-0 w-full lg:w-auto">
          {/* Step 1: Active */}
          <div className="flex flex-col items-center min-w-[62px] sm:min-w-[90px] shrink-0">
            <div className="w-7 h-7 rounded-full bg-[#8E2B45] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              1
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold text-[#F5F3F8] mt-1 text-center whitespace-nowrap">
              Project Details
            </span>
          </div>

          {/* Connector 1-2 */}
          <div className="w-5 sm:w-14 h-0.5 bg-[#8E2B45] -mt-4 shrink-0" />

          {/* Step 2 */}
          <div className="flex flex-col items-center min-w-[62px] sm:min-w-[95px] shrink-0 opacity-75">
            <div className="w-7 h-7 rounded-full border border-[#272332] bg-[#1E1B27] text-[#9E97A9] flex items-center justify-center text-xs font-medium">
              2
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#9E97A9] mt-1 text-center whitespace-nowrap">
              Fabric &amp; Patterns
            </span>
          </div>

          {/* Connector 2-3 */}
          <div className="w-5 sm:w-14 h-0.5 bg-[#272332] -mt-4 shrink-0" />

          {/* Step 3 */}
          <div className="flex flex-col items-center min-w-[58px] sm:min-w-[80px] shrink-0 opacity-60">
            <div className="w-7 h-7 rounded-full border border-[#272332] bg-[#1E1B27] text-[#9E97A9] flex items-center justify-center text-xs font-medium">
              3
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#9E97A9] mt-1 text-center whitespace-nowrap">
              Constraints
            </span>
          </div>

          {/* Connector 3-4 */}
          <div className="w-5 sm:w-14 h-0.5 bg-[#272332] -mt-4 shrink-0" />

          {/* Step 4 */}
          <div className="flex flex-col items-center min-w-[50px] sm:min-w-[70px] shrink-0 opacity-60">
            <div className="w-7 h-7 rounded-full border border-[#272332] bg-[#1E1B27] text-[#9E97A9] flex items-center justify-center text-xs font-medium">
              4
            </div>
            <span className="text-[10px] sm:text-[11px] font-medium text-[#9E97A9] mt-1 text-center whitespace-nowrap">
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
        
        {/* Left Form Column (8 cols on lg) - Form sections inside cohesive dark card */}
        <div className="lg:col-span-8 bg-[#16141D] rounded-3xl border border-[#272332] p-4 sm:p-7 space-y-6 shadow-2xs">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center text-xs font-bold shrink-0 border border-[#272332]">
                1
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#F5F3F8]">
                  Basic Information
                </h2>
                <p className="text-[11px] text-[#9E97A9] font-sans">
                  Give your project a name and a short description.
                </p>
              </div>
            </div>

            {/* Project Name */}
            <div>
              <label className="block text-xs font-semibold text-[#F5F3F8] mb-1.5 font-sans">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Summer Collection"
                className={`w-full px-3.5 py-2 text-xs rounded-xl border bg-[#1E1B27] text-[#F5F3F8] focus:outline-none focus:border-[#8E2B45] transition-all shadow-2xs ${
                  errors.name ? 'border-rose-500' : 'border-[#272332]'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-[#F5F3F8] font-sans">
                  Description (Optional)
                </label>
                <span className="text-[10px] text-[#9E97A9]">0/200</span>
              </div>
              <textarea
                rows={2}
                maxLength={200}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="E.g. Summer collection for women's tops and dresses..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#272332] bg-[#1E1B27] text-[#F5F3F8] focus:outline-none focus:border-[#8E2B45] transition-all shadow-2xs resize-none placeholder:text-[#635B70]"
              />
            </div>
          </div>

          <div className="border-t border-[#272332] pt-2" />

          {/* Section 2: Garment Type */}
          <div className="space-y-3.5">
            <div className="flex items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center text-xs font-bold shrink-0 border border-[#272332]">
                  2
                </div>
                <div>
                  <h2 className="font-serif text-sm font-bold text-[#F5F3F8]">
                    Garment Type
                  </h2>
                  <p className="text-[11px] text-[#9E97A9] font-sans">
                    Select the type of garments included in this project.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-[#E2A97E] bg-[#1E1B27] px-2.5 py-0.5 rounded-full border border-[#272332] cursor-pointer hover:border-[#8E2B45]/50 shrink-0">
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
                    className={`p-2.5 sm:p-3 rounded-2xl text-center flex flex-col items-center justify-between transition-all cursor-pointer border relative min-h-[105px] sm:min-h-[110px] ${
                      isSelected
                        ? 'border-[#8E2B45] bg-[#8E2B45]/20 text-[#E2A97E] shadow-2xs ring-1 ring-[#8E2B45]'
                        : 'border-[#272332] bg-[#1E1B27] hover:bg-[#272332]/60 text-[#9E97A9]'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#8E2B45] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-1 ${
                      isSelected ? 'text-[#E2A97E]' : 'text-[#9E97A9]'
                    }`}>
                      <IconComponent />
                    </div>
                    <div className="w-full">
                      <p className="text-xs font-bold text-[#F5F3F8] leading-tight truncate">{type.label}</p>
                      <p className="text-[10px] text-[#9E97A9] leading-tight mt-0.5 line-clamp-2">
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
              <div className="w-6 h-6 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center text-xs font-bold shrink-0 border border-[#272332]">
                3
              </div>
              <div>
                <h2 className="font-serif text-sm font-bold text-[#F5F3F8]">
                  Project Specifications
                </h2>
                <p className="text-[11px] text-[#9E97A9] font-sans">
                  Add production details and fabric settings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Target Quantity */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F3F8] mb-1.5 font-sans">
                  Target Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.targetQuantity}
                  onChange={(e) => setFormData({ ...formData, targetQuantity: Math.max(1, parseInt(e.target.value, 10) || 1) })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#272332] bg-[#1E1B27] text-[#F5F3F8] focus:outline-none focus:border-[#8E2B45] transition-all shadow-2xs"
                />
              </div>

              {/* Units */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F3F8] mb-1.5 font-sans">
                  Units
                </label>
                <select
                  value={formData.units}
                  onChange={(e) => setFormData({ ...formData, units: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#272332] bg-[#1E1B27] text-[#F5F3F8] focus:outline-none focus:border-[#8E2B45] transition-all shadow-2xs"
                >
                  <option value="Pieces">Pieces</option>
                  <option value="Bundles">Bundles</option>
                  <option value="Sets">Sets</option>
                  <option value="Dozen">Dozen</option>
                </select>
              </div>

              {/* Fabric Type */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F3F8] mb-1.5 font-sans">
                  Fabric Type *
                </label>
                <select
                  value={formData.fabricType}
                  onChange={(e) => setFormData({ ...formData, fabricType: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#272332] bg-[#1E1B27] text-[#F5F3F8] focus:outline-none focus:border-[#8E2B45] transition-all shadow-2xs"
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
                <label className="block text-xs font-semibold text-[#F5F3F8] mb-1.5 font-sans">
                  Fabric Width (cm) *
                </label>
                <input
                  type="number"
                  min="20"
                  max="400"
                  value={formData.fabricWidth}
                  onChange={(e) => setFormData({ ...formData, fabricWidth: Number(e.target.value) || 150 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#272332] bg-[#1E1B27] text-[#F5F3F8] focus:outline-none focus:border-[#8E2B45] transition-all shadow-2xs"
                />
              </div>

              {/* Allow Rotation Toggle */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F3F8] mb-2 font-sans">
                  Allow Rotation
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <div 
                    onClick={() => setFormData({ ...formData, allowRotation: !formData.allowRotation })}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                      formData.allowRotation ? 'bg-[#8E2B45]' : 'bg-[#272332]'
                    }`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      formData.allowRotation ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </div>
                  <span className="text-xs text-[#F5F3F8]">
                    {formData.allowRotation ? 'Yes, allow pattern rotation' : 'Restricted (Fixed grainline)'}
                  </span>
                </label>
              </div>

              {/* Grain Direction */}
              <div>
                <label className="block text-xs font-semibold text-[#F5F3F8] mb-1.5 font-sans">
                  Grain Direction
                </label>
                <select
                  value={formData.grainDirection}
                  onChange={(e) => setFormData({ ...formData, grainDirection: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#272332] bg-[#1E1B27] text-[#F5F3F8] focus:outline-none focus:border-[#8E2B45] transition-all shadow-2xs"
                >
                  <option value="As per pattern">As per pattern</option>
                  <option value="Warp / Lengthwise">Warp / Lengthwise</option>
                  <option value="Weft / Crosswise">Weft / Crosswise</option>
                  <option value="Any">Any</option>
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#272332] pt-2" />

          {/* Section 4: Fabric Reference (Optional) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center text-xs font-bold shrink-0 border border-[#272332]">
                4
              </div>
              <h2 className="font-serif text-sm font-bold text-[#F5F3F8]">
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
                className="p-4 rounded-2xl border border-dashed border-[#8E2B45]/50 bg-[#1E1B27] hover:bg-[#272332] transition-colors flex items-center justify-center gap-2.5 text-xs font-medium text-[#E2A97E] cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-[#E2A97E]" />
                <div className="text-left">
                  <p className="font-bold text-[#F5F3F8]">Upload Fabric Image</p>
                  <p className="text-[10px] text-[#9E97A9]">JPG, PNG up to 5MB</p>
                </div>
              </button>

              {/* Take Photo */}
              <button
                type="button"
                onClick={() => setShowCameraModal(true)}
                className="p-4 rounded-2xl border border-[#272332] bg-[#1E1B27] hover:bg-[#272332] transition-colors flex items-center justify-center gap-2.5 text-xs font-medium text-[#F5F3F8] cursor-pointer shadow-2xs"
              >
                <Camera className="w-4 h-4 text-[#E2A97E]" />
                <span className="font-bold text-[#F5F3F8]">Take Photo</span>
              </button>
            </div>

            {formData.fabricImage && (
              <div className="space-y-3 pt-1">
                <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    {formData.fabricImage.imageUrl && (
                      <img 
                        src={formData.fabricImage.imageUrl} 
                        alt="Fabric swatch thumbnail" 
                        className="w-9 h-9 object-cover rounded-lg border border-[#3B3549]" 
                      />
                    )}
                    <div>
                      <span className="font-semibold text-[#F5F3F8] block">{formData.fabricImage.fileName}</span>
                      <span className="text-[10px] text-[#A8A1B4]">
                        {formData.fabricImage.fabricIdentification?.isClear
                          ? `Identified as ${formData.fabricImage.fabricIdentification.fabricName} (${formData.fabricImage.fabricIdentification.confidence}% Match)`
                          : 'Reference swatch attached'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, fabricImage: null })}
                    className="font-bold hover:underline text-rose-400 cursor-pointer text-xs"
                  >
                    Remove
                  </button>
                </div>

                {/* Display AI Fabric Identification Card */}
                {formData.fabricImage.fabricIdentification && (
                  <FabricIdentificationCard
                    identification={formData.fabricImage.fabricIdentification}
                    onRetakePhoto={() => setShowCameraModal(true)}
                  />
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Inspiration Card, Sustainability Callout, and Summary (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Top Inspiration Photo Card: Folded Fabrics with Script Note */}
          <div className="rounded-3xl overflow-hidden border border-[#272332] shadow-2xs relative bg-[#16141D]" style={{ minHeight: '220px' }}>
            {/* Background image */}
            <img
              src="/atelier/rose_fabrics_stack.jpg"
              alt="Artisanal stacked fabrics in dusty rose and mauve"
              className="absolute inset-0 w-full h-full object-cover opacity-60"
              onError={(e) => {
                e.currentTarget.src = "/atelier/dashboard_hero_linen.jpg";
              }}
            />
            {/* Gradient overlay from left for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#16141D]/95 via-[#16141D]/80 to-transparent" />
            {/* Script Text - positioned on the left over the gradient */}
            <div className="relative z-10 p-5 sm:p-6 flex flex-col justify-center h-full" style={{ minHeight: '220px' }}>
              <p className="font-serif text-2xl sm:text-3xl font-bold leading-tight text-[#F5F3F8]">
                Same <br />
                Fabric. <br />
                <span className="italic text-[#E2A97E]">New Stories.</span>
              </p>
              <p className="text-[11px] text-[#9E97A9] mt-3 font-sans font-medium max-w-[180px] leading-relaxed">
                Plan. Optimize. Create a more sustainable future.
              </p>
            </div>
          </div>

          {/* Middle Card: Turn fabric waste into new possibilities */}
          <div className="rounded-2xl bg-[#1E1B27] border border-[#272332] p-4 shadow-2xs flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-full bg-[#16141D] text-[#E2A97E] border border-[#272332] flex items-center justify-center shrink-0 shadow-2xs">
              <Leaf className="w-4 h-4 text-[#E2A97E]" />
            </div>
            <div>
              <p className="font-serif text-xs sm:text-sm font-bold text-[#F5F3F8]">
                Turn fabric waste into new possibilities.
              </p>
              <p className="text-[11px] text-[#9E97A9] leading-tight mt-0.5 font-sans">
                Create optimized cutting plans and give leftover fabric a second life.
              </p>
            </div>
          </div>

          {/* Bottom Card: Project Summary */}
          <div className="bg-[#16141D] rounded-3xl border border-[#272332] p-5 shadow-2xs space-y-3.5">
            <div className="flex items-center gap-2 pb-2.5 border-b border-[#272332]">
              <div className="w-6 h-6 rounded-lg bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center border border-[#272332]">
                <FileText className="w-3.5 h-3.5 text-[#E2A97E]" />
              </div>
              <h3 className="font-serif text-sm font-bold text-[#F5F3F8]">
                Project Summary
              </h3>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#9E97A9]">Project Name</span>
                <span className="font-semibold text-[#F5F3F8] truncate max-w-[150px]">{formData.name || 'Summer Collection'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9E97A9]">Garment Type</span>
                <span className="font-semibold text-[#F5F3F8]">{formData.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9E97A9]">Target Quantity</span>
                <span className="font-semibold text-[#F5F3F8]">{formData.targetQuantity} {formData.units}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9E97A9]">Fabric Type</span>
                <span className="font-semibold text-[#F5F3F8]">{formData.fabricType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9E97A9]">Fabric Width</span>
                <span className="font-semibold text-[#F5F3F8]">{formData.fabricWidth} cm</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9E97A9]">Rotation</span>
                <span className="font-semibold text-[#F5F3F8]">{formData.allowRotation ? 'Allowed' : 'Restricted'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9E97A9]">Grain Direction</span>
                <span className="font-semibold text-[#F5F3F8]">{formData.grainDirection}</span>
              </div>
            </div>

            {/* Next Step CTA Button with subtle watermark / elegance */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-semibold bg-[#8E2B45] text-white hover:bg-[#A33452] transition-colors shadow-lg shadow-[#8E2B45]/20 flex items-center justify-center gap-2 cursor-pointer group relative overflow-hidden"
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
          targetType="fabric"
          title="Fabric Camera & AI Identification"
          subtitle="Capture a close-up of your fabric to automatically identify weave, characteristics, and care guidelines"
        />
      )}

    </div>
  );
}
