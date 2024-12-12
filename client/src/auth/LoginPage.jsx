import React from 'react';
import { LoginForm } from './components/LoginForms';
import styles from './styles/LoginForms.module.css';

export function LoginPage() {
  return (
    <div className={styles.loginPageContainer}>
      <div className={styles.imageSection} />
      <div className={styles.formSection}>
        <LoginForm />
      </div>
    </div>
  );
}