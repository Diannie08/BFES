import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Chip,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Tooltip
} from '@mui/material';
import { 
  AssignmentOutlined as AssignmentIcon, 
  RateReviewOutlined as ReviewIcon,
  WarningAmberOutlined as WarningIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const StudentEvaluation = () => {
  const { user } = useAuth();
  const [evaluations, setEvaluations] = useState([]);
  const [pendingEvaluations, setPendingEvaluations] = useState([]);

  useEffect(() => {
    // Fetch evaluations for the student
    const fetchEvaluations = async () => {
      try {
        // Placeholder for API call to fetch evaluations
        // const response = await axios.get(`/api/student/evaluations/${user.id}`);
        // setEvaluations(response.data);
        
        // Mock data for demonstration
        const allEvaluations = [
          {
            id: 1,
            title: 'Midterm Instructor Evaluation',
            course: 'Computer Science 101',
            instructor: 'Dr. Jane Smith',
            deadline: '2024-01-20',
            status: 'Pending',
            progress: 0
          },
          {
            id: 2,
            title: 'Final Instructor Evaluation',
            course: 'Mathematics 202',
            instructor: 'Prof. John Doe',
            deadline: '2024-02-25',
            status: 'Upcoming',
            progress: 0
          },
          {
            id: 3,
            title: 'Software Engineering Project Evaluation',
            course: 'Software Engineering',
            instructor: 'Dr. Emily Chen',
            deadline: '2024-03-15',
            status: 'Completed',
            progress: 100
          }
        ];

        setEvaluations(allEvaluations);
        setPendingEvaluations(allEvaluations.filter(evaluation => 
          evaluation.status === 'Pending' || evaluation.status === 'Upcoming'
        ));
      } catch (error) {
        console.error('Failed to fetch evaluations', error);
      }
    };

    fetchEvaluations();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'warning';
      case 'Upcoming': return 'info';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Pending': return <WarningIcon color="warning" />;
      case 'Upcoming': return <AssignmentIcon color="info" />;
      case 'Completed': return <ReviewIcon color="success" />;
      default: return null;
    }
  };

  const handleStartEvaluation = (evaluationId) => {
    // Implement logic to start evaluation
    console.log(`Starting evaluation ${evaluationId}`);
  };

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      bgcolor: '#F0F8FF',
      position: 'relative',
      p: 4
    }}>
      <Grid container spacing={3}>
        {/* Evaluation List Section */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: '#B0C4DE',
              borderRadius: '20px',
              p: 4
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1a237e',
                mb: 4,
                fontWeight: 600,
                pl: 1
              }}
            >
              Evaluation Forms
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Evaluation', 'Course', 'Instructor', 'Deadline', 'Status', 'Action'].map((header) => (
                      <TableCell 
                        key={header}
                        sx={{ 
                          color: '#1a237e', 
                          fontWeight: 600 
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evaluations.map((evaluation) => (
                    <TableRow key={evaluation.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {getStatusIcon(evaluation.status)}
                          {evaluation.title}
                        </Box>
                      </TableCell>
                      <TableCell>{evaluation.course}</TableCell>
                      <TableCell>{evaluation.instructor}</TableCell>
                      <TableCell>{evaluation.deadline}</TableCell>
                      <TableCell>
                        <Chip 
                          label={evaluation.status} 
                          color={getStatusColor(evaluation.status)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>
                        <Tooltip 
                          title={evaluation.status === 'Pending' ? 'Start Evaluation' : 'Not Available'}
                        >
                          <span>
                            <Button 
                              variant="contained" 
                              color="primary" 
                              size="small"
                              disabled={evaluation.status !== 'Pending'}
                              onClick={() => handleStartEvaluation(evaluation.id)}
                            >
                              Start
                            </Button>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Pending Evaluations Highlights */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: '#B0C4DE',
              borderRadius: '20px',
              p: 4,
              height: '100%'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1a237e',
                mb: 3,
                fontWeight: 600
              }}
            >
              Pending Evaluations
            </Typography>

            {pendingEvaluations.map((evaluation) => (
              <Card 
                key={evaluation.id} 
                sx={{ 
                  mb: 2, 
                  bgcolor: '#F0F8FF',
                  borderRadius: '12px'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getStatusIcon(evaluation.status)}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {evaluation.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {evaluation.course} | Deadline: {evaluation.deadline}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pr: 2, pb: 2 }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small"
                    disabled={evaluation.status !== 'Pending'}
                    onClick={() => handleStartEvaluation(evaluation.id)}
                  >
                    Start Evaluation
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentEvaluation;
