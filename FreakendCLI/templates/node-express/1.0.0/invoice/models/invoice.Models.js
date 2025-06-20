const mongoose = require('mongoose');

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  paymentId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  items: [
    {
      description: String,
      quantity: Number,
      unitPrice: Number
    }
  ],
  pdfUrl: String
});

module.exports = mongoose.model('Invoice', InvoiceSchema);