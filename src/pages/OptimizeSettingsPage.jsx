import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Cpu, 
  SlidersHorizontal, 
  AlertCircle,
  Scissors,
  RotateCw,
  Compass,
  Sparkles,
  Zap,
  Scale,
  Layers,
  Leaf
} from 'lucide-react';
import { OptimizationProgressBar } from '../components/fabric/OptimizationProgressBar';
import { FabricRequirementPlanner } from '../components/fabric/FabricRequirementPlanner';
import { CutOrderPlanningModal } from '../components/fabric/CutOrderPlanningModal';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';

export function OptimizeSettingsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { 
    getProject, 
    runFabricOptimization, 
    runFabricOptimizationAsync, 
    updateProject
  } = useProjects();

  const project = getProject(id);
  const abortControllerRef = useRef(null);

  const [isCopModalOpen, setIsCopModalOpen] = useState(false);
  const [settings, setSettings] = useState({
    minSpacing: 0.5,
    allowRotation: true,
    respectGrain: true,
    optimizationPriority: 'Minimum Fabric Waste',
  });

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [progressData, setProgressData] = useState({
    percent: 12,
    status: 'Analyzing fabric dimensions & grain alignment...'
  });

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  if (!project) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center bg-white rounded-2xl border border-[#EAE2DE] my-8 shadow-xs">
        <h2 className="text-xl font-serif font-bold text-[#4A252B]">Project Not Found</h2>
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
  const totalPieces = patterns.reduce((sum, p) => sum + (Number(p.quantity) || 0), 0);

  const handleApplySpecifications = (newSpecs) => {
    if (project?.id && typeof updateProject === 'function') {
      updateProject(project.id, newSpecs);
    }
  };

  const handleCancelOptimization = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsOptimizing(false);
    setErrorMessage('Optimization was cancelled by user.');
  };

  const handleStartOptimization = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isOptimizing) return;
    setErrorMessage(null);

    if (patterns.length === 0) {
      setErrorMessage('Please add at least one garment pattern piece before running optimization.');
      return;
    }

    const fabricWidth = Number(project.fabricWidth);
    const fabricLength = Number(project.fabricLength);
    if (!fabricWidth || fabricWidth <= 0 || !fabricLength || fabricLength <= 0) {
      setErrorMessage('Invalid fabric roll dimensions. Fabric width and length must be positive numbers.');
      return;
    }

    if (totalPieces <= 0) {
      setErrorMessage('Total requested garment pattern piece quantities must be at least 1.');
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsOptimizing(true);
    setProgressData({
      percent: 12,
      status: 'Analyzing fabric dimensions & grain alignment...'
    });

    try {
      let result;
      if (typeof runFabricOptimizationAsync === 'function') {
        result = await runFabricOptimizationAsync(
          project.id, 
          settings, 
          (p) => {
            setProgressData({
              percent: p.percent,
              status: p.status
            });
          },
          { signal: controller.signal }
        );
      } else {
        result = runFabricOptimization(project.id, settings);
      }

      if (result?.cancelled) {
        setIsOptimizing(false);
        setErrorMessage('Optimization was cancelled.');
        return;
      }

      if (result && result.success) {
        navigate(`/project/${project.id}/result`);
      } else {
        setIsOptimizing(false);
        setErrorMessage(
          result?.error || 
          'Could not place pattern pieces inside fabric dimensions. Please check fabric width or reduce pattern sizes.'
        );
      }
    } catch (err) {
      console.error('Optimization execution error:', err);
      setIsOptimizing(false);
      setErrorMessage(
        err?.message || 'An unexpected error occurred while running the fabric nesting solver.'
      );
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. PAGE TITLE & STEPPER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#272332]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1E1B27] text-[#E2A97E] flex items-center justify-center shrink-0 border border-[#272332]">
            <SlidersHorizontal className="w-5 h-5 text-[#E2A97E]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F3F8] tracking-tight">
              Optimization Settings
            </h1>
            <p className="text-xs text-[#9E97A9]">
              Set blade clearance, rotation flexibility, and nesting objective priorities.
            </p>
          </div>
        </div>

        {/* 4-Step Indicator Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto pb-1 text-xs font-medium">
          <div 
            onClick={() => navigate(`/project/${project.id}/patterns`)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[#9E97A9] hover:text-[#F5F3F8] hover:bg-[#1E1B27] transition-colors shrink-0 cursor-pointer"
          >
            <span className="w-4 h-4 rounded-full bg-[#272332] text-[#9E97A9] flex items-center justify-center text-[10px]">1</span>
            <span>Upload Patterns</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8E2B45] text-white shadow-xs shrink-0">
            <span className="w-4 h-4 rounded-full bg-white text-[#8E2B45] flex items-center justify-center font-bold text-[10px]">2</span>
            <span className="font-semibold">Fabric Settings</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[#9E97A9] shrink-0 opacity-75">
            <span className="w-4 h-4 rounded-full bg-[#272332] text-[#9E97A9] flex items-center justify-center text-[10px]">3</span>
            <span>Optimize</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[#9E97A9] shrink-0 opacity-75">
            <span className="w-4 h-4 rounded-full bg-[#272332] text-[#9E97A9] flex items-center justify-center text-[10px]">4</span>
            <span>Results</span>
          </div>
        </div>
      </div>

      {/* Optimization Processing Screen */}
      {isOptimizing ? (
        <OptimizationProgressBar 
          progress={progressData.percent}
          statusText={progressData.status}
          onCancel={handleCancelOptimization}
        />
      ) : (
        <>
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Notice:</strong> {errorMessage}
              </div>
            </div>
          )}

          {/* Fabric Requirement & Feasibility Overview */}
          <FabricRequirementPlanner
            project={project}
            settings={settings}
            onApplySpecifications={handleApplySpecifications}
          />

          <form onSubmit={handleStartOptimization} className="space-y-6">
            
            {/* Cutting Constraints & Clearance */}
            <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#E2A97E]" />
                <h3 className="text-sm font-semibold text-[#F5F3F8]">
                  Cutting Constraints & Clearance
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Blade Clearance Spacing */}
                <div className="p-4 rounded-xl border border-[#272332] bg-[#1E1B27] flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-semibold text-[#F5F3F8] mb-1">
                      Blade Clearance Spacing
                    </label>
                    <p className="text-[11px] text-[#9E97A9] mb-3">
                      Minimum safety gap between cutting silhouettes
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5.0"
                      value={settings.minSpacing}
                      onChange={(e) => setSettings({ ...settings, minSpacing: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full px-3 py-2 text-xs font-bold bg-[#16141D] border border-[#272332] rounded-xl focus:outline-none focus:border-[#8E2B45] text-[#F5F3F8]"
                      required
                    />
                    <span className="text-xs font-semibold text-[#9E97A9] bg-[#16141D] px-3 py-2 rounded-xl border border-[#272332] shrink-0">
                      cm
                    </span>
                  </div>
                </div>

                {/* 2. Allow 180° Rotation */}
                <div 
                  onClick={() => setSettings({ ...settings, allowRotation: !settings.allowRotation })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    settings.allowRotation
                      ? 'border-[#8E2B45] bg-[#8E2B45]/20 ring-1 ring-[#8E2B45]'
                      : 'border-[#272332] bg-[#1E1B27] hover:border-[#8E2B45]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="block text-xs font-semibold text-[#F5F3F8]">
                        180° Pattern Rotation
                      </span>
                      <p className="text-[11px] text-[#9E97A9] mt-1">
                        Allows symmetric pieces to turn for tighter nesting
                      </p>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors p-0.5 shrink-0 ${
                      settings.allowRotation ? 'bg-[#8E2B45]' : 'bg-[#272332]'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                        settings.allowRotation ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#272332] flex items-center gap-1.5 text-[11px]">
                    <RotateCw className="w-3.5 h-3.5 text-[#E2A97E]" />
                    <span className={settings.allowRotation ? 'text-[#E2A97E] font-semibold' : 'text-[#9E97A9]'}>
                      {settings.allowRotation ? 'Rotation enabled' : 'Rotation locked'}
                    </span>
                  </div>
                </div>

                {/* 3. Respect Fabric Grain */}
                <div 
                  onClick={() => setSettings({ ...settings, respectGrain: !settings.respectGrain })}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    settings.respectGrain
                      ? 'border-[#8E2B45] bg-[#8E2B45]/20 ring-1 ring-[#8E2B45]'
                      : 'border-[#272332] bg-[#1E1B27] hover:border-[#8E2B45]/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="block text-xs font-semibold text-[#F5F3F8]">
                        Grain Alignment Lock
                      </span>
                      <p className="text-[11px] text-[#9E97A9] mt-1">
                        Strictly adheres to warp and weft grainlines
                      </p>
                    </div>
                    <div className={`w-9 h-5 rounded-full transition-colors p-0.5 shrink-0 ${
                      settings.respectGrain ? 'bg-[#8E2B45]' : 'bg-[#272332]'
                    }`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                        settings.respectGrain ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#272332] flex items-center gap-1.5 text-[11px]">
                    <Compass className="w-3.5 h-3.5 text-[#E2A97E]" />
                    <span className={settings.respectGrain ? 'text-[#E2A97E] font-semibold' : 'text-[#9E97A9]'}>
                      {settings.respectGrain ? `Aligned (${project.grainDirection || 'Vertical'})` : 'Flexible alignment'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Optimization Priority Section */}
            <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#E2A97E]" />
                <h3 className="text-sm font-semibold text-[#F5F3F8]">
                  Optimization Objective Priority
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    value: 'Minimum Fabric Waste',
                    label: 'Minimum Fabric Waste',
                    tag: 'Yield Focus',
                    icon: Sparkles,
                    desc: 'Maximizes fabric surface utilization and minimizes offcut waste.'
                  },
                  {
                    value: 'Minimum Cutting Length',
                    label: 'Minimum Cutting Length',
                    tag: 'Speed Focus',
                    icon: Zap,
                    desc: 'Minimizes CNC knife traverse distance to accelerate production.'
                  },
                  {
                    value: 'Balanced',
                    label: 'Balanced Optimization',
                    tag: 'Yield + Speed',
                    icon: Scale,
                    desc: 'Harmonizes high material utilization with fast cutting cycle times.'
                  }
                ].map((opt) => {
                  const isSelected = settings.optimizationPriority === opt.value;
                  return (
                    <div
                      key={opt.value}
                      onClick={() => setSettings({ ...settings, optimizationPriority: opt.value })}
                      className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#8E2B45] bg-[#8E2B45]/20 ring-1 ring-[#8E2B45]'
                          : 'border-[#272332] hover:border-[#8E2B45]/50 bg-[#1E1B27]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-[#8E2B45] bg-[#8E2B45]' : 'border-[#635B70] bg-[#16141D]'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span className="text-xs font-bold text-[#F5F3F8]">
                              {opt.label}
                            </span>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isSelected ? 'bg-[#16141D] text-[#E2A97E] border border-[#272332]' : 'bg-[#1E1B27] text-[#9E97A9] border border-[#272332]'
                          }`}>
                            {opt.tag}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#9E97A9] pl-6 leading-relaxed">{opt.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => navigate(`/project/${project.id}/patterns`)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-[#272332] bg-[#1E1B27] text-[#F5F3F8] hover:bg-[#272332] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Patterns</span>
              </button>

              <button
                type="submit"
                disabled={isOptimizing}
                onClick={handleStartOptimization}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-[#8E2B45] text-white hover:bg-[#A33452] transition-colors shadow-lg shadow-[#8E2B45]/20 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <Scissors className="w-4 h-4" />
                <span>Execute Marker Nesting ({totalPieces} Pieces)</span>
              </button>
            </div>

          </form>
        </>
      )}

      {/* Stage 1: Cut-Order Planning Modal */}
      <CutOrderPlanningModal
        isOpen={isCopModalOpen}
        onClose={() => setIsCopModalOpen(false)}
        project={project}
      />
    </div>
  );
}
