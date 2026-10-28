import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Converts an HTML report string into a crisp, high-resolution downloadable PDF document.
 * Handles single or multi-page slicing cleanly for A4 printing standards.
 * Guaranteed to produce a .pdf file, never falling back to .html.
 *
 * @param {string} htmlContent - Full HTML string of the report
 * @param {string} filename - Target PDF file name (e.g. 'Project_Sustainability_Report.pdf')
 * @param {object} options - Configuration options
 * @param {'portrait'|'landscape'} [options.orientation='portrait'] - Page orientation
 * @returns {Promise<boolean>} True if PDF was generated and saved
 */
export async function downloadHTMLAsPDF(htmlContent, filename = 'Loom_Layer_Report.pdf', options = {}) {
  const safeFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  const orientation = options.orientation || 'portrait';

  if (typeof window === 'undefined' || !window.document) {
    return false;
  }

  // Width in pixels for capturing A4 layout cleanly
  const renderWidth = orientation === 'landscape' ? 1120 : 820;

  // Create isolated offscreen container placed in normal coordinates but hidden
  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = `${renderWidth}px`;
  container.style.minHeight = '100px';
  container.style.background = '#FFFFFF';
  container.style.color = '#2E2219';
  container.style.opacity = '0';
  container.style.pointerEvents = 'none';
  container.style.zIndex = '-9999';

  try {
    // Parse HTML string
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Remove buttons, print bars, and interactive controls from PDF
    doc.querySelectorAll('.no-print, .no-print-bar, script').forEach((el) => el.remove());

    // Extract all styles and CSS rules from document head
    const styles = Array.from(doc.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((el) => el.outerHTML)
      .join('\n');

    // Extract body or sheet wrapper
    const sheetWrapper = doc.querySelector('.sheet-wrapper') || doc.body;

    // Inject styles and content
    container.innerHTML = `
      ${styles}
      <style>
        body, .sheet-wrapper {
          box-shadow: none !important;
          margin: 0 !important;
          padding: 24px !important;
          max-width: ${renderWidth}px !important;
          width: 100% !important;
          background: #ffffff !important;
        }
      </style>
      ${sheetWrapper.innerHTML}
    `;

    document.body.appendChild(container);

    // Wait for fonts and layouts to settle
    await new Promise((resolve) => setTimeout(resolve, 250));

    // Render using html2canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FFFFFF',
      windowWidth: renderWidth,
      width: renderWidth,
      onclone: (clonedDoc) => {
        clonedDoc.querySelectorAll('.no-print, .no-print-bar, script').forEach((el) => el.remove());
      }
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    const pdf = new jsPDF({
      orientation: orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    const pdfPageWidth = orientation === 'landscape' ? 297 : 210;
    const pdfPageHeight = orientation === 'landscape' ? 210 : 297;

    const imgWidth = pdfPageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfPageHeight;

    // Multi-page slicing for longer documents
    while (heightLeft > 5) {
      position = position - pdfPageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pdfPageHeight;
    }

    pdf.save(safeFilename);
    return true;
  } catch (error) {
    console.error('Failed to generate canvas PDF, building vector PDF fallback:', error);
    // Bulletproof fallback: jsPDF creates a real .pdf file without html2canvas
    try {
      const pdf = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
      const pageWidth = orientation === 'landscape' ? 297 : 210;

      // Header Banner
      pdf.setFillColor(120, 37, 81); // Velvet Crimson
      pdf.rect(0, 0, pageWidth, 22, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('LOOM & LAYER — ATELIER EXECUTIVE REPORT', 14, 14);

      pdf.setTextColor(57, 52, 58);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Document: ${safeFilename.replace('.pdf', '')}`, 14, 34);
      pdf.text(`Generated: ${new Date().toLocaleDateString()} | Maison Studio #1 Paris`, 14, 40);

      // Extract plain text summary
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');
      const textContent = doc.body.innerText || 'Loom & Layer Certified Report';
      const cleanSummary = textContent.replace(/\s+/g, ' ').slice(0, 1500);
      const lines = pdf.splitTextToSize(cleanSummary, pageWidth - 28);
      pdf.text(lines, 14, 52);

      pdf.save(safeFilename);
      return true;
    } catch (fallbackErr) {
      console.error('Critical PDF generation failure:', fallbackErr);
      return false;
    }
  } finally {
    if (container.parentNode) {
      document.body.removeChild(container);
    }
  }
}

