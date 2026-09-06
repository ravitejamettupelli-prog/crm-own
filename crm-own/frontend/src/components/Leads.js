import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [form, setForm] = useState({ customerId: '', status: 'new', priority: 'medium', notes: '', dueDate: '', reminderDate: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    fetchLeads();
    fetchCustomers();
  }, []);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const filtered = leads.filter(lead => {
      const matchesSearch = !debouncedSearchTerm || 
        (lead.notes && lead.notes.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
        (lead.customerId?.name && lead.customerId.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
      
      const matchesStatus = !statusFilter || lead.status === statusFilter;
      const matchesPriority = !priorityFilter || lead.priority === priorityFilter;
      const matchesCustomer = !customerFilter || lead.customerId?._id === customerFilter;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesCustomer;
    });
    setFilteredLeads(filtered);
  }, [leads, debouncedSearchTerm, statusFilter, priorityFilter, customerFilter]);

  const fetchLeads = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/leads', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setLeads(res.data);
    setFilteredLeads(res.data);
  };

  const fetchCustomers = async () => {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:5000/customers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setCustomers(res.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    await axios.post('http://localhost:5000/leads', form, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setForm({ customerId: '', status: 'new', priority: 'medium', notes: '', dueDate: '', reminderDate: '' });
    fetchLeads();
  };

  const deleteLead = async (id) => {
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/leads/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchLeads();
  };

  return (
    <div className="container">
      <div className="page-header fade-in">
        <h1 className="page-title">Lead Management</h1>
        <p className="page-subtitle">Track and manage your sales leads</p>
      </div>

      {/* Search and Filter Section */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">Search & Filter</h3>
          <p className="card-subtitle">Find leads quickly</p>
        </div>
        <div className="card-body">
          <div className="grid grid-4 gap-2">
            <div className="form-group">
              <input 
                type="text"
                className="form-control"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="form-group">
              <select 
                className="form-select"
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="form-group">
              <select 
                className="form-select"
                value={priorityFilter} 
                onChange={(e) => setPriorityFilter(e.target.value)}
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="form-group">
              <select 
                className="form-select"
                value={customerFilter} 
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="">All Customers</option>
                {customers.map(customer => (
                  <option key={customer._id} value={customer._id}>{customer.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Add Lead Form */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">Add New Lead</h3>
          <p className="card-subtitle">Create a new sales lead</p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Customer</label>
                <select 
                  className="form-select"
                  value={form.customerId} 
                  onChange={(e) => setForm({ ...form, customerId: e.target.value })} 
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer._id} value={customer._id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select 
                  className="form-select"
                  value={form.status} 
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="qualified">Qualified</option>
                  <option value="proposal">Proposal</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select 
                  className="form-select"
                  value={form.priority} 
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={form.dueDate} 
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Reminder Date</label>
                <input 
                  type="datetime-local" 
                  className="form-control"
                  value={form.reminderDate} 
                  onChange={(e) => setForm({ ...form, reminderDate: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  placeholder="Enter lead notes..."
                  value={form.notes} 
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows="3"
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Add Lead
            </button>
          </form>
        </div>
      </div>

      {/* Lead List */}
      <div className="table-container hover-lift">
        <div className="card-header">
          <h3 className="card-title">Lead List</h3>
          <p className="card-subtitle">
            {filteredLeads.length} of {leads.length} leads found
          </p>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Dates</th>
              <th>Notes</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <tr key={lead._id}>
                <td>
                  <strong>{lead.customerId?.name || 'Unknown Customer'}</strong>
                </td>
                <td>
                  <span className={`badge ${getStatusColor(lead.status)}`}>
                    {lead.status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${getPriorityColor(lead.priority)}`}>
                    {lead.priority}
                  </span>
                </td>
                <td>
                  <div>
                    {lead.dueDate && (
                      <div><strong>Due:</strong> {formatDate(lead.dueDate)}</div>
                    )}
                    {lead.reminderDate && (
                      <div><strong>Reminder:</strong> {formatDate(lead.reminderDate)}</div>
                    )}
                  </div>
                </td>
                <td>
                  <small>{lead.notes || 'No notes'}</small>
                </td>
                <td>
                  <button 
                    onClick={() => deleteLead(lead._id)}
                    className="btn btn-danger btn-sm"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredLeads.length === 0 && leads.length > 0 && (
          <div className="text-center p-4">
            <p className="text-muted">No leads match your search criteria.</p>
          </div>
        )}
        {leads.length === 0 && (
          <div className="text-center p-4">
            <p className="text-muted">No leads found. Add your first lead above.</p>
          </div>
        )}
      </div>

      {/* Lead Statistics */}
      <div className="stats-grid">
        <div className="stat-card hover-lift">
          <div className="stat-number">{leads.length}</div>
          <div className="stat-label">Total Leads</div>
        </div>
        <div className="stat-card success hover-lift">
          <div className="stat-number">{leads.filter(l => l.status === 'qualified').length}</div>
          <div className="stat-label">Qualified</div>
        </div>
        <div className="stat-card danger hover-lift">
          <div className="stat-number">{leads.filter(l => l.priority === 'high').length}</div>
          <div className="stat-label">High Priority</div>
        </div>
        <div className="stat-card warning hover-lift">
          <div className="stat-number">{leads.filter(l => l.status === 'new').length}</div>
          <div className="stat-label">New Leads</div>
        </div>
      </div>
    </div>
  );

  function getStatusColor(status) {
    switch(status) {
      case 'new': return 'badge-primary';
      case 'contacted': return 'badge-info';
      case 'qualified': return 'badge-success';
      case 'proposal': return 'badge-warning';
      case 'negotiation': return 'badge-warning';
      case 'closed': return 'badge-secondary';
      default: return 'badge-primary';
    }
  }

  function getPriorityColor(priority) {
    switch(priority) {
      case 'low': return 'badge-success';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-primary';
    }
  }

  function formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

export default Leads;