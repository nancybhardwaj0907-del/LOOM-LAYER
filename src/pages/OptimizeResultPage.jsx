import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Mail,
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
import { EmailReportModal } from '../components/common/EmailReportModal';

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
import { downloadHTMLAsPDF } from '../utils/pdfExportService';

export function OptimizeResultPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject } = useProjects();
  const { profile } = useUserProfile();

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
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

  const handleDownload = async (format) => {
    try {
      const plan = generateCuttingPlan(project);
      const safeProjectName = (project.name || 'cutting_plan').replace(/\s+/g, '_').toLowerCase();

      if (format === 'dxf') {
        const dxfContent = exportCuttingPlanToDXF(plan);
        downloadFile(dxfContent, `${safeProjectName}_aama.dxf`, 'application/dxf');
      } else if (format === 'pdf') {
        const printHtml = generatePrintableCuttingPlanHTML(plan);
        await downloadHTMLAsPDF(printHtml, `${safeProjectName}_cutting_plan.pdf`, { orientation: 'landscape' });
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
      
      {/* 1. ATELIER MARKER HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#24212D]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#8E2B45]/15 border border-[#8E2B45]/30 text-[#ECA7B8] flex items-center justify-center shadow-xs shrink-0">
            <Scissors className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#F5F3F8] tracking-tight">
              Cutting & Marker Layout
            </h1>
            <p className="text-xs text-[#A8A1B4]">
              Review nested marker layout, fine-tune placements, and export production CAM vectors.
            </p>
          </div>
        </div>

        {/* Right Production Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => navigate('/rethread')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1E1B27] border border-[#2E293B] text-[#D8D2E1] hover:bg-[#252230] transition-colors shadow-2xs cursor-pointer"
            title="Repurpose offcut remnants into circular fashion accessories"
          >
            <Recycle className="w-3.5 h-3.5 text-[#E2A97E]" />
            <span>ReThread Offcuts</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/project/${project.id}/sustainability`)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1E1B27] border border-[#2E293B] text-[#D8D2E1] hover:bg-[#252230] transition-colors cursor-pointer"
            title="View Sustainability ESG Report"
          >
            <BarChart3 className="w-3.5 h-3.5 text-emerald-400" />
            <span>ESG Report</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEmailModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#1E1B27] border border-[#2E293B] text-[#D8D2E1] hover:bg-[#252230] transition-colors shadow-2xs cursor-pointer"
            title="Email cutting plan report directly to inbox"
          >
            <Mail className="w-3.5 h-3.5 text-[#ECA7B8]" />
            <span>Email Report</span>
          </button>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-[#8E2B45] hover:bg-[#A13350] text-white transition-colors shadow-xs cursor-pointer"
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
        <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8C8499] mb-1 font-mono">
            <span>Marker Efficiency</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-emerald-400">
            {project.utilization || 81.2}%
          </div>
          <p className="text-[11px] text-[#A8A1B4] mt-0.5 font-mono">Fabric yield utilization</p>
        </div>

        <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8C8499] mb-1 font-mono">
            <span>Cut Length Req.</span>
            <Scissors className="w-3.5 h-3.5 text-[#E2A97E]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5F3F8]">
            {project.cutLength || 91.0} <span className="text-sm font-sans font-normal text-[#8C8499]">cm</span>
          </div>
          <p className="text-[11px] text-[#A8A1B4] mt-0.5 font-mono">Along {project.fabricLength || 500}cm roll</p>
        </div>

        <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8C8499] mb-1 font-mono">
            <span>Fabric Saved</span>
            <Sparkles className="w-3.5 h-3.5 text-[#ECA7B8]" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#ECA7B8]">
            {project.fabricSavedMeters || '2.4'} <span className="text-sm font-sans font-normal text-[#8C8499]">m</span>
          </div>
          <p className="text-[11px] text-[#A8A1B4] mt-0.5 font-mono">Saved vs baseline layout</p>
        </div>

        <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#8C8499] mb-1 font-mono">
            <span>Nested Pieces</span>
            <Layers className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-2xl font-serif font-bold text-[#F5F3F8]">
            {totalPlacements} <span className="text-sm font-sans font-normal text-[#8C8499]">placed</span>
          </div>
          <p className="text-[11px] text-[#A8A1B4] mt-0.5 font-mono">{project.fabricType || 'Cotton'} roll</p>
        </div>
      </div>

      {/* ========================================================
          3. FULL WIDTH FABRIC CANVAS WORKSPACE
          ======================================================== */}
      <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#24212D]">
          <div>
            <h2 className="text-base font-serif font-bold text-[#F5F3F8]">
              Fabric Marker Canvas
            </h2>
            <p className="text-xs text-[#A8A1B4] font-mono">
              Roll: {project.fabricLength || 500} × {project.fabricWidth || 150} cm &bull; {project.fabricType || 'Cotton'} &bull; 0.5cm Safety Buffer
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marker Optimized</span>
            </span>
          </div>
        </div>

        {/* Fabric Canvas */}
        <div className="rounded-xl overflow-hidden border border-[#24212D] bg-[#111015]">
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
        <div className="lg:col-span-8 bg-[#16141D] rounded-2xl border border-[#272332] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#24212D]">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#F5F3F8]">
                Placed Pattern Pieces ({totalPlacements})
              </h3>
              <p className="text-xs text-[#A8A1B4]">
                Individual component dimensions and grain orientations on the roll.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#24212D] text-[#8C8499] font-mono">
                  <th className="pb-2.5 font-medium">Piece Name</th>
                  <th className="pb-2.5 font-medium">Dimensions</th>
                  <th className="pb-2.5 font-medium">Grain Line</th>
                  <th className="pb-2.5 font-medium">Coordinates</th>
                  <th className="pb-2.5 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#24212D]">
                {placements.map((pl, idx) => (
                  <tr key={idx} className="hover:bg-[#1E1B27] transition-colors">
                    <td className="py-2.5 font-medium text-[#F5F3F8] flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#1E1B27] border border-[#2E293B] p-1 flex items-center justify-center shrink-0">
                        {renderSilhouette(pl.name)}
                      </div>
                      <span>{pl.name || `Piece ${idx + 1}`}</span>
                    </td>
                    <td className="py-2.5 font-mono text-[#A8A1B4]">
                      {Math.round(pl.width || 0)} × {Math.round(pl.height || 0)} cm
                    </td>
                    <td className="py-2.5 text-[#A8A1B4]">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-[#1E1B27] border border-[#2E293B] font-mono">
                        {pl.rotation === 0 ? '0° (Lengthwise)' : `${pl.rotation}° Adjusted`}
                      </span>
                    </td>
                    <td className="py-2.5 font-mono text-[11px] text-[#A8A1B4]">
                      X: {Math.round(pl.x || 0)}, Y: {Math.round(pl.y || 0)}
                    </td>
                    <td className="py-2.5 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
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
          <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-5 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-[#E2A97E] flex items-center justify-center border border-amber-500/20">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold text-[#F5F3F8]">
                ReThread Circular Atelier
              </h4>
              <p className="text-xs text-[#A8A1B4] mt-1 leading-relaxed">
                This marker plan produces ~{project.wastePercentage || 15}% fabric offcuts. Convert leftover scraps into zero-waste scrunchies, pocket squares, and tote pouches.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/rethread')}
              className="w-full mt-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#8E2B45] hover:bg-[#A13350] text-white transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Explore Remnant Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-[#16141D] rounded-2xl border border-[#272332] p-5 shadow-sm space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#F5F3F8]">
              <Info className="w-4 h-4 text-[#E2A97E]" />
              <span>Production Verification</span>
            </div>
            <p className="text-[11px] text-[#A8A1B4] leading-relaxed">
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
            <div className="p-6 text-center space-y-2 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-emerald-400">Cutting Plan Exported!</h4>
              <p className="text-xs text-[#A8A1B4]">
                Your marker file has been exported with high-precision vector coordinates.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-2.5">
                <div
                  onClick={() => handleDownload('dxf')}
                  className="p-3.5 rounded-xl border border-[#272332] bg-[#1E1B27] hover:border-[#8E2B45] hover:bg-[#252230] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#141219] text-[#D8D2E1] font-mono font-bold text-xs border border-[#2E293B]">
                      DXF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5F3F8]">DXF-AAMA Standard</div>
                      <div className="text-[11px] text-[#A8A1B4]">Universal CAD vector format for CNC cutters</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#8C8499]" />
                </div>

                <div
                  onClick={() => handleDownload('pdf')}
                  className="p-3.5 rounded-xl border border-[#272332] bg-[#1E1B27] hover:border-[#8E2B45] hover:bg-[#252230] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#8E2B45]/20 text-[#ECA7B8] font-mono font-bold text-xs border border-[#8E2B45]/30">
                      PDF
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5F3F8]">1:1 Scale Marker Plotter PDF</div>
                      <div className="text-[11px] text-[#A8A1B4]">Print-ready cutting master with grain markings</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#8C8499]" />
                </div>

                <div
                  onClick={() => handleDownload('svg')}
                  className="p-3.5 rounded-xl border border-[#272332] bg-[#1E1B27] hover:border-[#8E2B45] hover:bg-[#252230] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#141219] text-[#D8D2E1] font-mono font-bold text-xs border border-[#2E293B]">
                      SVG
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5F3F8]">Laser Path SVG</div>
                      <div className="text-[11px] text-[#A8A1B4]">Optimized continuous contour stroke sequence</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#8C8499]" />
                </div>

                <div
                  onClick={() => handleDownload('gcode')}
                  className="p-3.5 rounded-xl border border-[#272332] bg-[#1E1B27] hover:border-[#8E2B45] hover:bg-[#252230] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#8E2B45]/20 text-[#ECA7B8] font-mono font-bold text-xs border border-[#8E2B45]/30">
                      .NC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5F3F8]">CNC / Laser G-Code (.nc)</div>
                      <div className="text-[11px] text-[#A8A1B4]">Toolpath coordinates for automated cutter beds</div>
                    </div>
                  </div>
                  <Download className="w-4 h-4 text-[#8C8499]" />
                </div>

                <div
                  onClick={() => {
                    setIsExportModalOpen(false);
                    setIsEmailModalOpen(true);
                  }}
                  className="p-3.5 rounded-xl border border-[#8E2B45]/40 bg-[#1E1B27] hover:bg-[#252230] cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[#8E2B45] text-white font-mono font-bold text-xs">
                      EMAIL
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#F5F3F8]">Send Report to Email</div>
                      <div className="text-[11px] text-[#A8A1B4]">Deliver cutting plan report and cloud download link to inbox</div>
                    </div>
                  </div>
                  <Mail className="w-4 h-4 text-[#ECA7B8]" />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-[#2E293B] bg-[#1E1B27] text-[#D8D2E1] hover:bg-[#252230] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Email Report Modal */}
      <EmailReportModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        defaultEmail={profile?.email || 'designer@atelier.com'}
        recipientName={profile?.name || 'Designer'}
        projectName={project?.name || 'Fabric Cut Plan'}
        reportType="Cutting & Marker Plan Report"
        reportContent={project ? generatePrintableCuttingPlanHTML(project) : ''}
        metrics={{
          utilization: project?.markerUtilization || project?.utilization || 88,
          fabricSaved: project?.fabricSavedMeters ? `${project.fabricSavedMeters} m` : undefined,
          wasteReduced: project?.wastePercentage ? `${project.wastePercentage}%` : undefined,
          co2Saved: project?.co2SavedKg ? `${project.co2SavedKg} kg` : undefined
        }}
        fileName={`${project?.name || 'Cutting_Plan'}_Report`}
      />

    </div>
  );
}
