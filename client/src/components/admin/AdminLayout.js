import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import RatingsIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout } = useAuth();
  const location = useLocation();

  // If we're at /admin, redirect to /admin/profile
  if (location.pathname === '/admin') {
    return <Navigate to="/admin/profile" replace />;
  }

  const menuItems = [
    {
      text: 'Admin Profile',
      icon: <PersonIcon />,
      path: '/admin/profile'
    },
    {
      text: 'Evaluation',
      icon: <AssessmentIcon />,
      path: '/admin/evaluation'
    },
    {
      text: 'Ratings',
      icon: <RatingsIcon />,
      path: '/admin/ratings'
    },
    {
      text: 'Calendar',
      icon: <CalendarTodayIcon />,
      path: '/admin/calendar'
    },
    {
      text: 'Logout',
      icon: <LogoutIcon />,
      onClick: logout
    }
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          flexShrink: 0,
          bgcolor: 'white',
          borderRight: '1px solid #e0e0e0',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Logo Section */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          justifyContent: 'center'
        }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: '1rem',
              lineHeight: 1.2,
              color: '#1a237e',
              textAlign: 'center'
            }}
          >
            INSTRUCTOR
            <br />
            EVALUATION
            <br />
            SYSTEM
          </Typography>
        </Box>

        {/* Navigation List */}
        <List sx={{ flexGrow: 1 }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={item.path ? Link : 'button'}
              to={item.path}
              onClick={item.onClick}
              sx={{
                color: location.pathname === item.path ? '#1a237e' : 'inherit',
                bgcolor: location.pathname === item.path ? '#f0f4fa' : 'transparent',
                '&:hover': {
                  bgcolor: '#f5f5f5'
                }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.9rem'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: '#f5f5f5',
          minHeight: '100vh'
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
