import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TopNavbar } from '../components/common/TopNavbar';
import { 
  Plus, 
  ArrowRight, 
  ArrowLeft,
  RotateCcw,
  Camera,
  Trash2, 
  Sparkles,
  UploadCloud,
  ChevronRight,
  Leaf,
  Layers,
  Scissors
} from 'lucide-react';
import { PatternFormModal } from '../components/fabric/PatternFormModal';
import { CameraCaptureModal } from '../components/fabric/CameraCaptureModal';
import { FabricAnalysisCard } from '../components/fabric/FabricAnalysisCard';
import { CutOrderPlanningModal } from '../components/fabric/CutOrderPlanningModal';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';
import { PRODUCT_TYPES, getProductTypeById } from '../data/productTypes';
import { validatePatternImageFile, readImageFileAsDataUrl } from '../utils/imageUploadValidator';
import { analyzeFabricImage } from '../utils/fabricAnalysisEngine';

export function AddPatternsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const [isAnalyzingFabric, setIsAnalyzingFabric] = useState(false);
  const [isCopModalOpen, setIsCopModalOpen] = useState(false);
  const { 
    getProject, 
    addPattern, 
    updatePattern, 
    deletePattern, 
    updatePatternQuantity,
    loadProductTemplates,
    uploadProjectPatternImage, 
    removeProjectPatternImage,
    setProjectExtractedShape,
    uploadProjectFabricImage,
    removeProjectFabricImage
  } = useProjects();

  const project = getProject(id);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState(null);
  const [isFabricCameraOpen, setIsFabricCameraOpen] = useState(false);
  const patternFileInputRef = useRef(null);

  if (!project) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center bg-white rounded-2xl border border-[#EAE2DE] my-8 shadow-xs">
        <h2 className="text-xl font-serif font-bold text-[#4A252B]">Project Not Found</h2>
        <p className="text-xs text-[#81777B] mt-2">The requested cutting project does not exist.</p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const patterns = project.patterns || [];
  const rawProductType = project.productType || 'Shirt';
  const prodObj = getProductTypeById(rawProductType);
  const productType = prodObj ? prodObj.name : rawProductType;

  const handleOpenAddModal = () => {
    setEditingPattern(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pat) => {
    setEditingPattern(pat);
    setIsModalOpen(true);
  };

  const handleSavePattern = (patternData) => {
    if (editingPattern) {
      updatePattern(project.id, editingPattern.id, patternData);
    } else {
      addPattern(project.id, patternData);
    }
  };

  const handleDeletePattern = (patternId) => {
    deletePattern(project.id, patternId);
  };

  const handleReloadTemplates = (pType) => {
    if (loadProductTemplates) {
      loadProductTemplates(project.id, pType || productType);
    }
  };

  const handlePatternFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validation = validatePatternImageFile(file);
    if (!validation.isValid) return;

    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      uploadProjectPatternImage(project.id, {
        imageUrl: dataUrl,
        imageName: validation.fileInfo.name,
        formattedSize: validation.fileInfo.formattedSize,
        sizeBytes: validation.fileInfo.size,
        uploadedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to read pattern image:', err);
    }
  };

  const handleFabricCameraConfirm = (captured) => {
    if (!project || !uploadProjectFabricImage) return;
    uploadProjectFabricImage(project.id, {
      imageUrl: captured.dataUrl,
      imageName: `Fabric_Capture_${Date.now().toString(36)}.jpg`,
      formattedSize: captured.formattedSize,
      sizeBytes: captured.sizeBytes,
      capturedAt: captured.capturedAt || new Date().toISOString(),
      width: captured.width,
      height: captured.height
    });
  };

  const handleContinue = () => {
    navigate(`/project/${project.id}/optimize`);
  };

  // Helper SVG silhouette renderer
  const renderSilhouette = (name) => {
    const n = (name || '').toLowerCase();
    if (n.includes('sleeve')) {
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full text-[#81777B] stroke-current fill-[#F3E6E4]" strokeWidth="1.5">
          <path d="M12 10 C16 6 24 6 28 10 L32 32 L8 32 Z" />
        </svg>
      );
    }
    if (n.includes('collar')) {
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full text-[#81777B] stroke-current fill-[#F3E6E4]" strokeWidth="1.5">
          <path d="M6 16 C14 20 26 20 34 16 L32 26 C24 28 16 28 8 26 Z" />
        </svg>
      );
    }
    if (n.includes('pocket')) {
      return (
        <svg viewBox="0 0 40 40" className="w-full h-full text-[#81777B] stroke-current fill-[#F3E6E4]" strokeWidth="1.5">
          <path d="M10 12 H30 V24 L20 30 L10 24 Z" />
        </svg>
      );
    }
    // Default Bodice / Torso
    return (
      <svg viewBox="0 0 40 40" className="w-full h-full text-[#81777B] stroke-current fill-[#F3E6E4]" strokeWidth="1.5">
        <path d="M12 8 L8 14 L14 18 L14 32 H26 L26 18 L32 14 L28 8 C24 10 16 10 12 8 Z" />
      </svg>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. TOP HEADER BAR */}
      <TopNavbar placeholder="Search patterns, fabrics..." />

      {/* 2. PAGE TITLE & STEPPER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#EAE2DE]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F3E6E4] text-[#783751] flex items-center justify-center shadow-2xs shrink-0 border border-[#C08274]/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#4A252B] tracking-tight">
              Fabric Optimizer
            </h1>
            <p className="text-xs text-[#81777B]">
              Get the most efficient nesting layout for your patterns.
            </p>
          </div>
        </div>

        {/* 4-Step Indicator Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 text-xs font-medium">
          {/* Step 1: Active */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#783751] text-white shadow-xs shrink-0">
            <span className="w-4 h-4 rounded-full bg-white text-[#783751] flex items-center justify-center font-bold text-[10px]">
              1
            </span>
            <span className="font-semibold">Upload Patterns</span>
          </div>

          {/* Step 2 */}
          <div 
            onClick={handleContinue}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[#81777B] hover:text-[#39343A] hover:bg-[#F3E6E4]/40 transition-colors shrink-0 cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-[#EAE2DE] text-[#39343A] flex items-center justify-center text-[10px]">
              2
            </span>
            <span>Fabric Settings</span>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[#81777B] shrink-0 opacity-75">
            <span className="w-4 h-4 rounded-full bg-[#EAE2DE] text-[#39343A] flex items-center justify-center text-[10px]">
              3
            </span>
            <span>Optimize</span>
          </div>

          {/* Step 4 */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[#81777B] shrink-0 opacity-75">
            <span className="w-4 h-4 rounded-full bg-[#EAE2DE] text-[#39343A] flex items-center justify-center text-[10px]">
              4
            </span>
            <span>Results</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. TWO-COLUMN LAYOUT: UPLOAD ZONE + PATTERN LIST (Reference Screen 3)
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Upload Pattern Files (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAE2DE] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#4A252B]">
              Upload Pattern Files
            </h2>
            <button
              type="button"
              onClick={() => setIsCopModalOpen(true)}
              className="text-[11px] font-mono text-[#783751] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-[#C08274]" />
              <span>COP Bundling</span>
            </button>
          </div>

          <input
            ref={patternFileInputRef}
            type="file"
            accept=".png,.jpg,.jpeg,.svg,.dxf,image/png,image/jpeg"
            onChange={handlePatternFileUpload}
            className="hidden"
          />

          {/* Large Drag & Drop Box */}
          <div 
            onClick={() => patternFileInputRef.current?.click()}
            className="border-2 border-dashed border-[#EAE2DE] hover:border-[#783751] rounded-2xl p-8 text-center bg-[#FBF7F5] transition-colors cursor-pointer group space-y-3"
          >
            <div className="w-12 h-12 rounded-full bg-white text-[#783751] border border-[#EAE2DE] flex items-center justify-center mx-auto shadow-2xs group-hover:scale-105 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#39343A]">
                Drag & drop pattern files here
              </p>
              <p className="text-[11px] text-[#81777B] mt-0.5">
                Supports PNG, JPG, SVG, DXF
              </p>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                patternFileInputRef.current?.click();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors cursor-pointer inline-block"
            >
              Choose Files
            </button>
          </div>

          {/* Pattern Silhouettes Preview Row */}
          <div>
            <p className="text-[11px] font-semibold text-[#81777B] uppercase tracking-wider mb-2">
              Detected Silhouettes
            </p>
            <div className="grid grid-cols-4 gap-2.5">
              {['Front Bodice', 'Back Bodice', 'Sleeve', 'Pocket'].map((piece, i) => (
                <div key={i} className="h-20 rounded-xl bg-[#FBF7F5] border border-[#EAE2DE] p-2 flex flex-col items-center justify-center">
                  <div className="w-10 h-10">
                    {renderSilhouette(piece)}
                  </div>
                  <span className="text-[9px] font-mono text-[#81777B] mt-1 truncate max-w-full">
                    {piece}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Pattern List (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#EAE2DE] p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[#4A252B]">
              Pattern List
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleReloadTemplates(productType)}
                className="text-xs text-[#81777B] hover:text-[#783751] cursor-pointer flex items-center gap-1"
                title="Reset to default templates"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#F3E6E4] text-[#783751] hover:bg-[#F3E6E4]/70 border border-[#C08274]/30 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Piece</span>
              </button>
            </div>
          </div>

          {/* Pattern Items List */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {patterns.length === 0 ? (
              <div className="text-center py-10 text-stone-400 space-y-2">
                <Scissors className="w-8 h-8 mx-auto text-[#81777B]" />
                <p className="text-xs">No pattern pieces loaded yet.</p>
                <button
                  type="button"
                  onClick={() => handleReloadTemplates(productType)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors cursor-pointer"
                >
                  Load {productType} Templates
                </button>
              </div>
            ) : (
              patterns.map((piece) => (
                <div
                  key={piece.id}
                  className="bg-[#FBF7F5] rounded-xl border border-[#EAE2DE] p-3 flex items-center justify-between gap-3 hover:border-[#783751] transition-colors"
                >
                  {/* Left: Thumbnail & Details */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-[#EAE2DE] p-1 flex items-center justify-center shrink-0">
                      {renderSilhouette(piece.name)}
                    </div>
                    <div>
                      <h4 
                        onClick={() => handleOpenEditModal(piece)}
                        className="text-xs font-semibold text-[#39343A] hover:text-[#783751] cursor-pointer"
                      >
                        {piece.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[#81777B]">
                        {piece.width} × {piece.height} cm
                      </p>
                    </div>
                  </div>

                  {/* Right: Quantity Stepper & Delete */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-[#EAE2DE] rounded-lg bg-white overflow-hidden text-xs">
                      <button
                        type="button"
                        onClick={() => updatePatternQuantity(project.id, piece.id, Math.max(1, (Number(piece.quantity) || 1) - 1))}
                        className="px-2 py-1 text-[#81777B] hover:bg-[#F3E6E4]/40 cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 font-mono font-semibold text-[#39343A]">
                        {piece.quantity} pcs
                      </span>
                      <button
                        type="button"
                        onClick={() => updatePatternQuantity(project.id, piece.id, (Number(piece.quantity) || 1) + 1)}
                        className="px-2 py-1 text-[#81777B] hover:bg-[#F3E6E4]/40 cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeletePattern(piece.id)}
                      className="p-1.5 text-[#81777B] hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete pattern piece"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bottom Next Button */}
          <div className="pt-3 border-t border-[#EAE2DE] flex justify-end">
            <button
              type="button"
              onClick={handleContinue}
              className="px-6 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Pattern Form Modal */}
      <PatternFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSavePattern}
        initialPattern={editingPattern}
      />

      {/* Camera Capture Modal */}
      <ErrorBoundary
        componentName="FabricCameraModal"
        title="Camera Capture Unavailable"
        message="The camera subsystem encountered an error."
        fallbackActionLabel="Close"
        onFallbackAction={() => setIsFabricCameraOpen(false)}
      >
        <CameraCaptureModal
          isOpen={isFabricCameraOpen}
          onClose={() => setIsFabricCameraOpen(false)}
          onCaptureConfirm={handleFabricCameraConfirm}
          onFallbackToFileUpload={() => {}}
          title="Capture Fabric Swatch"
          subtitle="Photograph fabric weave and pattern grain alignment for visual inspection"
          targetType="fabric"
        />
      </ErrorBoundary>

      {/* Stage 1: Cut-Order Planning Modal */}
      <CutOrderPlanningModal
        isOpen={isCopModalOpen}
        onClose={() => setIsCopModalOpen(false)}
        project={project}
      />

    </div>
  );
}
