import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useAuth } from '../../context/AuthContext';

export function GoogleButton() {
  const [openRoleDialog, setOpenRoleDialog] = useState(false);
  const [googleUserData, setGoogleUserData] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleSubmit = async (role) => {
    try {
      console.log('Sending registration data:', {
        ...googleUserData,
        role: role
      });

      const fetchOptions = {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...googleUserData,
          role: role
        }),
      };

      console.log('Fetch Options:', fetchOptions);

      const response = await fetch('http://localhost:5000/api/auth/google-register', fetchOptions);

      console.log('Full Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        url: response.url
      });

      const responseClone = response.clone();

      let responseBody;
      try {
        if (response.ok) {
          responseBody = await response.json();
        } else {
          const errorText = await responseClone.text();
          console.error('Error Response Text:', errorText);
          
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

      if (!response.ok) {
        throw new Error(
          responseBody?.message || 
          responseBody?.error || 
          'Registration failed'
        );
      }

      const { token, user } = responseBody;
      
      console.log('Registration successful, received:', { token, user });
      
      // Store token and user info directly
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Close the dialog first
      setOpenRoleDialog(false);
      
      // Navigate based on role
      if (user.role === 'student') {
        console.log('Redirecting to student profile...');
        navigate('/student/profile', { replace: true });
      } else {
        console.log('Redirecting to admin profile...');
        navigate('/admin/profile', { replace: true });
      }

      // Force page reload to update auth context
      window.location.reload();
    } catch (error) {
      console.error('=== FULL REGISTRATION ERROR ===');
      console.error('Error Object:', error);
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
      
      alert(`Registration Error: ${error.message}`);
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${response.access_token}`,
          },
        });
        
        if (!userInfoResponse.ok) {
          throw new Error('Failed to get user info');
        }

        const userInfo = await userInfoResponse.json();
        
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
                handleRoleSubmit('student');
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
                handleRoleSubmit('faculty');
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
        onClick={() => loginGoogle()}
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