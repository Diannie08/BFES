import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import { AddCircleOutline as AddCircleOutlineIcon } from '@mui/icons-material';
import evaluationService from '../../services/evaluation.service';

const Evaluation = () => {
  const navigate = useNavigate();
  const [evaluationForms, setEvaluationForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, formId: null });

  useEffect(() => {
    loadForms();
  }, []);

  const loadForms = async () => {
    try {
      setLoading(true);
      const forms = await evaluationService.getAllForms();
      setEvaluationForms(forms);
    } catch (err) {
      setError('Failed to load evaluation forms');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await evaluationService.deleteForm(deleteDialog.formId);
      setDeleteDialog({ open: false, formId: null });
      loadForms(); // Reload the forms list
    } catch (err) {
      setError('Failed to delete evaluation form');
      console.error(err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await evaluationService.updateFormStatus(id, newStatus);
      loadForms(); // Reload the forms list
    } catch (err) {
      setError('Failed to update form status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Evaluation Forms
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCircleOutlineIcon />}
          onClick={() => navigate('/admin/evaluation/create')}
        >
          Create New Form
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {evaluationForms.map((form) => (
          <Grid item xs={12} md={4} key={form._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {form.title}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {form.description}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Target: {form.targetAudience.charAt(0).toUpperCase() + form.targetAudience.slice(1)}
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mt: 2,
                    color: form.status === 'active' ? 'success.main' : 
                           form.status === 'draft' ? 'warning.main' : 'error.main'
                  }}
                >
                  Status: {form.status.charAt(0).toUpperCase() + form.status.slice(1)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color="primary"
                  onClick={() => navigate(`/admin/evaluation/edit/${form._id}`)}
                >
                  Edit
                </Button>
                <Button 
                  size="small" 
                  color="error"
                  onClick={() => setDeleteDialog({ open: true, formId: form._id })}
                >
                  Delete
                </Button>
                {form.status === 'draft' && (
                  <Button
                    size="small"
                    color="success"
                    onClick={() => handleStatusChange(form._id, 'active')}
                  >
                    Activate
                  </Button>
                )}
                {form.status === 'active' && (
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => handleStatusChange(form._id, 'inactive')}
                  >
                    Deactivate
                  </Button>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, formId: null })}
      >
        <DialogTitle>Delete Evaluation Form</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this evaluation form? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, formId: null })}>Cancel</Button>
          <Button onClick={handleDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Evaluation;
