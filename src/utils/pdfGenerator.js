//Generador de PDF
const PDFDocument = require('pdfkit');

class PDFGenerator {
  async generatePDFBuffer(content) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument();
        const chunks = [];
        
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        doc.on('error', (err) => reject(err));

        this.processContent(doc, content);
        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }

  processContent(doc, content) {
    const defaultStyle = {
      font: 'Helvetica',
      size: 12,
      color: '#000000',
      align: 'left',
      lineGap: 5
    };

    content.forEach(section => {
      const style = { ...defaultStyle, ...section.style };
      doc.font(style.font).fontSize(style.size).fillColor(style.color);

      switch (section.type) {
        case 'title':
          doc.text(section.text, { align: style.align, underline: true });
          doc.moveDown(2);
          break;
        case 'paragraph':
          doc.text(section.text, { 
            align: style.align, 
            lineGap: style.lineGap,
            paragraphGap: section.paragraphGap || 10
          });
          doc.moveDown(1);
          break;
        case 'table':
          this.drawTable(doc, section);
          doc.moveDown(2);
          break;
        case 'image':
          if (section.path) doc.image(section.path, section.x, section.y, section.options || {});
          break;
        case 'pageBreak':
          doc.addPage();
          break;
        default:
          doc.text(section.text || '', { align: style.align });
      }
    });
  }

  drawTable(doc, table) {
    const startX = table.x || 50;
    let startY = table.y || doc.y;
    const columnWidth = table.columnWidth || (doc.page.width - 100) / table.headers.length;

    doc.font('Helvetica-Bold');
    table.headers.forEach((header, i) => {
      doc.text(header, startX + (i * columnWidth), startY, {
        width: columnWidth,
        align: 'left'
      });
    });

    doc.font('Helvetica');
    startY += 20;
    table.rows.forEach(row => {
      row.forEach((cell, i) => {
        doc.text(cell.toString(), startX + (i * columnWidth), startY, {
          width: columnWidth,
          align: 'left'
        });
      });
      startY += 20;
    });
  }
}

module.exports = new PDFGenerator();