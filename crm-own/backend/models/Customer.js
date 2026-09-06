const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true },
  history: { type: String },
  stocks: [{
    symbol: { type: String, required: true },
    companyName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    purchasePrice: { type: Number, required: true, min: 0 },
    currentPrice: { type: Number, required: true, min: 0 },
    purchaseDate: { type: Date, required: true, default: Date.now },
    lastUpdated: { type: Date, default: Date.now }
  }],
  totalStockValue: { type: Number, default: 0 },
  sales: [{
    productName: { type: String, required: true },
    revenue: { type: Number, required: true, min: 0 },
    dealDate: { type: Date, required: true, default: Date.now },
    salesRep: { type: String, required: true },
    status: { type: String, enum: ['pending', 'closed', 'cancelled'], default: 'pending' },
    notes: { type: String }
  }],
  totalSalesValue: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);