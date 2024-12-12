import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper 
} from '@mui/material';
import { Link } from 'react-router-dom';
import LockIcon from '@mui/icons-material/Lock';

const Unauthorized = () => {
  return (
    <Container maxWidth="xs">
      <Box 
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          textAlign: 'center'
        }}
      >
        <Paper 
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: '#f0f4f8',
            borderRadius: 2
          }}
        >
          <LockIcon 
            sx={{ 
              fontSize: 80, 
              color: '#1a237e',
              mb: 2 
            }} 
          />
          
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#1a237e', 
              mb: 2,
              fontWeight: 600 
            }}
          >
            Access Denied
          </Typography>
          
          <Typography 
            variant="body1" 
            color="textSecondary" 
            sx={{ 
              mb: 3,
              textAlign: 'center'
            }}
          >
            You do not have permission to access this page. 
            Please contact your system administrator if you believe this is an error.
          </Typography>
          
          <Button 
            component={Link} 
            to="/login" 
            variant="contained"
            sx={{
              bgcolor: '#1a237e',
              '&:hover': {
                bgcolor: '#0d47a1'
              }
            }}
          >
            Return to Login
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Unauthorized;
