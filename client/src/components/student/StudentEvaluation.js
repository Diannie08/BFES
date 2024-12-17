import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Tooltip,
  CircularProgress,
  Alert,
  Chip
} from '@mui/material';
import {
  AssignmentOutlined as AssignmentIcon,
  WarningOutlined as WarningIcon,
  RateReviewOutlined as ReviewIcon,
  CheckCircleOutline as CheckCircleIcon,
  PendingOutlined as PendingIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  Grid
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StudentEvaluation = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [evaluations, setEvaluations] = useState([]);
  const [pendingEvaluations, setPendingEvaluations] = useState([]);
  const [evaluationForms, setEvaluationForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchEvaluations();
      fetchEvaluationForms();
    } else {
      setLoading(false);
      setError('Please log in to view evaluations');
    }
  }, [isAuthenticated]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  };

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/evaluation/student/evaluations`, 
        getAuthHeaders()
      );
      
      console.log('Fetched evaluations:', response.data);
      setEvaluations(response.data);
      setPendingEvaluations(response.data.filter(evaluation => evaluation.status === 'Active'));
      setError(null);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      setError(error.response?.data?.message || 'Failed to fetch evaluations. Please try again later.');
    }
  };

  const fetchEvaluationForms = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/evaluation`, 
        getAuthHeaders()
      );
      
      // Map the forms and ensure status is properly set
      const processedForms = response.data.map(form => ({
        ...form,
        status: form.status || 'Active' // Default to Active if status is not set
      }));
      
      console.log('Fetched evaluation forms:', processedForms);
      setEvaluationForms(processedForms);
      setError(null);
    } catch (error) {
      console.error('Error fetching evaluation forms:', error);
      setError(error.response?.data?.message || 'Failed to fetch evaluation forms. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const state = location.state;
    if (state?.message) {
      // Refresh the forms list when returning from submission
      fetchEvaluationForms();
    }
  }, [location.state]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Please log in to view evaluations</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const getStatusIcon = (status) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower === 'active') {
      return <AssignmentIcon sx={{ color: 'primary.main' }} />;
    }
    if (statusLower === 'draft') {
      return <PendingIcon sx={{ color: 'warning.main' }} />;
    }
    if (statusLower === 'completed') {
      return <CheckCircleIcon sx={{ color: 'success.main' }} />;
    }
    return <BlockIcon sx={{ color: 'error.main' }} />;
  };

  const getStatusChip = (status) => {
    const statusLower = status?.toLowerCase() || '';
    console.log('Status from DB:', status); // Debug log
    
    if (statusLower === 'active') {
      return <Chip label="Active" color="primary" size="small" />;
    }
    if (statusLower === 'draft') {
      return <Chip label="Draft" color="warning" size="small" />;
    }
    if (statusLower === 'completed') {
      return <Chip label="Completed" color="success" size="small" />;
    }
    return <Chip label={status || 'Pending'} color="default" size="small" />;
  };

  const handleStartEvaluation = (formId) => {
    navigate(`/student/evaluation/${formId}/answer`);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      width: '100%',
      bgcolor: '#F0F8FF',
      position: 'relative',
      p: 4
    }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#1a237e',
                  fontWeight: 600,
                  pl: 1
                }}
              >
                Evaluation Forms
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setLoading(true);
                  Promise.all([fetchEvaluations(), fetchEvaluationForms()])
                    .finally(() => setLoading(false));
                }}
                disabled={loading}
                sx={{ borderRadius: '12px' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Refresh'}
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Title', 'Type', 'Status', 'Deadline', 'Action'].map((header) => (
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
                  {evaluationForms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <AssignmentIcon sx={{ fontSize: 48, color: '#1a237e', opacity: 0.5, mb: 2 }} />
                          <Typography variant="body1" color="textSecondary">
                            No evaluation forms available
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    evaluationForms.map((form) => (
                      <TableRow 
                        key={form._id}
                        sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                      >
                        <TableCell>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {form.title}
                          </Typography>
                          {form.description && (
                            <Typography variant="body2" color="textSecondary">
                              {form.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={form.type || 'General'} 
                            size="small"
                            sx={{ bgcolor: '#E3F2FD' }}
                          />
                        </TableCell>
                        <TableCell>
                          {getStatusChip(form.status || 'Active')}
                        </TableCell>
                        <TableCell>
                          {form.deadline ? new Date(form.deadline).toLocaleDateString() : 'No deadline'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => handleStartEvaluation(form._id)}
                            disabled={form.status?.toLowerCase() === 'completed'}
                            sx={{ borderRadius: '8px' }}
                          >
                            {form.status?.toLowerCase() === 'completed' ? 'Completed' : 'Start'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
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

            {pendingEvaluations.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                color: '#1a237e',
                opacity: 0.7 
              }}>
                <ReviewIcon sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="body1">
                  No pending evaluations
                </Typography>
              </Box>
            ) : (
              pendingEvaluations.map((evaluation) => (
                <Card 
                  key={evaluation._id} 
                  sx={{ 
                    mb: 2, 
                    bgcolor: '#F0F8FF',
                    borderRadius: '12px',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)'
                    }
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
                          {evaluation.description}
                        </Typography>
                      </Box>
                      <Box sx={{ ml: 'auto' }}>
                        {getStatusChip(evaluation.status)}
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', pr: 2, pb: 2 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      size="small"
                      onClick={() => handleStartEvaluation(evaluation._id)}
                      sx={{ borderRadius: '8px' }}
                    >
                      Start Evaluation
                    </Button>
                  </CardActions>
                </Card>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentEvaluation;
