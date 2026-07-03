export function getModernEmailHtml(title, headerText, contentHtml) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    body { font-family: 'Inter', -apple-system, sans-serif; background-color: #09090b; color: #fafafa; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
    .wrapper { max-width: 600px; margin: 0 auto; }
    .container { background: #18181b; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.4); border: 1px solid #27272a; }
    .header { background: linear-gradient(135deg, #09090b 0%, #18181b 100%); padding: 32px; text-align: center; border-bottom: 2px solid #34d399; }
    .header h1 { color: #ffffff; font-size: 26px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
    .header span { color: #34d399; }
    .content { padding: 40px 32px; line-height: 1.7; font-size: 15px; color: #d4d4d8; }
    .content p { margin-top: 0; margin-bottom: 24px; }
    .content strong { color: #ffffff; font-weight: 600; }
    .card-details { background: #09090b; border-left: 3px solid #34d399; border-radius: 8px; padding: 24px; margin: 32px 0; border: 1px solid #27272a; }
    .card-details h3 { margin: 0 0 16px 0; color: #ffffff; font-size: 18px; font-weight: 600; }
    .detail-row { margin-bottom: 16px; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-label { display: block; font-size: 12px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .detail-value { font-size: 15px; color: #ffffff; font-weight: 500; margin: 0; }
    .detail-value a { color: #34d399; text-decoration: none; }
    .footer { background-color: #18181b; padding: 0 32px 32px; font-size: 13px; color: #71717a; text-align: center; }
    .btn { background-color: #34d399; color: #09090b !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 700; font-size: 15px; display: inline-block; letter-spacing: 0.5px; border: none; }
    .otp-card { background: #09090b; border-radius: 12px; padding: 40px 24px; margin: 32px 0; border: 1px solid #27272a; text-align: center; }
    .otp-label { color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; display: block; }
    .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #34d399; margin: 0; line-height: 1; }
    .warning-box { background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 16px; border-radius: 8px; margin-top: 16px; }
    .warning-text { margin: 0; color: #ef4444; font-size: 14px; font-weight: 600; }
    .payment-section { margin-top: 32px; border-top: 1px solid #27272a; padding-top: 32px; text-align: left; }
    .payment-section h3 { margin: 0 0 8px 0; color: #ffffff; font-size: 18px; font-weight: 700; }
    .payment-desc { margin: 0 0 24px 0; color: #a1a1aa; font-size: 14px; }
    .payment-card { border-radius: 8px; padding: 16px; margin-bottom: 12px; }
    .payment-card.recommended { background: #09090b; border: 1px solid #34d399; border-left: 4px solid #34d399; }
    .payment-card.standard { background: #09090b; border: 1px solid #27272a; }
    .payment-card h4 { margin: 0 0 4px 0; color: #ffffff; font-size: 16px; font-weight: 600; }
    .payment-card p { margin: 0; color: #a1a1aa; font-size: 13px; }
    .badge { display: inline-block; background: rgba(52, 211, 153, 0.1); color: #34d399; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: middle; margin-left: 8px; border: 1px solid rgba(52, 211, 153, 0.2); }
    .bank-details-card { background: #09090b; border: 1px dashed #3f3f46; border-radius: 8px; padding: 24px; margin-top: 24px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; }
    .bank-row { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #27272a; }
    .bank-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .bank-label { color: #a1a1aa; display: inline-block; width: 110px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .bank-val { color: #ffffff; font-weight: 600; font-size: 14px; user-select: all; }
    .deliverable-card { background: #09090b; border: 1px solid #27272a; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 32px 0; }
    .play-icon { width: 56px; height: 56px; background: #34d399; border-radius: 50%; display: inline-block; line-height: 56px; margin-bottom: 20px; box-shadow: 0 8px 16px rgba(52, 211, 153, 0.25); }
    .play-icon span { color: #09090b; font-size: 22px; margin-left: 4px; vertical-align: middle; }
    .deliverable-card h3 { margin: 0 0 12px 0; color: #ffffff; font-size: 20px; font-weight: 700; }
    .deliverable-card p { margin: 0 0 24px 0; color: #a1a1aa; font-size: 15px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>${title || 'MONOLITH <span>WORKFLOW</span>'}</h1>
      </div>
      <div class="content">
        ${headerText ? `<h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 24px;">${headerText}</h2>` : ''}
        ${contentHtml}
      </div>
      <div class="footer">&copy; ${new Date().getFullYear()} Monolith Media. All rights reserved.</div>
    </div>
  </div>
</body>
</html>
  `;
}
