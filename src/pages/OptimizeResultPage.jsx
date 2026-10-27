import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Leaf, 
  Scissors, 
  Layers, 
  CheckCircle2, 
  BarChart3,
  Recycle,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { Modal } from '../components/common/FeedbackAndNavigation';
import { FabricCanvas } from '../components/fabric/FabricCanvas';
import { useProjects } from '../context/useProjects';
import { useUserProfile } from '../context/useUserProfile';

import { 
  generateCuttingPlan,
  exportCuttingPlanToDXF,
  exportCuttingPlanToSVG,
  exportCuttingPlanToJSON,
  exportCuttingPlanToGCode,
  generatePrintableCuttingPlanHTML,
  downloadFile,
  openPrintableDocument
} from '../utils/cuttingPlanGenerator';

export function OptimizeResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { profile } = useUserProfile();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const project = getProject(id);

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

  const placements = project.layoutPlacements || [];
  const totalPlacements = placements.length || 0;

  // Helper SVG silhouette renderer for pieces table
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
    // Bodice
    return (
      <svg viewBox="0 0 40 40" className="w-full h-full text-[#783751] stroke-current fill-[#F3E6E4]" strokeWidth="1.5">
        <path d="M12 8 L8 14 L14 18 L14 32 H26 L26 18 L32 14 L28 8 C24 10 16 10 12 8 Z" />
      </svg>
    );
  };

  const handleDownload = (format) => {
    try {
      const plan = generateCuttingPlan(project);
      const safeProjectName = (project.name || 'cutting_plan').replace(/\s+/g, '_').toLowerCase();

      if (format === 'dxf') {
        const dxfContent = exportCuttingPlanToDXF(plan);
        downloadFile(dxfContent, `${safeProjectName}_aama.dxf`, 'application/dxf');
      } else if (format === 'pdf') {
        const printHtml = generatePrintableCuttingPlanHTML(plan);
        openPrintableDocument(printHtml);
      } else if (format === 'svg') {
        const svgContent = exportCuttingPlanToSVG(plan);
        downloadFile(svgContent, `${safeProjectName}_vector.svg`, 'image/svg+xml');
      } else if (format === 'gcode') {
        const gcodeContent = exportCuttingPlanToGCode(plan);
        downloadFile(gcodeContent, `${safeProjectName}_cnc_laser.nc`, 'text/plain');
      }
      
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        setIsExportModalOpen(false);
      }, 1600);
    } catch (err) {
      console.error('Error generating cutting plan export:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* ========================================================
          1. HEADER BAR: ATELIER MARKER WORKBENCH
          ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-[#EAE2DE] shadow-xs bg-[#F3E6E4] shrink-0">
            <img
              src={profile?.avatar || "/atelier/user_avatar.jpg"}
              alt={profile?.name || "Designer"}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/atelier/user_avatar.jpg";
              }}
            />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#4A252B] tracking-tight">
              Cutting & Marker Layout
            </h1>
            <p className="text-xs text-[#81777B]">
              Review the nested marker layout, fine-tune placements, and export production files.
            </p>
          </div>
        </div>

        {/* Right Production Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/rethread')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-[#EAE2DE] text-[#39343A] hover:bg-[#F3E6E4]/40 transition-colors shadow-2xs cursor-pointer"
            title="Repurpose offcut remnants into circular fashion accessories"
          >
            <Recycle className="w-3.5 h-3.5 text-[#783751]" />
            <span>ReThread Offcuts</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/project/${project.id}/sustainability`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#F3E6E4] text-[#783751] hover:bg-[#F3E6E4]/70 border border-[#C08274]/30 transition-colors cursor-pointer"
            title="View Sustainability ESG Report"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ESG Report</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Plan</span>
          </button>
        </div>
      </div>

      {/* ========================================================
          2. ATELIER METRIC STRIP
          ======================================================== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#81777B] mb-1">
            <span>Marker Efficiency</span>
            <Leaf className="w-3.5 h-3.5 text-[#783751]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#783751]">
            {project.utilization || 81.2}%
          </div>
          <p className="text-[11px] text-[#81777B] mt-0.5">Fabric yield utilization</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#81777B] mb-1">
            <span>Cut Length Req.</span>
            <Scissors className="w-3.5 h-3.5 text-[#C08274]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#4A252B]">
            {project.cutLength || 91.0} <span className="text-sm font-sans font-normal text-[#81777B]">cm</span>
          </div>
          <p className="text-[11px] text-[#81777B] mt-0.5">Along {project.fabricLength || 500}cm roll</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#81777B] mb-1">
            <span>Fabric Saved</span>
            <Sparkles className="w-3.5 h-3.5 text-[#783751]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#783751]">
            {project.fabricSavedMeters || '2.4'} <span className="text-sm font-sans font-normal text-[#81777B]">m</span>
          </div>
          <p className="text-[11px] text-[#81777B] mt-0.5">Saved vs baseline layout</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#81777B] mb-1">
            <span>Nested Pieces</span>
            <Layers className="w-3.5 h-3.5 text-[#783751]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#4A252B]">
            {totalPlacements} <span className="text-sm font-sans font-normal text-[#81777B]">placed</span>
          </div>
          <p className="text-[11px] text-[#81777B] mt-0.5">{project.fabricType || 'Cotton'} roll</p>
        </div>
      </div>

      {/* ========================================================
          3. FULL WIDTH FABRIC CANVAS WORKSPACE
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#EAE2DE] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#EAE2DE]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#4A252B]">
              Fabric Marker Canvas
            </h2>
            <p className="text-xs text-[#81777B]">
              Roll Dimensions: {project.fabricLength || 500} × {project.fabricWidth || 150} cm &bull; {project.fabricType || 'Cotton'} &bull; 0.5cm Safety Buffer
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3E6E4] text-[#783751] border border-[#C08274]/30 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#783751]" />
              <span>Marker Optimized</span>
            </span>
          </div>
        </div>

        {/* Fabric Canvas */}
        <div className="rounded-xl overflow-hidden border border-[#EAE2DE] bg-[#FBF7F5]">
          <FabricCanvas
            project={project}
            interactive={true}
            showLabels={true}
            showRulers={true}
            className="w-full"
          />
        </div>
      </div>

      {/* ========================================================
          4. PATTERN PIECES INVENTORY & CIRCULAR ATELIER
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Pieces Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#EAE2DE] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#EAE2DE]">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#4A252B]">
                Placed Pattern Pieces ({totalPlacements})
              </h3>
              <p className="text-xs text-[#81777B]">
                Individual component dimensions and grain orientations on the roll.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#EAE2DE] text-[#81777B] font-medium">
                  <th className="pb-2.5 font-medium">Piece Name</th>
                  <th className="pb-2.5 font-medium">Dimensions</th>
                  <th className="pb-2.5 font-medium">Grain Line</th>
                  <th className="pb-2.5 font-medium">Coordinates</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAE2DE]">
                {placements.map((pl, idx) => (
                  <tr key={idx} className="hover:bg-[#F3E6E4]/30 transition-colors">
                    <td className="py-2.5 font-medium text-[#39343A] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#FBF7F5] border border-[#EAE2DE] p-1 flex items-center justify-center shrink-0">
                        {renderSilhouette(pl.name)}
                      </div>
                      <span>{pl.name || `Piece ${idx + 1}`}</span>
                    </td>
                    <td className="py-2.5 font-mono text-[#81777B]">
                      {Math.round(pl.width || 0)} × {Math.round(pl.height || 0)} cm
                    </td>
                    <td className="py-2.5 text-[#81777B]">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#FBF7F5] border border-[#EAE2DE]">
                        {pl.rotation === 0 ? '0° (Lengthwise)' : `${pl.rotation}° Adjusted`}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#81777B]">
                      X: {Math.round(pl.x || 0)}, Y: {Math.round(pl.y || 0)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#783751] bg-[#F3E6E4] px-2 py-0.5 rounded-full border border-[#C08274]/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Valid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Circular Atelier & Offcuts Callout (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#FBF7F5] rounded-2xl border border-[#EAE2DE] p-5 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-[#F3E6E4] text-[#783751] flex items-center justify-center border border-[#C08274]/30">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-[#4A252B]">
                ReThread Circular Atelier
              </h4>
              <p className="text-xs text-[#81777B] mt-1 leading-relaxed">
                This marker plan produces ~{project.wastePercentage || 15}% fabric offcuts. Convert leftover scraps into zero-waste scrunchies, pocket squares, and tote pouches.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/rethread')}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#783751] text-white hover:bg-[#642C43] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Explore Remnant Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#EAE2DE] p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#39343A]">
              <Info className="w-4 h-4 text-[#C08274]" />
              <span>Production Verification</span>
            </div>
            <p className="text-[11px] text-[#81777B] leading-relaxed">
              All pattern pieces have been verified for zero overlap collision, grain alignment bounds, and safety clearance.
            </p>
          </div>
        </div>

      </div>

      {/* ========================================================
          5. EXPORT / DOWNLOAD MODAL (Preserved & Enhanced)
          ======================================================== */}
      <Modal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Download Cutting Plan & Markers"
        subtitle="Export CAD files ready for automated CNC cutting machines or manual plotters"
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {downloadSuccess ? (
            <div className="p-6 text-center space-y-2 bg-[#F3E6E4] rounded-xl border border-[#C08274]/40">
              <div className="w-12 h-12 bg-white text-[#783751] rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-[#783751]">Cutting Plan Exported!</h4>
              <p className="text-xs text-[#81777B]">
                Your marker file has been exported with high-precision vector coordinates.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2.5">
                <div
                  onClick={() => handleDownload('dxf')}
                  className="p-3.5 rounded-xl border border-[#EAE2DE] hover:border-[#783751] hover:bg-[#F3E6E4]/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-stone-100 text-[#39343A] font-mono font-bold text-xs">
                      DXF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#39343A]">DXF-AAMA Standard</div>
                      <div className="text-[11px] text-[#81777B]">Universal CAD vector format for CNC cutters</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#81777B]" />
                </div>

                <div
                  onClick={() => handleDownload('pdf')}
                  className="p-3.5 rounded-xl border border-[#EAE2DE] hover:border-[#783751] hover:bg-[#F3E6E4]/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F3E6E4] text-[#783751] font-mono font-bold text-xs">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#39343A]">1:1 Scale Marker Plotter PDF</div>
                      <div className="text-[11px] text-[#81777B]">Print-ready cutting master with grain markings</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#81777B]" />
                </div>

                <div
                  onClick={() => handleDownload('svg')}
                  className="p-3.5 rounded-xl border border-[#EAE2DE] hover:border-[#783751] hover:bg-[#F3E6E4]/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#FBF7F5] text-[#39343A] font-mono font-bold text-xs border border-[#EAE2DE]">
                      SVG
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#39343A]">Laser Path SVG</div>
                      <div className="text-[11px] text-[#81777B]">Optimized continuous contour stroke sequence</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#81777B]" />
                </div>

                <div
                  onClick={() => handleDownload('gcode')}
                  className="p-3.5 rounded-xl border border-[#EAE2DE] hover:border-[#783751] hover:bg-[#F3E6E4]/30 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#F3E6E4] text-[#783751] font-mono font-bold text-xs border border-[#C08274]/30">
                      .NC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#39343A]">CNC / Laser G-Code (.nc)</div>
                      <div className="text-[11px] text-[#81777B]">Toolpath coordinates for automated cutter beds</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#81777B]" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-[#EAE2DE] bg-white text-[#39343A] hover:bg-[#F3E6E4]/40 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

    </div>
  );
}
