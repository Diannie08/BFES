import React, { useState, useEffect, useCallback } from 'react';
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

  const loadForm = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    if (id) {
      loadForm();
    }
  }, [id, loadForm]);

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
    setLoading(true);

    try {
      if (id) {
        await evaluationService.updateForm(id, formData);
      } else {
        await evaluationService.createForm(formData);
      }
      navigate('/admin/evaluation');
    } catch (err) {
      setError('Failed to save evaluation form');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {id ? 'Edit Evaluation Form' : 'Create Evaluation Form'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Form Title"
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
                  label="Target Audience"
                >
                  <MenuItem value="student">Students</MenuItem>
                  <MenuItem value="peer">Faculty Peers</MenuItem>
                  <MenuItem value="self">Self Assessment</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Questions
              </Typography>
              {formData.questions.map((question, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={11}>
                      <TextField
                        fullWidth
                        label={`Question ${index + 1}`}
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
                          label="Question Type"
                        >
                          <MenuItem value="rating">Rating (1-5)</MenuItem>
                          <MenuItem value="text">Text Answer</MenuItem>
                          <MenuItem value="multiple_choice">Multiple Choice</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                  <Divider sx={{ my: 2 }} />
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
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  disabled={loading}
                >
                  {id ? 'Update Form' : 'Create Form'}
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/admin/evaluation')}
                >
                  Cancel
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EvaluationForm;
