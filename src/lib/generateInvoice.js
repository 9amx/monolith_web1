import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

export async function generateInvoiceBuffer(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 0 });
      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        resolve(Buffer.concat(buffers));
      });

      // Colors
      const bgDark = '#060312';
      const bgGradientEnd = '#15062a';
      const white = '#ffffff';
      const textMuted = '#d1d5db';
      const purple = '#8b5cf6';
      const tableBg = '#181432';

      // Background Gradient
      let grad = doc.linearGradient(0, 0, 0, doc.page.height);
      grad.stop(0, bgDark).stop(1, bgGradientEnd);
      doc.rect(0, 0, doc.page.width, doc.page.height).fill(grad);

      // Add a subtle radial glow in the center-left and top-right if possible (PDFKit doesn't support radial gradients perfectly, but linear is fine)

      // Margins
      const marginX = 50;
      let y = 60;

      // --- HEADER LEFT ---
      doc.fillColor(white).font('Helvetica-Bold').fontSize(56).text('INVOICE', marginX, y, { tracking: 2 });
      
      const invoiceTextWidth = doc.widthOfString('INVOICE', { tracking: 2 });
      y += 65;
      
      // Underline
      doc.moveTo(marginX, y).lineTo(marginX + invoiceTextWidth + 10, y).lineWidth(4).strokeColor(white).stroke();
      
      y += 15;
      doc.font('Helvetica-Bold').fontSize(14).text(`Invoice ${invoiceData.invoiceNo || 'CR-01234'}`, marginX, y);

      y += 40;
      
      // Dates
      const dateY = y;
      doc.font('Helvetica').fontSize(12).fillColor(textMuted);
      doc.text('Date', marginX, dateY);
      doc.text(':', marginX + 60, dateY);
      doc.fillColor(white).text(invoiceData.date || '2023-11-09', marginX + 80, dateY);
      
      doc.fillColor(textMuted).text('Due Date', marginX, dateY + 20);
      doc.text(':', marginX + 60, dateY + 20);
      doc.fillColor(white).text(invoiceData.date || '2023-12-09', marginX + 80, dateY + 20); // Just reusing date or can be blank

      // --- HEADER RIGHT ---
      const rightX = 350;
      let rightY = 60;
      
      doc.fillColor(white).font('Helvetica-Bold').fontSize(14).text('MONOLITH MEDIA', rightX, rightY, { width: 200, align: 'left' });
      doc.font('Helvetica').fontSize(10).fillColor(textMuted).text('monolithmedia.digital', rightX, rightY + 35);
      doc.text('Holding 26,1, Road Goyalkhali,\nBoyra, Stamp Khulna GPO', rightX, rightY + 50, { lineGap: 3 });

      const billToY = dateY;
      doc.fillColor(white).font('Helvetica-Bold').fontSize(12).text('Bill To:', rightX, billToY);
      doc.font('Helvetica').fontSize(12).text(invoiceData.clientName || 'Client Name', rightX, billToY + 20);
      doc.text(invoiceData.clientEmail || 'client@example.com', rightX, billToY + 40);

      // --- TABLE SECTION ---
      const tableY = 280;
      const tableWidth = doc.page.width - (marginX * 2);
      const tableHeight = 350;
      
      // Table Background
      doc.roundedRect(marginX, tableY, tableWidth, tableHeight, 16).fill(tableBg);

      // Table Headers (Pills)
      const headerY = tableY + 30;
      
      const drawPill = (text, x, y, width, align = 'center') => {
        doc.roundedRect(x, y - 8, width, 26, 13).fill(purple);
        doc.fillColor(white).font('Helvetica-Bold').fontSize(12).text(text, x, y, { width, align });
      };

      const col1X = marginX + 20;
      const col2X = marginX + 220;
      const col3X = marginX + 310;
      const col4X = marginX + 400;

      drawPill('Description', col1X, headerY, 150);
      drawPill('Qty', col2X, headerY, 60);
      drawPill('Price', col3X, headerY, 70);
      drawPill('Total', col4X, headerY, 70);

      // Table Rows
      let rowY = headerY + 45;
      const items = invoiceData.items || [
        { title: 'Video Editing', qty: '1', price: invoiceData.amount ? `$${invoiceData.amount}` : '$0', total: invoiceData.amount ? `$${invoiceData.amount}` : '$0' }
      ];

      doc.font('Helvetica').fontSize(12);
      items.forEach((item) => {
        doc.fillColor(white).font('Helvetica-Bold').fontSize(12).text(item.title || item.description, col1X + 10, rowY, { width: 180 });
        if (item.title && item.description && item.title !== item.description) {
          doc.fillColor(textMuted).font('Helvetica').fontSize(10).text(item.description, col1X + 10, rowY + 16, { width: 180, lineGap: 3 });
        }
        doc.font('Helvetica').fontSize(12);
        doc.fillColor(white).text('1', col2X, rowY, { width: 60, align: 'center' }); // Qty is just 1
        doc.text(item.total || item.price || invoiceData.subtotal, col3X, rowY, { width: 70, align: 'center' });
        doc.text(item.total || invoiceData.subtotal, col4X, rowY, { width: 70, align: 'center' });
        rowY += 45;
      });

      // Divider Line
      const dividerY = tableY + tableHeight - 120;
      doc.moveTo(marginX + 30, dividerY).lineTo(marginX + tableWidth - 30, dividerY).lineWidth(1).strokeColor('#2d284a').stroke();

      // Totals
      const totalsY = dividerY + 15;
      doc.fillColor(textMuted).font('Helvetica').fontSize(12).text('Subtotal', col3X - 40, totalsY, { width: 100, align: 'left' });
      doc.fillColor(white).font('Helvetica-Bold').text(invoiceData.subtotal || '$0', col4X, totalsY, { width: 70, align: 'center' });

      doc.fillColor(textMuted).font('Helvetica').fontSize(12).text('Sales Tax (0%)', col3X - 40, totalsY + 30, { width: 100, align: 'left' });
      doc.fillColor(white).font('Helvetica-Bold').text('$0', col4X, totalsY + 30, { width: 70, align: 'center' });

      doc.moveTo(col3X - 40, totalsY + 60).lineTo(marginX + tableWidth - 30, totalsY + 60).lineWidth(1).strokeColor('#2d284a').stroke();

      doc.fillColor(textMuted).font('Helvetica').fontSize(14).text('Grand Total', col3X - 40, totalsY + 75, { width: 100, align: 'left' });
      doc.fillColor(white).font('Helvetica-Bold').fontSize(18).text(invoiceData.total || '$0', col4X, totalsY + 73, { width: 70, align: 'center' });

      // --- BOTTOM SECTION ---
      const bottomY = tableY + tableHeight + 40;

      // Payment Info
      drawPill('Payment Information', marginX, bottomY, 180);
      
      const payY = bottomY + 40;
      doc.font('Helvetica').fontSize(12).fillColor(textMuted);
      doc.text('Bank', marginX, payY);
      doc.text(':', marginX + 80, payY);
      doc.fillColor(white).text('Dutch Bangla Bank', marginX + 100, payY);

      doc.fillColor(textMuted).text('Bank Transfer', marginX, payY + 25);
      doc.text(':', marginX + 80, payY + 25);
      doc.fillColor(white).text('1201580374514', marginX + 100, payY + 25);

      // Terms & Conditions
      doc.font('Helvetica-Bold').fontSize(14).fillColor(white).text('Terms and Conditions:', rightX, bottomY + 5);
      
      const termBullet = (text, yPos) => {
        doc.circle(rightX + 5, yPos + 5, 2).fill(white);
        doc.font('Helvetica').fontSize(12).text(text, rightX + 15, yPos, { width: 200, lineGap: 4 });
      };

      termBullet('Payment must be made before final raw files delivery.', bottomY + 35);
      termBullet('Any late payment is subject to additional fees.', bottomY + 75);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
