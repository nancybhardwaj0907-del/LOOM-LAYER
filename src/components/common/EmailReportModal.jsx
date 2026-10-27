import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  Download,
  Loader2,
  FileText,
  Inbox
} from 'lucide-react';
import { sendReportEmail } from '../../services/emailReportService';

export function EmailReportModal({
  isOpen,
  onClose,
  defaultEmail = '',
  recipientName = 'Designer',
  projectName = 'Fabric Cut Plan',
  reportType = 'ESG Sustainability Report',
  reportContent, // HTML string or Blob
  metrics = {},
  fileName = 'Report'
}) {
  const [email, setEmail] = useState(defaultEmail || '');
  const [status, setStatus] = useState('idle'); // 'idle' | 'uploading' | 'sending' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!email || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }

    setErrorMessage('');
    setStatus('sending');

    try {
      // Dispatch email and upload report securely through backend service_role (bypasses RLS)
      const emailRes = await sendReportEmail({
        to: email.trim(),
        projectName,
        reportType,
        reportContent,
        metrics,
        recipientName
      });

      if (emailRes.downloadUrl) {
        setDownloadUrl(emailRes.downloadUrl);
      }

      if (!emailRes.success) {
        setErrorMessage(
          emailRes.error || 'Failed to dispatch email. Please ensure your email is authorized in Resend.'
        );
        setStatus('error');
      } else {
        setStatus('success');
      }
    } catch (err) {
      console.error('[EmailReportModal] Error:', err);
      setErrorMessage(err.message || 'An unexpected error occurred.');
      setStatus('error');
    }
  };

  const handleCopy = () => {
    if (!downloadUrl) return;
    navigator.clipboard.writeText(downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Instant local file download
  const handleLocalDownload = () => {
    try {
      let blob;
      if (typeof reportContent === 'string') {
        blob = new Blob([reportContent], { type: 'text/html;charset=utf-8' });
      } else if (reportContent instanceof Blob) {
        blob = reportContent;
      } else {
        blob = new Blob(['<html><body><h1>Report</h1></body></html>'], { type: 'text/html' });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(projectName || 'Fabric_Report').replace(/[^a-zA-Z0-9_-]/g, '_')}_Report.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#EAE2DE] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#783751] px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base leading-tight">Email & Download Report</h3>
              <p className="text-[11px] text-[#F3E6E4]">Instant dispatch to your inbox with direct cloud access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[85vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl p-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#81777B]">
                {reportType}
              </p>
              <h4 className="font-serif font-bold text-[#4A252B] text-sm mt-0.5">
                {projectName}
              </h4>
              {metrics?.utilization && (
                <p className="text-xs text-[#2E6F40] font-medium mt-1">
                  Utilization: {metrics.utilization}% • Saved: {metrics.fabricSaved || 'N/A'}
                </p>
              )}
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3E6E4] text-[#783751] shrink-0 border border-[#C08274]/30">
              Interactive HTML
            </span>
          </div>

          {status === 'success' ? (
            /* Success State */
            <div className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-base text-[#4A252B]">
                    Report Successfully Dispatched!
                  </h4>
                  <p className="text-xs text-[#81777B] mt-1 max-w-sm mx-auto">
                    The report has been transmitted to <strong className="text-[#39343A]">{email}</strong> via Resend.
                  </p>
                </div>
              </div>

              {/* CRITICAL NOTICE: Gmail Spam Folder Warning */}
              <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-950 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Inbox className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Important: Check Spam / Junk / Promotions Folder</span>
                </div>
                <p className="text-[11px] leading-relaxed text-amber-900/90">
                  Because this email was sent from the testing domain (<strong>onboarding@resend.dev</strong>), <strong>Gmail and Outlook frequently divert it into your Spam, Junk, or Promotions folder</strong> instead of Primary Inbox. Please check your Spam folder now.
                </p>
              </div>

              {/* Instant Actions: Open & Download right now */}
              <div className="bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#4A252B] uppercase tracking-wide">
                    Instant Access
                  </span>
                  <span className="text-[10px] text-[#81777B]">
                    No waiting for email delivery
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleLocalDownload}
                    className="px-3 py-2.5 rounded-xl bg-[#783751] hover:bg-[#642C43] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File Now</span>
                  </button>

                  {downloadUrl ? (
                    <a
                      href={downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2.5 rounded-xl bg-white border border-[#EAE2DE] hover:border-[#783751] text-[#783751] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open in Browser</span>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLocalDownload}
                      className="px-3 py-2.5 rounded-xl bg-white border border-[#EAE2DE] text-[#783751] text-xs font-semibold flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View File</span>
                    </button>
                  )}
                </div>

                {downloadUrl && (
                  <div className="pt-2 border-t border-[#EAE2DE] flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={downloadUrl}
                      className="bg-white border border-[#EAE2DE] text-[11px] text-[#4A252B] px-2.5 py-1.5 rounded-lg flex-1 font-mono truncate focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-[#EAE2DE] text-xs text-[#783751] hover:bg-[#F3E6E4]/40 flex items-center gap-1 font-semibold cursor-pointer shrink-0"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="pt-1 flex items-center justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Input / Sending Form */
            <form onSubmit={handleSend} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-[#4A252B] mb-1">
                  Recipient Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="nancybhardwaj0907@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'uploading' || status === 'sending'}
                    className="w-full bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#39343A] focus:border-[#783751] focus:bg-white outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#81777B] absolute right-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-[#81777B] mt-1">
                  Free Resend tier delivers to registered account (e.g. nancybhardwaj0907@gmail.com).
                </p>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p>{errorMessage}</p>
                    {downloadUrl && (
                      <div className="mt-2 pt-2 border-t border-red-200">
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-semibold text-red-800 underline"
                        >
                          <span>Open your report directly from cloud storage</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Direct Download Option (even before sending) */}
              <div className="bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-[#4A252B]">Want local file right now?</p>
                  <p className="text-[10px] text-[#81777B]">Download standalone HTML report without waiting</p>
                </div>
                <button
                  type="button"
                  onClick={handleLocalDownload}
                  className="px-3 py-1.5 rounded-lg border border-[#EAE2DE] bg-white hover:bg-[#F3E6E4]/40 text-[#783751] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Now</span>
                </button>
              </div>

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={status === 'uploading' || status === 'sending'}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-[#EAE2DE] text-[#81777B] hover:bg-[#FBF7F5] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={status === 'uploading' || status === 'sending'}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#783751] hover:bg-[#642C43] text-white flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {(status === 'uploading' || status === 'sending') ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{status === 'uploading' ? 'Uploading to Cloud...' : 'Dispatching Email...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send to Email</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
