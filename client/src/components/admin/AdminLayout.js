import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Typography,
  useMediaQuery,
  useTheme,
  Avatar
} from '@mui/material';
import { Link, Outlet, Navigate, useLocation } from 'react-router-dom';
import PersonIcon from '@mui/icons-material/Person';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import RatingsIcon from '@mui/icons-material/AssessmentOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useAuth } from '../../context/AuthContext';

const AdminLayout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
    <Box sx={{ 
      display: 'flex', 
      minHeight: '100vh',
      bgcolor: '#F0F8FF'
    }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 280,
          flexShrink: 0,
          bgcolor: '#ffffff',
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          flexDirection: 'column',
          position: isMobile ? 'fixed' : 'relative',
          height: '100vh',
          zIndex: 1000,
          boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
        }}
      >
        {/* Logo Section */}
        <Box sx={{ 
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.12)',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <img 
            src="/images/buksu-logo.png" 
            alt="BukSU Logo" 
            style={{ 
              width: 40, 
              height: 40 
            }} 
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1a237e',
              fontSize: '1rem',
              lineHeight: 1.2
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
        <List sx={{ 
          flexGrow: 1,
          mt: 2,
          '& .MuiListItem-root': {
            mb: 1,
            mx: 1,
            borderRadius: 1,
            '&:hover': {
              bgcolor: 'rgba(25, 118, 210, 0.08)',
            },
            '&.Mui-selected': {
              bgcolor: 'rgba(25, 118, 210, 0.12)',
              '&:hover': {
                bgcolor: 'rgba(25, 118, 210, 0.12)',
              }
            }
          }
        }}>
          {menuItems.map((item) => (
            <ListItem
              key={item.text}
              component={item.path ? Link : 'button'}
              to={item.path}
              onClick={item.onClick}
              selected={item.path && location.pathname === item.path}
              sx={{ 
                py: 1,
                color: 'inherit',
                textDecoration: 'none'
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: location.pathname === item.path ? '#1976d2' : 'text.secondary'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Main Content Area */}
      <Box 
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          backgroundImage: 'url(/images/buksu-building-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          position: 'relative'
        }}
      >
        {/* Background Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(240, 248, 255, 0.9)',
            zIndex: 1
          }}
        />

        {/* Content */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            p: 3,
            height: '100%'
          }}
        >
          <Box sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: 2,
            p: 3,
            minHeight: 'calc(100vh - 48px)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
          }}>
            <Outlet />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLayout;
