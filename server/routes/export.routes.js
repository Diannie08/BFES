const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
require('dotenv').config();

// Initialize Google Sheets API
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

router.post('/google-sheets', async (req, res) => {
  try {
    const { data } = req.body;
    
    // Get auth client
    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: authClient });

    // Create a new spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Evaluation Results - ${new Date().toLocaleDateString()}`,
        },
        sheets: [
          {
            properties: {
              title: 'Summary',
            },
          },
          {
            properties: {
              title: 'Detailed Responses',
            },
          },
        ],
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;

    // Prepare summary data
    const summaryData = [
      ['Instructor', 'Evaluation Form', 'Average Rating', 'Evaluation Period'],
      ...data.map(item => [
        item.instructor,
        item.evaluationForm,
        item.averageRating,
        item.evaluationPeriod
      ])
    ];

    // Prepare detailed data
    const detailedData = [
      ['Instructor', 'Question', 'Rating', 'Comment'],
      ...data.flatMap(item => 
        item.responses.map(response => [
          item.instructor,
          response.question,
          response.rating,
          response.comment
        ])
      )
    ];

    // Update Summary sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Summary!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: summaryData,
      },
    });

    // Update Detailed Responses sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Detailed Responses!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: detailedData,
      },
    });

    // Format the sheets
    const requests = [
      {
        repeatCell: {
          range: {
            sheetId: 0,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
              textFormat: { bold: true },
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)',
        },
      },
      {
        repeatCell: {
          range: {
            sheetId: 1,
            startRowIndex: 0,
            endRowIndex: 1,
          },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.8, green: 0.8, blue: 0.8 },
              textFormat: { bold: true },
            },
          },
          fields: 'userEnteredFormat(backgroundColor,textFormat)',
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests,
      },
    });

    res.json({
      success: true,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export to Google Sheets' });
  }
});

module.exports = router;
