import fs from 'fs';
import path from 'path';

const newMailerContent = `import nodemailer from 'nodemailer';
import { generateInvoiceBuffer } from './generateInvoice.js';
import { getModernEmailHtml } from './emailTheme.js';

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
    const clientHtml = (cardDetails.clientName || cardDetails.title) ? \`
      <div class="detail-row">
        <span class="detail-label">Client Name</span>
        <p class="detail-value">\${cardDetails.clientName || cardDetails.title}</p>
      </div>
    \` : '';

    const deadlineHtml = \`
      <div class="detail-row">
        <span class="detail-label">Deadline / Timer</span>
        <p class="detail-value" style="color: #ef4444;">
          \${cardDetails.deadlineHours ? \`\${cardDetails.deadlineHours} Hours (Timer has started!)\` : 'Check dashboard for deadline'}
        </p>
      </div>
    \`;

    const linksHtml = cardDetails.projectLinks && cardDetails.projectLinks.length > 0 ? \`
      <div class="detail-row">
        <span class="detail-label">Project Links</span>
        \${cardDetails.projectLinks.map(l => \`<p class="detail-value"><a href="\${l.url}">\${l.url}</a></p>\`).join('')}
      </div>
    \` : '';

    const attachmentsHtml = \`
      <div class="warning-box" style="margin-top: 16px;">
        <p class="warning-text" style="color: #34d399;"><strong>Important:</strong> Please log in to your dashboard to view the project deadline, collect any project links, and download attached files before starting your work.</p>
      </div>
    \`;

    const htmlContent = \`
      <p>Hello, you have been assigned to a new project by <strong>\${assignedBy}</strong>.</p>
      <div class="card-details">
        \${clientHtml}
        <div class="detail-row">
          <span class="detail-label">Project Name</span>
          <p class="detail-value">\${cardDetails.projectFileName || 'Unnamed Project'}</p>
        </div>
        \${deadlineHtml}
        \${linksHtml}
        <div class="detail-row" style="margin-bottom: 0;">
          <span class="detail-label">Description</span>
          <p class="detail-value" style="font-weight: 400; color: #a1a1aa; line-height: 1.5;">\${cardDetails.description || 'No description provided.'}</p>
        </div>
        \${attachmentsHtml}
      </div>
      <p style="margin-top: 32px;">Log in to your dashboard to view the full details and start working.</p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: \`Project Assignment: \${cardDetails.projectFileName || cardDetails.title}\`,
      text: \`Hello,\\n\\nYou have been assigned to "\${cardDetails.projectFileName || cardDetails.title}".\\n\\nPlease check the Monolith Workflow board for full details.\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', 'New Project Assignment', htmlContent),
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
    const htmlContent = \`
      <p style="text-align: center;">Here is your 6-digit code to \${actionText}:</p>
      <div class="otp-card">
        <span class="otp-label">Verification Code</span>
        <div class="otp-code">\${otpCode}</div>
      </div>
      <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 8px; text-align: center;">This code will expire in 10 minutes.</p>
      <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 32px; text-align: center;">If you didn't request this, you can safely ignore this email.</p>
      <p style="margin-bottom: 0; text-align: center;">Best regards,<br><strong>Monolith Team</strong></p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject,
      text: \`Hello,\\n\\nHere is your 6-digit code to \${actionText}:\\n\\n\${otpCode}\\n\\nThis code will expire in 10 minutes.\\n\\nIf you didn't request this, you can safely ignore this email.\\n\\nBest,\\nMonolith Team\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', title, htmlContent),
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

    const htmlContent = \`
      <p>Hello,</p>
      <p>A new project delivery has been submitted and the invoice has been sent to the client.</p>
      
      <div class="card-details" style="border-left-color: #3b82f6;">
        <h3 style="margin-top: 0; margin-bottom: 16px; font-size: 16px; color: #60a5fa;">Editor Details</h3>
        <div class="detail-row">
          <span class="detail-label">Name</span>
          <p class="detail-value">\${editorName}</p>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email</span>
          <p class="detail-value">\${editorEmail}</p>
        </div>
        <div class="detail-row" style="margin-bottom: 0;">
          <span class="detail-label">Username</span>
          <p class="detail-value">\${editorUsername}</p>
        </div>
      </div>

      <div class="card-details">
        <div class="detail-row">
          <span class="detail-label">Client Name</span>
          <p class="detail-value">\${submissionDetails.clientName || submissionDetails.cardTitle}</p>
        </div>
        <div class="detail-row">
          <span class="detail-label">Project Name</span>
          <p class="detail-value">\${submissionDetails.projectFileName || 'Unnamed Project'}</p>
        </div>
        <div class="detail-row" \${!submissionDetails.duration ? 'style="margin-bottom: 0;"' : ''}>
          <span class="detail-label">Video Link</span>
          <p class="detail-value"><a href="\${submissionDetails.videoLink}" style="color: #34d399;">\${submissionDetails.videoLink}</a></p>
        </div>
        \${submissionDetails.duration ? \`
        <div class="detail-row" style="margin-bottom: 0;">
          <span class="detail-label">Duration</span>
          <p class="detail-value">\${submissionDetails.duration} minutes</p>
        </div>\` : ''}
      </div>
      
      <p>An invoice has been automatically generated and sent to the client. A copy is attached to this email.</p>
      <p>Please check the Monolith Workflow dashboard under "Client Review" for more details.</p>
      <p style="margin-bottom: 0;">Best regards,<br><strong>Monolith Team</strong></p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: adminEmail,
      subject: \`Project Delivery & Invoice: \${submissionDetails.clientName}\`,
      text: \`Hello,\\n\\nA new project delivery has been submitted by \${editorName}.\\n\\nClient: \${submissionDetails.clientName}\\nVideo Link: \${submissionDetails.videoLink}\\nDuration: \${submissionDetails.duration ? submissionDetails.duration + ' minutes' : 'N/A'}\\n\\nPlease check the dashboard for more details.\\n\\nBest,\\nMonolith Team\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', 'Project Delivery & Invoice Sent', htmlContent),
      attachments: pdfBuffer ? [
        {
          filename: \`Invoice_\${submissionDetails.projectFileName || 'Monolith'}.pdf\`,
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
    const htmlContent = \`
      <p>Hello,</p>
      <p>This is a system warning that <strong>\${percent}%</strong> of the deadline has passed for the project <strong>"\${cardTitle}"</strong>.</p>
      <p style="color: #f59e0b; font-weight: bold;">You have approximately \${hoursLeft.toFixed(1)} hours left.</p>
      <p>Please ensure you submit your work on time to avoid late penalties.</p>
      <p>Best regards,<br>Monolith Team</p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: \`Project Warning: \${percent}% of time elapsed for \${cardTitle}\`,
      text: \`Hello,\\n\\nThis is a warning that \${percent}% of the deadline has passed for the project "\${cardTitle}".\\nYou have approximately \${hoursLeft.toFixed(1)} hours left.\\n\\nPlease ensure you submit your work on time to avoid penalties.\\n\\nBest,\\nMonolith Team\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', 'Project Deadline Warning', htmlContent),
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending warning email:', error.message);
    return { success: false };
  }
}

export async function sendOverdueEmail(toEmail, cardTitle) {
  try {
    const htmlContent = \`
      <p>Hello,</p>
      <p>The deadline for the project <strong>"\${cardTitle}"</strong> has officially passed.</p>
      <div class="warning-box">
        <p class="warning-text">If the project is not delivered within the next 30 minutes, late penalties (2% per hour) will begin to apply.</p>
      </div>
      <p style="margin-top: 16px;">Please deliver the project immediately.</p>
      <p>Best regards,<br>Monolith Team</p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: \`URGENT: Project Overdue - \${cardTitle}\`,
      text: \`Hello,\\n\\nThe deadline for the project "\${cardTitle}" has passed.\\nIf the project is not delivered within the next 30 minutes, late penalties (2% per hour) will begin to apply.\\n\\nBest,\\nMonolith Team\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', '<span style="color: #ef4444;">Project Overdue</span>', htmlContent),
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending overdue email:', error.message);
    return { success: false };
  }
}

export async function sendCommentEmailToAdmin(adminEmail, cardTitle, commentText, authorName) {
  try {
    const htmlContent = \`
      <p>Hello,</p>
      <p><strong>\${authorName}</strong> has commented on the project <strong>"\${cardTitle}"</strong>.</p>
      <div class="card-details">
        <p style="margin: 0; color: #d4d4d8; font-style: italic;">"\${commentText}"</p>
      </div>
      <p>Please check the Monolith Workflow dashboard to reply.</p>
      <p>Best regards,<br>Monolith Team</p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: adminEmail,
      subject: \`New Comment on Project: \${cardTitle}\`,
      text: \`Hello,\\n\\n\${authorName} has commented on the project "\${cardTitle}".\\n\\nComment:\\n"\${commentText}"\\n\\nPlease check the dashboard to reply.\\n\\nBest,\\nMonolith Team\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', 'New Comment on Project', htmlContent),
    });
    return { success: true };
  } catch (error) {
    console.error('Error sending comment email:', error.message);
    return { success: false };
  }
}

export async function sendReplyEmailToUser(userEmail, cardTitle, replyText, adminName) {
  try {
    const htmlContent = \`
      <p>Hello,</p>
      <p><strong>\${adminName}</strong> has replied to your comment on the project <strong>"\${cardTitle}"</strong>.</p>
      <div class="card-details">
        <p style="margin: 0; color: #d4d4d8; font-style: italic;">"\${replyText}"</p>
      </div>
      <p>Please check the Monolith Workflow dashboard for details.</p>
      <p>Best regards,<br>Monolith Team</p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: userEmail,
      subject: \`New Reply on Project: \${cardTitle}\`,
      text: \`Hello,\\n\\n\${adminName} has replied to your comment on the project "\${cardTitle}".\\n\\nReply:\\n"\${replyText}"\\n\\nPlease check the dashboard for details.\\n\\nBest,\\nMonolith Team\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', 'New Reply on Project', htmlContent),
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
    
    const htmlContent = \`
      <p>A new invoice was successfully added to the dashboard.</p>
      <div class="card-details">
        <div class="detail-row">
          <span class="detail-label">Client Name</span>
          <p class="detail-value">\${clientName}</p>
        </div>
        <div class="detail-row">
          <span class="detail-label">Date</span>
          <p class="detail-value">\${formattedDate}</p>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Revenue</span>
          <p class="detail-value" style="color: #34d399;">$\${amount.toFixed(2)}</p>
        </div>
        <div class="detail-row">
          <span class="detail-label">Profit</span>
          <p class="detail-value">$\${profit.toFixed(2)}</p>
        </div>
        <div class="detail-row" style="margin-bottom: 0;">
          <span class="detail-label">Editor Cut</span>
          <p class="detail-value">$\${editorCut.toFixed(2)}</p>
        </div>
      </div>
      <p style="color: #71717a; font-size: 14px;">This is an automated notification from Monolith Workflow.</p>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: 'olialkonok2@gmail.com',
      subject: \`New Invoice Logged: \${clientName}\`,
      text: \`A new invoice has been logged.\\n\\nClient: \${clientName}\\nRevenue: $\${amount}\\nProfit: $\${profit}\\nEditor Cut: $\${editorCut}\\nDate: \${formattedDate}\\n\`,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', 'New Invoice Logged', htmlContent),
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

    const htmlContent = \`
      <p>Dear <strong>\${invoiceData.clientName}</strong>,</p>
      <p>Thank you for partnering with Monolith Media. Your video editing project has been completed successfully.</p>
      <p><strong>Invoice ID:</strong> \${invoiceData.invoiceNo}</p>
      <p>Please find attached the detailed PDF invoice for the services rendered. A direct link to download and view your final deliverable is provided below.</p>
      
      <div class="deliverable-card">
        <div class="play-icon">
          <span>▶</span>
        </div>
        <h3>Your Video is Ready</h3>
        <p>High-quality render available for download</p>
        <a href="\${invoiceData.videoLink || '#'}" class="btn">View Deliverable</a>
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
            <span class="bank-val" style="color: #34d399; font-size: 16px;">$\${invoiceData.amount}.00</span>
          </div>
          <div class="bank-row"><span class="bank-label">A/C Number:</span><span class="bank-val" style="color: #34d399; font-size: 16px;">1201580374514</span></div>
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
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: clientEmail,
      subject: \`Invoice from Monolith Media - \${invoiceData.invoiceNo || 'New'}\`,
      text: \`Hello \${invoiceData.clientName || 'Client'},\\n\\nPlease find attached your invoice.\\n\\nBest regards,\\nMonolith Media\`,
      html: getModernEmailHtml('MONOLITH <span>MEDIA</span>', '', htmlContent),
      attachments: [
        {
          filename: \`Invoice_\${invoiceData.invoiceNo || 'Monolith'}.pdf\`,
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
      subject = \`⏳ Deadline Alert (50%): \${projectName}\`;
      title = \`50% Time Elapsed\`;
      messageHtml = \`<p>This is a friendly reminder that <strong>50%</strong> of the allocated time for your assigned project <strong>\${projectName}</strong> has passed.</p>
      <p>Please ensure you are on track to meet the deadline.</p>\`;
    } else if (type === '80_percent') {
      subject = \`⚠️ URGENT Deadline Alert (80%): \${projectName}\`;
      title = \`<span style="color: #ef4444;">80% Time Elapsed</span>\`;
      messageHtml = \`<div class="warning-box"><p class="warning-text"><strong>Urgent Notice:</strong> <strong>80%</strong> of the allocated time for <strong>\${projectName}</strong> has passed!</p>
      <p class="warning-text" style="margin-top: 8px;">You have very little time left. Please finalize your work and submit it soon.</p></div>\`;
    } else if (type === 'overdue') {
      subject = \`🚨 DEADLINE OVER: \${projectName}\`;
      title = \`<span style="color: #ef4444;">Deadline Overdue</span>\`;
      messageHtml = \`<div class="warning-box"><p class="warning-text">The deadline for your project <strong>\${projectName}</strong> has expired.</p>
      <p class="warning-text" style="margin-top: 8px;">Please submit the video immediately. If not submitted within the next 30 minutes, a 2% penalty will be applied to your payout, and it will increase by 2% for every subsequent hour it is late.</p></div>\`;
    } else if (type === 'penalty') {
      subject = \`💸 Penalty Applied: \${projectName}\`;
      title = \`<span style="color: #ef4444;">Late Penalty Applied</span>\`;
      messageHtml = \`<div class="warning-box"><p class="warning-text">A penalty of <strong>\${projectDetails.penaltyPercent}%</strong> has been applied to your payout for project <strong>\${projectName}</strong> due to late submission.</p>
      <p class="warning-text" style="margin-top: 8px;">The penalty will continue to increase by 2% for every hour it remains unsubmitted. Submit your work immediately to stop further penalties!</p></div>\`;
    }

    const htmlContent = \`
      \${messageHtml}
      <div style="margin-top: 30px; text-align: center;">
        <a href="\${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" class="btn">Go to Dashboard</a>
      </div>
    \`;

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Monolith Workflow" <noreply@monolith.com>',
      to: toEmail,
      subject: subject,
      html: getModernEmailHtml('MONOLITH <span>WORKFLOW</span>', title, htmlContent),
    });
    console.log(\`Deadline alert (\${type}) email sent: %s\`, info.messageId);
    return { success: true };
  } catch (error) {
    console.error(\`Error sending deadline alert (\${type}) email:\`, error.message);
    return { success: false, error: error.message };
  }
}
`;

fs.writeFileSync(path.join(process.cwd(), 'src/lib/mailer.js'), newMailerContent, 'utf-8');
console.log('mailer.js updated successfully!');
