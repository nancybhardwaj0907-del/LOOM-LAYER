import React, { useMemo } from 'react';
import { 
  Calculator, 
  CheckCircle2, 
  AlertTriangle
} from 'lucide-react';
import { calculateFabricRequirement } from '../../utils/fabricRequirementPlanner';

export function FabricRequirementPlanner({
  project,
  settings,
  className = ''
}) {
  // Compute live requirement plan using project inputs and active settings
  const plan = useMemo(() => {
    if (!project) return null;
    return calculateFabricRequirement({
      ...project,
      minSpacing: settings?.minSpacing !== undefined ? settings.minSpacing : project.minSpacing,
      allowRotation: settings?.allowRotation !== undefined ? settings.allowRotation : project.allowRotation,
      respectGrain: settings?.respectGrain !== undefined ? settings.respectGrain : project.respectGrain,
      fabricPricePerMeter: project.fabricPricePerMeter || project.fabricPrice || 200.0
    });
  }, [
    project,
    settings?.minSpacing,
    settings?.allowRotation,
    settings?.respectGrain
  ]);

  if (!project || !plan) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header and Live Feasibility Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-[#E2A97E]" />
          <h3 className="text-base font-serif font-bold text-[#F5F3F8]">
            Fabric Requirement & Stock Feasibility
          </h3>
        </div>

        {/* Stock Sufficiency Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {plan.isSufficient ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#1E1B27] text-emerald-400 border border-emerald-900/50 shadow-2xs font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Sufficient Roll Stock (+{plan.surplusM}m surplus)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/40 text-amber-300 border border-amber-900/50 shadow-2xs font-sans">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Stock Shortfall ({plan.shortfallM}m needed)
            </span>
          )}
        </div>
      </div>

      {/* Unified Single-Layer Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#272332] bg-[#16141D] rounded-xl border border-[#272332] py-3.5 px-6 shadow-2xs">
        {/* Metric 1: Available Roll Stock */}
        <div className="pr-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#9E97A9] block">
            Fabric Roll Stock
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#F5F3F8]">
            {plan.availableRollLengthM} m
            <span className="text-xs font-normal text-[#9E97A9] ml-1">({plan.availableRollLengthCm} cm)</span>
          </div>
          <div className="text-[11px] text-[#9E97A9] mt-0.5">
            {project.fabricType || 'Fabric'} • {plan.fabricWidth} cm cut width
          </div>
        </div>

        {/* Metric 2: Order Pieces */}
        <div className="px-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#9E97A9] block">
            Order Pieces
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#F5F3F8]">
            {plan.totalRequestedPieces} Pieces
          </div>
          <div className="text-[11px] text-[#9E97A9] mt-0.5">
            {project.patterns?.length || 0} garment pattern templates
          </div>
        </div>

        {/* Metric 3: Estimated Needed Length */}
        <div className="px-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#9E97A9] block">
            Estimated Needed
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#F5F3F8]">
            {plan.estimatedRequiredLengthM} m
            <span className="text-xs font-normal text-[#9E97A9] ml-1">({plan.estimatedRequiredLengthCm} cm)</span>
          </div>
          <div className={`text-[11px] font-medium mt-0.5 ${plan.isSufficient ? 'text-emerald-400' : 'text-amber-400'}`}>
            {plan.isSufficient ? `+${plan.surplusM} m balance` : `-${plan.shortfallM} m shortfall`}
          </div>
        </div>

        {/* Metric 4: Estimated Fabric Cost */}
        <div className="pl-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#9E97A9] block">
            Estimated Cost
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#E2A97E]">
            ₹{plan.estimatedFabricCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#9E97A9] mt-0.5">
            ₹{plan.fabricPricePerMeter.toFixed(2)} per linear meter
          </div>
        </div>
      </div>

      {/* Post-Nesting Validated Comparison */}
      {plan.isValidatedComparable && plan.hasValidatedResult && (
        <div className="p-3 rounded-xl bg-[#1E1B27] border border-[#272332] text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-bold text-[#F5F3F8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Validated Cut Length: <strong className="text-[#E2A97E] font-extrabold">{plan.validatedCutLengthM} m</strong> ({plan.validatedCutLengthCm} cm)</span>
          </div>
          <span className="text-[11px] font-mono text-[#E2A97E] font-semibold">
            All {plan.validatedPlacedCount}/{plan.totalRequestedPieces} pieces placed
          </span>
        </div>
      )}
    </div>
  );
}
