// Vercel Serverless Function: /api/send-report-email
// Handles secure report storage upload using service_role and sends email via Resend

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://afvnkmsyijynajexjoqa.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmdm5rbXN5aWp5bmFqZXhqb3FhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjY2MDE1OSwiZXhwIjoyMTA4MjM2MTU5fQ.38oE7AUBtwYDFWUC1N9QQ3IZJMB-ijOeg2D7S4JjQ4Q';

const supabaseAdmin = createClient(supabaseUrl, serviceKey);

export default async function handler(req, res) {
  // CORS setup
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Only POST is supported.' });
  }

  try {
    const apiKey = process.env.RESEND_API_KEY || process.env.VITE_RESEND_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: 'RESEND_API_KEY is not configured in Vercel Environment Variables. Please add RESEND_API_KEY in your Vercel Project Settings.'
      });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const { to, projectName, reportType, reportContent, metrics, recipientName } = body;
    let downloadUrl = body.downloadUrl;

    if (!to) {
      return res.status(400).json({ error: 'Missing required parameter: to' });
    }

    // Securely upload report to Supabase storage with service_role to bypass RLS
    if (!downloadUrl && reportContent) {
      try {
        const timestamp = Date.now();
        const sanitized = (projectName || 'report').replace(/[^a-zA-Z0-9_-]/g, '_');
        const filePath = `${sanitized}_${timestamp}.html`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('reports')
          .upload(filePath, reportContent, {
            contentType: 'text/html;charset=utf-8',
            upsert: true
          });

        if (!uploadError) {
          const { data: urlData } = supabaseAdmin.storage
            .from('reports')
            .getPublicUrl(filePath);
          downloadUrl = urlData.publicUrl;
        } else {
          console.warn('[Serverless] Storage upload warning:', uploadError.message);
        }
      } catch (uploadErr) {
        console.warn('[Serverless] Could not upload to storage:', uploadErr);
      }
    }

    const title = reportType || 'Fabric Cutting & ESG Report';
    const name = recipientName || 'Designer';
    const proj = projectName || 'Fabric Cutting Project';

    // Build metric highlights
    let metricsHtml = '';
    if (metrics) {
      metricsHtml = `
        <div style="background-color: #FBF7F5; border: 1px solid #EAE2DE; border-radius: 12px; padding: 16px; margin: 24px 0;">
          <h4 style="margin: 0 0 12px 0; color: #4A252B; font-family: Georgia, serif; font-size: 15px;">Report Highlights</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            ${metrics.utilization ? `<tr><td style="padding: 6px 0; color: #81777B;">Marker Utilization</td><td style="text-align: right; font-weight: bold; color: #4A252B;">${metrics.utilization}%</td></tr>` : ''}
            ${metrics.fabricSaved ? `<tr><td style="padding: 6px 0; color: #81777B;">Fabric Saved</td><td style="text-align: right; font-weight: bold; color: #2E6F40;">${metrics.fabricSaved}</td></tr>` : ''}
            ${metrics.wasteReduced ? `<tr><td style="padding: 6px 0; color: #81777B;">Waste Reduced</td><td style="text-align: right; font-weight: bold; color: #4A252B;">${metrics.wasteReduced}</td></tr>` : ''}
            ${metrics.co2Saved ? `<tr><td style="padding: 6px 0; color: #81777B;">CO₂ Avoided</td><td style="text-align: right; font-weight: bold; color: #2E6F40;">${metrics.co2Saved}</td></tr>` : ''}
          </table>
        </div>
      `;
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F5F2; margin: 0; padding: 24px; color: #39343A; }
          .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #EAE2DE; overflow: hidden; }
          .header { background-color: #783751; padding: 28px 24px; text-align: center; }
          .header h1 { color: #ffffff; font-family: Georgia, serif; margin: 0; font-size: 24px; font-weight: normal; }
          .header p { color: #F3E6E4; margin: 6px 0 0 0; font-size: 13px; }
          .body-content { padding: 32px 28px; }
          .btn-download { display: inline-block; background-color: #783751; color: #ffffff !important; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
          .footer { padding: 20px 28px; background-color: #FBF7F5; border-top: 1px solid #EAE2DE; text-align: center; font-size: 12px; color: #81777B; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Loom & Layer</h1>
            <p>Atelier Circular Cutting & Sustainability Engine</p>
          </div>
          <div class="body-content">
            <h2 style="color: #4A252B; font-family: Georgia, serif; font-size: 20px; margin-top: 0;">${title}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #5B5257;">
              Hello ${name},<br/><br/>
              Your requested downloadable report for <strong>${proj}</strong> is ready. You can inspect the complete cutting geometry, marker layout, and sustainability analytics using the link below.
            </p>

            ${metricsHtml}

            ${downloadUrl ? `
              <div style="text-align: center; margin: 32px 0 24px 0;">
                <a href="${downloadUrl}" class="btn-download" target="_blank" rel="noopener noreferrer">
                  📥 Download Report File
                </a>
              </div>
              <p style="font-size: 12px; color: #81777B; line-height: 1.5; text-align: center;">
                This download link is securely stored on your atelier cloud storage.
              </p>
            ` : ''}
          </div>
          <div class="footer">
            © ${new Date().getFullYear()} Loom & Layer Atelier. Zero-waste circular pattern engineering.
          </div>
        </div>
      </body>
      </html>
    `;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Loom & Layer <onboarding@resend.dev>',
        to: [to],
        subject: `[Loom & Layer] ${title} — ${proj}`,
        html: emailHtml,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error('[Vercel Serverless] Resend API error:', resendData);
      return res.status(resendResponse.status).json({
        error: resendData.message || 'Failed to dispatch email via Resend'
      });
    }

    return res.status(200).json({
      success: true,
      id: resendData.id,
      downloadUrl
    });
  } catch (err) {
    console.error('[Vercel Serverless] Unexpected error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
