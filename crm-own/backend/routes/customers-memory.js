const express = require('express');
const db = require('../db/memory-store');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get all customers
router.get('/', auth, async (req, res) => {
  try {
    const { search, email } = req.query;
    let customers = await db.findCustomers();
    
    if (search) {
      customers = customers.filter(customer => 
        customer.name.toLowerCase().includes(search.toLowerCase()) ||
        customer.contact.toLowerCase().includes(search.toLowerCase()) ||
        customer.email.toLowerCase().includes(search.toLowerCase()) ||
        (customer.history && customer.history.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (email) {
      customers = customers.filter(customer => 
        customer.email.toLowerCase().includes(email.toLowerCase())
      );
    }
    
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add customer
router.post('/', auth, async (req, res) => {
  try {
    const customer = await db.createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update customer
router.put('/:id', auth, async (req, res) => {
  try {
    const customer = await db.updateCustomer(req.params.id, req.body);
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
    const deleted = await db.deleteCustomer(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add stock to customer (admin only)
router.post('/:id/stocks', auth, adminOnly, async (req, res) => {
  try {
    const { symbol, companyName, quantity, purchasePrice, currentPrice } = req.body;
    
    const customer = await db.findCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    const newStock = {
      _id: Date.now().toString(), // Generate unique ID
      symbol,
      companyName,
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      currentPrice: parseFloat(currentPrice),
      purchaseDate: new Date(),
      lastUpdated: new Date()
    };
    
    // Initialize stocks array if it doesn't exist
    if (!customer.stocks) {
      customer.stocks = [];
    }
    
    customer.stocks.push(newStock);
    
    // Calculate total stock value
    customer.totalStockValue = customer.stocks.reduce((total, stock) => {
      return total + (stock.quantity * stock.currentPrice);
    }, 0);
    
    const updatedCustomer = await db.updateCustomer(req.params.id, customer);
    res.status(201).json(updatedCustomer);
  } catch (error) {
    console.error('Error adding stock:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update stock price (authenticated users)
router.put('/:id/stocks/:stockId', auth, async (req, res) => {
  try {
    const { currentPrice } = req.body;
    
    const customer = await db.findCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    if (!customer.stocks) {
      return res.status(404).json({ error: 'No stocks found for this customer' });
    }
    
    const stock = customer.stocks.find(s => s._id === req.params.stockId);
    if (!stock) {
      return res.status(404).json({ error: 'Stock not found' });
    }
    
    stock.currentPrice = parseFloat(currentPrice);
    stock.lastUpdated = new Date();
    
    // Recalculate total stock value
    customer.totalStockValue = customer.stocks.reduce((total, stock) => {
      return total + (stock.quantity * stock.currentPrice);
    }, 0);
    
    const updatedCustomer = await db.updateCustomer(req.params.id, customer);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating stock price:', error);
    res.status(400).json({ error: error.message });
  }
});

// Delete stock from customer (authenticated users)
router.delete('/:id/stocks/:stockId', auth, async (req, res) => {
  try {
    const customer = await db.findCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    if (!customer.stocks) {
      return res.status(404).json({ error: 'No stocks found for this customer' });
    }
    
    customer.stocks = customer.stocks.filter(s => s._id !== req.params.stockId);
    
    // Recalculate total stock value
    customer.totalStockValue = customer.stocks.reduce((total, stock) => {
      return total + (stock.quantity * stock.currentPrice);
    }, 0);
    
    const updatedCustomer = await db.updateCustomer(req.params.id, customer);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error deleting stock:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get customer stocks (authenticated users)
router.get('/:id/stocks', auth, async (req, res) => {
  try {
    const customer = await db.findCustomerById(req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer.stocks || []);
  } catch (error) {
    console.error('Error fetching customer stocks:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
