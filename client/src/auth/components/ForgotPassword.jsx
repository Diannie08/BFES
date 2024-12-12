import React, { useState } from 'react';
import styles from '../styles/LoginForms.module.css';
import axios from 'axios';

export function ForgotPassword({ onBack }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        await axios.post('http://localhost:5000/api/auth/forgot-password', {
          email: formData.email
        });
        setStep(2);
      } else if (step === 2) {
        await axios.post('http://localhost:5000/api/auth/verify-code', {
          email: formData.email,
          code: formData.verificationCode
        });
        setStep(3);
      } else if (step === 3) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Passwords do not match');
          return;
        }
        if (formData.newPassword.length < 6) {
          setError('Password must be at least 6 characters long');
          return;
        }
        await axios.post('http://localhost:5000/api/auth/reset-password', {
          email: formData.email,
          code: formData.verificationCode,
          newPassword: formData.newPassword
        });
        onBack(); // Return to login after success
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className={styles.formSection}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <h2 className={styles.welcomeText}>Reset Password</h2>
              <p className={styles.subText}>
                Enter your email address and we'll send you a verification code.
              </p>
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Email</label>
                <input
                  type="email"
                  id="email"
                  className={styles.input}
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  disabled={loading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>

              <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className={styles.loginLink}>
                Back to Login
              </a>
            </form>
          </div>
        );

      case 2:
        return (
          <div className={styles.formSection}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <h2 className={styles.welcomeText}>Enter Code</h2>
              <p className={styles.subText}>
                We've sent a verification code to your email.
                Please enter it below.
              </p>
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Verification Code</label>
                <input
                  type="text"
                  id="verificationCode"
                  className={styles.input}
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  placeholder="Enter verification code"
                  disabled={loading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className={styles.loginLink}>
                Back to Login
              </a>
            </form>
          </div>
        );

      case 3:
        return (
          <div className={styles.formSection}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
              <h2 className={styles.welcomeText}>Create New Password</h2>
              <p className={styles.subText}>
                Please enter your new password.
              </p>
              {error && <div className={styles.error}>{error}</div>}
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="newPassword"
                  className={styles.input}
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  placeholder="Enter new password"
                  disabled={loading}
                  required
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Confirm Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  id="confirmPassword"
                  className={styles.input}
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm new password"
                  disabled={loading}
                  required
                />
              </div>

              <div className={styles.showPasswordContainer}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={() => setShowPassword(!showPassword)}
                    className={styles.checkbox}
                  />
                  Show Password
                </label>
              </div>

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={loading}
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>

              <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className={styles.loginLink}>
                Back to Login
              </a>
            </form>
          </div>
        );
    }
  };

  return renderStep();
}

export default ForgotPassword;
