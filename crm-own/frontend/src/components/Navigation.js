import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.dropdown-professional')) {
        closeDropdowns();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 2L4 8v6c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8L16 2z" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M4 14v4c0 1.1.9 2 2 2h8v6l4-4h4c1.1 0 2-.9 2-2v-6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <path d="M8 18h4M8 22h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="8" r="2" fill="currentColor"/>
            </svg>
          </div>
          <span className="brand-text">CRM Pro</span>
        </div>
        
        <div className="navbar-nav">
          <Link 
            to={user.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
            className="nav-link nav-link-professional"
          >
            <span className="nav-icon">Dashboard</span>
          </Link>
          
          <Link 
            to="/customers"
            className="nav-link nav-link-professional"
          >
            <span className="nav-icon">Customers</span>
          </Link>
          
          <Link 
            to="/leads"
            className="nav-link nav-link-professional"
          >
            <span className="nav-icon">Leads</span>
          </Link>
          
          <Link 
            to="/reminders"
            className="nav-link nav-link-professional"
          >
            <span className="nav-icon">Reminders</span>
          </Link>
          
          <Link 
            to="/sales-reports"
            className="nav-link nav-link-professional"
          >
            <span className="nav-icon">Sales</span>
          </Link>
          
          <Link 
            to="/profile"
            className="nav-link nav-link-professional"
          >
            <span className="nav-icon">Profile</span>
          </Link>
          
          {user.role === 'admin' && (
            <div className="dropdown-professional">
              <button 
                className="nav-link nav-link-professional dropdown-toggle"
                onClick={() => toggleDropdown('admin')}
              >
                <span className="nav-icon">Admin</span>
                <span className="dropdown-arrow">{'>'}</span>
              </button>
              <div className={`dropdown-menu-professional ${activeDropdown === 'admin' ? 'show' : ''}`}>
                <Link to="/user-management" className="dropdown-item-professional">
                  <span className="dropdown-icon">U</span>
                  User Management
                </Link>
                <Link to="/admin-dashboard" className="dropdown-item-professional">
                  <span className="dropdown-icon">A</span>
                  Admin Dashboard
                </Link>
                <Link to="/reminder-scheduler" className="dropdown-item-professional">
                  <span className="dropdown-icon">R</span>
                  Reminder Scheduler
                </Link>
                <Link to="/sales-reports" className="dropdown-item-professional">
                  <span className="dropdown-icon">S</span>
                  Sales Reports
                </Link>
                <Link to="/settings" className="dropdown-item-professional">
                  <span className="dropdown-icon">S</span>
                  Settings
                </Link>
              </div>
            </div>
          )}
          
          <div className="dropdown-professional">
            <button 
              className="nav-link nav-link-professional dropdown-toggle user-dropdown-toggle"
              onClick={() => toggleDropdown('user')}
            >
              <div className="user-avatar">
                <span className="avatar-text">{user.name.charAt(0).toUpperCase()}</span>
              </div>
              <span className="user-name">{user.name}</span>
              <span className="dropdown-arrow">&gt;</span>
            </button>
            <div className={`dropdown-menu-professional dropdown-menu-right ${activeDropdown === 'user' ? 'show' : ''}`}>
              <div className="dropdown-header">
                <div className="dropdown-user-info">
                  <div className="dropdown-user-name">{user.name}</div>
                  <div className="dropdown-user-role">{user.role}</div>
                </div>
              </div>
              <Link to="/profile" className="dropdown-item-professional">
                <span className="dropdown-icon">P</span>
                Profile
              </Link>
              <div className="dropdown-divider"></div>
              <button onClick={handleLogout} className="dropdown-item-professional dropdown-item-danger">
                <span className="dropdown-icon">L</span>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
