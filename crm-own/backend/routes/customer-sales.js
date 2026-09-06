const express = require('express');
const db = require('../db/memory-store');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get sales for a specific customer
router.get('/:customerId/sales', auth, async (req, res) => {
  try {
    const { customerId } = req.params;
    const sales = await db.findSales(customerId);
    
    if (sales === null) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add sales record for a specific customer (admin only)
router.post('/:customerId/sales', auth, adminOnly, async (req, res) => {
  try {
    const { customerId } = req.params;
    const {
      productName,
      revenue,
      dealDate,
      salesRep,
      status,
      notes
    } = req.body;
    
    // Validate required fields
    if (!productName || !revenue || !dealDate || !salesRep) {
      return res.status(400).json({ error: 'All required fields must be provided' });
    }
    
    const saleData = {
      productName,
      revenue: parseFloat(revenue),
      dealDate: new Date(dealDate),
      salesRep,
      status: status || 'pending',
      notes: notes || ''
    };
    
    const newSale = await db.createSale(customerId, saleData);
    
    if (!newSale) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.status(201).json(newSale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update sales record for a specific customer
router.put('/:customerId/sales/:saleId', auth, async (req, res) => {
  try {
    const { customerId, saleId } = req.params;
    const updates = req.body;
    
    // Convert dealDate to Date object if provided
    if (updates.dealDate) {
      updates.dealDate = new Date(updates.dealDate);
    }
    
    // Convert revenue to number if provided
    if (updates.revenue) {
      updates.revenue = parseFloat(updates.revenue);
    }
    
    const updatedSale = await db.updateSale(customerId, saleId, updates);
    
    if (!updatedSale) {
      return res.status(404).json({ error: 'Customer or sale not found' });
    }
    
    res.json(updatedSale);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete sales record for a specific customer (admin only)
router.delete('/:customerId/sales/:saleId', auth, adminOnly, async (req, res) => {
  try {
    const { customerId, saleId } = req.params;
    
    const deleted = await db.deleteSale(customerId, saleId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Customer or sale not found' });
    }
    
    res.json({ message: 'Sales record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
