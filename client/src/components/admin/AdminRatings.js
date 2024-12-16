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
    try {
      setLoading(true);
      const data = results.map(result => ({
        instructor: result.instructor.name,
        evaluationForm: result.evaluationForm.title,
        averageRating: calculateAverageRating(result.responses),
        evaluationPeriod: `${result.evaluationPeriod.startDate.substring(0, 10)} to ${result.evaluationPeriod.endDate.substring(0, 10)}`,
        responses: result.responses.map(response => ({
          question: response.questionText,
          rating: response.rating || 'N/A',
          comment: response.comment || 'N/A'
        }))
      }));

      // Send data to backend
      const response = await fetch('http://localhost:5000/api/export/google-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data })
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const result = await response.json();
      alert('Data exported successfully! Sheet URL: ' + result.spreadsheetUrl);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data: ' + error.message);
    } finally {
      setLoading(false);
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
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 3, p: 4, mt: 4 }}>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h4" gutterBottom sx={{ mt: 2, mb: 2, color: '#333', fontWeight: 'bold', fontSize: 24 }}>
          Instructor Ratings
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={exportToGoogleSheets}
          disabled={loading || results.length === 0}
        >
          {loading ? 'Exporting...' : 'Export to Google Sheets'}
        </Button>
      </Box>
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
