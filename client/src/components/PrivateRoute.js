import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // For admin/faculty routes
  if (['admin', 'faculty'].includes(user.role)) {
    if (window.location.pathname === '/admin') {
      return <Navigate to="/admin/profile" replace />;
    }
    return children;
  }

  // For student routes
  if (user.role === 'student') {
    if (window.location.pathname === '/student') {
      return <Navigate to="/student/profile" replace />;
    }
    return children;
  }

  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
