import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Collapse,
  IconButton,
  Rating,
  Divider,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import {
  KeyboardArrowUp as KeyboardArrowUpIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import evaluationService from '../../services/evaluation.service';

const AdminRatings = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await evaluationService.getEvaluationResults();
      setResults(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load evaluation results');
      setLoading(false);
    }
  };

  const calculateAverageRating = (responses) => {
    const ratingResponses = responses.filter(r => r.questionType === 'rating' && r.rating);
    if (ratingResponses.length === 0) return 0;
    const sum = ratingResponses.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / ratingResponses.length).toFixed(2);
  };

  const exportToGoogleSheets = async () => {
    const sheetId = 'YOUR_SHEET_ID'; // Replace with your Google Sheet ID
    const apiKey = 'YOUR_API_KEY'; // Replace with your Google API key

    const data = results.map(result => ({
      instructor: result.instructor.name,
      evaluationForm: result.evaluationForm.title,
      averageRating: calculateAverageRating(result.responses),
      evaluationPeriod: `${result.evaluationPeriod.startDate.substring(0, 10)} to ${result.evaluationPeriod.endDate.substring(0, 10)}`
    }));

    try {
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Sheet1!A1:append?valueInputOption=RAW&key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: data.map(item => [item.instructor, item.evaluationForm, item.averageRating, item.evaluationPeriod])
        })
      });
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data.');
    }
  };

  const Row = ({ result }) => {
    const isExpanded = expandedRow === result._id;
    const averageRating = calculateAverageRating(result.responses);

    return (
      <>
        <TableRow>
          <TableCell>
            <IconButton
              size="small"
              onClick={() => setExpandedRow(isExpanded ? null : result._id)}
            >
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{result.instructor.name}</TableCell>
          <TableCell>{result.evaluationForm.title}</TableCell>
          <TableCell>
            <Box display="flex" alignItems="center">
              <Rating value={Number(averageRating)} precision={0.1} readOnly />
              <Typography variant="body2" ml={1}>
                ({averageRating})
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            {result.evaluationPeriod.startDate.substring(0, 10)} to{' '}
            {result.evaluationPeriod.endDate.substring(0, 10)}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box margin={2}>
                <Typography variant="h6" gutterBottom>
                  Detailed Responses
                </Typography>
                <Grid container spacing={2}>
                  {/* Rating Questions */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Ratings
                        </Typography>
                        {result.responses
                          .filter(response => response.questionType === 'rating')
                          .map((response, index) => (
                            <Box key={index} mb={2}>
                              <Typography variant="body1" gutterBottom>
                                {response.questionText}
                              </Typography>
                              <Box display="flex" alignItems="center">
                                <Rating value={response.rating || 0} readOnly />
                                <Typography variant="body2" ml={1}>
                                  ({response.rating || 'No rating'})
                                </Typography>
                              </Box>
                              <Divider sx={{ my: 1 }} />
                            </Box>
                          ))}
                      </CardContent>
                    </Card>
                  </Grid>
                  {/* Text Responses */}
                  <Grid item xs={12} md={6}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          Comments
                        </Typography>
                        {result.responses
                          .filter(response => response.questionType === 'text')
                          .map((response, index) => (
                            <Box key={index} mb={2}>
                              <Typography variant="body1" gutterBottom>
                                {response.questionText}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {response.answer || 'No response'}
                              </Typography>
                              <Divider sx={{ my: 1 }} />
                            </Box>
                          ))}
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 3, p: 4, mt: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2, color: '#333', fontWeight: 'bold', fontSize: 24 }}>
        Instructor Ratings
      </Typography>
      <Button variant="contained" color="primary" onClick={exportToGoogleSheets} sx={{ mb: 2, bgcolor: '#2196f3', '&:hover': { bgcolor: '#1a237e' }, py: 1, px: 3, fontSize: 16 }}>
        Export to Google Sheets
      </Button>
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2, mt: 2 }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '50px' }} />
              <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>Instructor</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>Evaluation Form</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>Average Rating</TableCell>
              <TableCell sx={{ fontWeight: 'bold', fontSize: 18 }}>Evaluation Period</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results.map((result) => (
              <Row key={result._id} result={result} />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default AdminRatings;
