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
  if (!project) return null;

  // Compute live requirement plan using project inputs and active settings
  const plan = useMemo(() => {
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

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header and Live Feasibility Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calculator className="w-4 h-4 text-crimson-700" />
          <h3 className="text-base font-editorial font-bold text-atelier-950">
            Fabric Requirement & Stock Feasibility
          </h3>
        </div>

        {/* Stock Sufficiency Status Badge */}
        <div className="flex items-center gap-2 shrink-0">
          {plan.isSufficient ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F3E6E4] text-[#783751] border border-[#C08274]/50 shadow-2xs font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#783751]" />
              Sufficient Roll Stock (+{plan.surplusM}m surplus)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs font-sans">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Stock Shortfall ({plan.shortfallM}m needed)
            </span>
          )}
        </div>
      </div>

      {/* Unified Single-Layer Metrics Strip (No duplicate banners, no '@' symbols) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#EAE2DE] bg-white rounded-xl border border-[#EAE2DE] py-3.5 px-6 shadow-2xs">
        {/* Metric 1: Available Roll Stock */}
        <div className="pr-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#81777B] block">
            Fabric Roll Stock
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#39343A]">
            {plan.availableRollLengthM} m
            <span className="text-xs font-normal text-[#81777B] ml-1">({plan.availableRollLengthCm} cm)</span>
          </div>
          <div className="text-[11px] text-[#81777B] mt-0.5">
            {project.fabricType || 'Fabric'} • {plan.fabricWidth} cm cut width
          </div>
        </div>

        {/* Metric 2: Order Pieces */}
        <div className="px-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#81777B] block">
            Order Pieces
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#39343A]">
            {plan.totalRequestedPieces} Pieces
          </div>
          <div className="text-[11px] text-[#81777B] mt-0.5">
            {project.patterns?.length || 0} garment pattern templates
          </div>
        </div>

        {/* Metric 3: Estimated Needed Length */}
        <div className="px-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#81777B] block">
            Estimated Needed
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#39343A]">
            {plan.estimatedRequiredLengthM} m
            <span className="text-xs font-normal text-[#81777B] ml-1">({plan.estimatedRequiredLengthCm} cm)</span>
          </div>
          <div className={`text-[11px] font-medium mt-0.5 ${plan.isSufficient ? 'text-[#783751]' : 'text-amber-800'}`}>
            {plan.isSufficient ? `+${plan.surplusM} m balance` : `-${plan.shortfallM} m shortfall`}
          </div>
        </div>

        {/* Metric 4: Estimated Fabric Cost */}
        <div className="pl-4 py-2 sm:py-0">
          <span className="text-[10px] font-mono uppercase tracking-wider font-semibold text-[#81777B] block">
            Estimated Cost
          </span>
          <div className="mt-0.5 text-xl font-bold font-mono text-[#783751]">
            ₹{plan.estimatedFabricCost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-[#81777B] mt-0.5">
            ₹{plan.fabricPricePerMeter.toFixed(2)} per linear meter
          </div>
        </div>
      </div>

      {/* Post-Nesting Validated Comparison (Only when previously run with exact same configuration) */}
      {plan.isValidatedComparable && plan.hasValidatedResult && (
        <div className="p-3 rounded-xl bg-[#F3E6E4]/40 border border-[#EAE2DE] text-xs flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5 font-bold text-[#4A252B]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#783751]" />
            <span>Validated Cut Length: <strong className="text-[#783751] font-extrabold">{plan.validatedCutLengthM} m</strong> ({plan.validatedCutLengthCm} cm)</span>
          </div>
          <span className="text-[11px] font-mono text-[#783751] font-semibold">
            All {plan.validatedPlacedCount}/{plan.totalRequestedPieces} pieces placed
          </span>
        </div>
      )}
    </div>
  );
}
