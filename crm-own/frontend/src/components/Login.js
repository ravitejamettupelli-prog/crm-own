import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Login = ({ setToken }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Load saved email if remember me was checked
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsAnimating(true);
    
    try {
      const res = await axios.post('http://localhost:5000/auth/login', { email, password }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      setToken(res.data.token);
      localStorage.setItem('token', res.data.token);
      
      // Success animation before redirect
      setTimeout(() => {
        window.location.href = res.data.user.role === 'admin' ? '/admin-dashboard' : '/dashboard';
      }, 500);
      
    } catch (error) {
      setIsAnimating(false);
      
      let errorMessage = 'Login failed';
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error: Cannot connect to backend server. Please ensure the backend is running on http://localhost:5000';
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid credentials. Please check your email and password.';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>
      
      <div className={`auth-card fade-in ${isAnimating ? 'success-animation' : ''}`}>
        <div className="auth-header">
          <div className="auth-logo">
            <div className="logo-icon">CRM</div>
          </div>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your CRM Pro account</p>
        </div>
        
        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'} fade-in`}>
            <div className="alert-icon">
              {message.includes('success') ? '!' : '×'}
            </div>
            <div className="alert-content">
              {message}
            </div>
          </div>
        )}
        
        <form id="loginForm" onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <input
                type="email"
                className="form-control"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <div className="input-icon">
                <span className="icon-email">@</span>
              </div>
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="icon-eye">{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-custom"></span>
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-lg auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-loading"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <span className="btn-arrow">»</span>
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p className="text-muted">
            Don't have an account? <Link to="/register" className="text-primary">Create Account</Link>
          </p>
          <div className="auth-features">
            <span className="feature-badge">Secure</span>
            <span className="feature-badge">Fast</span>
            <span className="feature-badge">Professional</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;