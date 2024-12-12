import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Radio, 
  RadioGroup, 
  FormControlLabel,
  Box,
  Typography 
} from '@mui/material';
import styles from '../styles/LoginForms.module.css';
import { useNavigate } from 'react-router-dom';

export function GoogleButton() {
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [googleUserData, setGoogleUserData] = useState(null);
  const navigate = useNavigate();

  const handleRoleSubmit = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    try {
      console.log('Sending registration data:', {
        ...googleUserData,
        role: selectedRole
      });

      // More explicit and verbose fetch configuration
      const fetchOptions = {
        method: 'POST',
        mode: 'cors', // Explicitly set CORS mode
        cache: 'no-cache',
        credentials: 'include', // Include credentials if needed
        headers: {
          'Content-Type': 'application/json',
          'X-Debug-Request': 'GoogleRegister',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...googleUserData,
          role: selectedRole
        }),
      };

      console.log('Fetch Options:', fetchOptions);

      // Send Google user data along with selected role to backend
      const response = await fetch('http://localhost:5000/api/auth/google-register', fetchOptions);

      console.log('Full Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      // Clone the response to allow multiple reads
      const responseClone = response.clone();

      // Try to parse the response
      let responseBody;
      try {
        if (response.ok) {
          responseBody = await response.json();
        } else {
          // For non-OK responses, try to get text
          const errorText = await responseClone.text();
          console.error('Error Response Text:', errorText);
          
          // Try to parse as JSON if possible
          try {
            responseBody = JSON.parse(errorText);
          } catch {
            throw new Error(errorText || 'Unknown server error');
          }
        }
      } catch (parseError) {
        console.error('Response Parsing Error:', parseError);
        throw parseError;
      }

      // Check for error in response
      if (!response.ok) {
        throw new Error(
          responseBody?.message || 
          responseBody?.error || 
          'Registration failed'
        );
      }

      // Destructure successful response
      const { token, user } = responseBody;
      
      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Close dialog and navigate based on role
      setOpenRoleDialog(false);
      
      // Navigate based on role
      switch (user.role) {
        case 'admin':
          navigate('/admin/profile');
          break;
        case 'faculty':
          navigate('/faculty');
          break;
        case 'student':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
      console.error('=== FULL REGISTRATION ERROR ===');
      console.error('Error Object:', error);
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      // More detailed error alert
      alert(`Registration Error: ${error.message}`);
    }
  };

  const login = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Fetch user info from Google
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userInfo = await userInfoResponse.json();
        
        // Open role selection dialog
        setGoogleUserData({
          email: userInfo.email,
          firstName: userInfo.given_name,
          lastName: userInfo.family_name,
          googleId: userInfo.sub
        });
        setOpenRoleDialog(true);
      } catch (error) {
        console.error('Error during Google login:', error);
      }
    },
    onError: () => {
      console.error('Google Login Failed');
    }
  });

  // Role Selection Dialog Component
  const RoleSelectionDialog = () => (
    <Dialog 
      open={openRoleDialog} 
      onClose={() => setOpenRoleDialog(false)}
      PaperProps={{
        style: {
          backgroundColor: '#0A1929',
          borderRadius: '12px',
          maxWidth: '400px',
          width: '100%',
          padding: '20px'
        }
      }}
    >
      <Box sx={{ textAlign: 'center', color: 'white' }}>
        <DialogTitle sx={{ 
          fontSize: '1.2rem',
          fontWeight: 500,
          color: 'white',
          pb: 1
        }}>
          Before you continue, are you a student or an instructor?
        </DialogTitle>
        
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: 2,
          pt: 2
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2,
            mt: 2
          }}>
            <Button
              onClick={() => {
                setSelectedRole('student');
                handleRoleSubmit();
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '20px',
                padding: '8px 24px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                textTransform: 'none'
              }}
            >
              I'm a Student
            </Button>
            <Button
              onClick={() => {
                setSelectedRole('faculty');
                handleRoleSubmit();
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                borderRadius: '20px',
                padding: '8px 24px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                },
                textTransform: 'none'
              }}
            >
              I'm a Instructor
            </Button>
          </Box>
        </DialogContent>
      </Box>
    </Dialog>
  );

  return (
    <>
      <button 
        type="button" 
        className={styles.googleButton}
        onClick={() => login()}
      >
        <img
          src="https://authjs.dev/img/providers/google.svg"
          className={styles.googleIcon}
          alt="Google icon"
        />
        <span className={styles.googleButtonText}>Continue with Google</span>
      </button>

      <RoleSelectionDialog />
    </>
  );
}