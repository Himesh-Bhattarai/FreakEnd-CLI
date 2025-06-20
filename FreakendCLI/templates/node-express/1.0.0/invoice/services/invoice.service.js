const Invoice = require('../models/Invoice.model');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceService {
  async generateInvoiceNumber() {
    const count = await Invoice.countDocuments();
    return `INV-${Date.now()}-${count + 1}`;
  }

  async createInvoice(invoiceData) {
    invoiceData.invoiceNumber = await this.generateInvoiceNumber();
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    await this.generatePDF(invoice);
    return invoice;
  }

  async generatePDF(invoice) {
    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `../../invoices/${invoice.invoiceNumber}.pdf`);
    doc.pipe(fs.createWriteStream(filePath));
    
    // PDF generation logic
    doc.fontSize(25).text('Invoice', 100, 100);
    doc.text(`Invoice Number: ${invoice.invoiceNumber}`, 100, 150);
    // Add more invoice details
    
    doc.end();
    
    invoice.pdfUrl = `/invoices/${invoice.invoiceNumber}.pdf`;
    await invoice.save();
  }
}

module.exports = new InvoiceService();