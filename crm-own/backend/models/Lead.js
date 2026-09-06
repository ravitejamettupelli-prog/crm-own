const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed'], default: 'new' },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  notes: { type: String },
  dueDate: { type: Date },
  reminderSent: { type: Boolean, default: false },
  reminderDate: { type: Date },
  lastFollowUp: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);