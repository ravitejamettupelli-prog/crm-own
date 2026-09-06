const express = require('express');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');
const { validateCustomer } = require('../middleware/validation');

const router = express.Router();

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const { search, email } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contact: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { history: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (email) {
      query.email = { $regex: email, $options: 'i' };
    }
    
    const customers = await Customer.find(query);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add customer
router.post('/', auth, validateCustomer, async (req, res) => {
  try {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', auth, validateCustomer, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete customer
router.delete('/:id', auth, async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add stock to customer
router.post('/:id/stocks', auth, async (req, res) => {
  try {
    const { symbol, companyName, quantity, purchasePrice, currentPrice } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const newStock = {
      symbol,
      companyName,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate: new Date(),
      lastUpdated: new Date()
    };
    
    customer.stocks.push(newStock);
    
    // Calculate total stock value
    customer.totalStockValue = customer.stocks.reduce((total, stock) => {
      return total + (stock.quantity * stock.currentPrice);
    }, 0);
    
    await customer.save();
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update stock price
router.put('/:id/stocks/:stockId', auth, async (req, res) => {
  try {
    const { currentPrice } = req.body;
    
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const stock = customer.stocks.id(req.params.stockId);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    stock.currentPrice = currentPrice;
    stock.lastUpdated = new Date();
    
    // Recalculate total stock value
    customer.totalStockValue = customer.stocks.reduce((total, stock) => {
      return total + (stock.quantity * stock.currentPrice);
    }, 0);
    
    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete stock from customer
router.delete('/:id/stocks/:stockId', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    customer.stocks.pull(req.params.stockId);
    
    // Recalculate total stock value
    customer.totalStockValue = customer.stocks.reduce((total, stock) => {
      return total + (stock.quantity * stock.currentPrice);
    }, 0);
    
    await customer.save();
    res.json(customer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get customer stocks
router.get('/:id/stocks', auth, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer.stocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;