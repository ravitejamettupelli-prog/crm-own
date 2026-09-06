import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Check password strength
    if (password.length === 0) {
      setPasswordStrength(0);
    } else if (password.length < 6) {
      setPasswordStrength(1);
    } else if (password.length < 10) {
      setPasswordStrength(2);
    } else if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) {
      setPasswordStrength(4);
    } else {
      setPasswordStrength(3);
    }
  }, [password]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setMessage('');
    setIsAnimating(true);
    
    try {
      const response = await axios.post('http://localhost:5000/auth/register', { name, email, password });
      setMessage('Registration successful! You can now login.');
      
      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setErrors({});
      
      // Success animation
      setTimeout(() => {
        setIsAnimating(false);
      }, 1000);
      
    } catch (error) {
      setIsAnimating(false);
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed';
      setMessage(`Registration failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthText = () => {
    switch(passwordStrength) {
      case 0: return '';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getPasswordStrengthColor = () => {
    switch(passwordStrength) {
      case 0: return '';
      case 1: return 'strength-weak';
      case 2: return 'strength-fair';
      case 3: return 'strength-good';
      case 4: return 'strength-strong';
      default: return '';
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
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join CRM Pro and start managing your business efficiently</p>
        </div>
        
        {message && (
          <div className={`alert ${message.includes('successful') ? 'alert-success' : 'alert-danger'} fade-in`}>
            <div className="alert-icon">
              {message.includes('successful') ? '!' : '×'}
            </div>
            <div className="alert-content">
              {message}
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-group">
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
              <div className="input-icon">
                <span className="icon-user">U</span>
              </div>
            </div>
            {errors.name && <div className="error-message">{errors.name}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-group">
              <input
                type="email"
                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
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
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="icon-eye">{showPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            {errors.password && <div className="error-message">{errors.password}</div>}
            
            {password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div className={`strength-fill ${getPasswordStrengthColor()}`} style={{ width: `${passwordStrength * 25}%` }}></div>
                </div>
                <span className={`strength-text ${getPasswordStrengthColor()}`}>
                  Password strength: {getPasswordStrengthText()}
                </span>
              </div>
            )}
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-group">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="icon-eye">{showConfirmPassword ? 'Hide' : 'Show'}</span>
              </button>
            </div>
            {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                required
              />
              <span className="checkbox-custom"></span>
              I agree to the Terms of Service and Privacy Policy
            </label>
          </div>
          
          <button
            type="submit"
            className="btn btn-primary btn-lg auth-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-loading"></span>
                Creating Account...
              </>
            ) : (
              <>
                Create Account
                <span className="btn-arrow">»</span>
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p className="text-muted">
            Already have an account? <Link to="/login" className="text-primary">Sign In</Link>
          </p>
          <div className="auth-features">
            <span className="feature-badge">Secure</span>
            <span className="feature-badge">Free</span>
            <span className="feature-badge">Professional</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;