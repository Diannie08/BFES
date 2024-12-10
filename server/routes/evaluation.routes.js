const express = require('express');
const router = express.Router();
const EvaluationForm = require('../models/evaluationForm.model');
const auth = require('../middleware/auth');

// Create a new evaluation form
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, targetAudience, questions } = req.body;
    
    const evaluationForm = new EvaluationForm({
      title,
      description,
      targetAudience,
      questions,
      createdBy: req.user.id,
    });

    await evaluationForm.save();
    res.status(201).json(evaluationForm);
  } catch (error) {
    console.error('Error creating evaluation form:', error);
    res.status(500).json({ message: 'Error creating evaluation form' });
  }
});

// Get all evaluation forms
router.get('/', auth, async (req, res) => {
  try {
    const evaluationForms = await EvaluationForm.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(evaluationForms);
  } catch (error) {
    console.error('Error fetching evaluation forms:', error);
    res.status(500).json({ message: 'Error fetching evaluation forms' });
  }
});

// Get a specific evaluation form by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const evaluationForm = await EvaluationForm.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!evaluationForm) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }
    
    res.json(evaluationForm);
  } catch (error) {
    console.error('Error fetching evaluation form:', error);
    res.status(500).json({ message: 'Error fetching evaluation form' });
  }
});

// Update an evaluation form
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, targetAudience, questions, status } = req.body;
    
    const evaluationForm = await EvaluationForm.findById(req.params.id);
    
    if (!evaluationForm) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }
    
    // Check if the user is the creator of the form
    if (evaluationForm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this form' });
    }
    
    evaluationForm.title = title;
    evaluationForm.description = description;
    evaluationForm.targetAudience = targetAudience;
    evaluationForm.questions = questions;
    if (status) evaluationForm.status = status;
    
    await evaluationForm.save();
    res.json(evaluationForm);
  } catch (error) {
    console.error('Error updating evaluation form:', error);
    res.status(500).json({ message: 'Error updating evaluation form' });
  }
});

// Delete an evaluation form
router.delete('/:id', auth, async (req, res) => {
  try {
    const evaluationForm = await EvaluationForm.findById(req.params.id);
    
    if (!evaluationForm) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }
    
    // Check if the user is the creator of the form
    if (evaluationForm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this form' });
    }
    
    await evaluationForm.remove();
    res.json({ message: 'Evaluation form deleted successfully' });
  } catch (error) {
    console.error('Error deleting evaluation form:', error);
    res.status(500).json({ message: 'Error deleting evaluation form' });
  }
});

// Update evaluation form status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const evaluationForm = await EvaluationForm.findById(req.params.id);
    
    if (!evaluationForm) {
      return res.status(404).json({ message: 'Evaluation form not found' });
    }
    
    // Check if the user is the creator of the form
    if (evaluationForm.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this form' });
    }
    
    evaluationForm.status = status;
    await evaluationForm.save();
    
    res.json(evaluationForm);
  } catch (error) {
    console.error('Error updating evaluation form status:', error);
    res.status(500).json({ message: 'Error updating evaluation form status' });
  }
});

module.exports = router;
