const express = require('express');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Mock sales data - in a real application, this would come from a database
const mockSalesData = {
  monthly: [
    { month: 'Jan', revenue: 45000, deals: 12, customers: 8 },
    { month: 'Feb', revenue: 52000, deals: 15, customers: 10 },
    { month: 'Mar', revenue: 48000, deals: 14, customers: 9 },
    { month: 'Apr', revenue: 61000, deals: 18, customers: 12 },
    { month: 'May', revenue: 58000, deals: 16, customers: 11 },
    { month: 'Jun', revenue: 67000, deals: 20, customers: 14 }
  ],
  quarterly: [
    { quarter: 'Q1 2024', revenue: 145000, deals: 41, customers: 27 },
    { quarter: 'Q2 2024', revenue: 186000, deals: 54, customers: 37 },
    { quarter: 'Q3 2024', revenue: 178000, deals: 49, customers: 34 },
    { quarter: 'Q4 2024', revenue: 195000, deals: 58, customers: 41 }
  ],
  yearly: [
    { year: '2021', revenue: 420000, deals: 120, customers: 85 },
    { year: '2022', revenue: 580000, deals: 165, customers: 118 },
    { year: '2023', revenue: 704000, deals: 202, customers: 139 },
    { year: '2024', revenue: 704000, deals: 202, customers: 139 }
  ],
  byProduct: [
    { product: 'CRM Basic', revenue: 125000, units: 250, percentage: 25 },
    { product: 'CRM Pro', revenue: 180000, units: 180, percentage: 36 },
    { product: 'CRM Enterprise', revenue: 150000, units: 60, percentage: 30 },
    { product: 'Custom Solutions', revenue: 45000, units: 15, percentage: 9 }
  ],
  byRegion: [
    { region: 'North America', revenue: 280000, deals: 95, percentage: 40 },
    { region: 'Europe', revenue: 210000, deals: 70, percentage: 30 },
    { region: 'Asia Pacific', revenue: 175000, deals: 62, percentage: 25 },
    { region: 'Other', revenue: 35000, deals: 22, percentage: 5 }
  ],
  bySalesRep: [
    { name: 'John Smith', revenue: 145000, deals: 42, commission: 14500 },
    { name: 'Sarah Johnson', revenue: 132000, deals: 38, commission: 13200 },
    { name: 'Mike Davis', revenue: 118000, deals: 35, commission: 11800 },
    { name: 'Emily Wilson', revenue: 105000, deals: 34, commission: 10500 }
  ]
};

// Get comprehensive sales reports
router.get('/reports', auth, async (req, res) => {
  try {
    // In a real application, you would query your database here
    // For now, we return mock data
    res.json(mockSalesData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales summary for dashboard
router.get('/summary', auth, async (req, res) => {
  try {
    const currentMonth = mockSalesData.monthly[mockSalesData.monthly.length - 1];
    const totalRevenue = mockSalesData.monthly.reduce((sum, item) => sum + item.revenue, 0);
    const totalDeals = mockSalesData.monthly.reduce((sum, item) => sum + item.deals, 0);
    const totalCustomers = mockSalesData.monthly.reduce((sum, item) => sum + item.customers, 0);
    
    const summary = {
      currentMonthRevenue: currentMonth.revenue,
      currentMonthDeals: currentMonth.deals,
      currentMonthCustomers: currentMonth.customers,
      totalRevenue,
      totalDeals,
      totalCustomers,
      averageDealSize: totalDeals > 0 ? totalRevenue / totalDeals : 0,
      growthRate: 15.5 // Mock growth rate
    };
    
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get top performing sales reps
router.get('/top-reps', auth, async (req, res) => {
  try {
    const topReps = mockSalesData.bySalesRep
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    res.json(topReps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get sales performance by period
router.get('/performance/:period', auth, async (req, res) => {
  try {
    const { period } = req.params;
    let data;
    
    switch (period) {
      case 'monthly':
        data = mockSalesData.monthly;
        break;
      case 'quarterly':
        data = mockSalesData.quarterly;
        break;
      case 'yearly':
        data = mockSalesData.yearly;
        break;
      default:
        return res.status(400).json({ error: 'Invalid period. Use monthly, quarterly, or yearly' });
    }
    
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new sales record (admin only)
router.post('/record', auth, adminOnly, async (req, res) => {
  try {
    const {
      customerName,
      productName,
      revenue,
      salesRep,
      region,
      dealDate,
      status
    } = req.body;
    
    // In a real application, you would save this to your database
    // For now, we just return success
    const newRecord = {
      id: Date.now(),
      customerName,
      productName,
      revenue,
      salesRep,
      region,
      dealDate: new Date(dealDate),
      status: status || 'closed',
      createdAt: new Date()
    };
    
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update sales record (admin only)
router.put('/record/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // In a real application, you would update the record in your database
    // For now, we just return the updated record
    const updatedRecord = {
      id,
      ...updates,
      updatedAt: new Date()
    };
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete sales record (admin only)
router.delete('/record/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // In a real application, you would delete the record from your database
    // For now, we just return success
    res.json({ message: 'Sales record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
