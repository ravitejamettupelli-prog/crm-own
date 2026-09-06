const express = require('express');
const db = require('../db/memory-store');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all leads
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, priority, customerId } = req.query;
    let leads = await db.findLeads();
    
    if (search) {
      leads = leads.filter(lead => 
        (lead.notes && lead.notes.toLowerCase().includes(search.toLowerCase())) ||
        (lead.customerId?.name && lead.customerId.name.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    if (status) {
      leads = leads.filter(lead => lead.status === status);
    }
    
    if (priority) {
      leads = leads.filter(lead => lead.priority === priority);
    }
    
    if (customerId) {
      leads = leads.filter(lead => lead.customerId?._id === customerId);
    }
    
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add lead
router.post('/', auth, async (req, res) => {
  try {
    const lead = await db.createLead(req.body);
    res.status(201).json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update lead
router.put('/:id', auth, async (req, res) => {
  try {
    const lead = await db.updateLead(req.params.id, req.body);
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
    const deleted = await db.deleteLead(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json({ message: 'Lead deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
