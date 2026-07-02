import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

async function generatePayoutPDF(payoutData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      const invoiceNumber = `PR-${Math.floor(1000 + Math.random() * 9000)}`;
      doc.on('end', () => {
        resolve({ pdfBuffer: Buffer.concat(buffers), invoiceNumber });
      });

      // Colors
      const black = '#000000';
      const lightGray = '#a1a1aa';
      const teal = '#20d489';

      const { editorName, editorEmail, amount, duration = 'Project Duration', itemTitle = 'Video Editing Service', itemDescription = 'Professional video editing including\\ncuts, transitions, color grading,\\nsound sync & effects.' } = payoutData;
      const date = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

      // --- HEADER LEFT ---
      const logoPath = path.join(process.cwd(), 'logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { height: 60 });
      } else {
        doc.roundedRect(50, 50, 60, 60, 15).fill('#09090b');
        doc.fillColor(teal).fontSize(40).font('Helvetica-Bold').text('M', 66, 60);
        doc.fillColor(black).fontSize(24).font('Helvetica-Bold').text('MONOLITH', 125, 55);
        doc.fontSize(10).font('Helvetica').text('M  E  D  I  A', 128, 82, { characterSpacing: 4 });
      }

      // Line under Monolith Media
      doc.moveTo(125, 115).lineTo(250, 115).lineWidth(1).strokeColor(lightGray).stroke();
      doc.fillColor(black).fontSize(8).font('Helvetica').text('VIDEO EDITING AGENCY', 125, 125);
      
      // Email icon (simple circle + text)
      doc.circle(132, 145, 8).fill(black);
      doc.fillColor('white').fontSize(8).text('@', 128, 141); 
      doc.fillColor(black).fontSize(10).text('minzu.bd.123@gmail.com', 148, 141);

      // --- HEADER RIGHT ---
      doc.fillColor(teal).fontSize(24).font('Helvetica-Bold').text('PAID', 350, 45, { align: 'right' });
      doc.fillColor(black).fontSize(36).font('Helvetica-Bold').text('INVOICE', 350, 70, { align: 'right' });
      
      // Line under INVOICE
      doc.moveTo(350, 115).lineTo(535, 115).lineWidth(1.5).strokeColor(black).stroke();
      doc.circle(535, 115, 4).fill(black);
      
      doc.fontSize(12).font('Helvetica').text(`Invoice No. ${invoiceNumber}`, 350, 130, { align: 'right' });
      doc.text(date, 350, 150, { align: 'right' });

      // --- BILLED TO ---
      doc.moveDown(3);
      doc.fillColor(teal).fontSize(12).font('Helvetica-Bold').text('Paid to:', 50, 200);
      
      doc.fillColor(black);
      doc.moveDown(1);
      doc.font('Helvetica-Bold').text('Editor Name : ', 50, 230, { continued: true })
         .font('Helvetica').text(editorName);
         
      doc.font('Helvetica-Bold').text('Email             : ', 50, 255, { continued: true })
         .font('Helvetica').text(editorEmail);

      // --- WEBSITE / PHONE ---
      doc.circle(410, 240, 12).strokeColor(black).lineWidth(2).stroke(); // Fake Globe
      doc.moveTo(398, 240).lineTo(422, 240).lineWidth(1).stroke();
      doc.moveTo(410, 228).lineTo(410, 252).stroke();
      
      doc.fontSize(10).font('Helvetica').text('monolithmedia.digital', 430, 235);
      doc.text('+880 1940-420383', 430, 250);

      // --- TABLE HEADER ---
      const tableTop = 300;
      doc.rect(50, tableTop, 495, 35).fill(black);
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
      doc.text('ITEM / DESCRIPTION', 70, tableTop + 12);
      doc.text('DURATION', 250, tableTop + 12, { width: 150, align: 'center' });
      doc.text('AMOUNT', 400, tableTop + 12, { width: 135, align: 'center' });

      // --- TABLE BODY ---
      doc.fillColor(black);
      let rowTop = tableTop + 55;
      
      doc.font('Helvetica-Bold').fontSize(12).text(itemTitle, 70, rowTop);
      doc.font('Helvetica').fontSize(10).text(itemDescription, 70, rowTop + 25, { width: 180, lineGap: 4 });
      
      doc.text(duration, 250, rowTop, { width: 150, align: 'center' });
      doc.font('Helvetica-Bold').fontSize(12).text(`$${amount}`, 400, rowTop, { width: 135, align: 'center' });
      
      rowTop += 90;

      // Line below table
      doc.moveTo(50, rowTop).lineTo(545, rowTop).lineWidth(1).strokeColor(lightGray).stroke();

      // --- TOTAL SECTION ---
      const totalTop = rowTop + 25;
      doc.fillColor(black).font('Helvetica').fontSize(12).text('Subtotal', 300, totalTop);
      doc.font('Helvetica-Bold').text(`$${amount}`, 400, totalTop, { width: 135, align: 'center' });
      
      doc.rect(290, totalTop + 25, 255, 40).fill(black);
      doc.fillColor('white').font('Helvetica-Bold').fontSize(16).text('TOTAL PAID', 310, totalTop + 38);
      doc.text(`$${amount}`, 400, totalTop + 38, { width: 135, align: 'center' });

      // --- SIGNATURES ---
      doc.fillColor(teal);
      doc.font('Helvetica-Oblique').fontSize(38).text('Thank You!', 50, totalTop + 10);
      doc.fillColor(black).font('Helvetica').fontSize(10).text('Payment has been made.', 50, totalTop + 55);
      doc.font('Helvetica-Bold').text('We appreciate your hard work!', 50, totalTop + 70);

      // Right Signature Replacement
      const signRightTop = totalTop + 95;
      doc.moveTo(290, signRightTop).lineTo(545, signRightTop).lineWidth(1).strokeColor(black).stroke();
      doc.font('Helvetica-Bold').fontSize(12).text('MONOLITH MEDIA', 290, signRightTop + 10, { width: 255, align: 'center' });
      doc.font('Helvetica').fontSize(9).text('VIDEO EDITING AGENCY', 290, signRightTop + 25, { width: 255, align: 'center', characterSpacing: 2 });

      // --- FOOTER SEPARATOR ---
      const footerTop = signRightTop + 65;
      doc.moveTo(50, footerTop).lineTo(545, footerTop).lineWidth(1).strokeColor(lightGray).stroke();

      // --- FOOTER LEFT ---
      doc.circle(70, footerTop + 40, 16).fill(black);
      doc.fillColor('white').fontSize(16).text('@', 62, footerTop + 34); // Envelope icon substitute
      
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('Agency Email', 100, footerTop + 32);
      doc.font('Helvetica').text('minzu.bd.123@gmail.com', 100, footerTop + 46);
      
      // Vertical line separator
      doc.moveTo(272, footerTop + 20).lineTo(272, footerTop + 70).lineWidth(1).strokeColor(black).stroke();

      // --- FOOTER RIGHT ---
      doc.circle(315, footerTop + 40, 16).fill(black);
      doc.fillColor('white').fontSize(16).font('Helvetica-Bold').text('O', 310, footerTop + 34); // Location icon substitute
      
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('Agency Address', 345, footerTop + 32);
      doc.font('Helvetica').text('Holding 26,1, Road\nGoyalkhali, Boyra ,Stamp Khulna GPO', 345, footerTop + 46);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { editorName, editorEmail, videoLink, amount, profit, duration, itemTitle, itemDescription } = body;

    // Validate inputs
    if (!editorName || !editorEmail || !videoLink || !amount) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailUser = process.env.SMTP_USER;
    const emailPass = process.env.SMTP_PASS;
    const emailHost = process.env.SMTP_HOST || 'smtp-relay.brevo.com';
    const emailPort = process.env.SMTP_PORT || 587;
    const emailFrom = process.env.SMTP_FROM || emailUser;

    if (!emailUser || !emailPass) {
      console.error('Email credentials not configured in environment variables.');
      return NextResponse.json(
        { message: 'Email service is not configured. Please add SMTP_USER and SMTP_PASS to .env.local.' },
        { status: 500 }
      );
    }

    // Generate the PDF Buffer using pdfkit
    const { pdfBuffer, invoiceNumber } = await generatePayoutPDF({ editorName, editorEmail, videoLink, amount, duration, itemTitle, itemDescription });

    // Create a transporter
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: false, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f4f4f5;
            color: #27272a;
            margin: 0;
            padding: 40px 20px;
            -webkit-font-smoothing: antialiased;
          }
          .wrapper {
            max-width: 600px;
            margin: 0 auto;
          }
          .container {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 24px rgba(0,0,0,0.04);
            border: 1px solid #f4f4f5;
          }
          .header {
            background-color: #09090b;
            padding: 32px;
            text-align: center;
            border-bottom: 3px solid #34d399;
          }
          .header h1 {
            color: #ffffff;
            font-size: 24px;
            margin: 0;
            font-weight: 700;
            letter-spacing: -0.5px;
          }
          .header span {
            color: #34d399;
          }
          .content {
            padding: 40px 32px;
            line-height: 1.7;
          }
          .content p {
            margin-top: 0;
            margin-bottom: 24px;
            color: #52525b;
            font-size: 16px;
          }
          .content strong {
            color: #09090b;
            font-weight: 600;
          }
          .deliverable-card {
            background: #fafafa;
            border: 1px solid #e4e4e7;
            border-radius: 12px;
            padding: 32px 24px;
            text-align: center;
            margin: 32px 0;
          }
          .play-icon {
            width: 56px;
            height: 56px;
            background: #34d399;
            border-radius: 50%;
            display: inline-block;
            line-height: 56px;
            margin-bottom: 20px;
            box-shadow: 0 8px 16px rgba(52, 211, 153, 0.25);
          }
          .play-icon span {
            color: #09090b;
            font-size: 22px;
            margin-left: 4px;
            vertical-align: middle;
          }
          .deliverable-card h3 {
            margin: 0 0 12px 0;
            color: #09090b;
            font-size: 20px;
            font-weight: 700;
          }
          .deliverable-card p {
            margin: 0 0 24px 0;
            color: #71717a;
            font-size: 15px;
          }
          .btn {
            background-color: #09090b;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 15px;
            display: inline-block;
            letter-spacing: 0.5px;
          }
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
              <p>Dear <strong>${editorName}</strong>,</p>
              <p>Thank you for your fantastic work on this video editing project. Your final deliverable was amazing, and we are happy to inform you that your payout has been successfully processed!</p>
              <p><strong>Invoice ID:</strong> ${invoiceNumber}</p>
              <p>Please find attached the detailed PDF payout receipt for your records. A direct link to download and view your final deliverable is provided below.</p>
              
              <div class="deliverable-card">
                <div class="play-icon">
                  <span>▶</span>
                </div>
                <h3>Project Completed</h3>
                <p>Great job on the final render!</p>
                <a href="${videoLink}" class="btn">View Deliverable</a>
              </div>
              
              <div class="payment-section" style="border-top: none; padding-top: 0;">
                <div class="bank-details-card" style="margin-top: 16px; border: 1px solid #34d399; background: #ecfdf5;">
                  <h3 style="margin-top: 0; margin-bottom: 16px; color: #059669; font-size: 18px; text-align: center;">Payout Summary</h3>
                  <div class="bank-row"><span class="bank-label">Status:</span><span class="bank-val" style="color: #059669;">Paid ✅</span></div>
                  <div class="bank-row"><span class="bank-label">Service:</span><span class="bank-val">Video Editing</span></div>
                  <div class="bank-row" style="border-bottom: none;"><span class="bank-label">Total Amount:</span><span class="bank-val" style="color: #059669; font-size: 18px;">$${amount}.00</span></div>
                </div>
              </div>
  
              <p style="margin-top: 32px; margin-bottom: 0; text-align: center;">Keep up the great work!<br><strong>The Monolith Media Team</strong></p>
            </div>
            <div class="footer">
              &copy; \${new Date().getFullYear()} Monolith Media. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send mail
    const mailOptions = {
      from: emailFrom,
      to: editorEmail,
      subject: `Payout Receipt for Video Editing Services - ${editorName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Payout_Receipt_MonolithMedia_${editorName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    return NextResponse.json(
      { message: 'Invoice sent successfully', invoiceId: invoiceNumber },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error sending invoice:', error);
    return NextResponse.json(
      { message: 'Failed to send invoice', error: error.message },
      { status: 500 }
    );
  }
}
