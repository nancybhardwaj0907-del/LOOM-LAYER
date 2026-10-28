import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Info, 
  Shirt, 
  Droplet, 
  Scissors, 
  Eye, 
  RotateCcw,
  Tag
} from 'lucide-react';

export function FabricIdentificationCard({
  identification,
  isAnalyzing = false,
  onRetakePhoto,
  className = ''
}) {
  // 1. Loading / In-flight Analysis State
  if (isAnalyzing) {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#16141D] border border-[#272332] space-y-3 animate-pulse shadow-md ${className}`}>
        <div className="flex items-center gap-2.5 text-[#E2A97E] text-xs font-mono font-bold">
          <Sparkles className="w-4 h-4 animate-spin text-[#E2A97E]" />
          <span>Analyzing fabric weave, yarn alignment &amp; surface fibers...</span>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-[#1E1B27] rounded-md w-3/4"></div>
          <div className="h-2.5 bg-[#1E1B27] rounded-md w-full"></div>
          <div className="h-2.5 bg-[#1E1B27] rounded-md w-5/6"></div>
        </div>
        <p className="text-[11px] text-[#9E97A9] font-sans leading-relaxed">
          Evaluating diagonal twill ridge frequency, slub distribution, and surface reflectance metrics via AI Computer Vision.
        </p>
      </div>
    );
  }

  if (!identification) return null;

  // 2. Unclear / Poor Lighting / Blurry Image State
  if (!identification.isClear) {
    return (
      <div className={`p-4 sm:p-5 rounded-2xl bg-[#201518] border border-rose-900/60 text-[#F5F3F8] space-y-3.5 shadow-md ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-950/80 text-rose-400 border border-rose-800/60 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-bold text-rose-200 uppercase tracking-wider font-mono">
              Fabric Photo Needs Better Clarity
            </h4>
            <p className="text-xs text-rose-200/90 leading-relaxed font-sans">
              {identification.unclearMessage || 'The captured photo is too blurry or lacks sufficient lighting for reliable AI identification. Weave interlacing and fiber characteristics could not be resolved.'}
            </p>
          </div>
        </div>

        {/* Guidance tip on how to capture clearly */}
        <div className="p-3 rounded-xl bg-[#16141D]/90 border border-rose-900/40 text-xs text-[#D8D2E1] space-y-1">
          <span className="font-semibold text-[#E2A97E] block text-[11px] uppercase font-mono">
            How to Capture an Optimal Fabric Photo:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-[#A8A1B4]">
            <li>Lay the fabric completely flat on an even, solid surface.</li>
            <li>Hold your camera steady approximately 15–25 cm (6–10 in) above the cloth.</li>
            <li>Ensure bright, diffuse daylight or overhead lamp illumination without dark hand shadows.</li>
          </ul>
        </div>

        {onRetakePhoto && (
          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={onRetakePhoto}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#8E2B45] text-white hover:bg-[#A33452] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Clearer Photo</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 3. Successful Identification State
  const {
    fabricName,
    category,
    confidence = 90,
    characteristics,
    commonUses,
    careInstructions,
    weaveType,
    typicalWeight,
    recommendedNeedle,
    cuttingTip,
    provider,
    disclaimer
  } = identification;

  // Determine badge styling based on confidence
  const confidenceColor = confidence >= 90 
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
    : confidence >= 80 
    ? 'text-[#E2A97E] bg-amber-500/10 border-amber-500/30'
    : 'text-amber-300 bg-amber-500/10 border-amber-500/20';

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-[#16141D] border border-[#272332] space-y-4 shadow-md text-[#F5F3F8] ${className}`}>
      
      {/* Top Header: Badge, Title & Confidence */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-[#272332]">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#8E2B45]/20 text-[#E2A97E] border border-[#8E2B45]/40 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#A8A1B4]">
                AI-Estimated Fabric Classification
              </span>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#1E1B27] text-[#E2A97E] border border-[#272332]">
                Visual Appearance
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#F5F3F8] flex items-center gap-2 mt-0.5">
              <span>{fabricName}</span>
              {weaveType && (
                <span className="text-xs font-mono font-normal text-[#A8A1B4]">
                  ({weaveType})
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* Confidence Percentage Pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span 
            className={`text-xs font-mono font-bold px-2.5 py-1 rounded-xl border flex items-center gap-1.5 shadow-2xs ${confidenceColor}`}
            title="Estimated visual match confidence"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{confidence}% Match</span>
          </span>
        </div>
      </div>

      {/* 3 Structured Information Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Block 1: Visible Fabric Characteristics */}
        <div className="p-3.5 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E2A97E] mb-1 font-sans">
              <Eye className="w-3.5 h-3.5 shrink-0 text-[#E2A97E]" />
              <span>Visible Characteristics</span>
            </div>
            <p className="text-[11px] text-[#D8D2E1] leading-relaxed font-sans">
              {characteristics}
            </p>
          </div>
          {typicalWeight && (
            <div className="pt-2 border-t border-[#272332]/60 text-[10px] font-mono text-[#9E97A9]">
              Weight: <span className="text-[#F5F3F8] font-semibold">{typicalWeight}</span>
            </div>
          )}
        </div>

        {/* Block 2: Common Uses */}
        <div className="p-3.5 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E2A97E] mb-1 font-sans">
              <Shirt className="w-3.5 h-3.5 shrink-0 text-[#E2A97E]" />
              <span>Common Uses</span>
            </div>
            <p className="text-[11px] text-[#D8D2E1] leading-relaxed font-sans">
              {commonUses}
            </p>
          </div>
          {recommendedNeedle && (
            <div className="pt-2 border-t border-[#272332]/60 text-[10px] font-mono text-[#9E97A9]">
              Sewing Needle: <span className="text-[#F5F3F8] font-semibold">{recommendedNeedle}</span>
            </div>
          )}
        </div>

        {/* Block 3: Basic Care Instructions */}
        <div className="p-3.5 rounded-xl bg-[#1E1B27] border border-[#272332] space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#E2A97E] mb-1 font-sans">
              <Droplet className="w-3.5 h-3.5 shrink-0 text-[#E2A97E]" />
              <span>Basic Care Instructions</span>
            </div>
            <p className="text-[11px] text-[#D8D2E1] leading-relaxed font-sans">
              {careInstructions}
            </p>
          </div>
          {cuttingTip && (
            <div className="pt-2 border-t border-[#272332]/60 text-[10px] font-mono text-[#9E97A9]">
              Lay Prep: <span className="text-[#F5F3F8] font-semibold">{cuttingTip.slice(0, 36)}...</span>
            </div>
          )}
        </div>

      </div>

      {/* Mandatory Regulatory & Scientific Disclaimer */}
      <div className="p-2.5 rounded-xl bg-[#1E1B27]/60 border border-[#272332] flex items-start gap-2 text-[10px] text-[#9E97A9] leading-relaxed">
        <Info className="w-3.5 h-3.5 text-[#E2A97E] shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-[#D8D2E1]">AI-Estimated Classification: </span>
          {disclaimer || 'Classification is derived from optical surface geometry, weave pattern, and color tone. Visual analysis does not provide exact chemical fiber composition or certified laboratory fiber assay.'}
          {provider && (
            <span className="block mt-0.5 font-mono text-[9px] text-[#7D7588]">
              Engine: {provider}
            </span>
          )}
        </div>
      </div>

    </div>
  );
}
