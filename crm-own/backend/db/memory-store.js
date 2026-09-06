// Simple in-memory database for testing
class MemoryStore {
  constructor() {
    this.customers = [];
    this.leads = [];
    this.users = [];
    this.init();
  }

  async init() {
    // Initialize with sample data
    const bcrypt = require('bcryptjs');
    
    console.log('Initializing memory store...');
    
    // Add admin user
    const adminPassword = await bcrypt.hash('Admin123', 10);
    this.users.push({
      _id: '1',
      name: 'Admin User',
      email: 'admin@crm.com',
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Admin user created: admin@crm.com');

    // Add test user
    const userPassword = await bcrypt.hash('Test123', 10);
    this.users.push({
      _id: '2',
      name: 'Test User',
      email: 'test@example.com',
      password: userPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Test user created: test@example.com');

    // Add ravitejas user
    const ravitejasPassword = await bcrypt.hash('Ravitejas123', 10);
    this.users.push({
      _id: '3',
      name: 'Ravitejas',
      email: 'ravitejas@crm.com',
      password: ravitejasPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Ravitejas user created: ravitejas@crm.com');

    // Add divya user
    const divyaPassword = await bcrypt.hash('Divya123', 10);
    this.users.push({
      _id: '4',
      name: 'Divya',
      email: 'divya@crm.com',
      password: divyaPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Divya user created: divya@crm.com');
    console.log('Total users initialized:', this.users.length);

    // Add sample customers
    this.customers.push({
      _id: '1',
      name: 'John Doe',
      contact: '+1234567890',
      email: 'john@example.com',
      history: 'VIP customer since 2020',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.customers.push({
      _id: '2',
      name: 'Jane Smith',
      contact: '+0987654321',
      email: 'jane@example.com',
      history: 'New lead from website',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Add sample leads
    this.leads.push({
      _id: '1',
      customerId: '1',
      status: 'new',
      priority: 'high',
      notes: 'Interested in premium package',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      reminderDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
      reminderSent: false,
      lastFollowUp: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    this.leads.push({
      _id: '2',
      customerId: '2',
      status: 'contacted',
      priority: 'medium',
      notes: 'Initial call completed',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      reminderSent: false,
      lastFollowUp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  // Customer methods
  async findCustomers() {
    return this.customers;
  }

  async findCustomerById(id) {
    return this.customers.find(c => c._id === id);
  }

  async createCustomer(data) {
    const customer = {
      _id: String(this.customers.length + 1),
      ...data,
      stocks: [],
      totalStockValue: 0,
      sales: [],
      totalSalesValue: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.customers.push(customer);
    return customer;
  }

  async updateCustomer(id, data) {
    const index = this.customers.findIndex(c => c._id === id);
    if (index === -1) return null;
    this.customers[index] = { ...this.customers[index], ...data, updatedAt: new Date() };
    return this.customers[index];
  }

  async deleteCustomer(id) {
    const index = this.customers.findIndex(c => c._id === id);
    if (index === -1) return false;
    this.customers.splice(index, 1);
    return true;
  }

  // Sales methods
  async findSales(customerId) {
    const customer = this.customers.find(c => c._id === customerId);
    if (!customer) return null;
    return customer.sales || [];
  }

  async createSale(customerId, saleData) {
    const customer = this.customers.find(c => c._id === customerId);
    if (!customer) return null;

    if (!customer.sales) {
      customer.sales = [];
    }

    const newSale = {
      _id: Date.now().toString(),
      ...saleData,
      createdAt: new Date()
    };

    customer.sales.push(newSale);

    // Calculate total sales value (only count closed sales)
    customer.totalSalesValue = customer.sales
      .filter(s => s.status === 'closed')
      .reduce((total, sale) => total + sale.revenue, 0);

    customer.updatedAt = new Date();
    return newSale;
  }

  async updateSale(customerId, saleId, saleData) {
    const customer = this.customers.find(c => c._id === customerId);
    if (!customer || !customer.sales) return null;

    const saleIndex = customer.sales.findIndex(s => s._id === saleId);
    if (saleIndex === -1) return null;

    customer.sales[saleIndex] = {
      ...customer.sales[saleIndex],
      ...saleData,
      updatedAt: new Date()
    };

    // Recalculate total sales value
    customer.totalSalesValue = customer.sales
      .filter(s => s.status === 'closed')
      .reduce((total, sale) => total + sale.revenue, 0);

    customer.updatedAt = new Date();
    return customer.sales[saleIndex];
  }

  async deleteSale(customerId, saleId) {
    const customer = this.customers.find(c => c._id === customerId);
    if (!customer || !customer.sales) return false;

    const saleIndex = customer.sales.findIndex(s => s._id === saleId);
    if (saleIndex === -1) return false;

    customer.sales.splice(saleIndex, 1);

    // Recalculate total sales value
    customer.totalSalesValue = customer.sales
      .filter(s => s.status === 'closed')
      .reduce((total, sale) => total + sale.revenue, 0);

    customer.updatedAt = new Date();
    return true;
  }

  // Lead methods
  async findLeads() {
    return this.leads.map(lead => ({
      ...lead,
      customerId: this.customers.find(c => c._id === lead.customerId)
    }));
  }

  async createLead(data) {
    const lead = {
      _id: String(this.leads.length + 1),
      ...data,
      reminderSent: false,
      lastFollowUp: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leads.push(lead);
    return lead;
  }

  async updateLead(id, data) {
    const index = this.leads.findIndex(l => l._id === id);
    if (index === -1) return null;
    this.leads[index] = { ...this.leads[index], ...data, updatedAt: new Date() };
    return this.leads[index];
  }

  async deleteLead(id) {
    const index = this.leads.findIndex(l => l._id === id);
    if (index === -1) return false;
    this.leads.splice(index, 1);
    return true;
  }

  // User methods
  async findUser(email) {
    return this.users.find(u => u.email === email);
  }

  async findUserById(id) {
    return this.users.find(u => u._id === id);
  }

  async getAllUsers() {
    return this.users.map(user => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  async createUser(data) {
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = {
      _id: String(this.users.length + 1),
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async updateUser(id, data) {
    const index = this.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    this.users[index] = { ...this.users[index], ...data, updatedAt: new Date() };
    return this.users[index];
  }

  async deleteUser(id) {
    const index = this.users.findIndex(u => u._id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  // Dashboard methods
  async getDashboardStats() {
    const totalCustomers = this.customers.length;
    const totalLeads = this.leads.length;
    
    const leadsByStatus = this.leads.reduce((acc, lead) => {
      acc[lead.status] = (acc[lead.status] || 0) + 1;
      return acc;
    }, {});

    const leadsByStatusArray = Object.entries(leadsByStatus).map(([status, count]) => ({
      _id: status,
      count
    }));

    // Stock data aggregation
    const stockData = [];
    this.customers.forEach(customer => {
      if (customer.stocks && customer.stocks.length > 0) {
        customer.stocks.forEach(stock => {
          const existingStock = stockData.find(s => s._id === stock.symbol);
          if (existingStock) {
            existingStock.totalPurchaseValue += stock.quantity * stock.purchasePrice;
            existingStock.totalCurrentValue += stock.quantity * stock.currentPrice;
          } else {
            stockData.push({
              _id: stock.symbol,
              totalPurchaseValue: stock.quantity * stock.purchasePrice,
              totalCurrentValue: stock.quantity * stock.currentPrice
            });
          }
        });
      }
    });

    return { totalCustomers, totalLeads, leadsByStatus: leadsByStatusArray, stockData };
  }

  // Reminder methods
  async getReminders() {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const upcoming = this.leads.filter(lead => {
      const date = lead.dueDate || lead.reminderDate;
      return date && date <= sevenDaysFromNow && date >= now && !lead.reminderSent;
    }).map(lead => ({
      ...lead,
      customerId: this.customers.find(c => c._id === lead.customerId)
    }));

    const overdue = this.leads.filter(lead => {
      const date = lead.dueDate || lead.reminderDate;
      return date && date < now && !lead.reminderSent;
    }).map(lead => ({
      ...lead,
      customerId: this.customers.find(c => c._id === lead.customerId)
    }));

    return { upcoming, overdue };
  }

  async markReminderSent(id) {
    const lead = this.leads.find(l => l._id === id);
    if (lead) {
      lead.reminderSent = true;
      lead.lastFollowUp = new Date();
    }
    return lead;
  }
}

module.exports = new MemoryStore();
