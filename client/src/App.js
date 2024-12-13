import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { LoginPage } from './auth/LoginPage';
import AdminRoutes from './routes/AdminRoutes';
import StudentRoutes from './routes/StudentRoutes';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  // Try to get from env first, if not available use the hardcoded one
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || "885880571210-tq3u1ql9j4geshe4ql6mqgnmncv84fhu.apps.googleusercontent.com";
  
  // Debug logging
  console.log('Environment Variables:', {
    REACT_APP_GOOGLE_CLIENT_ID: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    NODE_ENV: process.env.NODE_ENV
  });

  if (!clientId) {
    console.error('Google Client ID is not configured in environment variables');
    return <div>Error: Google Client ID not configured</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            
            {/* Protected Admin Routes for Admin and Faculty */}
            <Route 
              path="/admin/*" 
              element={
                <PrivateRoute>
                  <AdminRoutes />
                </PrivateRoute>
              } 
            />
            
            {/* Protected Student Routes */}
            <Route 
              path="/student/*" 
              element={
                <PrivateRoute>
                  <StudentRoutes />
                </PrivateRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
