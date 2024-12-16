import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  Tooltip,
  Rating,
  Collapse,
  CircularProgress,
  Card,
  CardContent,
  Snackbar,
  Alert,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/material';

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Assessment as AssessmentIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

import evaluationService from '../../services/evaluation.service';

const Evaluation = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [resultsDialog, setResultsDialog] = useState({ open: false, formId: null });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      const response = await evaluationService.getAllForms();
      setForms(response);
    } catch (error) {
      console.error('Error fetching forms:', error);
      showSnackbar('Error fetching evaluation forms', 'error');
    }
  };

  const handleCreateForm = () => {
    navigate('/admin/evaluation/create');
  };

  const handleEditForm = (formId) => {
    navigate(`/admin/evaluation/edit/${formId}`);
  };

  const handleDeleteClick = (form) => {
    setSelectedForm(form);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await evaluationService.deleteForm(selectedForm._id);
      setDeleteDialogOpen(false);
      showSnackbar('Form deleted successfully', 'success');
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      showSnackbar('Error deleting form', 'error');
    }
  };

  const handleStatusChange = async (form) => {
    try {
      const updatedForm = { ...form };
      updatedForm.status = form.status === 'active' ? 'draft' : 'active';
      await evaluationService.updateForm(form._id, updatedForm);
      showSnackbar(`Form ${updatedForm.status === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchForms();
    } catch (error) {
      console.error('Error updating form status:', error);
      showSnackbar('Error updating form status', 'error');
    }
  };

  const handleViewResults = async (formId) => {
    setLoading(true);
    setResultsDialog({ open: true, formId });
    try {
      const response = await evaluationService.getEvaluationResults();
      console.log('Got evaluation results:', response);
      
      // Filter results for this specific form
      const formResults = response.filter(r => r.evaluationForm._id === formId);
      console.log('Filtered results for form:', formResults);
      
      setResults(formResults);
    } catch (error) {
      console.error('Error fetching results:', error);
      showSnackbar('Error fetching evaluation results', 'error');
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageRating = (responses) => {
    const ratings = responses.filter(r => r.rating !== undefined && r.rating !== null)
                           .map(r => r.rating);
    if (ratings.length === 0) return 0;
    const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;
    return Number(average.toFixed(2));
  };

  const toggleRowExpansion = (rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'success';
      case 'draft':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusDisplay = (status) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'Active';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  const getTargetColor = (target) => {
    switch (target) {
      case 'Student':
        return '#2196f3';
      case 'Self':
        return '#4caf50';
      case 'Peer':
        return '#ff9800';
      default:
        return '#757575';
    }
  };

  const ResultsDialog = () => {
    if (!resultsDialog.open) return null;

    return (
      <Dialog
        open={resultsDialog.open}
        onClose={() => setResultsDialog({ open: false, formId: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Evaluation Results
          {loading && <CircularProgress size={24} style={{ marginLeft: 15 }} />}
        </DialogTitle>
        <DialogContent>
          {results.length > 0 ? (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Instructor</TableCell>
                    <TableCell align="right">Average Rating</TableCell>
                    <TableCell align="right">Number of Responses</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {results.map((result) => {
                    const avgRating = calculateAverageRating(result.responses);
                    const numResponses = result.responses.length;
                    
                    return (
                      <React.Fragment key={result._id}>
                        <TableRow>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => toggleRowExpansion(result._id)}
                            >
                              {expandedRows[result._id] ? (
                                <KeyboardArrowUpIcon />
                              ) : (
                                <KeyboardArrowDownIcon />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>{result.instructor.name}</TableCell>
                          <TableCell align="right">
                            {avgRating > 0 ? (
                              <Rating value={avgRating} precision={0.1} readOnly />
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell align="right">{numResponses}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{ paddingBottom: 0, paddingTop: 0 }}
                            colSpan={6}
                          >
                            <Collapse
                              in={expandedRows[result._id]}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box margin={1}>
                                <Typography variant="h6" gutterBottom component="div">
                                  Detailed Responses
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Question</TableCell>
                                      <TableCell>Response</TableCell>
                                      <TableCell>Student</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {result.responses.map((response, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{response.questionText}</TableCell>
                                        <TableCell>
                                          {response.questionType === 'rating' ? (
                                            <Rating
                                              value={response.rating}
                                              readOnly
                                            />
                                          ) : (
                                            response.answer
                                          )}
                                        </TableCell>
                                        <TableCell>{response.student.name}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography>No evaluation results found.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setResultsDialog({ open: false, formId: null })}
            color="primary"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
          Evaluation Forms
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateForm}
          sx={{ 
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 'bold'
          }}
        >
          Create New Form
        </Button>
      </Box>

      <Grid container spacing={3}>
        {forms.map((form) => (
          <Grid item xs={12} md={6} lg={4} key={form._id}>
            <Card 
              elevation={2}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1, p: 3 }}>
                <Box mb={2}>
                  <Typography variant="h6" component="h2" gutterBottom fontWeight="bold">
                    {form.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: '40px' }}>
                    {form.description}
                  </Typography>
                </Box>

                <Box display="flex" gap={1} mb={2}>
                  <Chip
                    label={form.targetAudience}
                    size="small"
                    sx={{
                      backgroundColor: getTargetColor(form.targetAudience),
                      color: 'white',
                      fontWeight: 'medium'
                    }}
                  />
                  <Chip
                    label={getStatusDisplay(form.status)}
                    size="small"
                    color={getStatusColor(form.status)}
                    icon={form.status.toLowerCase() === 'active' ? <ActiveIcon /> : <InactiveIcon />}
                  />
                </Box>

                <Box 
                  display="flex" 
                  justifyContent="flex-end"
                  gap={1}
                  sx={{ mt: 'auto' }}
                >
                  <Tooltip title={form.status.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'}>
                    <IconButton
                      size="small"
                      onClick={() => handleStatusChange(form)}
                      color={form.status.toLowerCase() === 'active' ? 'error' : 'success'}
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                      }}
                    >
                      {form.status.toLowerCase() === 'active' ? <InactiveIcon /> : <ActiveIcon />}
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Form">
                    <IconButton
                      size="small"
                      onClick={() => handleEditForm(form._id)}
                      color="primary"
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Form">
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(form)}
                      color="error"
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Results">
                    <IconButton
                      size="small"
                      onClick={() => handleViewResults(form._id)}
                      color="info"
                      sx={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' }
                      }}
                    >
                      <AssessmentIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ResultsDialog />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Evaluation Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedForm?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Evaluation;
