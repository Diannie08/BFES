const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['rating', 'text', 'multiple_choice'],
    default: 'rating',
  },
  options: [{
    type: String,
  }],
});

const evaluationFormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  targetAudience: {
    type: String,
    enum: ['student', 'peer', 'self'],
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive'],
    default: 'draft',
  },
  questions: [questionSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

evaluationFormSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const EvaluationForm = mongoose.model('EvaluationForm', evaluationFormSchema);
module.exports = EvaluationForm;
