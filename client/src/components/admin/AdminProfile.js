import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const AdminProfile = () => {
  const { user } = useAuth();

  useEffect(() => {
    console.log('=== ADMIN PROFILE USER DATA ===');
    console.log('Full User Object:', user);
    console.log('First Name:', user?.firstName);
    console.log('Last Name:', user?.lastName);
    console.log('Email:', user?.email);
  }, [user]);

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      bgcolor: '#F0F8FF',
      position: 'relative'
    }}>
      {/* Background Image Section */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '200px',
          backgroundImage: 'url(/campus-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(5px)'
          }
        }}
      />

      {/* Main Content */}
      <Box sx={{ 
        position: 'relative',
        zIndex: 1,
        pt: '100px',
        px: 4
      }}>
        {/* Profile Header */}
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          mb: 4
        }}>
          {/* Avatar Circle */}
          <Box sx={{
            width: 180,
            height: 180,
            borderRadius: '50%',
            bgcolor: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: '3px solid white'
          }}>
            <Box 
              component="img" 
              src="/user-avatar.png" 
              alt="User Avatar"
              sx={{
                width: '70%',
                height: '70%',
                opacity: 0.7
              }}
            />
          </Box>

          {/* Name Display */}
          <Typography 
            variant="h3" 
            sx={{ 
              color: '#1a237e',
              fontWeight: 500,
              fontSize: '2.5rem'
            }}
          >
            {user?.firstName || user?.name || 'Admin User'}
          </Typography>
        </Box>

        {/* Profile Card */}
        <Paper 
          elevation={0}
          sx={{ 
            bgcolor: '#B0C4DE',
            borderRadius: '20px',
            p: 4,
            maxWidth: '900px',
            mx: 'auto'
          }}
        >
          {/* Profile Header */}
          <Typography 
            variant="h5" 
            sx={{ 
              color: '#1a237e',
              mb: 4,
              fontWeight: 600,
              pl: 1
            }}
          >
            Profile
          </Typography>

          {/* Profile Fields Grid */}
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 4,
            px: 1
          }}>
            {/* Name Field */}
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#1a237e',
                  mb: 1.5,
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              >
                Name
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#F0F8FF',
                  p: 2,
                  borderRadius: '10px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography 
                  variant="body1"
                  sx={{
                    color: '#333',
                    fontWeight: 400
                  }}
                >
                  {user?.firstName} {user?.lastName || user?.name || 'Not Available'}
                </Typography>
              </Paper>
            </Box>

            {/* Email Field */}
            <Box>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: '#1a237e',
                  mb: 1.5,
                  fontWeight: 500,
                  fontSize: '0.95rem'
                }}
              >
                University Email
              </Typography>
              <Paper
                elevation={0}
                sx={{
                  bgcolor: '#F0F8FF',
                  p: 2,
                  borderRadius: '10px',
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <Typography 
                  variant="body1"
                  sx={{
                    color: '#333',
                    fontWeight: 400
                  }}
                >
                  {user?.email || 'Not Available'}
                </Typography>
              </Paper>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminProfile;
