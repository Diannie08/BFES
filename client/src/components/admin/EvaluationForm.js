import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Box,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import evaluationService from '../../services/evaluation.service';

const EvaluationForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAudience: 'student',
    questions: [
      {
        text: '',
        type: 'rating',
        options: ['1', '2', '3', '4', '5'],
      }
    ]
  });

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const form = await evaluationService.getFormById(id);
      setFormData(form);
    } catch (err) {
      setError('Failed to load evaluation form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionAdd = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          text: '',
          type: 'rating',
          options: ['1', '2', '3', '4', '5'],
        }
      ]
    });
  };

  const handleQuestionDelete = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      questions: newQuestions,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (id) {
        await evaluationService.updateForm(id, formData);
        setSuccess('Form updated successfully!');
      } else {
        await evaluationService.createForm(formData);
        setSuccess('Form created successfully!');
      }
      setTimeout(() => navigate('/admin/evaluation'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save form');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id ? 'Edit Evaluation Form' : 'Create Evaluation Form'}
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  required
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="peer">Peer</MenuItem>
                  <MenuItem value="self">Self</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Questions
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {formData.questions.map((question, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={11}>
                      <TextField
                        fullWidth
                        label="Question Text"
                        value={question.text}
                        onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                        required
                      />
                    </Grid>
                    
                    <Grid item xs={1}>
                      <IconButton
                        color="error"
                        onClick={() => handleQuestionDelete(index)}
                        disabled={formData.questions.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Question Type</InputLabel>
                        <Select
                          value={question.type}
                          onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                          required
                        >
                          <MenuItem value="rating">Rating</MenuItem>
                          <MenuItem value="text">Text</MenuItem>
                          <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={handleQuestionAdd}
                variant="outlined"
                sx={{ mt: 2 }}
              >
                Add Question
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : (id ? 'Update Form' : 'Create Form')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EvaluationForm;
