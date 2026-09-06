const express = require('express');
const db = require('../db/memory-store');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get upcoming reminders
router.get('/', auth, async (req, res) => {
  try {
    const reminders = await db.getReminders();
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark reminder as sent
router.put('/:id/sent', auth, async (req, res) => {
  try {
    const lead = await db.markReminderSent(req.params.id);
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set reminder for a lead
router.put('/:id/reminder', auth, async (req, res) => {
  try {
    const { reminderDate } = req.body;
    const lead = await db.updateLead(req.params.id, { reminderDate, reminderSent: false });
    if (!lead) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
