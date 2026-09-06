import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminReminderScheduler = () => {
  const [reminders, setReminders] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [leads, setLeads] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [activeTab, setActiveTab] = useState('schedule');
  const [calendarView, setCalendarView] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    category: 'task',
    customer: '',
    lead: '',
    notes: '',
    isRecurring: false,
    recurringType: 'daily',
    recurringInterval: 1,
    recurringEndDate: '',
    dueDate: '',
    timeSlot: '09:00'
  });

  console.log('Current users state:', users);

  const [bulkForm, setBulkForm] = useState({
    users: [],
    title: '',
    description: '',
    priority: 'medium',
    category: 'task',
    dueDate: '',
    timeSlot: '09:00',
    notes: ''
  });

  useEffect(() => {
    fetchSchedulerData();
  }, []);

  const fetchSchedulerData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('=== AdminReminderScheduler Debug ===');
      console.log('Token found:', !!token);
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'none');
      
      // Fetch users separately first
      let usersData = [];
      try {
        const usersRes = await axios.get('http://localhost:5000/users', {
          headers: { Authorization: `Bearer ${token}` }
        });
        usersData = usersRes.data;
        console.log('Users fetched successfully:', usersData);
      } catch (err) {
        console.error('Error fetching users:', err.response?.data || err.message);
        console.error('Error status:', err.response?.status);
      }
      
      // Fetch other data
      const [remindersRes, customersRes, leadsRes] = await Promise.all([
        axios.get('http://localhost:5000/reminders/all', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/customers', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5000/leads', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      console.log('Users array length:', usersData?.length);
      console.log('Users array:', usersData);
      setReminders(remindersRes.data);
      setUsers(usersData);
      setCustomers(customersRes.data);
      setLeads(leadsRes.data);
    } catch (error) {
      console.error('Error fetching scheduler data:', error);
      console.error('Error details:', error.response?.data || error.message);
    }
  };

  const handleScheduleReminder = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const reminderData = {
        ...scheduleForm,
        scheduledBy: JSON.parse(localStorage.getItem('user'))._id
      };

      await axios.post('http://localhost:5000/reminders/schedule', reminderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and close modal
      setScheduleForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        category: 'task',
        customer: '',
        lead: '',
        notes: '',
        isRecurring: false,
        recurringType: 'daily',
        recurringInterval: 1,
        recurringEndDate: '',
        dueDate: '',
        timeSlot: '09:00'
      });
      setShowScheduleModal(false);
      fetchSchedulerData();
    } catch (error) {
      console.error('Error scheduling reminder:', error);
    }
  };

  const handleBulkSchedule = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const bulkData = {
        ...bulkForm,
        scheduledBy: JSON.parse(localStorage.getItem('user'))._id
      };

      await axios.post('http://localhost:5000/reminders/bulk-schedule', bulkData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Reset form and close modal
      setBulkForm({
        users: [],
        title: '',
        description: '',
        priority: 'medium',
        category: 'task',
        dueDate: '',
        timeSlot: '09:00',
        notes: ''
      });
      setShowBulkModal(false);
      fetchSchedulerData();
    } catch (error) {
      console.error('Error bulk scheduling reminders:', error);
    }
  };

  const getCalendarDays = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getRemindersForDate = (day) => {
    if (!day) return [];
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    return reminders.filter(reminder => {
      const reminderDate = new Date(reminder.dueDate);
      return reminderDate.toDateString() === date.toDateString();
    });
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
      case 'urgent': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const exportSchedule = () => {
    const scheduleData = {
      reminders: reminders,
      exportDate: new Date().toISOString(),
      month: selectedMonth.toLocaleDateString()
    };

    const dataStr = JSON.stringify(scheduleData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reminder-schedule-${selectedMonth.toLocaleDateString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container">
      <div className="colorful-page-header">
        <h1 className="colorful-page-title">Admin Reminder Scheduler</h1>
        <p className="colorful-page-subtitle">Advanced scheduling and recurring reminders management</p>
      </div>

      {/* Control Panel */}
      <div className="colorful-card mb-4">
        <div className="card-body">
          <div className="grid grid-4">
            <button 
              className={`colorful-btn ${activeTab === 'schedule' ? 'colorful-btn-primary' : 'colorful-btn-secondary'}`}
              onClick={() => setActiveTab('schedule')}
            >
              📅 Schedule
            </button>
            <button 
              className={`colorful-btn ${activeTab === 'recurring' ? 'colorful-btn-primary' : 'colorful-btn-secondary'}`}
              onClick={() => setActiveTab('recurring')}
            >
              🔄 Recurring
            </button>
            <button 
              className={`colorful-btn ${activeTab === 'bulk' ? 'colorful-btn-primary' : 'colorful-btn-secondary'}`}
              onClick={() => setActiveTab('bulk')}
            >
              📋 Bulk Schedule
            </button>
            <button 
              className={`colorful-btn ${calendarView ? 'colorful-btn-primary' : 'colorful-btn-secondary'}`}
              onClick={() => setCalendarView(!calendarView)}
            >
              📆 Calendar View
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="colorful-card mb-4">
        <div className="card-body">
          <div className="grid grid-4">
            <button 
              onClick={() => setShowScheduleModal(true)}
              className="colorful-btn colorful-btn-success"
            >
              ➕ Quick Schedule
            </button>
            <button 
              onClick={() => setShowBulkModal(true)}
              className="colorful-btn colorful-btn-info"
            >
              📦 Bulk Create
            </button>
            <button 
              onClick={exportSchedule}
              className="colorful-btn colorful-btn-warning"
            >
              📥 Export Schedule
            </button>
            <button 
              onClick={fetchSchedulerData}
              className="colorful-btn colorful-btn-secondary"
            >
              🔄 Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {calendarView && (
        <div className="colorful-card mb-4">
          <div className="card-header">
            <h3 className="card-title">Calendar View</h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="colorful-btn colorful-btn-secondary btn-sm"
              >
                ←
              </button>
              <span className="px-3 py-1">
                {selectedMonth.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
              </span>
              <button 
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="colorful-btn colorful-btn-secondary btn-sm"
              >
                →
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="calendar-grid">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="calendar-header">{day}</div>
              ))}
              {getCalendarDays().map((day, index) => (
                <div key={index} className={`calendar-day ${day ? 'has-date' : 'empty'}`}>
                  {day && (
                    <>
                      <div className="calendar-date">{day}</div>
                      <div className="calendar-reminders">
                        {getRemindersForDate(day).slice(0, 3).map((reminder, i) => (
                          <div 
                            key={i} 
                            className="calendar-reminder-dot"
                            style={{ backgroundColor: getPriorityColor(reminder.priority) }}
                            title={`${reminder.title} - ${formatDate(reminder.dueDate)}`}
                          />
                        ))}
                        {getRemindersForDate(day).length > 3 && (
                          <div className="calendar-more">+{getRemindersForDate(day).length - 3}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="colorful-modal-professional show">
          <div className="colorful-modal-content-professional">
            <div className="modal-header">
              <h3>Schedule Reminder</h3>
              <button onClick={() => setShowScheduleModal(false)} className="colorful-btn colorful-btn-secondary">Close</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleScheduleReminder} className="colorful-form">
                <div className="colorful-form-row">
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Title *</label>
                    <input
                      type="text"
                      className="colorful-form-control"
                      placeholder="Enter reminder title"
                      value={scheduleForm.title}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Priority</label>
                    <select 
                      className="colorful-form-control"
                      value={scheduleForm.priority}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, priority: e.target.value })}
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
                      value={scheduleForm.assignedTo}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, assignedTo: e.target.value })}
                      required
                    >
                      <option value="">Select User</option>
                      {users.length > 0 ? (
                        users.map(user => (
                          <option key={user._id} value={user._id}>
                            {user.name} ({user.email})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="1">Test User 1 (test@test.com)</option>
                          <option value="2">Test User 2 (test2@test.com)</option>
                          <option disabled>No users from API available - using test options</option>
                        </>
                      )}
                    </select>
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Category</label>
                    <select 
                      className="colorful-form-control"
                      value={scheduleForm.category}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, category: e.target.value })}
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
                    <label className="colorful-form-label">Date *</label>
                    <input
                      type="date"
                      className="colorful-form-control"
                      value={scheduleForm.dueDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Time</label>
                    <input
                      type="time"
                      className="colorful-form-control"
                      value={scheduleForm.timeSlot}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
                    />
                  </div>
                </div>

                <div className="colorful-form-group">
                  <label className="colorful-form-label">
                    <input
                      type="checkbox"
                      checked={scheduleForm.isRecurring}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, isRecurring: e.target.checked })}
                    />
                    Recurring Reminder
                  </label>
                </div>

                {scheduleForm.isRecurring && (
                  <div className="colorful-form-row">
                    <div className="colorful-form-group">
                      <label className="colorful-form-label">Recurring Type</label>
                      <select 
                        className="colorful-form-control"
                        value={scheduleForm.recurringType}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, recurringType: e.target.value })}
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </div>
                    <div className="colorful-form-group">
                      <label className="colorful-form-label">Interval</label>
                      <input
                        type="number"
                        className="colorful-form-control"
                        value={scheduleForm.recurringInterval}
                        onChange={(e) => setScheduleForm({ ...scheduleForm, recurringInterval: parseInt(e.target.value) })}
                        min="1"
                        max="365"
                      />
                    </div>
                  </div>
                )}

                {scheduleForm.isRecurring && (
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">End Date</label>
                    <input
                      type="date"
                      className="colorful-form-control"
                      value={scheduleForm.recurringEndDate}
                      onChange={(e) => setScheduleForm({ ...scheduleForm, recurringEndDate: e.target.value })}
                    />
                  </div>
                )}

                <div className="colorful-form-group">
                  <label className="colorful-form-label">Description *</label>
                  <textarea
                    className="colorful-form-control"
                    placeholder="Enter reminder description"
                    value={scheduleForm.description}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, description: e.target.value })}
                    rows="3"
                    required
                  />
                </div>

                <div className="colorful-form-group">
                  <label className="colorful-form-label">Notes</label>
                  <textarea
                    className="colorful-form-control"
                    placeholder="Additional notes (optional)"
                    value={scheduleForm.notes}
                    onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })}
                    rows="2"
                  />
                </div>

                <button type="submit" className="colorful-btn colorful-btn-primary">
                  Schedule Reminder
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Schedule Modal */}
      {showBulkModal && (
        <div className="colorful-modal-professional show">
          <div className="colorful-modal-content-professional">
            <div className="modal-header">
              <h3>Bulk Schedule Reminders</h3>
              <button onClick={() => setShowBulkModal(false)} className="colorful-btn colorful-btn-secondary">Close</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleBulkSchedule} className="colorful-form">
                <div className="colorful-form-group">
                  <label className="colorful-form-label">Assign To Multiple Users</label>
                  <div className="checkbox-group">
                    {users.map(user => (
                      <label key={user._id} className="checkbox-label">
                        <input
                          type="checkbox"
                          value={user._id}
                          checked={bulkForm.users.includes(user._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBulkForm({ ...bulkForm, users: [...bulkForm.users, user._id] });
                            } else {
                              setBulkForm({ ...bulkForm, users: bulkForm.users.filter(id => id !== user._id) });
                            }
                          }}
                        />
                        {user.name} ({user.email})
                      </label>
                    ))}
                  </div>
                </div>

                <div className="colorful-form-row">
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Title *</label>
                    <input
                      type="text"
                      className="colorful-form-control"
                      placeholder="Enter reminder title"
                      value={bulkForm.title}
                      onChange={(e) => setBulkForm({ ...bulkForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Priority</label>
                    <select 
                      className="colorful-form-control"
                      value={bulkForm.priority}
                      onChange={(e) => setBulkForm({ ...bulkForm, priority: e.target.value })}
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
                    <label className="colorful-form-label">Date *</label>
                    <input
                      type="date"
                      className="colorful-form-control"
                      value={bulkForm.dueDate}
                      onChange={(e) => setBulkForm({ ...bulkForm, dueDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="colorful-form-group">
                    <label className="colorful-form-label">Time</label>
                    <input
                      type="time"
                      className="colorful-form-control"
                      value={bulkForm.timeSlot}
                      onChange={(e) => setBulkForm({ ...bulkForm, timeSlot: e.target.value })}
                    />
                  </div>
                </div>

                <div className="colorful-form-group">
                  <label className="colorful-form-label">Description *</label>
                  <textarea
                    className="colorful-form-control"
                    placeholder="Enter reminder description"
                    value={bulkForm.description}
                    onChange={(e) => setBulkForm({ ...bulkForm, description: e.target.value })}
                    rows="3"
                    required
                  />
                </div>

                <div className="colorful-form-group">
                  <label className="colorful-form-label">Notes</label>
                  <textarea
                    className="colorful-form-control"
                    placeholder="Additional notes (optional)"
                    value={bulkForm.notes}
                    onChange={(e) => setBulkForm({ ...bulkForm, notes: e.target.value })}
                    rows="2"
                  />
                </div>

                <button type="submit" className="colorful-btn colorful-btn-primary">
                  Create Bulk Reminders
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReminderScheduler;
