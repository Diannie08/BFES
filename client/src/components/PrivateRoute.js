import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('PrivateRoute Debug:', {
    user,
    isAuthenticated,
    requiredRole,
    currentPath: window.location.pathname
  });

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if specified
  if (requiredRole) {
    // If requiredRole is 'admin', only admin can access
    if (requiredRole === 'admin' && user.role !== 'admin') {
      console.warn('Access denied: Only admin can access this route');
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Allow access to admin routes for both admin and faculty
  if (['admin', 'faculty'].includes(user.role)) {
    // Redirect to profile if on base admin route
    if (window.location.pathname === '/admin') {
      return <Navigate to="/admin/profile" replace />;
    }
    return children;
  }

  // For student
  if (user.role === 'student') {
    // Redirect to profile if on base student route
    if (window.location.pathname === '/student') {
      return <Navigate to="/student/profile" replace />;
    }
    return children;
  }

  // Default fallback
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
