import PDFDocument from "pdfkit";

export const PDFGenerator = (invoice: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(20).text("INVOICE", { align: "right" });
    doc
      .fontSize(10)
      .text(`Invoice No: ${invoice.invoiceNo}`, { align: "right" });
    doc.text(`Date:${invoice.invoiceDate}`, { align: "right" });
    doc.moveDown();

    doc.fontSize(12).text("Bill To:");
    doc.fontSize(10).text(invoice.clientName);
    doc.text(invoice.clientEmail);
    doc.moveDown();

    doc.fontSize(10).text("Description", 50, doc.y, { width: 200 });
    doc.text("Qty", 250, doc.y, { width: 80 });
    doc.text("Cost", 330, doc.y, { width: 80 });
    doc.text("Total", 410, doc.y, { width: 80 });
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    invoice.items.forEach((item: any) => {
      const y = doc.y;
      doc.text(item.description, 50, y, { width: 200 });
      doc.text(String(item.quantity), 250, y, { width: 80 });
      doc.text(`€${item.cost}`, 330, y, { width: 80 });
      doc.text(`€${item.quantity * item.cost}`, 410, y, { width: 80 });
      doc.moveDown();
    });

    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Grand Total: €${invoice.total}`, { align: "right" });

    doc.end();
  });
};
