import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from './Inputs';
import { GoogleButton } from './GoogleButton';
import SignUp from './SignUp';
import { ForgotPassword } from './ForgotPassword';
import styles from '../styles/LoginForms.module.css';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const recaptchaRef = useRef(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (error) setError('');
  };

  useEffect(() => {
    // Load reCAPTCHA script
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let recaptchaValue = '';
      if (window.grecaptcha && window.grecaptcha.getResponse) {
        recaptchaValue = window.grecaptcha.getResponse();
        if (!recaptchaValue) {
          setError('Please complete the reCAPTCHA');
          setLoading(false);
          return;
        }
      }

      const userData = await login({
        email: formData.email,
        password: formData.password,
        recaptchaResponse: recaptchaValue
      });

      console.log('User Data:', userData);

      // Role-based routing
      switch(userData.role) {
        case 'admin':
        case 'faculty':
          console.log('Navigating to /admin/profile for role:', userData.role);
          navigate('/admin/profile');
          break;
        case 'student':
          console.log('Navigating to /student/profile');
          navigate('/student/profile');
          break;
        default:
          console.warn('Unrecognized role, navigating to login');
          navigate('/login');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.response?.data?.message || 'Failed to login. Please try again.');
      if (window.grecaptcha) {
        window.grecaptcha.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  if (showSignUp) {
    return <SignUp onBack={() => setShowSignUp(false)} />;
  }

  return (
    <form className={styles.loginForm} onSubmit={handleSubmit}>
      <img src="/buksu-logo.png" alt="BukSU Logo" className={styles.logo} />
      <h1 className={styles.welcomeText}>INSTRUCTOR EVALUATION SYSTEM</h1>
      
      <GoogleButton onClick={handleGoogleLogin} disabled={loading} />

      <div className={styles.dividerContainer}>
        <span>or Sign in with Email</span>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>University Email (@buksu.edu.ph)</label>
        <input
          type="email"
          id="email"
          className={styles.input}
          placeholder="Enter your email address"
          value={formData.email}
          onChange={handleInputChange}
          disabled={loading}
          required
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.inputLabel}>Password</label>
        <input
          type={showPassword ? "text" : "password"}
          id="password"
          className={styles.input}
          value={formData.password}
          onChange={handleInputChange}
          required
          disabled={loading}
        />
        <button
          type="button"
          className={styles.showPassword}
          onClick={() => setShowPassword(!showPassword)}
          disabled={loading}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <div className={styles.recaptcha}>
        <div 
          ref={recaptchaRef}
          className="g-recaptcha" 
          data-sitekey="6LeBAZ0qAAAAABKl_d_jSXQbj0mp18m9aUsRm1tb"
          data-theme="light"
          data-size="normal"
        ></div>
      </div>

      <button 
        type="submit" 
        className={styles.signInButton}
        disabled={loading}
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    
      <div className={styles.bottomLinks}>
        <a
          href="#"
          className={styles.forgotPasswordLink}
          onClick={(e) => {
            e.preventDefault();
            setShowForgotPassword(true);
          }}
        >
          Forgot Password?
        </a>
        <a
          href="#"
          className={styles.signUpLink}
          onClick={(e) => {
            e.preventDefault();
            setShowSignUp(true);
          }}
        >
          Sign Up
        </a>
      </div>
    </form>
  );
}