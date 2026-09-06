import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reminders = () => {
  const [reminders, setReminders] = useState({ upcoming: [], overdue: [] });
  const [allReminders, setAllReminders] = useState([]);
  const [myReminders, setMyReminders] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reminderForm, setReminderForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    category: 'task',
    customer: '',
    lead: '',
    notes: ''
  });

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchReminders();
    if (userData && userData.role === 'admin') {
      fetchAdminData();
    }
  }, []);

  const fetchReminders = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/reminders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(res.data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch all reminders
      const remindersRes = await axios.get('http://localhost:5000/reminders/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAllReminders(remindersRes.data);
      
      // Fetch my reminders
      const myRemindersRes = await axios.get('http://localhost:5000/reminders/my-reminders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyReminders(myRemindersRes.data);
      
      // Fetch users for assignment
      const usersRes = await axios.get('http://localhost:5000/reminders/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);
      
      // Fetch customers and leads
      const customersRes = await axios.get('http://localhost:5000/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCustomers(customersRes.data);
      
      const leadsRes = await axios.get('http://localhost:5000/leads', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLeads(leadsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  const handleCreateReminder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/reminders', reminderForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminderForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        category: 'task',
        customer: '',
        lead: '',
        notes: ''
      });
      setShowCreateModal(false);
      fetchAdminData();
    } catch (error) {
      console.error('Error creating reminder:', error);
    }
  };

  const handleUpdateReminder = async (reminderId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/reminders/${reminderId}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleDeleteReminder = async (reminderId) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAdminData();
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  const markAsCompleted = async (leadId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/reminders/${leadId}/sent`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReminders();
    } catch (error) {
      console.error('Error marking reminder as completed:', error);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#00C851';
      default: return '#666';
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center mt-4">
          <div className="colorful-loading"></div>
          <p className="text-muted mt-2">Loading reminders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="colorful-page-header">
        <h1 className="colorful-page-title">Reminder Management</h1>
        <p className="colorful-page-subtitle">
          {user && user.role === 'admin' 
            ? 'Admin: Create and manage all reminders' 
            : 'Manage your customer follow-up schedule'
          }
        </p>
      </div>

      {/* Admin Tabs */}
      {user && user.role === 'admin' && (
        <div className="colorful-card mb-4">
          <div className="btn-group w-100" role="group">
            <button 
              className={`colorful-btn ${activeTab === 'overview' ? 'colorful-btn-primary' : 'colorful-btn-secondary'}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`colorful-btn ${activeTab === 'manage' ? 'colorful-btn-primary' : 'colorful-btn-secondary'}`}
              onClick={() => setActiveTab('manage')}
            >
              Manage All
            </button>
            <button 
              className={`colorful-btn ${activeTab === 'my-reminders' ? 'colorful-btn-primary' : 'colorful-btn-secondary'}`}
              onClick={() => setActiveTab('my-reminders')}
            >
              My Reminders
            </button>
            <button 
              className="colorful-btn colorful-btn-success"
              onClick={() => setShowCreateModal(true)}
            >
              Create Reminder
            </button>
          </div>
        </div>
      )}

      {/* Admin Create Reminder Modal */}
      {showCreateModal && (
        <div className="colorful-modal-professional show">
          <div className="colorful-modal-content-professional">
            <div className="modal-header">
              <h3>Create New Reminder</h3>
              <button onClick={() => setShowCreateModal(false)} className="colorful-btn colorful-btn-secondary">Close</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateReminder} className="colorful-form">
                <div className="colorful-form-row">
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Title *</label>
                    <input
                      type="text"
                      className="colorful-form-control"
                      placeholder="Enter reminder title"
                      value={reminderForm.title}
                      onChange={(e) => setReminderForm({ ...reminderForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Priority</label>
                    <select 
                      className="colorful-form-control"
                      value={reminderForm.priority}
                      onChange={(e) => setReminderForm({ ...reminderForm, priority: e.target.value })}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                
                <div className="colorful-form-row">
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Assign To *</label>
                    <select 
                      className="colorful-form-control"
                      value={reminderForm.assignedTo}
                      onChange={(e) => setReminderForm({ ...reminderForm, assignedTo: e.target.value })}
                      required
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id}>
                          {user.name} ({user.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Category</label>
                    <select 
                      className="colorful-form-control"
                      value={reminderForm.category}
                      onChange={(e) => setReminderForm({ ...reminderForm, category: e.target.value })}
                    >
                      <option value="task">Task</option>
                      <option value="meeting">Meeting</option>
                      <option value="follow-up">Follow-up</option>
                      <option value="deadline">Deadline</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="colorful-form-row">
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Due Date *</label>
                    <input
                      type="datetime-local"
                      className="colorful-form-control"
                      value={reminderForm.dueDate}
                      onChange={(e) => setReminderForm({ ...reminderForm, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Related Customer</label>
                    <select 
                      className="colorful-form-control"
                      value={reminderForm.customer}
                      onChange={(e) => setReminderForm({ ...reminderForm, customer: e.target.value })}
                    >
                      <option value="">Select Customer</option>
                      {customers.map(customer => (
                        <option key={customer._id} value={customer._id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="colorful-form-group">
                  <label className="colorful-form-label">Description *</label>
                  <textarea
                    className="colorful-form-control"
                    placeholder="Enter reminder description"
                    value={reminderForm.description}
                    onChange={(e) => setReminderForm({ ...reminderForm, description: e.target.value })}
                    rows="3"
                    required
                  />
                </div>

                <div className="colorful-form-group">
                  <label className="colorful-form-label">Notes</label>
                  <textarea
                    className="colorful-form-control"
                    placeholder="Additional notes (optional)"
                    value={reminderForm.notes}
                    onChange={(e) => setReminderForm({ ...reminderForm, notes: e.target.value })}
                    rows="2"
                  />
                </div>

                <button type="submit" className="colorful-btn colorful-btn-primary">
                  Create Reminder
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'manage' && user && user.role === 'admin' && (
        <div className="colorful-table-container">
          <div className="card-header">
            <h3 className="card-title">All Reminders</h3>
            <p className="card-subtitle">Manage all system reminders</p>
          </div>
          <table className="colorful-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allReminders.map(reminder => (
                <tr key={reminder._id}>
                  <td>
                    <div>
                      <strong>{reminder.title}</strong><br />
                      <small className="text-muted">{reminder.description}</small>
                    </div>
                  </td>
                  <td>{reminder.assignedTo?.name}</td>
                  <td>
                    <span className={`colorful-status colorful-status-${reminder.priority === 'urgent' ? 'danger' : reminder.priority}`}>
                      {reminder.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`colorful-status colorful-status-${reminder.status === 'completed' ? 'success' : reminder.status === 'cancelled' ? 'danger' : 'info'}`}>
                      {reminder.status}
                    </span>
                  </td>
                  <td>{formatDate(reminder.dueDate)}</td>
                  <td>
                    <div className="actions-straight">
                      {reminder.status !== 'completed' && (
                        <button 
                          onClick={() => handleUpdateReminder(reminder._id, { status: 'completed' })}
                          className="colorful-btn colorful-btn-success btn-sm"
                        >
                          Complete
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteReminder(reminder._id)}
                        className="colorful-btn colorful-btn-danger btn-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'my-reminders' && user && user.role === 'admin' && (
        <div className="colorful-table-container">
          <div className="card-header">
            <h3 className="card-title">My Reminders</h3>
            <p className="card-subtitle">Reminders assigned to you</p>
          </div>
          <table className="colorful-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Created By</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {myReminders.map(reminder => (
                <tr key={reminder._id}>
                  <td>
                    <div>
                      <strong>{reminder.title}</strong><br />
                      <small className="text-muted">{reminder.description}</small>
                    </div>
                  </td>
                  <td>{reminder.createdBy?.name}</td>
                  <td>
                    <span className={`colorful-status colorful-status-${reminder.priority === 'urgent' ? 'danger' : reminder.priority}`}>
                      {reminder.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`colorful-status colorful-status-${reminder.status === 'completed' ? 'success' : reminder.status === 'cancelled' ? 'danger' : 'info'}`}>
                      {reminder.status}
                    </span>
                  </td>
                  <td>{formatDate(reminder.dueDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Original Overview Content */}
      {activeTab === 'overview' && (
        <>
          {/* Summary Cards */}
          <div className="colorful-grid">
            <div className="colorful-card danger">
              <div className="stat-number">{reminders.overdue.length}</div>
              <div className="stat-label">Overdue</div>
            </div>
            <div className="colorful-card info">
              <div className="stat-number">{reminders.upcoming.length}</div>
              <div className="stat-label">Upcoming</div>
            </div>
            <div className="colorful-card success">
              <div className="stat-number">{reminders.overdue.length + reminders.upcoming.length}</div>
              <div className="stat-label">Total</div>
            </div>
            {user && user.role === 'admin' && (
              <div className="colorful-card primary">
                <div className="stat-number">{allReminders.length}</div>
                <div className="stat-label">All System</div>
              </div>
            )}
          </div>

          {/* Overdue Reminders */}
          <div className="colorful-table-container">
            <div className="card-header">
              <h3 className="card-title text-danger">Overdue Reminders</h3>
              <p className="card-subtitle">Requires immediate attention</p>
            </div>
            <div className="card-body">
              {reminders.overdue.length === 0 ? (
                <div className="text-center p-4">
                  <div className="text-success">
                    <h4>Great job!</h4>
                    <p>No overdue reminders</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-1 gap-3">
                  {reminders.overdue.map(reminder => (
                    <div key={reminder._id} className="colorful-card" style={{ borderLeft: '4px solid #dc3545' }}>
                      <div className="card-body">
                        <div className="flex-between">
                          <div>
                            <h5 className="card-title mb-2">
                              {reminder.customerId?.name || 'Unknown Customer'}
                            </h5>
                            <div className="mb-2">
                              <span className="colorful-status colorful-status-info me-2">{reminder.status}</span>
                              <span className={`colorful-status colorful-status-${reminder.priority === 'high' ? 'danger' : reminder.priority === 'medium' ? 'warning' : 'success'} me-2`}>
                                {reminder.priority}
                              </span>
                            </div>
                            <p className="text-danger mb-2">
                              <strong>Due:</strong> {formatDate(reminder.dueDate || reminder.reminderDate)}
                            </p>
                            {reminder.notes && (
                              <p className="text-muted mb-0">
                                <em>{reminder.notes}</em>
                              </p>
                            )}
                          </div>
                          <div>
                            <button 
                              onClick={() => markAsCompleted(reminder._id)}
                              className="colorful-btn colorful-btn-success"
                            >
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Reminders */}
          <div className="colorful-table-container">
            <div className="card-header">
              <h3 className="card-title text-primary">Upcoming Reminders</h3>
              <p className="card-subtitle">Next 7 days</p>
            </div>
            <div className="card-body">
              {reminders.upcoming.length === 0 ? (
                <div className="text-center p-4">
                  <p className="text-muted">No upcoming reminders in the next 7 days</p>
                </div>
              ) : (
                <div className="grid grid-1 gap-3">
                  {reminders.upcoming.map(reminder => (
                    <div key={reminder._id} className="colorful-card" style={{ borderLeft: '4px solid #007bff' }}>
                      <div className="card-body">
                        <div className="flex-between">
                          <div>
                            <h5 className="card-title mb-2">
                              {reminder.customerId?.name || 'Unknown Customer'}
                            </h5>
                            <div className="mb-2">
                              <span className="colorful-status colorful-status-info me-2">{reminder.status}</span>
                              <span className={`colorful-status colorful-status-${reminder.priority === 'high' ? 'danger' : reminder.priority === 'medium' ? 'warning' : 'success'} me-2`}>
                                {reminder.priority}
                              </span>
                            </div>
                            <p className="text-primary mb-2">
                              <strong>Due:</strong> {formatDate(reminder.dueDate || reminder.reminderDate)}
                            </p>
                            {reminder.notes && (
                              <p className="text-muted mb-0">
                                <em>{reminder.notes}</em>
                              </p>
                            )}
                          </div>
                          <div>
                            <button 
                              onClick={() => markAsCompleted(reminder._id)}
                              className="colorful-btn colorful-btn-success"
                            >
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="colorful-card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
              <p className="card-subtitle">Common reminder tasks</p>
            </div>
            <div className="card-body">
              <div className="grid grid-3">
                <button className="colorful-btn colorful-btn-primary">
                  View All Leads
                </button>
                {user && user.role === 'admin' && (
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="colorful-btn colorful-btn-success"
                  >
                    Add New Reminder
                  </button>
                )}
                <button className="colorful-btn colorful-btn-info">
                  Export Calendar
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reminders;
