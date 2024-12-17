const nodemailer = require('nodemailer');
const User = require('../models/user.model');

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const emailService = {
  /**
   * Send notification about new evaluation form to all students
   */
  async sendNewFormNotification(formTitle, formDescription, startDate, endDate) {
    try {
      console.log('Attempting to send notification email with:', {
        formTitle,
        formDescription,
        startDate,
        endDate
      });

      // Get all student users
      const students = await User.find({ role: 'student' });
      console.log(`Found ${students.length} students to notify`);
      
      if (!students.length) {
        console.log('No students found to notify');
        return;
      }

      const studentEmails = students.map(student => student.email);
      console.log('Student emails:', studentEmails);
      
      // Format dates if they exist
      const formattedStartDate = startDate ? new Date(startDate).toLocaleDateString() : 'Not specified';
      const formattedEndDate = endDate ? new Date(endDate).toLocaleDateString() : 'Not specified';

      // Email content
      const mailOptions = {
        from: `IES Evaluation System <${process.env.EMAIL_USER}>`,
        bcc: studentEmails, // Use BCC for privacy
        subject: 'New Evaluation Form Available - BukSU IES',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #003366; color: white; padding: 20px; text-align: center;">
              <h2 style="margin: 0;">New Evaluation Form Available</h2>
            </div>
            
            <div style="padding: 20px; background-color: #f9f9f9;">
              <p>Dear Student,</p>
              
              <p>A new evaluation form has been created and requires your attention.</p>
              
              <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <h3 style="color: #003366; margin-top: 0;">Form Details:</h3>
                <ul style="list-style: none; padding: 0;">
                  <li style="margin-bottom: 10px;"><strong>Title:</strong> ${formTitle || 'Not specified'}</li>
                  <li style="margin-bottom: 10px;"><strong>Description:</strong> ${formDescription || 'Not specified'}</li>
                  <li style="margin-bottom: 10px;"><strong>Evaluation Period:</strong><br>${formattedStartDate} to ${formattedEndDate}</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="http://localhost:3000/login" 
                   style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Complete Evaluation
                </a>
              </div>

              <p>Please log in to the system and complete your evaluation before the end date.</p>
              
              <p style="margin-top: 20px;">Best regards,<br>BukSU IES Team</p>
            </div>
            
            <div style="background-color: #f1f1f1; padding: 15px; text-align: center; font-size: 0.9em; color: #666;">
              <p style="margin: 0;">This is an automated message from the BukSU Instructor Evaluation System.</p>
              <p style="margin: 5px 0 0 0;">Please do not reply to this email.</p>
            </div>
          </div>
        `
      };

      // Send email
      console.log('Sending email with options:', mailOptions);
      const info = await transporter.sendMail(mailOptions);
      console.log('Notification emails sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending notification emails:', error);
      throw error;
    }
  }
};

module.exports = emailService;
