const mongoose = require('mongoose');

const evaluationResponseSchema = new mongoose.Schema({
  evaluationForm: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EvaluationForm',
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  answer: {
    type: String
  },
  evaluationPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries
evaluationResponseSchema.index({ evaluationForm: 1, instructor: 1, student: 1 });

const EvaluationResponse = mongoose.model('EvaluationResponse', evaluationResponseSchema);

module.exports = EvaluationResponse;
