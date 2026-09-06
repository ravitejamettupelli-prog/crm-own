const express = require('express');
const Lead = require('../models/Lead');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const Customer = require('../models/Customer');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get upcoming reminders
router.get('/', auth, async (req, res) => {
  try {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcomingReminders = await Lead.find({
      $or: [
        { dueDate: { $lte: sevenDaysFromNow, $gte: now }, reminderSent: false },
        { reminderDate: { $lte: sevenDaysFromNow, $gte: now }, reminderSent: false }
      ]
    }).populate('customerId');
    
    const overdueReminders = await Lead.find({
      $or: [
        { dueDate: { $lt: now }, reminderSent: false },
        { reminderDate: { $lt: now }, reminderSent: false }
      ]
    }).populate('customerId');

    res.json({
      upcoming: upcomingReminders,
      overdue: overdueReminders
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark reminder as sent
router.put('/:id/sent', auth, async (req, res) => {
  try {
    const lead = await Lead.findByIdAndUpdate(
      req.params.id, 
      { reminderSent: true, lastFollowUp: new Date() }, 
      { new: true }
    ).populate('customerId');
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Set reminder for a lead
router.put('/:id/reminder', auth, async (req, res) => {
  try {
    const { reminderDate } = req.body;
    const lead = await Lead.findByIdAndUpdate(
      req.params.id, 
      { reminderDate, reminderSent: false }, 
      { new: true }
    ).populate('customerId');
    res.json(lead);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all reminders (admin only)
router.get('/all', auth, async (req, res) => {
  try {
    const { status, priority, assignedTo, category } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;
    if (category) query.category = category;
    
    const reminders = await Reminder.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('customer', 'name email')
      .populate('lead', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new reminder (admin only)
router.post('/', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      category,
      customer,
      lead,
      notes
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const reminder = new Reminder({
      title,
      description,
      assignedTo,
      createdBy: req.user.id,
      priority: priority || 'medium',
      dueDate,
      category: category || 'task',
      customer,
      lead,
      notes
    });
    
    await reminder.save();
    
    const populatedReminder = await Reminder.findById(reminder._id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('customer', 'name email')
      .populate('lead', 'name email');
    
    res.status(201).json(populatedReminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update reminder
router.put('/:id', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      status,
      dueDate,
      category,
      customer,
      lead,
      notes,
      completedBy
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const updateData = {
      title,
      description,
      assignedTo,
      priority,
      status,
      dueDate,
      category,
      customer,
      lead,
      notes
    };
    
    if (status === 'completed') {
      updateData.completedAt = new Date();
      updateData.completedBy = completedBy || req.user.id;
    }
    
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('customer', 'name email')
      .populate('lead', 'name email')
      .populate('completedBy', 'name email');
    
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json(reminder);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete reminder
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const reminder = await Reminder.findByIdAndDelete(req.params.id);
    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }
    
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reminders assigned to current user
router.get('/my-reminders', auth, async (req, res) => {
  try {
    const { status } = req.query;
    let query = { assignedTo: req.user.id };
    
    if (status) query.status = status;
    
    const reminders = await Reminder.find(query)
      .populate('createdBy', 'name email')
      .populate('customer', 'name email')
      .populate('lead', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users for assignment dropdown
router.get('/users', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    const users = await User.find({}).select('name email role');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Schedule reminder with recurring support
router.post('/schedule', auth, async (req, res) => {
  try {
    const {
      title,
      description,
      assignedTo,
      priority,
      dueDate,
      timeSlot,
      category,
      customer,
      lead,
      notes,
      isRecurring,
      recurringType,
      recurringInterval,
      recurringEndDate
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Combine date and time
    const scheduledDateTime = new Date(`${dueDate}T${timeSlot}:00`);
    
    if (isRecurring) {
      // Create recurring reminders
      const reminders = [];
      const endDate = new Date(recurringEndDate);
      const startDate = new Date(scheduledDateTime);
      
      let currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const reminder = new Reminder({
          title,
          description,
          assignedTo,
          createdBy: req.user.id,
          priority: priority || 'medium',
          dueDate: new Date(currentDate),
          category: category || 'task',
          customer,
          lead,
          notes,
          isRecurring: true,
          recurringType,
          recurringInterval
        });
        
        reminders.push(reminder);
        
        // Calculate next occurrence
        switch (recurringType) {
          case 'daily':
            currentDate.setDate(currentDate.getDate() + recurringInterval);
            break;
          case 'weekly':
            currentDate.setDate(currentDate.getDate() + (recurringInterval * 7));
            break;
          case 'monthly':
            currentDate.setMonth(currentDate.getMonth() + recurringInterval);
            break;
          case 'yearly':
            currentDate.setFullYear(currentDate.getFullYear() + recurringInterval);
            break;
        }
      }
      
      // Save all recurring reminders
      await Reminder.insertMany(reminders);
      
      // Populate and return the first reminder
      const firstReminder = await Reminder.findById(reminders[0]._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('customer', 'name email')
        .populate('lead', 'name email');
      
      res.status(201).json(firstReminder);
    } else {
      // Create single reminder
      const reminder = new Reminder({
        title,
        description,
        assignedTo,
        createdBy: req.user.id,
        priority: priority || 'medium',
        dueDate: scheduledDateTime,
        category: category || 'task',
        customer,
        lead,
        notes
      });
      
      await reminder.save();
      
      const populatedReminder = await Reminder.findById(reminder._id)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .populate('customer', 'name email')
        .populate('lead', 'name email');
      
      res.status(201).json(populatedReminder);
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Bulk schedule reminders
router.post('/bulk-schedule', auth, async (req, res) => {
  try {
    const {
      users,
      title,
      description,
      priority,
      dueDate,
      timeSlot,
      category,
      notes
    } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    if (!users || users.length === 0) {
      return res.status(400).json({ error: 'At least one user must be selected' });
    }
    
    // Combine date and time
    const scheduledDateTime = new Date(`${dueDate}T${timeSlot}:00`);
    
    // Create reminders for each selected user
    const reminders = users.map(userId => ({
      title,
      description,
      assignedTo: userId,
      createdBy: req.user.id,
      priority: priority || 'medium',
      dueDate: scheduledDateTime,
      category: category || 'task',
      notes
    }));
    
    const savedReminders = await Reminder.insertMany(reminders);
    
    // Populate and return the reminders
    const populatedReminders = await Reminder.find({ _id: { $in: savedReminders.map(r => r._id) } })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedReminders);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get calendar view data
router.get('/calendar', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    // Get start and end of month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    const reminders = await Reminder.find({
      dueDate: { $gte: startDate, $lte: endDate }
    })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('customer', 'name email')
      .populate('lead', 'name email')
      .sort({ dueDate: 1 });
    
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
