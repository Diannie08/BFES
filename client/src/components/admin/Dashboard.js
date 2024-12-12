import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  NotificationsActive as NotificationsActiveIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';

// Styled components for enhanced visual appeal
const StyledCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[12],
  },
  borderRadius: theme.spacing(2),
  height: '100%',
}));

const GradientCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
  color: theme.palette.common.white,
  borderRadius: theme.spacing(2),
  height: '100%',
}));

const Dashboard = () => {
  const { user } = useAuth();
  
  // Expanded dummy data with more context
  const stats = {
    totalEvaluations: 15,
    activeEvaluations: 8,
    completedEvaluations: 7,
    totalFaculty: 25,
    newFaculty: 3,
    totalStudents: 450,
    newStudents: 25,
  };

  const recentActivities = [
    {
      id: 1,
      action: 'New evaluation form created',
      subject: 'Faculty Performance Review 2024',
      timestamp: '2 hours ago',
      type: 'success',
    },
    {
      id: 2,
      action: 'Evaluation completed',
      subject: 'Prof. Smith - CS101',
      timestamp: '5 hours ago',
      type: 'info',
    },
    {
      id: 3,
      action: 'New faculty member added',
      subject: 'Dr. Johnson',
      timestamp: '1 day ago',
      type: 'warning',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Welcome, {user?.name || 'Admin'}
      </Typography>

      <Grid container spacing={4}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AssessmentIcon color="primary" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalEvaluations}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Evaluations
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  +{stats.activeEvaluations} Active
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PeopleIcon color="warning" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalFaculty}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Faculty Members
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  +{stats.newFaculty} New
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StyledCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon color="info" sx={{ fontSize: 40, mr: 2 }} />
                <Box>
                  <Typography variant="h4">{stats.totalStudents}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Students
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="success.main">
                  +{stats.newStudents} New
                </Typography>
              </Box>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <GradientCard>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <NotificationsActiveIcon sx={{ fontSize: 40, mr: 2, color: 'white' }} />
                <Box>
                  <Typography variant="h4" color="inherit">
                    {recentActivities.length}
                  </Typography>
                  <Typography variant="body2" color="inherit" sx={{ opacity: 0.8 }}>
                    Pending Notifications
                  </Typography>
                </Box>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={50} 
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.3)', 
                  '& .MuiLinearProgress-bar': { 
                    backgroundColor: 'white' 
                  } 
                }} 
              />
            </CardContent>
          </GradientCard>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {activity.action}
                          <Chip 
                            label={activity.type} 
                            size="small" 
                            color={activity.type === 'success' ? 'success' : activity.type === 'info' ? 'info' : 'warning'}
                            sx={{ ml: 2 }}
                          />
                        </Box>
                      }
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="textPrimary"
                          >
                            {activity.subject}
                          </Typography>
                          {" — "}{activity.timestamp}
                        </>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <AssignmentIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">
                    Create Evaluation
                  </Typography>
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                  <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
                  <Typography variant="body2">
                    Manage Users
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
