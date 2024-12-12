import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Student Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Welcome, {user?.name || 'Student'}</Typography>
            <Typography variant="body2">Email: {user?.email}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Recent Evaluations</Typography>
            {/* Add student evaluation list or summary */}
            <Typography variant="body2">No recent evaluations.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;
