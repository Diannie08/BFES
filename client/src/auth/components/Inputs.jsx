import React from 'react';
import styles from '../styles/Inputs.module.css';

export function Input({ id, type = "text", placeholder, label, value, onChange }) {
  return (
    <div className={styles.inputWrapper}>
      <label htmlFor={id} className="visually-hidden">{label}</label>
      <div className={styles.inputContainer}>
        <input
          className={styles.input}
          type={type}
          id={id}
          placeholder={placeholder}
          aria-label={label}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}