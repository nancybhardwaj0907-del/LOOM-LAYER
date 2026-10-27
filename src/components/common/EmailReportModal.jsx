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
  Loader2
} from 'lucide-react';
import { uploadReportToStorage, sendReportEmail } from '../../services/emailReportService';

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
        to: email,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white border border-[#EAE2DE] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
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
              <h3 className="font-serif font-bold text-base leading-tight">Email Report</h3>
              <p className="text-[11px] text-[#F3E6E4]">Send downloadable copy directly to inbox</p>
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
        <div className="p-5 space-y-4">
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
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#F3E6E4] text-[#783751] shrink-0">
              HTML / PDF
            </span>
          </div>

          {status === 'success' ? (
            /* Success State */
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-[#4A252B]">
                  Report Dispatched!
                </h4>
                <p className="text-xs text-[#81777B] mt-1 max-w-xs mx-auto">
                  We've sent your downloadable report to <strong className="text-[#39343A]">{email}</strong>.
                </p>
              </div>

              {/* Direct Link Access */}
              {downloadUrl && (
                <div className="bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl p-3 text-left space-y-2">
                  <label className="text-[10px] font-bold text-[#81777B] uppercase block">
                    Cloud Download Link
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={downloadUrl}
                      className="bg-white border border-[#EAE2DE] text-xs text-[#4A252B] px-2.5 py-1.5 rounded-lg flex-1 font-mono truncate focus:outline-none"
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
                </div>
              )}

              <div className="pt-2 flex items-center justify-center gap-2">
                {downloadUrl && (
                  <a
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 rounded-xl bg-[#F3E6E4] text-[#783751] hover:bg-[#ebd8d5] text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Open Report Now</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#783751] text-white hover:bg-[#642C43] text-xs font-semibold transition-colors cursor-pointer"
                >
                  Done
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
                    placeholder="designer@atelier.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === 'uploading' || status === 'sending'}
                    className="w-full bg-[#FBF7F5] border border-[#EAE2DE] rounded-xl px-3.5 py-2.5 text-xs text-[#39343A] focus:border-[#783751] focus:bg-white outline-none transition-colors"
                  />
                  <Mail className="w-4 h-4 text-[#81777B] absolute right-3 top-3 pointer-events-none" />
                </div>
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
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#783751] hover:bg-[#642C43] text-white flex items-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {(status === 'uploading' || status === 'sending') ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{status === 'uploading' ? 'Uploading to Cloud...' : 'Sending Email...'}</span>
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
