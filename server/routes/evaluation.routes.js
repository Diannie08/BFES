const express = require('express');
const router = express.Router();
const EvaluationForm = require('../models/evaluationForm.model');
const EvaluationResponse = require('../models/evaluationResponse.model');
const { verifyToken } = require('../middleware/auth');
const emailService = require('../services/email.service');

// Get all evaluation forms
router.get('/', verifyToken, async (req, res) => {
  try {
    // Get all forms
    const evaluationForms = await EvaluationForm.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    // If user is a student, add completion status
    if (req.user.role === 'student') {
      // Get completed evaluations for this student
      const completedResponses = await EvaluationResponse.distinct('evaluationForm', {
        student: req.user.id
      });

      // Mark forms as completed if student has submitted responses
      const formsWithStatus = evaluationForms.map(form => {
        const formObj = form.toObject();
        formObj.status = completedResponses.includes(form._id) ? 'Completed' : 'Pending';
        return formObj;
      });

      return res.json(formsWithStatus);
    }

    // For admin, return forms with their original status
    res.json(evaluationForms);
  } catch (error) {
    console.error('Error fetching evaluation forms:', error);
    res.status(500).json({ message: 'Error fetching evaluation forms', error: error.message });
  }
});

// Get all evaluation forms for students
router.get('/student/evaluations', verifyToken, async (req, res) => {
  try {
    console.log('Fetching all evaluation forms for students');
    const evaluationForms = await EvaluationForm.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    // Get completed evaluations for this student
    const completedResponses = await EvaluationResponse.find({
      student: req.user.id
    }).distinct('evaluationForm');

    // Return forms with their original status
    const formsWithStatus = evaluationForms.map(form => {
      const formObj = form.toObject();
      // Keep the original status
      return formObj;
    });

    console.log('Forms with status:', formsWithStatus);
    res.json(formsWithStatus);
  } catch (error) {
    console.error('Error fetching evaluation forms for students:', error);
    console.error('Error details:', error.message, error.stack);
    res.status(500).json({ message: 'Error fetching evaluation forms', error: error.message });
  }
});

// Get evaluation results
router.get('/results', verifyToken, async (req, res) => {
  try {
    console.log('Fetching evaluation results');
    const results = await EvaluationResponse.find()
      .populate({
        path: 'evaluationForm',
        populate: {
          path: 'questions'
        }
      })
      .populate('instructor', 'name email')
      .populate('student', 'name email')
      .sort({ createdAt: -1 });
    
    // Group responses by evaluation form and instructor
    const groupedResults = results.reduce((acc, curr) => {
      if (!curr.evaluationForm || !curr.instructor) {
        console.log('Skipping response due to missing form or instructor:', curr._id);
        return acc;
      }

      const key = `${curr.evaluationForm._id}-${curr.instructor._id}`;
      if (!acc[key]) {
        acc[key] = {
          _id: key,
          evaluationForm: curr.evaluationForm,
          instructor: curr.instructor,
          evaluationPeriod: curr.evaluationPeriod,
          responses: []
        };
      }

      // Find the question details and handle missing questions
      const question = curr.evaluationForm.questions.find(
        q => q._id.toString() === curr.questionId.toString()
      );

      // Only add response if we have valid question data
      if (question) {
        acc[key].responses.push({
          questionId: curr.questionId,
          questionText: question.text,
          questionType: question.type,
          rating: curr.rating,
          answer: curr.answer,
          student: curr.student
        });
      } else {
        console.log('Question not found for response:', curr._id);
      }
      
      return acc;
    }, {});

    const finalResults = Object.values(groupedResults).filter(result => 
      result.responses && result.responses.length > 0
    );

    console.log('Sending grouped results:', finalResults);
    res.json(finalResults);
  } catch (error) {
    console.error('Error fetching evaluation results:', error);
    res.status(500).json({ message: 'Error fetching evaluation results', error: error.message });
  }
});

// Get evaluation results by date
router.get('/results/date/:date', verifyToken, async (req, res) => {
  const { date } = req.params;
  try {
    const results = await EvaluationResponse.find({ createdAt: { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) } })
      .populate('evaluationForm')
      .populate('instructor', 'name email')
      .populate('student', 'name email');

    res.json(results);
  } catch (error) {
    console.error('Error fetching evaluation results by date:', error);
    res.status(500).json({ message: 'Error fetching evaluation results', error: error.message });
  }
});

// Get a specific evaluation result
router.get('/results/:id', verifyToken, async (req, res) => {
  try {
    const result = await EvaluationResponse.findById(req.params.id)
      .populate('evaluationForm')
      .populate('instructor', 'name email')
      .populate('student', 'name email');
    
    if (!result) {
      return res.status(404).json({ message: 'Evaluation result not found' });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching evaluation result:', error);
    res.status(500).json({ message: 'Error fetching evaluation result', error: error.message });
  }
});

// Submit evaluation response
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    const { instructor, student, questionId, rating, answer, evaluationPeriod } = req.body;
    console.log('Received submission data:', {
      formId: req.params.id,
      instructor,
      student,
      questionId,
      rating,
      answer,
      evaluationPeriod
    });

    const evaluationForm = await EvaluationForm.findById(req.params.id);
    
    if (!evaluationForm) {
      console.log('Evaluation form not found:', req.params.id);
      return res.status(404).json({ message: 'Evaluation form not found' });
    }

    // Check if student has already submitted this specific question
    const existingResponse = await EvaluationResponse.findOne({
      evaluationForm: req.params.id,
      student,
      questionId
    });

    if (existingResponse) {
      console.log('Duplicate response found:', existingResponse);
      return res.status(400).json({ message: 'You have already submitted an answer for this question' });
    }

    // Validate the data
    if (!instructor || !student || !questionId) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        details: { instructor, student, questionId }
      });
    }

    // Create new evaluation response
    const response = new EvaluationResponse({
      evaluationForm: req.params.id,
      instructor,
      student,
      questionId,
      rating: rating || undefined,
      answer: answer || undefined,
      evaluationPeriod: {
        startDate: new Date(evaluationPeriod.startDate),
        endDate: new Date(evaluationPeriod.endDate)
      }
    });

    console.log('Creating new response:', {
      evaluationForm: response.evaluationForm,
      instructor: response.instructor,
      student: response.student,
      questionId: response.questionId,
      rating: response.rating,
      answer: response.answer,
      evaluationPeriod: response.evaluationPeriod
    });

    const savedResponse = await response.save();
    console.log('Response saved successfully:', savedResponse);

    res.status(201).json({ 
      message: 'Answer submitted successfully',
      response: {
        id: savedResponse._id,
        createdAt: savedResponse.createdAt
      }
    });
  } catch (error) {
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });
    console.error('Request body:', req.body);
    res.status(500).json({ 
      message: 'Error submitting evaluation', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Get a specific evaluation form
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const evaluationForm = await EvaluationForm.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!evaluationForm) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }
    
    res.json(evaluationForm);
  } catch (error) {
    console.error('Error fetching evaluation form:', error);
    res.status(500).json({ message: 'Error fetching evaluation form', error: error.message });
  }
});

// Create a new evaluation form
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Creating new evaluation form with data:', req.body);
    
    const form = new EvaluationForm({
      ...req.body,
      createdBy: req.user._id
    });
    
    const savedForm = await form.save();
    console.log('Form saved successfully:', savedForm);

    // Send notification emails to all students
    try {
      console.log('Attempting to send notification emails');
      await emailService.sendNewFormNotification(
        req.body.title,
        req.body.description,
        req.body.startDate,
        req.body.endDate
      );
      console.log('Notification emails sent successfully');
    } catch (emailError) {
      console.error('Error sending notification emails:', emailError);
      // Don't fail the request if email sending fails
    }

    res.status(201).json(savedForm);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ message: 'Error creating evaluation form', error: error.message });
  }
});

// Update an evaluation form
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, description, targetAudience, questions, status } = req.body;
    
    const evaluationForm = await EvaluationForm.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        targetAudience,
        questions,
        status,
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!evaluationForm) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }

    res.json(evaluationForm);
  } catch (error) {
    console.error('Error updating evaluation form:', error);
    res.status(500).json({ message: 'Error updating evaluation form', error: error.message });
  }
});

// Delete an evaluation form
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const evaluationForm = await EvaluationForm.findByIdAndDelete(req.params.id);
    
    if (!evaluationForm) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }
    
    // Also delete all responses associated with this form
    await EvaluationResponse.deleteMany({ evaluationForm: req.params.id });
    
    res.json({ message: 'Evaluation form deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation form:', error);
    res.status(500).json({ message: 'Error deleting evaluation form', error: error.message });
  }
});

// Get all evaluation forms for admin
router.get('/admin/forms', verifyToken, async (req, res) => {
  try {
    const evaluationForms = await EvaluationForm.find()
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    
    res.json(evaluationForms);
  } catch (error) {
    console.error('Error fetching evaluation forms:', error);
    res.status(500).json({ message: 'Error fetching evaluation forms', error: error.message });
  }
});

module.exports = router;
