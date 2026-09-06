const express = require('express');
const db = require('../db/memory-store');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get dashboard analytics
router.get('/', auth, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
