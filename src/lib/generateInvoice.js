import PDFDocument from 'pdfkit';
import path from 'path';

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
      const black = '#000000';
      const darkGray = '#333333';
      const lightGray = '#a1a1aa';
      const teal = '#20d489'; // Approximate color for M logo

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
      const fs = require('fs');
      const logoPath = path.join(process.cwd(), 'logo.png');
      let logoYOffset = 0;
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, 45, { height: 40 });
        logoYOffset = 40;
      } else {
        // Fallback M Logo
        doc.roundedRect(50, 50, 60, 60, 15).fill('#09090b');
        doc.fillColor(teal).fontSize(40).font('Helvetica-Bold').text('M', 66, 60);
        // MONOLITH MEDIA
        doc.fillColor(black).fontSize(24).font('Helvetica-Bold').text('MONOLITH', 125, 55);
        doc.fontSize(10).font('Helvetica').text('M  E  D  I  A', 128, 82, { characterSpacing: 4 });
      }
      
      // Line under Monolith Media
      doc.moveTo(125, 100).lineTo(250, 100).lineWidth(1).strokeColor(lightGray).stroke();
      
      doc.fontSize(8).font('Helvetica').text('VIDEO EDITING AGENCY', 125, 110);
      
      // Email icon (simple circle + text)
      doc.circle(132, 130, 8).fill(black);
      doc.fillColor('white').fontSize(8).text('@', 128, 126); 
      doc.fillColor(black).fontSize(10).text('minzu.bd.123@gmail.com', 148, 126);

      // --- HEADER RIGHT ---
      doc.fontSize(40).font('Helvetica-Bold').text('INVOICE', 350, 50, { align: 'right' });
      
      // Line under INVOICE
      doc.moveTo(350, 95).lineTo(535, 95).lineWidth(1.5).strokeColor(black).stroke();
      doc.circle(535, 95, 4).fill(black);
      
      doc.fontSize(12).font('Helvetica').text(`Invoice No. ${invoiceNo}`, 350, 115, { align: 'right' });
      doc.text(date, 350, 135, { align: 'right' });

      // --- BILLED TO ---
      doc.moveDown(3);
      doc.fontSize(12).font('Helvetica-Bold').text('Billed to:', 50, 180);
      
      doc.moveDown(1);
      doc.font('Helvetica-Bold').text('Client Name : ', 50, 210, { continued: true })
         .font('Helvetica').text(clientName);
         
      doc.font('Helvetica-Bold').text('Email : ', 50, 230, { continued: true })
         .font('Helvetica').text(clientEmail);

      // --- WEBSITE / PHONE ---
      doc.circle(410, 220, 12).strokeColor(black).lineWidth(2).stroke(); // Fake Globe
      // Horizontal and vertical lines for globe
      doc.moveTo(398, 220).lineTo(422, 220).lineWidth(1).stroke();
      doc.moveTo(410, 208).lineTo(410, 232).stroke();
      
      doc.fontSize(10).font('Helvetica').text('monolithmedia.digital', 430, 215);
      doc.text('+880 1940-420383', 430, 230);

      // --- TABLE HEADER ---
      const tableTop = 280;
      doc.rect(50, tableTop, 495, 35).fill(black);
      doc.fillColor('white').fontSize(10).font('Helvetica-Bold');
      doc.text('ITEM / DESCRIPTION', 70, tableTop + 12);
      doc.text('VIDEO DURATION', 250, tableTop + 12, { width: 150, align: 'center' });
      doc.text('TOTAL', 400, tableTop + 12, { width: 135, align: 'center' });

      // --- TABLE BODY ---
      doc.fillColor(black);
      let rowTop = tableTop + 55;
      
      items.forEach((item) => {
        doc.font('Helvetica-Bold').fontSize(12).text(item.title, 70, rowTop);
        doc.font('Helvetica').fontSize(10).text(item.description, 70, rowTop + 20, { width: 180, lineGap: 4 });
        
        doc.text(item.duration, 250, rowTop, { width: 150, align: 'center' });
        doc.font('Helvetica-Bold').fontSize(12).text(item.total, 400, rowTop, { width: 135, align: 'center' });
        
        rowTop += 70; // Adjust row height
      });

      // Line below table
      doc.moveTo(50, rowTop).lineTo(545, rowTop).lineWidth(1).strokeColor(lightGray).stroke();

      // --- TOTAL SECTION ---
      const totalTop = rowTop + 20;
      doc.fillColor(black).font('Helvetica').fontSize(12).text('Subtotal', 300, totalTop);
      doc.font('Helvetica-Bold').text(subtotal, 400, totalTop, { width: 135, align: 'center' });
      
      doc.rect(290, totalTop + 25, 255, 40).fill(black);
      doc.fillColor('white').font('Helvetica-Bold').fontSize(16).text('TOTAL', 310, totalTop + 38);
      doc.text(total, 400, totalTop + 38, { width: 135, align: 'center' });

      // --- SIGNATURES ---
      doc.fillColor(black);
      // Thank you
      doc.font('Helvetica-Oblique').fontSize(38).text('Thank You!', 50, totalTop + 10);
      doc.font('Helvetica').fontSize(12).text('We appreciate your business!', 50, totalTop + 55);

      // Right Signature
      const signRightTop = totalTop + 100;
      doc.moveTo(290, signRightTop).lineTo(360, signRightTop).lineWidth(1).strokeColor(black).stroke();
      doc.font('Helvetica-Bold').fontSize(12).text('MST POLY KHATUN', 370, signRightTop - 5);
      doc.moveTo(490, signRightTop).lineTo(545, signRightTop).stroke();

      // --- FOOTER SEPARATOR ---
      const footerTop = signRightTop + 35;
      doc.moveTo(50, footerTop).lineTo(545, footerTop).lineWidth(1).strokeColor(black).stroke();

      // --- FOOTER LEFT ---
      doc.circle(70, footerTop + 40, 16).fill(black); // Bank Icon fake
      doc.fillColor('white').fontSize(15).font('Helvetica-Bold').text('III', 63, footerTop + 34);
      
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('Payment Information', 100, footerTop + 35);
      
      const paymentDetails = [
        { label: 'BANK NAME', value: 'Dutch Bangla Bank' },
        { label: 'A/C NO', value: '1201580374514' },
        { label: 'ACCOUNT NAME', value: 'MST POLY KHATUN' },
        { label: 'SWIFT CODE', value: 'DBBLBDDH' },
        { label: 'BRANCH CODE', value: '120' },
        { label: 'ROUTING NO.', value: '090471544' },
        { label: 'COUNTRY', value: 'Bangladesh' },
        { label: 'CITY', value: 'KHULNA' },
        { label: 'POSTCODE', value: '9000' },
        { label: 'BRANCH', value: 'Khulna' },
        { label: 'EMAIL', value: 'minzu.bd.123@gmail.com' },
        { label: 'ADDRESS', value: 'Holding 26,1, Road\nGoyalkhali, Boyra ,Stamp Khulna GPO' }
      ];

      let y = footerTop + 60;
      paymentDetails.forEach(item => {
        doc.font('Helvetica-Bold').fontSize(8).text(item.label + ' : ', 100, y, { continued: true })
           .font('Helvetica').text(item.value);
        const lines = item.value.split('\n').length;
        y += 12 * lines;
      });

      // Vertical line separator
      doc.moveTo(280, footerTop + 20).lineTo(280, footerTop + 220).lineWidth(1).strokeColor(black).stroke();

      // --- FOOTER RIGHT ---
      doc.circle(315, footerTop + 40, 16).fill(black); // Email Icon
      doc.fillColor('white').fontSize(16).text('@', 307, footerTop + 34);
      
      doc.fillColor(black).fontSize(10).font('Helvetica').text('minzu.bd.123@gmail.com', 345, footerTop + 36);
      
      doc.circle(315, footerTop + 95, 16).fill(black); // Location Icon
      doc.fillColor('white').fontSize(16).font('Helvetica-Bold').text('O', 310, footerTop + 89);
      
      doc.fillColor(black).fontSize(10).font('Helvetica-Bold').text('ADDRESS : ', 345, footerTop + 85, { continued: true })
         .font('Helvetica').text('Holding 26,1, Road\nGoyalkhali, Boyra ,Stamp Khulna GPO');

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
