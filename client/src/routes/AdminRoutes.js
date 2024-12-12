import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../components/admin/AdminLayout';
import AdminProfile from '../components/admin/AdminProfile';
import Evaluation from '../components/admin/Evaluation';
import EvaluationForm from '../components/admin/EvaluationForm';
import Dashboard from '../components/admin/Dashboard';
import AdminRatings from '../components/admin/AdminRatings';
import AdminCalendar from '../components/admin/AdminCalendar';
import UserManagement from '../components/admin/UserManagement';
import Unauthorized from '../pages/Unauthorized';
import { Box, Typography, Button } from '@mui/material';

// Custom Unauthorized Component with more details
const DetailedUnauthorized = ({ user }) => {
  return (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h4" color="error" sx={{ mb: 2 }}>
        Access Denied
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Your current role does not have permission to access this page.
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Current Role: {user?.role || 'Unknown'}
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={() => window.location.href = '/login'}
      >
        Return to Login
      </Button>
    </Box>
  );
};

const ProtectedRoute = ({ 
  children, 
  allowedRoles = ['admin', 'faculty'], 
  adminOnlyRoutes = ['/admin/users'] 
}) => {
  const { user, isAuthenticated } = useAuth();

  // Detailed logging for debugging
  useEffect(() => {
    console.group('🔒 Protected Route Debug');
    console.log('User:', JSON.stringify(user, null, 2));
    console.log('Is Authenticated:', isAuthenticated);
    console.log('Allowed Roles:', allowedRoles);
    console.log('Current Route:', window.location.pathname);
    console.groupEnd();
  }, [user, isAuthenticated, allowedRoles]);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if current route is admin-only
  const isAdminOnlyRoute = adminOnlyRoutes.some(route => 
    window.location.pathname.startsWith(route)
  );

  // More flexible role checking
  const isRoleAllowed = 
    allowedRoles.includes(user?.role) || 
    (isAdminOnlyRoute && user?.role === 'admin');

  if (!isRoleAllowed) {
    console.error('🚫 Access Denied:', {
      userRole: user?.role,
      allowedRoles,
      currentRoute: window.location.pathname
    });
    return <DetailedUnauthorized user={user} />;
  }

  return children;
};

const AdminRoutes = () => {
  return (
    <Routes>
      <Route 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route 
          index 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <AdminProfile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="users" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="ratings" 
          element={
            <ProtectedRoute>
              <AdminRatings />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="calendar" 
          element={
            <ProtectedRoute>
              <AdminCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="evaluation" 
          element={
            <ProtectedRoute>
              <Evaluation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="evaluation/create" 
          element={
            <ProtectedRoute>
              <EvaluationForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="evaluation/edit/:id" 
          element={
            <ProtectedRoute>
              <EvaluationForm />
            </ProtectedRoute>
          } 
        />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
