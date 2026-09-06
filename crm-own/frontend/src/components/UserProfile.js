import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showActivity, setShowActivity] = useState(false);
  const [activityData, setActivityData] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setForm({ name: res.data.name, email: res.data.email, currentPassword: '', newPassword: '' });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const updateData = { name: form.name, email: form.email };
      
      if (form.newPassword) {
        updateData.currentPassword = form.currentPassword;
        updateData.password = form.newPassword;
      }
      
      await axios.put('http://localhost:5000/users/profile', updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage('Profile updated successfully!');
      setForm({ ...form, currentPassword: '', newPassword: '' });
      fetchUserProfile();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile: ' + (error.response?.data?.error || error.message));
    }
  };

  // Quick Actions Functions
  const handleViewActivity = async () => {
    try {
      const token = localStorage.getItem('token');
      // Simulate fetching user activity data
      const mockActivity = [
        { id: 1, action: 'Profile Updated', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), details: 'Updated email address' },
        { id: 2, action: 'Login', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), details: 'Logged in from Chrome browser' },
        { id: 3, action: 'Password Changed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), details: 'Password successfully updated' },
        { id: 4, action: 'Customer Created', timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), details: 'Added new customer: John Doe' },
        { id: 5, action: 'Lead Created', timestamp: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), details: 'Created new lead for ABC Corp' }
      ];
      setActivityData(mockActivity);
      setShowActivity(true);
    } catch (error) {
      console.error('Error fetching activity:', error);
      setMessage('Error loading activity data');
    }
  };

  const handleExportData = () => {
    try {
      const exportData = {
        profile: {
          name: user?.name,
          email: user?.email,
          role: user?.role,
          memberSince: user?.createdAt
        },
        activity: activityData,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `user-profile-${user?.name || 'data'}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setMessage('Profile data exported successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error exporting data:', error);
      setMessage('Error exporting data');
    }
  };

  const handleHelpCenter = () => {
    setShowHelp(true);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center mt-4">
          <div className="loading"></div>
          <p className="text-muted mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header fade-in">
        <h1 className="page-title">User Profile</h1>
        <p className="page-subtitle">Manage your account settings and preferences</p>
      </div>

      {/* Profile Information */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">Profile Information</h3>
          <p className="card-subtitle">Your current account details</p>
        </div>
        <div className="card-body">
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <div className="form-control" style={{ backgroundColor: '#f8f9fa', cursor: 'default' }}>
                {user?.name}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-control" style={{ backgroundColor: '#f8f9fa', cursor: 'default' }}>
                {user?.email}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="form-control" style={{ backgroundColor: '#f8f9fa', cursor: 'default' }}>
                <span className={`badge ${user?.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                  {user?.role}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Member Since</label>
              <div className="form-control" style={{ backgroundColor: '#f8f9fa', cursor: 'default' }}>
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">Edit Profile</h3>
          <p className="card-subtitle">Update your personal information</p>
        </div>
        <div className="card-body">
          {message && (
            <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
              {message}
            </div>
          )}
          <form onSubmit={handleProfileUpdate}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-control"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.currentPassword}
                  onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                  placeholder="Enter current password to change password"
                />
                <small className="text-muted">Required only when changing password</small>
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  placeholder="Leave blank to keep current password"
                />
                <small className="text-muted">Minimum 6 characters recommended</small>
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              Update Profile
            </button>
          </form>
        </div>
      </div>

      {/* Role Information */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">Role Permissions</h3>
          <p className="card-subtitle">Your current access level and capabilities</p>
        </div>
        <div className="card-body">
          {user?.role === 'admin' ? (
            <div>
              <h4 className="text-danger mb-3">Admin Privileges</h4>
              <div className="grid grid-2">
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge badge-danger me-2">Full Access</span>
                    <strong>System Management</strong>
                  </div>
                  <ul className="list-unstyled ms-3">
                    <li className="mb-2">Manage all users and permissions</li>
                    <li className="mb-2">View comprehensive analytics</li>
                    <li className="mb-2">Access all customer and lead data</li>
                  </ul>
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge badge-warning me-2">Advanced</span>
                    <strong>Administrative Tools</strong>
                  </div>
                  <ul className="list-unstyled ms-3">
                    <li className="mb-2">Manage system settings</li>
                    <li className="mb-2">View user activity reports</li>
                    <li className="mb-2">System configuration access</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h4 className="text-primary mb-3">User Privileges</h4>
              <div className="grid grid-2">
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge badge-primary me-2">Standard</span>
                    <strong>Customer Management</strong>
                  </div>
                  <ul className="list-unstyled ms-3">
                    <li className="mb-2">Manage assigned customers</li>
                    <li className="mb-2">Create and track leads</li>
                    <li className="mb-2">View personal dashboard</li>
                  </ul>
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center mb-2">
                    <span className="badge badge-success me-2">Basic</span>
                    <strong>Personal Tools</strong>
                  </div>
                  <ul className="list-unstyled ms-3">
                    <li className="mb-2">Manage reminders</li>
                    <li className="mb-2">Update own profile</li>
                    <li className="mb-2">View personal analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">Common profile tasks</p>
        </div>
        <div className="card-body">
          <div className="grid grid-3">
            <button className="btn btn-info" onClick={handleViewActivity}>
              View Activity
            </button>
            <button className="btn btn-warning" onClick={handleExportData}>
              Export Data
            </button>
            <button className="btn btn-secondary" onClick={handleHelpCenter}>
              Help Center
            </button>
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivity && (
        <div className="modal-professional show" onClick={() => setShowActivity(false)}>
          <div className="modal-content-professional" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>User Activity Log</h3>
                <p className="text-muted mb-0">Your recent account activities</p>
              </div>
              <div className="modal-header-actions">
                <button 
                  className="btn btn-sm btn-secondary" 
                  onClick={() => setShowActivity(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              {activityData.length > 0 ? (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Action</th>
                        <th>Details</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityData.map(activity => (
                        <tr key={activity.id}>
                          <td>
                            <span className={`badge ${
                              activity.action.includes('Login') ? 'badge-success' :
                              activity.action.includes('Updated') ? 'badge-warning' :
                              activity.action.includes('Created') ? 'badge-info' :
                              'badge-secondary'
                            }`}>
                              {activity.action}
                            </span>
                          </td>
                          <td>{activity.details}</td>
                          <td>{new Date(activity.timestamp).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted">No activity data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Help Center Modal */}
      {showHelp && (
        <div className="modal-professional show" onClick={() => setShowHelp(false)}>
          <div className="modal-content-professional" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3>Help Center</h3>
                <p className="text-muted mb-0">Frequently asked questions and support</p>
              </div>
              <div className="modal-header-actions">
                <button 
                  className="btn btn-sm btn-secondary" 
                  onClick={() => setShowHelp(false)}
                >
                  ×
                </button>
              </div>
            </div>
            <div className="modal-body">
              <div className="help-sections">
                <div className="help-section">
                  <h4>Profile Management</h4>
                  <div className="help-item">
                    <strong>Q: How do I update my profile?</strong>
                    <p>A: Click the "Edit Profile" section and update your information. Don't forget to save changes.</p>
                  </div>
                  <div className="help-item">
                    <strong>Q: How do I change my password?</strong>
                    <p>A: Enter your current password and new password in the Edit Profile section, then click Update Profile.</p>
                  </div>
                </div>
                
                <div className="help-section">
                  <h4>Data & Analytics</h4>
                  <div className="help-item">
                    <strong>Q: How do I export my data?</strong>
                    <p>A: Click the "Export Data" button in Quick Actions to download your profile and activity data as JSON.</p>
                  </div>
                  <div className="help-item">
                    <strong>Q: What data can I export?</strong>
                    <p>A: You can export your profile information, activity log, and account settings.</p>
                  </div>
                </div>
                
                <div className="help-section">
                  <h4>Security</h4>
                  <div className="help-item">
                    <strong>Q: How do I view my activity?</strong>
                    <p>A: Click "View Activity" to see your recent account activities and login history.</p>
                  </div>
                  <div className="help-item">
                    <strong>Q: Is my data secure?</strong>
                    <p>A: Yes, all data is encrypted and stored securely. We use industry-standard security practices.</p>
                  </div>
                </div>
                
                <div className="help-section">
                  <h4>Support</h4>
                  <div className="help-item">
                    <strong>Q: How do I contact support?</strong>
                    <p>A: Email us at support@crm-pro.com or call 1-800-CRM-HELP for immediate assistance.</p>
                  </div>
                  <div className="help-item">
                    <strong>Q: What are the system requirements?</strong>
                    <p>A: Works on any modern browser (Chrome, Firefox, Safari, Edge) with internet connection.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
