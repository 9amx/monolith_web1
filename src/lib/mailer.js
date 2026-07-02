import nodemailer from 'nodemailer';
import { generateInvoiceBuffer } from './generateInvoice.js';

// You can add your SMTP server configuration here later
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'password',
  },
});

export async function sendCardAssignmentEmail(toEmail, cardDetails, assignedBy) {
  try {
    const clientHtml = (cardDetails.clientName || cardDetails.title) ? `
      <div class="detail-row">
        <span class="detail-label">Client Name</span>
        <p class="detail-value">${cardDetails.clientName || cardDetails.title}</p>
      </div>
    ` : '';

    const deadlineHtml = `
      <div class="detail-row">
        <span class="detail-label">Deadline / Timer</span>
        <p class="detail-value" style="color: #ef4444;">
          ${cardDetails.deadlineHours ? `${cardDetails.deadlineHours} Hours (Timer has started!)` : 'Check dashboard for deadline'}
        </p>
      </div>
    `;

    const linksHtml = cardDetails.projectLinks && cardDetails.projectLinks.length > 0 ? `
      <div class="detail-row">
        <span class="detail-label">Project Links</span>
        ${cardDetails.projectLinks.map(l => `<p class="detail-value"><a href="${l.url}" style="color: #34d399;">${l.url}</a></p>`).join('')}
      </div>
    ` : '';

    const attachmentsHtml = `
      <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px; margin-top: 16px;">
        <p style="margin: 0; color: #166534; font-size: 14px;"><strong>Important:</strong> Please log in to your dashboard to view the project deadline, collect any project links, and download attached files before starting your work.</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: `Project Assignment: ${cardDetails.projectFileName || cardDetails.title}`,
      text: `Hello,\n\nYou have been assigned to "${cardDetails.projectFileName || cardDetails.title}".\n\nPlease check the Monolith Workflow board for full details.`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', -apple-system, sans-serif; background-color: #f4f4f5; color: #27272a; margin: 0; padding: 40px 20px; }
            .wrapper { max-width: 600px; margin: 0 auto; }
            .container { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #f4f4f5; }
            .header { background-color: #09090b; padding: 32px; text-align: center; border-bottom: 3px solid #34d399; }
            .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 700; }
            .header span { color: #34d399; }
            .content { padding: 40px 32px; line-height: 1.7; }
            .card-details { background: #fafafa; border-left: 4px solid #34d399; border-radius: 0 8px 8px 0; padding: 24px; margin: 32px 0; }
            .detail-row { margin-bottom: 16px; }
            .detail-label { display: block; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .detail-value { font-size: 15px; color: #27272a; font-weight: 500; margin: 0; }
            .footer { background-color: #ffffff; padding: 0 32px 32px; font-size: 14px; color: #a1a1aa; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>MONOLITH <span>WORKFLOW</span></h1>
              </div>
              <div class="content">
                <h2 style="color: #09090b; font-size: 20px; font-weight: 600; margin-top: 0;">New Project Assignment</h2>
                <p>Hello, you have been assigned to a new project by <strong>${assignedBy}</strong>.</p>
                <div class="card-details">
                  ${clientHtml}
                  <div class="detail-row">
                    <span class="detail-label">Project Name</span>
                    <p class="detail-value">${cardDetails.projectFileName || 'Unnamed Project'}</p>
                  </div>
                  ${deadlineHtml}
                  ${linksHtml}
                  <div class="detail-row" style="margin-bottom: 0;">
                    <span class="detail-label">Description</span>
                    <p class="detail-value" style="font-weight: 400; color: #52525b; line-height: 1.5;">${cardDetails.description || 'No description provided.'}</p>
                  </div>
                  ${attachmentsHtml}
                </div>
                <p style="margin-top: 32px;">Log in to your dashboard to view the full details and start working.</p>
              </div>
              <div class="footer">&copy; ${new Date().getFullYear()} Monolith Workflow.</div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('Assignment email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending assignment email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendOtpEmail(toEmail, otpCode, type) {
  const isSignup = type === 'signup';
  const isLogin = type === 'login';
  const subject = isSignup ? 'Verify your Monolith Workflow email' : (isLogin ? 'Your Login Verification Code' : 'Reset your Monolith Workflow password');
  const title = isSignup ? 'Email Verification' : (isLogin ? 'Login Verification' : 'Password Reset');
  const actionText = isSignup ? 'verify your email address' : (isLogin ? 'verify your login' : 'reset your password');

  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject,
      text: `Hello,\n\nHere is your 6-digit code to ${actionText}:\n\n${otpCode}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this, you can safely ignore this email.\n\nBest,\nMonolith Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #27272a; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
            .wrapper { max-width: 600px; margin: 0 auto; }
            .container { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); border: 1px solid #f4f4f5; }
            .header { background-color: #09090b; padding: 32px; text-align: center; border-bottom: 3px solid #34d399; }
            .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
            .header span { color: #34d399; }
            .content { padding: 40px 32px; line-height: 1.7; text-align: center; }
            .content p { margin-top: 0; margin-bottom: 24px; color: #52525b; font-size: 16px; }
            .otp-card {
              background: #09090b;
              border-radius: 12px;
              padding: 40px 24px;
              margin: 32px 0;
              box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
            }
            .otp-label { color: #a1a1aa; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0; display: block; }
            .otp-code { font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #34d399; margin: 0; line-height: 1; }
            .footer { background-color: #ffffff; padding: 0 32px 32px; font-size: 14px; color: #a1a1aa; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>MONOLITH <span>WORKFLOW</span></h1>
              </div>
              <div class="content">
                <h2 style="color: #09090b; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 16px;">${title}</h2>
                <p>Here is your 6-digit code to ${actionText}:</p>
                
                <div class="otp-card">
                  <span class="otp-label">Verification Code</span>
                  <div class="otp-code">${otpCode}</div>
                </div>
                
                <p style="color: #71717a; font-size: 14px; margin-bottom: 8px;">This code will expire in 10 minutes.</p>
                <p style="color: #71717a; font-size: 14px; margin-bottom: 32px;">If you didn't request this, you can safely ignore this email.</p>
                <p style="margin-bottom: 0;">Best regards,<br><strong>Monolith Team</strong></p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Monolith Workflow. All rights reserved.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log('OTP email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending OTP email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendSubmissionEmail(adminEmail, submissionDetails, submittedBy, pdfBuffer) {
  try {
    const editorName = submittedBy.name || 'An editor';
    const editorEmail = submittedBy.email || 'N/A';
    const editorUsername = submittedBy.username || 'N/A';

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: adminEmail,
      subject: `Project Delivery & Invoice: ${submissionDetails.clientName}`,
      text: `Hello,\n\nA new project delivery has been submitted by ${editorName}.\n\nClient: ${submissionDetails.clientName}\nVideo Link: ${submissionDetails.videoLink}\nDuration: ${submissionDetails.duration ? submissionDetails.duration + ' minutes' : 'N/A'}\n\nPlease check the dashboard for more details.\n\nBest,\nMonolith Team`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #27272a; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
            .wrapper { max-width: 600px; margin: 0 auto; }
            .container { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); border: 1px solid #f4f4f5; }
            .header { background-color: #09090b; padding: 32px; text-align: center; border-bottom: 3px solid #34d399; }
            .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
            .header span { color: #34d399; }
            .content { padding: 40px 32px; line-height: 1.7; }
            .content p { margin-top: 0; margin-bottom: 24px; color: #52525b; font-size: 16px; }
            .content strong { color: #09090b; font-weight: 600; }
            .card-details { background: #fafafa; border-left: 4px solid #34d399; border-radius: 0 8px 8px 0; padding: 24px; margin: 32px 0; }
            .card-details h3 { margin: 0 0 16px 0; color: #09090b; font-size: 18px; font-weight: 600; }
            .detail-row { margin-bottom: 12px; }
            .detail-label { display: block; font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
            .detail-value { font-size: 15px; color: #27272a; font-weight: 500; margin: 0; }
            .footer { background-color: #ffffff; padding: 0 32px 32px; font-size: 14px; color: #a1a1aa; text-align: center; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>MONOLITH <span>WORKFLOW</span></h1>
              </div>
              <div class="content">
                <h2 style="color: #09090b; font-size: 20px; font-weight: 600; margin-top: 0; margin-bottom: 24px;">Project Delivery & Invoice Sent</h2>
                <p>Hello,</p>
                <p>A new project delivery has been submitted and the invoice has been sent to the client.</p>
                
                <div class="card-details" style="border-left-color: #3b82f6;">
                  <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 16px; color: #1e40af;">Editor Details</h3>
                  <div class="detail-row">
                    <span class="detail-label">Name</span>
                    <p class="detail-value">${editorName}</p>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Email</span>
                    <p class="detail-value">${editorEmail}</p>
                  </div>
                  <div class="detail-row" style="margin-bottom: 0;">
                    <span class="detail-label">Username</span>
                    <p class="detail-value">${editorUsername}</p>
                  </div>
                </div>

                <div class="card-details">
                  <div class="detail-row">
                    <span class="detail-label">Client Name</span>
                    <p class="detail-value">${submissionDetails.clientName || submissionDetails.cardTitle}</p>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Project Name</span>
                    <p class="detail-value">${submissionDetails.projectFileName || 'Unnamed Project'}</p>
                  </div>
                  <div class="detail-row" ${!submissionDetails.duration ? 'style="margin-bottom: 0;"' : ''}>
                    <span class="detail-label">Video Link</span>
                    <p class="detail-value"><a href="${submissionDetails.videoLink}" style="color: #34d399;">${submissionDetails.videoLink}</a></p>
                  </div>
                  ${submissionDetails.duration ? `
                  <div class="detail-row" style="margin-bottom: 0;">
                    <span class="detail-label">Duration</span>
                    <p class="detail-value">${submissionDetails.duration} minutes</p>
                  </div>` : ''}
                </div>
                
                <p>An invoice has been automatically generated and sent to the client. A copy is attached to this email.</p>
                <p>Please check the Monolith Workflow dashboard under "Client Review" for more details.</p>
                <p style="margin-bottom: 0;">Best regards,<br><strong>Monolith Team</strong></p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Monolith Workflow. All rights reserved.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: pdfBuffer ? [
        {
          filename: `Invoice_${submissionDetails.projectFileName || 'Monolith'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ] : [],
    });
    console.log('Submission email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending submission email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendDeadlineWarningEmail(toEmail, cardTitle, percent, hoursLeft) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: `Project Warning: ${percent}% of time elapsed for ${cardTitle}`,
      text: `Hello,\n\nThis is a warning that ${percent}% of the deadline has passed for the project "${cardTitle}".\nYou have approximately ${hoursLeft.toFixed(1)} hours left.\n\nPlease ensure you submit your work on time to avoid penalties.\n\nBest,\nMonolith Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Project Deadline Warning</h2>
          <p>Hello,</p>
          <p>This is a system warning that <strong>${percent}%</strong> of the deadline has passed for the project <strong>"${cardTitle}"</strong>.</p>
          <p style="color: #ef4444; font-weight: bold;">You have approximately ${hoursLeft.toFixed(1)} hours left.</p>
          <p>Please ensure you submit your work on time to avoid late penalties.</p>
          <p>Best regards,<br>Monolith Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending warning email:', error.message);
    return { success: false };
  }
}

export async function sendOverdueEmail(toEmail, cardTitle) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: `URGENT: Project Overdue - ${cardTitle}`,
      text: `Hello,\n\nThe deadline for the project "${cardTitle}" has passed.\nIf the project is not delivered within the next 30 minutes, late penalties (2% per hour) will begin to apply.\n\nBest,\nMonolith Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2 style="color: #ef4444;">Project Overdue</h2>
          <p>Hello,</p>
          <p>The deadline for the project <strong>"${cardTitle}"</strong> has officially passed.</p>
          <p><strong>If the project is not delivered within the next 30 minutes, late penalties (2% per hour) will begin to apply.</strong></p>
          <p>Please deliver the project immediately.</p>
          <p>Best regards,<br>Monolith Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending overdue email:', error.message);
    return { success: false };
  }
}

export async function sendCommentEmailToAdmin(adminEmail, cardTitle, commentText, authorName) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: adminEmail,
      subject: `New Comment on Project: ${cardTitle}`,
      text: `Hello,\n\n${authorName} has commented on the project "${cardTitle}".\n\nComment:\n"${commentText}"\n\nPlease check the dashboard to reply.\n\nBest,\nMonolith Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Comment on Project</h2>
          <p>Hello,</p>
          <p><strong>${authorName}</strong> has commented on the project <strong>"${cardTitle}"</strong>.</p>
          <div style="background-color: #f4f4f5; padding: 15px; border-left: 4px solid #34d399; margin: 20px 0;">
            <p style="margin: 0;">"${commentText}"</p>
          </div>
          <p>Please check the Monolith Workflow dashboard to reply.</p>
          <p>Best regards,<br>Monolith Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending comment email:', error.message);
    return { success: false };
  }
}

export async function sendReplyEmailToUser(userEmail, cardTitle, replyText, adminName) {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: userEmail,
      subject: `New Reply on Project: ${cardTitle}`,
      text: `Hello,\n\n${adminName} has replied to your comment on the project "${cardTitle}".\n\nReply:\n"${replyText}"\n\nPlease check the dashboard for details.\n\nBest,\nMonolith Team`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>New Reply on Project</h2>
          <p>Hello,</p>
          <p><strong>${adminName}</strong> has replied to your comment on the project <strong>"${cardTitle}"</strong>.</p>
          <div style="background-color: #f4f4f5; padding: 15px; border-left: 4px solid #34d399; margin: 20px 0;">
            <p style="margin: 0;">"${replyText}"</p>
          </div>
          <p>Please check the Monolith Workflow dashboard for details.</p>
          <p>Best regards,<br>Monolith Team</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending reply email:', error.message);
    return { success: false };
  }
}

export async function sendInvoiceEmail(clientName, amount, profit, date) {
  try {
    const editorCut = amount - profit;
    const formattedDate = new Date(date).toLocaleDateString();
    
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: 'olialkonok2@gmail.com',
      subject: `New Invoice Logged: ${clientName}`,
      text: `A new invoice has been logged.\n\nClient: ${clientName}\nRevenue: $${amount}\nProfit: $${profit}\nEditor Cut: $${editorCut}\nDate: ${formattedDate}\n`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;">New Invoice Logged</h2>
          <p>A new invoice was successfully added to the dashboard.</p>
          <div style="background-color: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="margin: 8px 0;"><strong>Client Name:</strong> ${clientName}</p>
            <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0;"><strong>Total Revenue:</strong> $${amount.toFixed(2)}</p>
            <p style="margin: 8px 0;"><strong>Profit:</strong> $${profit.toFixed(2)}</p>
            <p style="margin: 8px 0;"><strong>Editor Cut:</strong> $${editorCut.toFixed(2)}</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This is an automated notification from Monolith Workflow.</p>
        </div>
      `,
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending invoice email:', error.message);
    return { success: false };
  }
}

export async function sendClientInvoiceEmail(clientEmail, invoiceData, preGeneratedPdfBuffer) {
  try {
    const pdfBuffer = preGeneratedPdfBuffer || await generateInvoiceBuffer(invoiceData);

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: clientEmail,
      subject: `Invoice from Monolith Media - ${invoiceData.invoiceNo || 'New'}`,
      text: `Hello ${invoiceData.clientName || 'Client'},\n\nPlease find attached your invoice.\n\nBest regards,\nMonolith Media`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f4f5; color: #27272a; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased; }
            .wrapper { max-width: 600px; margin: 0 auto; }
            .container { background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.04); border: 1px solid #f4f4f5; }
            .header { background-color: #09090b; padding: 32px; text-align: center; border-bottom: 3px solid #34d399; }
            .header h1 { color: #ffffff; font-size: 24px; margin: 0; font-weight: 700; letter-spacing: -0.5px; }
            .header span { color: #34d399; }
            .content { padding: 40px 32px; line-height: 1.7; }
            .content p { margin-top: 0; margin-bottom: 24px; color: #52525b; font-size: 16px; }
            .content strong { color: #09090b; font-weight: 600; }
            .deliverable-card { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 12px; padding: 32px 24px; text-align: center; margin: 32px 0; }
            .play-icon { width: 56px; height: 56px; background: #34d399; border-radius: 50%; display: inline-block; line-height: 56px; margin-bottom: 20px; box-shadow: 0 8px 16px rgba(52, 211, 153, 0.25); }
            .play-icon span { color: #09090b; font-size: 22px; margin-left: 4px; vertical-align: middle; }
            .deliverable-card h3 { margin: 0 0 12px 0; color: #09090b; font-size: 20px; font-weight: 700; }
            .deliverable-card p { margin: 0 0 24px 0; color: #71717a; font-size: 15px; }
            .btn { background-color: #09090b; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 15px; display: inline-block; letter-spacing: 0.5px; }
            .btn:hover { background-color: #27272a; }
            .footer { background-color: #ffffff; padding: 0 32px 32px; font-size: 14px; color: #a1a1aa; text-align: center; }
            .payment-section { margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 32px; text-align: left; }
            .payment-section h3 { margin: 0 0 8px 0; color: #09090b; font-size: 18px; font-weight: 700; }
            .payment-desc { margin: 0 0 24px 0; color: #52525b; font-size: 14px; }
            .payment-card { border-radius: 8px; padding: 16px; margin-bottom: 12px; }
            .payment-card.recommended { background: #fafafa; border: 1px solid #34d399; border-left: 4px solid #34d399; }
            .payment-card.standard { background: #ffffff; border: 1px solid #e4e4e7; }
            .payment-card h4 { margin: 0 0 4px 0; color: #09090b; font-size: 16px; font-weight: 600; }
            .payment-card p { margin: 0; color: #71717a; font-size: 13px; }
            .badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; vertical-align: middle; margin-left: 8px; }
            .bank-details-card { background: #fafafa; border: 1px dashed #a1a1aa; border-radius: 8px; padding: 24px; margin-top: 24px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 13px; }
            .bank-row { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid #e4e4e7; }
            .bank-row:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
            .bank-label { color: #71717a; display: inline-block; width: 110px; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
            .bank-val { color: #09090b; font-weight: 600; font-size: 14px; user-select: all; }
          </style>
        </head>
        <body>
          <div class="wrapper">
            <div class="container">
              <div class="header">
                <h1>MONOLITH <span>MEDIA</span></h1>
              </div>
              <div class="content">
                <p>Dear <strong>${invoiceData.clientName}</strong>,</p>
                <p>Thank you for partnering with Monolith Media. Your video editing project has been completed successfully.</p>
                <p><strong>Invoice ID:</strong> ${invoiceData.invoiceNo}</p>
                <p>Please find attached the detailed PDF invoice for the services rendered. A direct link to download and view your final deliverable is provided below.</p>
                
                <div class="deliverable-card">
                  <div class="play-icon">
                    <span>▶</span>
                  </div>
                  <h3>Your Video is Ready</h3>
                  <p>High-quality render available for download</p>
                  <a href="${invoiceData.videoLink || '#'}" class="btn">View Deliverable</a>
                </div>
                
                <div class="payment-section">
                  <h3>Supported Payment Methods</h3>
                  <p class="payment-desc">We accept payments via the following services. Remitly and Taptap Send are highly recommended due to their low fees and fast delivery times.</p>
                  
                  <div class="payment-card recommended">
                    <h4>Remitly <span class="badge">Highly Recommended</span></h4>
                    <p>$0 fee &bull; Fast transfer</p>
                  </div>
  
                  <div class="payment-card recommended">
                    <h4>Taptap Send <span class="badge">Highly Recommended</span></h4>
                    <p>Low fee &bull; Fast transfer</p>
                  </div>
  
                  <div class="payment-card standard">
                    <h4>Wise</h4>
                    <p>High fee &bull; Delayed transfer</p>
                  </div>
                  
                  <p class="payment-desc" style="margin-top: 32px; margin-bottom: 16px;"><strong>Verified Bank Details:</strong></p>
                  <div class="bank-details-card">
                    <div class="bank-row"><span class="bank-label">Bank Name:</span><span class="bank-val">Dutch Bangla Bank</span></div>
                    <div class="bank-row">
                      <span class="bank-label">Amount</span>
                      <span class="bank-val" style="color: #059669; font-size: 16px;">$${invoiceData.amount}.00</span>
                    </div>
                    <div class="bank-row"><span class="bank-label">A/C Number:</span><span class="bank-val" style="color: #059669; font-size: 16px;">1201580374514</span></div>
                    <div class="bank-row"><span class="bank-label">First Name:</span><span class="bank-val">MST POLY</span></div>
                    <div class="bank-row"><span class="bank-label">Last Name:</span><span class="bank-val">KHATUN</span></div>
                    <div class="bank-row"><span class="bank-label">SWIFT Code:</span><span class="bank-val">DBBLBDDH</span></div>
                    <div class="bank-row"><span class="bank-label">Branch Code:</span><span class="bank-val">120</span></div>
                    <div class="bank-row"><span class="bank-label">Routing No:</span><span class="bank-val">090471544</span></div>
                    <div class="bank-row"><span class="bank-label">Country:</span><span class="bank-val">Bangladesh</span></div>
                    <div class="bank-row"><span class="bank-label">City:</span><span class="bank-val">KHULNA</span></div>
                    <div class="bank-row"><span class="bank-label">Postcode:</span><span class="bank-val">9000</span></div>
                    <div class="bank-row"><span class="bank-label">Branch:</span><span class="bank-val">Khulna</span></div>
                    <div class="bank-row"><span class="bank-label">Email:</span><span class="bank-val">minzu.bd.123@gmail.com</span></div>
                    <div class="bank-row"><span class="bank-label">Address:</span><span class="bank-val">Holding 26,1, Road Goyalkhali, Boyra, Stamp Khulna GPO</span></div>
                  </div>
                </div>
    
                <p style="margin-top: 32px; margin-bottom: 0; text-align: center;">Best regards,<br><strong>The Monolith Media Team</strong></p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} Monolith Media. All rights reserved.
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      attachments: [
        {
          filename: `Invoice_${invoiceData.invoiceNo || 'Monolith'}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
    console.log('Client invoice email sent: %s', info.messageId);
    return { success: true };
  } catch (error) {
    console.error('Error sending client invoice email:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendDeadlineAlert(toEmail, type, projectDetails) {
  try {
    let subject = "";
    let title = "";
    let messageHtml = "";
    const projectName = projectDetails.projectFileName || projectDetails.title;

    if (type === '50_percent') {
      subject = `⏳ Deadline Alert (50%): ${projectName}`;
      title = `50% Time Elapsed`;
      messageHtml = `<p>This is a friendly reminder that <strong>50%</strong> of the allocated time for your assigned project <strong>${projectName}</strong> has passed.</p>
      <p>Please ensure you are on track to meet the deadline.</p>`;
    } else if (type === '80_percent') {
      subject = `⚠️ URGENT Deadline Alert (80%): ${projectName}`;
      title = `80% Time Elapsed`;
      messageHtml = `<p><strong>Urgent Notice:</strong> <strong>80%</strong> of the allocated time for <strong>${projectName}</strong> has passed!</p>
      <p style="color: #ef4444; font-weight: bold;">You have very little time left. Please finalize your work and submit it soon.</p>`;
    } else if (type === 'overdue') {
      subject = `🚨 DEADLINE OVER: ${projectName}`;
      title = `Deadline Overdue`;
      messageHtml = `<p style="color: #ef4444; font-weight: bold;">The deadline for your project <strong>${projectName}</strong> has expired.</p>
      <p>Please submit the video immediately. If not submitted within the next 30 minutes, a 2% penalty will be applied to your payout, and it will increase by 2% for every subsequent hour it is late.</p>`;
    } else if (type === 'penalty') {
      subject = `💸 Penalty Applied: ${projectName}`;
      title = `Late Penalty Applied`;
      messageHtml = `<p style="color: #ef4444; font-weight: bold;">A penalty of <strong>${projectDetails.penaltyPercent}%</strong> has been applied to your payout for project <strong>${projectName}</strong> due to late submission.</p>
      <p>The penalty will continue to increase by 2% for every hour it remains unsubmitted. Submit your work immediately to stop further penalties!</p>`;
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <div style="background-color: ${type.includes('80') || type === 'overdue' || type === 'penalty' ? '#ef4444' : '#f59e0b'}; padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">${title}</h1>
            </div>
            <div style="padding: 30px; color: #3f3f46; font-size: 16px; line-height: 1.6;">
              ${messageHtml}
              <div style="margin-top: 30px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Go to Dashboard</a>
              </div>
            </div>
            <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
              &copy; ${new Date().getFullYear()} Monolith Media. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });
    console.log(`Deadline alert (${type}) email sent: %s`, info.messageId);
    return { success: true };
  } catch (error) {
    console.error(`Error sending deadline alert (${type}) email:`, error.message);
    return { success: false, error: error.message };
  }
}

