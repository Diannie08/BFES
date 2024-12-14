require('dotenv').config();
const mongoose = require('mongoose');
const EvaluationForm = require('../models/evaluationForm.model');
const EvaluationResponse = require('../models/evaluationResponse.model');
const User = require('../models/user.model');
const connectDB = require('../config/db.config');

const seedEvaluations = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Clear existing responses to avoid duplicates
    await EvaluationResponse.deleteMany({});
    console.log('Cleared existing evaluation responses');

    // Get existing users
    const users = await User.find({});
    const instructors = users.filter(user => user.role === 'instructor');
    const students = users.filter(user => user.role === 'student');
    const admin = users.find(user => user.role === 'admin');

    console.log(`Found ${instructors.length} instructors and ${students.length} students`);

    // Get or create evaluation forms
    let evaluationForms = await EvaluationForm.find({});

    if (evaluationForms.length === 0 && admin) {
      const sampleForm = {
        title: 'Teaching Effectiveness Survey',
        description: 'Evaluate the teaching methods and effectiveness of the instructor',
        targetAudience: 'Student',
        status: 'Active',
        questions: [
          {
            text: 'How well did the instructor explain complex concepts?',
            type: 'rating'
          },
          {
            text: 'How engaging were the class discussions?',
            type: 'rating'
          },
          {
            text: 'What suggestions do you have for improvement?',
            type: 'text'
          }
        ],
        createdBy: admin._id
      };

      const form = new EvaluationForm(sampleForm);
      await form.save();
      evaluationForms = [form];
      console.log('Created sample evaluation form');
    }

    console.log(`Working with ${evaluationForms.length} evaluation forms`);

    // Create responses for each form
    const sampleResponses = [];

    const textAnswers = [
      'The instructor was very helpful and explained concepts clearly.',
      'Classes were engaging and interactive.',
      'The instructor showed great expertise in the subject matter.',
      'I appreciate the real-world examples used in class.',
      'The teaching methods were effective and helped me understand complex topics.'
    ];

    for (const form of evaluationForms) {
      console.log(`Creating responses for form: ${form.title}`);
      
      for (const instructor of instructors) {
        console.log(`- Creating responses for instructor: ${instructor.name}`);
        
        for (const student of students) {
          console.log(`  - Creating response from student: ${student.name}`);
          
          // Create a response for each question
          form.questions.forEach(question => {
            const response = {
              evaluationForm: form._id,
              instructor: instructor._id,
              student: student._id,
              questionId: question._id,
              evaluationPeriod: {
                startDate: new Date('2024-01-01'),
                endDate: new Date('2024-12-31')
              }
            };

            // Add appropriate response based on question type
            if (question.type === 'rating') {
              response.rating = Math.floor(Math.random() * 4) + 2; // Random rating between 2-5
            } else if (question.type === 'text') {
              response.answer = textAnswers[Math.floor(Math.random() * textAnswers.length)];
            }

            sampleResponses.push(response);
          });
        }
      }
    }

    if (sampleResponses.length > 0) {
      console.log(`Inserting ${sampleResponses.length} evaluation responses`);
      await EvaluationResponse.insertMany(sampleResponses);
      console.log('Sample evaluation responses created successfully');
    } else {
      console.log('No responses to insert - please check that you have forms, instructors, and students');
    }

    console.log('Evaluation seeding completed successfully');
    
    // Disconnect from database
    await mongoose.disconnect();
    console.log('Database connection closed');

  } catch (error) {
    console.error('Error seeding evaluations:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the seeder
seedEvaluations();
