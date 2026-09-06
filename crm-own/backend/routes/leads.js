const express = require('express');
const Lead = require('../models/Lead');
const { auth } = require('../middleware/auth');
const { validateLead } = require('../middleware/validation');

const router = express.Router();

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, priority, customerId } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { notes: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (priority) {
      query.priority = priority;
    }
    
    if (customerId) {
      query.customerId = customerId;
    }
    
    const leads = await Lead.find(query).populate('customerId');
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add lead
router.post('/', auth, validateLead, async (req, res) => {
  try {
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update lead
router.put('/:id', auth, validateLead, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete lead
router.delete('/:id', auth, async (req, res) => {
  try {
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;