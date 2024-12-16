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

    // Create evaluation forms if none exist
    let evaluationForms = await EvaluationForm.find({});

    if (evaluationForms.length === 0 && admin) {
      const sampleForms = [
        {
          title: 'Midterm Evaluation',
          description: 'Evaluate the midterm performance of the student.',
          targetAudience: 'student',
          status: 'active',
          questions: [
            { text: 'How well did you understand the course material?', type: 'rating' },
            { text: 'What areas do you feel need improvement?', type: 'text' }
          ],
          createdBy: admin._id,
          date: new Date('2024-01-15'),
          type: 'Evaluation',
          studentId: students[0]._id // Assign to the first student for demonstration
        },
        {
          title: 'Final Exam Feedback',
          description: 'Provide feedback on the final exam.',
          targetAudience: 'student',
          status: 'active',
          questions: [
            { text: 'Was the exam fair and reflective of the course content?', type: 'rating' },
            { text: 'Please provide any additional comments.', type: 'text' }
          ],
          createdBy: admin._id,
          date: new Date('2024-02-20'),
          type: 'Exam',
          studentId: students[1]._id // Assign to the second student for demonstration
        }
      ];

      await EvaluationForm.insertMany(sampleForms);
      console.log('Sample evaluation forms created successfully');
    } else {
      console.log('Evaluation forms already exist, skipping creation.');
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
      
      if (form.targetAudience === 'Student') {
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
      } else if (form.targetAudience === 'student') {
        for (const student of students) {
          console.log(`- Creating response from student: ${student.name}`);
          
          // Create a response for each question
          form.questions.forEach(question => {
            const response = {
              evaluationForm: form._id,
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
