import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [editingUser, setEditingUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      if (editingUser) {
        await axios.put(`http://localhost:5000/users/${editingUser._id}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:5000/users', form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      setForm({ name: '', email: '', password: '', role: 'user' });
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setForm({ 
      name: user.name, 
      email: user.email, 
      password: '', 
      role: user.role 
    });
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'user' });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="text-center mt-4">
          <div className="loading"></div>
          <p className="text-muted mt-2">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header fade-in">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage system users and their permissions</p>
      </div>

      {/* Add/Edit User Form */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">{editingUser ? 'Edit User' : 'Add New User'}</h3>
          <p className="card-subtitle">
            {editingUser ? 'Update user information and permissions' : 'Create a new system user'}
          </p>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter user's full name"
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
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder={editingUser ? 'New password (leave blank to keep current)' : 'Enter password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required={!editingUser}
                />
                {editingUser && (
                  <small className="text-muted">Leave blank to keep current password</small>
                )}
              </div>
              <div className="form-group">
                <label className="form-label">User Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              {editingUser && (
                <button type="button" onClick={handleCancel} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Users List */}
      <div className="table-container hover-lift">
        <div className="card-header">
          <h3 className="card-title">System Users</h3>
          <p className="card-subtitle">{users.length} total users</p>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>User Information</th>
              <th>Role</th>
              <th>Created Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>
                  <div>
                    <strong>{user.name}</strong><br />
                    <small className="text-muted">{user.email}</small>
                  </div>
                </td>
                <td>
                  <span className={`badge ${user.role === 'admin' ? 'badge-danger' : 'badge-primary'}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <small>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </small>
                </td>
                <td>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="btn btn-info btn-sm"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center p-4">
            <p className="text-muted">
              No users found. Create your first user above.
            </p>
          </div>
        )}
      </div>

      {/* User Statistics */}
      <div className="stats-grid">
        <div className="stat-card hover-lift">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card danger hover-lift">
          <div className="stat-number">{users.filter(u => u.role === 'admin').length}</div>
          <div className="stat-label">Admin Users</div>
        </div>
        <div className="stat-card success hover-lift">
          <div className="stat-number">{users.filter(u => u.role === 'user').length}</div>
          <div className="stat-label">Regular Users</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card hover-lift">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
          <p className="card-subtitle">Common user management tasks</p>
        </div>
        <div className="card-body">
          <div className="grid grid-3">
            <button className="btn btn-primary">
              Export Users
            </button>
            <button className="btn btn-success">
              Bulk Import
            </button>
            <button className="btn btn-info">
              User Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
