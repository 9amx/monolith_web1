import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateInvoiceBuffer(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Colors
      const white = '#ffffff';
      const slate200 = '#e2e8f0';
      const slate300 = '#cbd5e1';
      const slate400 = '#94a3b8';
      const slate800 = '#1e293b';
      const purple = '#8B3DFF';
      const cardBg = '#130f26';
      
      // Background Gradient
      let grad = doc.linearGradient(0, 0, doc.page.width, doc.page.height);
      grad.stop(0, '#0a0518').stop(1, '#1a0b36');
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(grad);

      // Destructure invoiceData
      const {
        invoiceNo = '12345',
        date = '30 July 2025',
        clientName = 'Estelle Darcy',
        clientEmail = 'estelle.darcy@email.com',
        items = [
          {
            title: 'YouTube Video Editing',
            description: 'Editing long-form YouTube videos\nwith transitions, color grading,\nsound sync & effects.',
            duration: '25 Minutes',
            total: '$500'
          }
        ],
        subtotal = '$500',
        total = '$500'
      } = invoiceData;

      // Logo
      const logoPath = path.join(process.cwd(), 'logo.png');
      let logoYOffset = 0;
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { height: 40 });
        logoYOffset = 40;
      } else {
        // Fallback M Logo
        doc.roundedRect(50, 50, 60, 60, 15).fill(cardBg);
        doc.fillColor(slate300).fontSize(40).font('Helvetica-Bold').text('M', 66, 60);
        // MONOLITH MEDIA
        doc.fillColor(slate300).fontSize(24).font('Helvetica-Bold').text('MONOLITH', 125, 55);
        doc.fontSize(10).font('Helvetica').text('M  E  D  I  A', 128, 82, { characterSpacing: 4 });
      }
      
      // Line under Monolith Media
      doc.moveTo(125, 100).lineTo(250, 100).lineWidth(1).strokeColor(slate800).stroke();
      
      doc.fontSize(8).font('Helvetica').fillColor(white).text('VIDEO EDITING AGENCY', 125, 110);
      
      // Email icon (simple circle + text)
      doc.circle(132, 130, 8).fill(cardBg);
      doc.fillColor(white).fontSize(8).text('@', 128, 126); 
      doc.fillColor(slate200).fontSize(10).text('minzu.bd.123@gmail.com', 148, 126);

      // --- HEADER RIGHT ---
      doc.fillColor(white).fontSize(40).font('Helvetica-Bold').text('INVOICE', 350, 50, { align: 'right' });
      
      // Line under INVOICE
      doc.moveTo(350, 95).lineTo(535, 95).lineWidth(1.5).strokeColor(white).stroke();
      doc.circle(535, 95, 4).fill(white);
      
      doc.fillColor(slate300).fontSize(12).font('Helvetica').text(`Invoice No. ${invoiceNo}`, 350, 115, { align: 'right' });
      doc.text(date, 350, 135, { align: 'right' });

      // --- BILLED TO ---
      doc.moveDown(3);
      doc.fillColor(slate400).fontSize(12).font('Helvetica-Bold').text('Billed to:', 50, 180);
      
      doc.moveDown(1);
      doc.fillColor(white).font('Helvetica-Bold').text('Client Name : ', 50, 210, { continued: true })
         .fillColor(slate200).font('Helvetica').text(clientName);
         
      doc.fillColor(white).font('Helvetica-Bold').text('Email : ', 50, 230, { continued: true })
         .fillColor(slate200).font('Helvetica').text(clientEmail);

      // --- WEBSITE / PHONE ---
      doc.circle(410, 220, 12).strokeColor(white).lineWidth(2).stroke(); // Fake Globe
      // Horizontal and vertical lines for globe
      doc.moveTo(398, 220).lineTo(422, 220).lineWidth(1).stroke();
      doc.moveTo(410, 208).lineTo(410, 232).stroke();
      
      doc.fillColor(slate200).fontSize(10).font('Helvetica').text('monolithmedia.digital', 430, 215);
      doc.text('+880 1940-420383', 430, 230);

      // --- TABLE HEADER ---
      const tableTop = 280;
      doc.rect(50, tableTop, 495, 35).fill(purple);
      doc.fillColor(white).fontSize(10).font('Helvetica-Bold');
      doc.text('ITEM / DESCRIPTION', 70, tableTop + 12);
      doc.text('VIDEO DURATION', 250, tableTop + 12, { width: 150, align: 'center' });
      doc.text('TOTAL', 400, tableTop + 12, { width: 135, align: 'center' });

      // --- TABLE BODY ---
      let rowTop = tableTop + 55;
      
      items.forEach((item) => {
        doc.fillColor(white).font('Helvetica-Bold').fontSize(12).text(item.title, 70, rowTop);
        doc.fillColor(slate400).font('Helvetica').fontSize(10).text(item.description, 70, rowTop + 20, { width: 180, lineGap: 4 });
        
        doc.fillColor(white).text(item.duration, 250, rowTop, { width: 150, align: 'center' });
        doc.fillColor(white).font('Helvetica-Bold').fontSize(12).text(item.total, 400, rowTop, { width: 135, align: 'center' });
        
        rowTop += 70; // Adjust row height
      });

      // Line below table
      doc.moveTo(50, rowTop).lineTo(545, rowTop).lineWidth(1).strokeColor(slate800).stroke();

      // --- TOTAL SECTION ---
      const totalTop = rowTop + 20;
      doc.fillColor(slate400).font('Helvetica').fontSize(12).text('Subtotal', 300, totalTop);
      doc.fillColor(white).font('Helvetica-Bold').text(subtotal, 400, totalTop, { width: 135, align: 'center' });
      
      doc.rect(290, totalTop + 25, 255, 40).fill(purple);
      doc.fillColor(white).font('Helvetica-Bold').fontSize(16).text('TOTAL', 310, totalTop + 38);
      doc.text(total, 400, totalTop + 38, { width: 135, align: 'center' });

      // --- SIGNATURES ---
      // Thank you
      doc.fillColor(white).font('Helvetica-Oblique').fontSize(38).text('Thank You!', 50, totalTop + 10);
      doc.font('Helvetica').fontSize(12).text('We appreciate your business!', 50, totalTop + 55);

      // Right Signature
      const signRightTop = totalTop + 100;
      doc.moveTo(290, signRightTop).lineTo(360, signRightTop).lineWidth(1).strokeColor(white).stroke();
      doc.fillColor(white).font('Helvetica-Bold').fontSize(12).text('MST POLY KHATUN', 370, signRightTop - 5);
      doc.moveTo(490, signRightTop).lineTo(545, signRightTop).stroke();

      // --- FOOTER SEPARATOR ---
      const footerTop = signRightTop + 35;
      doc.moveTo(50, footerTop).lineTo(545, footerTop).lineWidth(1).strokeColor(slate800).stroke();

      // --- FOOTER LEFT ---
      doc.circle(70, footerTop + 40, 16).fill(cardBg); // Bank Icon fake
      doc.fillColor(white).fontSize(15).font('Helvetica-Bold').text('III', 63, footerTop + 34);
      
      doc.fillColor(slate400).fontSize(10).font('Helvetica-Bold').text('Payment Information', 100, footerTop + 35);
      
      const paymentDetails = [
        { label: 'BANK NAME', value: invoiceData.bankName || 'Dutch Bangla Bank' },
        { label: 'A/C NO', value: invoiceData.accountNumber || '1201580374514' },
        { label: 'ACCOUNT NAME', value: invoiceData.accountName || 'MST POLY KHATUN' },
        { label: 'SWIFT CODE', value: invoiceData.swiftCode || 'DBBLBDDH' },
        { label: 'ROUTING NO.', value: invoiceData.routingNumber || '090471544' },
      ];

      let y = footerTop + 60;
      paymentDetails.forEach(item => {
        doc.fillColor(white).font('Helvetica-Bold').fontSize(8).text(item.label + ' : ', 100, y, { continued: true })
           .fillColor(slate300).font('Helvetica').text(item.value);
        const lines = item.value.split('\n').length;
        y += 12 * lines;
      });

      // Vertical line separator
      doc.moveTo(280, footerTop + 20).lineTo(280, footerTop + 220).lineWidth(1).strokeColor(slate800).stroke();

      // --- FOOTER RIGHT ---
      doc.circle(315, footerTop + 40, 16).fill(cardBg); // Email Icon
      doc.fillColor(white).fontSize(16).text('@', 307, footerTop + 34);
      
      doc.fillColor(slate300).fontSize(10).font('Helvetica').text(invoiceData.agencyEmail || 'minzu.bd.123@gmail.com', 345, footerTop + 36);
      
      doc.circle(315, footerTop + 95, 16).fill(cardBg); // Location Icon
      doc.fillColor(white).fontSize(16).font('Helvetica-Bold').text('O', 310, footerTop + 89);
      
      doc.fillColor(white).fontSize(10).font('Helvetica-Bold').text('ADDRESS : ', 345, footerTop + 85, { continued: true })
         .fillColor(slate300).font('Helvetica').text(invoiceData.agencyAddress || 'Holding 26,1, Road\nGoyalkhali, Boyra ,Stamp Khulna GPO');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
