import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  // If still loading authentication state, show nothing or a loading spinner
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole && (!user || user.role !== requiredRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children or use Outlet for nested routes
  return children || <Outlet />;
};

export default PrivateRoute;
