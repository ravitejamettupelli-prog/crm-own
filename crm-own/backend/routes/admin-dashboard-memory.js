const express = require('express');
const db = require('../db/memory-store');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Get admin dashboard analytics
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    const users = await db.getAllUsers();
    
    // Additional admin-specific analytics
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    // Customer analytics
    const customers = await db.findCustomers();
    const recentCustomers = customers.filter(c => {
      const createdAt = new Date(c.createdAt);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return createdAt > sevenDaysAgo;
    }).length;
    
    // Lead analytics
    const leads = await db.findLeads();
    const highPriorityLeads = leads.filter(l => l.priority === 'high').length;
    const overdueReminders = leads.filter(l => {
      const date = l.dueDate || l.reminderDate;
      return date && new Date(date) < new Date() && !l.reminderSent;
    }).length;
    
    // Conversion rates
    const conversionRate = customers.length > 0 ? Math.round((leads.length / customers.length) * 100) : 0;
    
    res.json({
      ...stats,
      totalUsers,
      adminUsers,
      regularUsers,
      recentCustomers,
      highPriorityLeads,
      overdueReminders,
      conversionRate
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activity summary
router.get('/user-activity', auth, adminOnly, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    const customers = await db.findCustomers();
    const leads = await db.findLeads();
    
    // Simulate user activity data
    const userActivity = users.map(user => ({
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      customersCreated: Math.floor(Math.random() * 10),
      leadsCreated: Math.floor(Math.random() * 15),
      lastLogin: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
    }));
    
    res.json(userActivity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
