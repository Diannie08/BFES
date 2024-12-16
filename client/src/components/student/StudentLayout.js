import React, { useState } from 'react';
import { 
  Box, 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Toolbar, 
  AppBar, 
  Typography, 
  IconButton 
} from '@mui/material';
import { 
  Person as ProfileIcon, 
  Assignment as EvaluationIcon, 
  Logout as LogoutIcon,
  Menu as MenuIcon 
} from '@mui/icons-material';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const drawerWidth = 280;

const StudentLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { 
      text: 'Student Profile', 
      icon: <ProfileIcon />, 
      path: '/student/profile' 
    },
    { 
      text: 'Evaluation Forms', 
      icon: <EvaluationIcon />, 
      path: '/student/evaluation' 
    },
    { 
      text: 'Logout', 
      icon: <LogoutIcon />, 
      onClick: handleLogout 
    }
  ];

  const drawer = (
    <Box>
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
          STUDENT
          <br />
          EVALUATION
          <br />
          SYSTEM
        </Typography>
      </Box>

      {/* Navigation List */}
      <List sx={{ 
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
            button
            onClick={item.onClick || (() => handleNavigation(item.path))}
            selected={location.pathname === item.path}
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
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          width: { sm: `calc(100% - ${drawerWidth}px)` }, 
          ml: { sm: `${drawerWidth}px` } 
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div">
            Student Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 },
        }}
        aria-label="student navigation"
      >
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#ffffff',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              bgcolor: '#ffffff',
              borderRight: '1px solid rgba(0, 0, 0, 0.12)',
              boxShadow: '4px 0 10px rgba(0,0,0,0.1)'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: 3, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '64px' }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default StudentLayout;
