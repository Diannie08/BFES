import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Rating,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AnswerEvaluation = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const response = await axios.get(`${API_URL}/evaluation/${formId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setForm(response.data);
      // Initialize answers object
      const initialAnswers = {};
      response.data.questions.forEach((question, index) => {
        initialAnswers[index] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      console.error('Error fetching form:', error);
      setError(error.response?.data?.message || 'Failed to fetch evaluation form');
    } finally {
      setLoading(false);
    }
  };

  // Profanity and inappropriate words list
  const inappropriateWords = [
    'fuck', 'shit', 'ass', 'bitch', 'dick', 'pussy', 'cock', 'bastard',
    'idiot', 'stupid', 'dumb', 'retard', 'moron', 'asshole', 'puta',
    'gago', 'bobo', 'tanga', 'ulol', 'inutil', 'tarantado', 'putangina',
    'tangina', 'pakyu', 'lintik', 'kupal', 'tae', 'leche', 'animal',
    // Add more inappropriate words as needed
  ];

  const validateAnswer = (question, value) => {
    if (!value) return 'This field is required';

    switch (question.type) {
      case 'text':
        // Check for minimum length (3 characters)
        if (value.length < 3) {
          return 'Answer must be at least 3 characters long';
        }
        
        // Check for maximum length (500 characters)
        if (value.length > 500) {
          return 'Answer cannot exceed 500 characters';
        }
        
        // Check for random characters/keyboard smashing
        const randomCharPattern = /(.)\1{4,}/; // Detects 5 or more repeated characters
        if (randomCharPattern.test(value)) {
          return 'Please provide a valid answer without repeated characters';
        }
        
        // Check for only numbers
        if (/^\d+$/.test(value)) {
          return 'Answer cannot contain only numbers';
        }
        
        // Check for minimum word count (2 words)
        const words = value.trim().split(/\s+/);
        if (words.length < 2) {
          return 'Please provide a more detailed answer (minimum 2 words)';
        }

        // Check for inappropriate language
        const lowerCaseValue = value.toLowerCase();
        const foundInappropriateWords = inappropriateWords.filter(word => 
          lowerCaseValue.includes(word) || 
          // Check for intentionally obfuscated words (e.g., "f*ck", "f.u.c.k")
          lowerCaseValue.replace(/[^a-z]/g, '').includes(word.replace(/[^a-z]/g, ''))
        );

        if (foundInappropriateWords.length > 0) {
          return 'Please maintain professional language in your evaluation. Inappropriate words are not allowed.';
        }

        // Check for excessive capitalization (shouting)
        const upperCaseCount = (value.match(/[A-Z]/g) || []).length;
        if (upperCaseCount > value.length * 0.5) {
          return 'Please avoid excessive use of capital letters';
        }

        // Check for repetitive punctuation (!!!???)
        if (/[!?]{2,}/.test(value)) {
          return 'Please use appropriate punctuation';
        }

        break;

      case 'rating':
        const rating = parseInt(value);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          return 'Rating must be between 1 and 5';
        }
        break;

      case 'multiple_choice':
        if (!question.options.includes(value)) {
          return 'Please select a valid option';
        }
        break;
    }

    return null;
  };

  const handleAnswerChange = (questionIndex, value) => {
    const question = form.questions[questionIndex];
    const validationError = validateAnswer(question, value);
    
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: value
    }));

    // Update errors state
    setErrors(prev => ({
      ...prev,
      [questionIndex]: validationError
    }));
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      // Validate all answers before submission
      const newErrors = {};
      let hasErrors = false;

      form.questions.forEach((question, index) => {
        const validationError = validateAnswer(question, answers[index]);
        if (validationError) {
          newErrors[index] = validationError;
          hasErrors = true;
        }
      });

      if (hasErrors) {
        setErrors(newErrors);
        setError('Please correct the errors before submitting');
        return;
      }

      // Check if all questions are answered
      const unansweredQuestions = form.questions.filter((_, index) => !answers[index]);
      if (unansweredQuestions.length > 0) {
        setError('Please answer all questions before submitting');
        return;
      }

      console.log('Form data:', form);
      console.log('User data:', user);

      // Submit each answer as a separate response
      const submitPromises = form.questions.map(async (question, index) => {
        const answerValue = answers[index];
        const currentDate = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);

        const requestData = {
          evaluationForm: formId,
          instructor: form.createdBy._id,
          student: user.id,
          questionId: question._id,
          rating: question.type === 'rating' ? parseInt(answerValue) : undefined,
          answer: question.type === 'text' || question.type === 'multiple_choice' ? answerValue : undefined,
          evaluationPeriod: {
            startDate: currentDate.toISOString(),
            endDate: nextWeek.toISOString()
          }
        };

        console.log('Submitting answer:', requestData);
        
        const response = await axios.post(`${API_URL}/evaluation/${formId}/submit`, requestData, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        return response.data;
      });

      await Promise.all(submitPromises);

      // Navigate back to evaluations list
      navigate('/student/evaluation', { 
        state: { message: 'Evaluation submitted successfully!' }
      });
    } catch (error) {
      console.error('Error submitting evaluation:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        details: error.response?.data?.details || 'No additional details'
      });
      setError(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to submit evaluation');
      setActiveStep(0);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const renderQuestion = (question, index) => {
    switch (question.type) {
      case 'rating':
        return (
          <Box sx={{ mt: 2 }}>
            <Rating
              value={Number(answers[index]) || 0}
              onChange={(event, newValue) => handleAnswerChange(index, newValue)}
              size="large"
            />
          </Box>
        );
      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
            sx={{ mt: 2 }}
          />
        );
      case 'multiple_choice':
        return (
          <FormControl component="fieldset" sx={{ mt: 2 }}>
            <RadioGroup
              value={answers[index] || ''}
              onChange={(e) => handleAnswerChange(index, e.target.value)}
            >
              {question.options.map((option, optIndex) => (
                <FormControlLabel
                  key={optIndex}
                  value={option}
                  control={<Radio />}
                  label={option}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/student/evaluation')}
          sx={{ mt: 2 }}
        >
          Back to Evaluations
        </Button>
      </Box>
    );
  }

  if (!form) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Evaluation form not found
        </Alert>
        <Button
          variant="outlined"
          onClick={() => navigate('/student/evaluation')}
          sx={{ mt: 2 }}
        >
          Back to Evaluations
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, bgcolor: '#F0F8FF', minHeight: '100vh' }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: '20px', bgcolor: '#B0C4DE' }}>
        <Typography variant="h4" sx={{ color: '#1a237e', mb: 4, fontWeight: 600 }}>
          {form.title}
        </Typography>
        
        {form.description && (
          <Typography variant="body1" sx={{ mb: 4, color: '#1a237e' }}>
            {form.description}
          </Typography>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {form.questions.map((_, index) => (
            <Step key={index}>
              <StepLabel>Question {index + 1}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Card sx={{ bgcolor: '#F0F8FF', borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#1a237e', mb: 2 }}>
              {form.questions[activeStep].text}
            </Typography>
            <FormControl fullWidth error={Boolean(errors[activeStep])}>
              {renderQuestion(form.questions[activeStep], activeStep)}
              {errors[activeStep] && (
                <Typography color="error" variant="caption" sx={{ mt: 1 }}>
                  {errors[activeStep]}
                </Typography>
              )}
            </FormControl>
          </CardContent>
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0}
            sx={{ borderRadius: '8px' }}
          >
            Back
          </Button>
          <Box>
            <Button
              variant="outlined"
              onClick={() => navigate('/student/evaluations')}
              sx={{ mr: 2, borderRadius: '8px' }}
            >
              Cancel
            </Button>
            {activeStep === form.questions.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitting || Boolean(errors[activeStep])}
                sx={{ borderRadius: '8px' }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Submit'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!answers[activeStep] || Boolean(errors[activeStep])}
                sx={{ borderRadius: '8px' }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AnswerEvaluation;
