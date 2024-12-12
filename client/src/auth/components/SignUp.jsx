import React, { useState } from 'react';
import styles from '../styles/LoginForms.module.css';
import axios from 'axios';

const SignUp = ({ onBack }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
    
    // Clear previous errors when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    // Validate first and last name
    if (!formData.firstName.trim()) {
      setError('First name is required');
      return false;
    }

    if (!formData.lastName.trim()) {
      setError('Last name is required');
      return false;
    }

    // Validate email (basic check)
    const emailRegex = /^[^\s@]+@(student\.)?buksu\.edu\.ph$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please use a valid BukSU email address');
      return false;
    }

    // Validate password
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validate form before submission
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Prepare user data for registration
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      };

      // Send registration request
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);

      // Handle successful registration
      console.log('Registration successful', response.data);
      
      // Optional: Show success message or automatically log in
      alert('Registration successful! You can now log in.');
      
      // Return to login page
      onBack();
    } catch (err) {
      // Handle registration errors
      const errorMessage = err.response?.data?.error || 
                           'An error occurred during registration';
      setError(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.formSection}>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2 className={styles.welcomeText}>Create Account</h2>
        <p className={styles.subText}>Please fill in your information to create an account</p>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.nameContainer}>
          <div className={styles.inputGroup} style={{ width: '90%' }}>
            <label className={styles.inputLabel}>First Name</label>
            <input
              type="text"
              id="firstName"
              className={styles.input}
              value={formData.firstName}
              onChange={handleInputChange}
              placeholder="Enter first name"
              required
            />
          </div>

          <div className={styles.inputGroup} style={{ width: '90%' }}>
            <label className={styles.inputLabel}>Last Name</label>
            <input
              type="text"
              id="lastName"
              className={styles.input}
              value={formData.lastName}
              onChange={handleInputChange}
              placeholder="Enter last name"
              required
            />
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label className={styles.inputLabel}>Email</label>
          <input
            type="email"
            id="email"
            className={styles.input}
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your BukSU email"
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
            placeholder="Create a password"
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
            placeholder="Confirm your password"
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
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>

        <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className={styles.loginLink}>
          Already have an account? Back to Login
        </a>
      </form>
    </div>
  );
};

export default SignUp;
