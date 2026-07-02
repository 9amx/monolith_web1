import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateInvoiceBuffer } from '@/lib/generateInvoice';
import { db } from '@/db';
import { submissions, cards } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    const body = await req.json();
    const { clientName, clientEmail, videoLink, amount, profit } = body;

    // Validate inputs
    if (!clientName || !clientEmail || !videoLink || !amount) {
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

    // Lookup submission and card data by videoLink
    const [submissionRecord] = await db.select()
      .from(submissions)
      .leftJoin(cards, eq(submissions.cardId, cards.id))
      .where(eq(submissions.videoLink, videoLink));

    const cardData = submissionRecord?.cards;
    
    // Fallbacks if no submission is found
    const itemName = cardData?.projectFileName || cardData?.title || 'Video Editing Service';
    const itemDescription = cardData?.description || '';
    const itemDuration = cardData?.deliveredDuration ? `${cardData.deliveredDuration} Minutes` : 'N/A';

    const invoiceNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const dateFormatted = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

    // Generate the Exact Match PDF Buffer
    const pdfBuffer = await generateInvoiceBuffer({
      invoiceNo: invoiceNumber,
      date: dateFormatted,
      clientName: clientName,
      clientEmail: clientEmail,
      items: [
        {
          title: itemName,
          description: itemDescription,
          duration: itemDuration,
          total: `$${amount}`
        }
      ],
      subtotal: `$${amount}`,
      total: `$${amount}`
    });

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
              <p>Dear <strong>${clientName}</strong>,</p>
              <p>Thank you for partnering with Monolith Media. Your video editing project has been completed successfully.</p>
              <p>Please find attached the detailed PDF invoice for the services rendered. A direct link to download and view your final deliverable is provided below.</p>
              
              <div class="deliverable-card">
                <div class="play-icon">
                  <span>▶</span>
                </div>
                <h3>Your Video is Ready</h3>
                <p>High-quality render available for download</p>
                <a href="${videoLink}" class="btn">View Deliverable</a>
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
                    <span class="bank-val" style="color: #059669; font-size: 16px;">$${amount}.00</span>
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
      to: clientEmail,
      subject: `Invoice from Monolith Media - ${clientName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Invoice_MonolithMedia_${clientName.replace(/\s+/g, '_')}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);

    return NextResponse.json(
      { message: 'Invoice sent successfully' },
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
