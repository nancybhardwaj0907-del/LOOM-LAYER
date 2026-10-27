import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

/**
 * Uploads a report file (HTML, CSV, or PDF) to the Supabase Storage 'reports' bucket.
 * 
 * @param {Object} params
 * @param {string|Blob} params.content - HTML string, CSV string, or Blob content
 * @param {string} params.fileName - Target file name, e.g. "Summer_Shirt_ESG_Report.html"
 * @param {string} params.mimeType - e.g. "text/html" or "application/pdf"
 * @returns {Promise<{ success: boolean, publicUrl?: string, filePath?: string, error?: string }>}
 */
export async function uploadReportToStorage({ content, fileName, mimeType = 'text/html' }) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase storage is not configured. Please check your .env.local file.'
    };
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = (fileName || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = `reports/${sanitizedName}_${timestamp}.${mimeType === 'text/html' ? 'html' : 'pdf'}`;

    const blob = typeof content === 'string' 
      ? new Blob([content], { type: `${mimeType};charset=utf-8` }) 
      : content;

    const { data, error } = await supabase.storage
      .from('reports')
      .upload(filePath, blob, {
        contentType: mimeType,
        upsert: true
      });

    if (error) {
      console.error('[emailReportService] Storage upload failed:', error);
      return { success: false, error: error.message };
    }

    const { data: urlData } = supabase.storage
      .from('reports')
      .getPublicUrl(filePath);

    return {
      success: true,
      filePath,
      publicUrl: urlData.publicUrl
    };
  } catch (err) {
    console.error('[emailReportService] Unexpected upload error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Dispatches the report email via Supabase Edge Function with Resend.
 * 
 * @param {Object} params
 * @param {string} params.to - Recipient email address
 * @param {string} params.projectName - Project title
 * @param {string} params.reportType - e.g. "ESG Sustainability Report" or "Cutting Plan CAM Report"
 * @param {string} params.downloadUrl - Downloadable URL from Supabase Storage
 * @param {Object} params.metrics - Optional highlights (utilization, fabricSaved, etc.)
 * @param {string} params.recipientName - Designer name
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
export async function sendReportEmail({
  to,
  projectName,
  reportType,
  downloadUrl,
  reportContent,
  metrics,
  recipientName
}) {
  const payload = {
    to,
    projectName,
    reportType,
    downloadUrl,
    reportContent,
    metrics,
    recipientName
  };

  // 1. Try server API route (/api/send-report-email)
  try {
    const apiRes = await fetch('/api/send-report-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await apiRes.json();
    if (apiRes.ok && (data.success || data.id)) {
      return { 
        success: true, 
        emailId: data.id, 
        downloadUrl: data.downloadUrl || downloadUrl 
      };
    } else if (data?.error) {
      return {
        success: false,
        error: data.error,
        downloadUrl: data.downloadUrl || downloadUrl
      };
    }
  } catch (err) {
    console.warn('[emailReportService] /api/send-report-email fetch error:', err);
  }

  // 2. Try Supabase Edge Function fallback
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.functions.invoke('send-report-email', {
        body: payload
      });

      if (!error && data?.success) {
        return { success: true, emailId: data.emailId, downloadUrl: data.downloadUrl || downloadUrl };
      }
    } catch (err) {
      console.warn('[emailReportService] Supabase Edge Function error:', err);
    }
  }

  return {
    success: false,
    error: 'Failed to dispatch email. Please check your network connection or email authorization in Resend.',
    downloadUrl
  };
}
