const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const mongoSanitize = require('mongo-sanitize');

dotenv.config();

const app = express();

// Security middleware
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(mongoSanitize());
// app.use(helmet());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is running!', timestamp: new Date() });
});

// Simple sales test endpoint
app.get('/sales/test', (req, res) => {
  console.log('Sales test endpoint called');
  res.json({ message: 'Sales endpoint working!' });
});

// Routes
app.use('/auth', require('./routes/auth-simple'));
app.use('/customers', require('./routes/customers-memory'));
app.use('/customers', require('./routes/customer-sales')); // Customer-specific sales routes
app.use('/sales', require('./routes/sales-reports')); // General sales reports
app.use('/leads', require('./routes/leads-memory'));
app.use('/dashboard', require('./routes/dashboard-memory'));
app.use('/reminders', require('./routes/reminders-memory'));
app.use('/users', require('./routes/users-memory'));
app.use('/admin-dashboard', require('./routes/admin-dashboard-memory'));

// Connect to MongoDB - temporarily disabled for testing
// mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm')
// .then(() => console.log('MongoDB connected'))
// .catch(err => console.log(err));
console.log('Running in test mode without MongoDB connection');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});