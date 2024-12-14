const express = require('express');
const router = express.Router();
const EvaluationForm = require('../models/evaluationForm.model');
const EvaluationResponse = require('../models/evaluationResponse.model');
const { verifyToken } = require('../middleware/auth');

// Get all evaluation forms
router.get('/', verifyToken, async (req, res) => {
  try {
    console.log('Fetching all evaluation forms');
    const evaluationForms = await EvaluationForm.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    console.log('Found forms:', evaluationForms);
    res.json(evaluationForms);
  } catch (error) {
    console.error('Error fetching evaluation forms:', error);
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

// Submit evaluation responses
router.post('/:id/submit', verifyToken, async (req, res) => {
  try {
    const { responses } = req.body;
    const evaluationId = req.params.id;
    
    // Validate evaluation form exists
    const form = await EvaluationForm.findById(evaluationId);
    if (!form) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }

    // Create responses
    const savedResponses = await Promise.all(
      responses.map(response => {
        const evaluationResponse = new EvaluationResponse({
          evaluationForm: evaluationId,
          instructor: response.instructorId,
          student: req.user._id,
          questionId: response.questionId,
          rating: response.rating,
          answer: response.answer,
          evaluationPeriod: {
            startDate: form.evaluationPeriod.startDate,
            endDate: form.evaluationPeriod.endDate
          }
        });
        return evaluationResponse.save();
      })
    );

    res.json(savedResponses);
  } catch (error) {
    console.error('Error submitting evaluation:', error);
    res.status(500).json({ message: 'Error submitting evaluation', error: error.message });
  }
});

// Get a specific evaluation form by ID
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
    const { title, description, targetAudience, questions } = req.body;
    
    const evaluationForm = new EvaluationForm({
      title,
      description,
      targetAudience,
      questions,
      createdBy: req.user._id,
    });

    await evaluationForm.save();
    res.status(201).json(evaluationForm);
  } catch (error) {
    console.error('Error creating evaluation form:', error);
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

module.exports = router;
