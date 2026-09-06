const express = require('express');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/', auth, async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const leadsByStatus = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Stock data aggregation
    const stockData = await Customer.aggregate([
      { $unwind: '$stocks' },
      {
        $group: {
          _id: '$symbol',
          totalPurchaseValue: { $sum: { $multiply: ['$stocks.quantity', '$stocks.purchasePrice'] } },
          totalCurrentValue: { $sum: { $multiply: ['$stocks.quantity', '$stocks.currentPrice'] } }
        }
      },
      { $sort: { totalCurrentValue: -1 } },
      { $limit: 10 }
    ]);

    res.json({ totalCustomers, totalLeads, leadsByStatus, stockData });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;