const express = require('express');
const router = express.Router();
const { google } = require('googleapis');
const path = require('path');
const { verifyToken } = require('../middleware/auth');
const fs = require('fs');

// Initialize Google Sheets API with credentials file from config directory
const credentialsPath = path.join(__dirname, '../config/google-sheets-credentials.json');

// Verify credentials file exists
if (!fs.existsSync(credentialsPath)) {
  console.error('Google Sheets credentials file not found at:', credentialsPath);
}

const auth = new google.auth.GoogleAuth({
  keyFile: credentialsPath,
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file'
  ],
});

// Add verifyToken middleware to protect the route
router.post('/google-sheets', verifyToken, async (req, res) => {
  try {
    console.log('Starting Google Sheets export...');
    const { data } = req.body;
    
    if (!data || !Array.isArray(data)) {
      console.error('Invalid data format received:', data);
      return res.status(400).json({ error: 'Invalid data format' });
    }

    console.log('Getting auth client...');
    // Get auth client
    const authClient = await auth.getClient();
    console.log('Auth client obtained successfully');
    
    const sheets = google.sheets({ version: 'v4', auth: authClient });
    const drive = google.drive({ version: 'v3', auth: authClient });
    console.log('APIs initialized');

    // Create a new spreadsheet
    console.log('Creating new spreadsheet...');
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Evaluation Results - ${new Date().toLocaleDateString()}`,
        },
      },
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId;
    console.log('Spreadsheet created with ID:', spreadsheetId);

    // Share the spreadsheet with the user's email
    console.log('Setting file permissions...');
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: {
        role: 'writer',
        type: 'anyone',
      },
    });

    // Get the sheet IDs
    const summarySheetId = spreadsheet.data.sheets[0].properties.sheetId;

    // Create a new sheet for detailed responses
    const createSheetResponse = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: 'Detailed Responses',
              },
            },
          },
        ],
      },
    });

    const detailedSheetId = createSheetResponse.data.replies[0].addSheet.properties.sheetId;

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

    console.log('Updating Summary sheet...');
    // Update Summary sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: summaryData,
      },
    });

    console.log('Updating Detailed Responses sheet...');
    // Update Detailed Responses sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Detailed Responses!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: detailedData,
      },
    });

    console.log('Formatting sheets...');
    // Format the sheets
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            repeatCell: {
              range: {
                sheetId: summarySheetId,
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
                sheetId: detailedSheetId,
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
          // Auto-resize columns in both sheets
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: summarySheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 4,
              },
            },
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: detailedSheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: 4,
              },
            },
          },
        ],
      },
    });

    console.log('Export completed successfully');
    res.json({
      success: true,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}`,
    });
  } catch (error) {
    console.error('Export error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Failed to export to Google Sheets', 
      details: error.message,
      serverError: error.response?.data || error.stack 
    });
  }
});

module.exports = router;
