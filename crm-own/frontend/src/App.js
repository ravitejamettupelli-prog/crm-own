import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminDashboard from './components/AdminDashboard';
import Customers from './components/Customers';
import Leads from './components/Leads';
import Reminders from './components/Reminders';
import UserManagement from './components/UserManagement';
import UserProfile from './components/UserProfile';
import SalesReports from './components/SalesReports';
import AdminReminderScheduler from './components/AdminReminderScheduler';
import Navigation from './components/Navigation';
import './App.css';

function AppContent() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Fetch user profile to get role information
      axios.get('http://localhost:5000/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          console.error('Error fetching user profile');
          // If profile fetch fails, logout user
          setToken(null);
          localStorage.removeItem('token');
        });
    }
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div className="App">
      {token && user ? (
        <>
          <Navigation user={user} onLogout={logout} />
          <Routes>
            {user.role === 'admin' ? (
              <>
                <Route path="/admin-dashboard" element={<AdminDashboard />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/dashboard" element={<Navigate to="/admin-dashboard" />} />
              </>
            ) : (
              <Route path="/dashboard" element={<Dashboard />} />
            )}
            <Route path="/customers" element={<Customers />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/reminder-scheduler" element={<AdminReminderScheduler />} />
            <Route path="/sales-reports" element={<SalesReports />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="*" element={<Navigate to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'} />} />
          </Routes>
        </>
      ) : (
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;