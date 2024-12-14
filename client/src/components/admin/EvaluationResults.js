import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Alert,
  Rating,
  Chip,
  IconButton,
  Collapse,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import {
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
} from '@mui/icons-material';
import evaluationService from '../../services/evaluation.service';

const EvaluationResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState(null);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      setLoading(true);
      const data = await evaluationService.getEvaluationResults();
      setResults(data);
    } catch (err) {
      setError('Failed to load evaluation results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getAverageRating = (responses) => {
    if (!responses || responses.length === 0) return 0;
    const sum = responses.reduce((acc, curr) => acc + parseFloat(curr.rating), 0);
    return (sum / responses.length).toFixed(1);
  };

  const Row = ({ result }) => {
    const isExpanded = expandedRow === result._id;

    return (
      <>
        <TableRow 
          sx={{ 
            '&:hover': { bgcolor: 'action.hover' },
            cursor: 'pointer',
          }}
          onClick={() => setExpandedRow(isExpanded ? null : result._id)}
        >
          <TableCell>
            <IconButton size="small">
              {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell>{result.evaluationForm.title}</TableCell>
          <TableCell>{result.instructor.name}</TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Rating value={parseFloat(getAverageRating(result.responses))} readOnly precision={0.1} />
              <Typography variant="body2">
                ({getAverageRating(result.responses)})
              </Typography>
            </Box>
          </TableCell>
          <TableCell>
            <Chip 
              label={`${result.responses.length} responses`}
              color="primary"
              size="small"
            />
          </TableCell>
          <TableCell>{new Date(result.evaluationPeriod.endDate).toLocaleDateString()}</TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Detailed Responses
                </Typography>
                <Grid container spacing={3}>
                  {result.evaluationForm.questions.map((question, index) => (
                    <Grid item xs={12} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle1" gutterBottom>
                            {question.text}
                          </Typography>
                          <Divider sx={{ my: 1 }} />
                          {question.type === 'rating' ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Rating 
                                value={parseFloat(getAverageRating(
                                  result.responses.filter(r => r.questionId === question._id)
                                ))} 
                                readOnly 
                                precision={0.1} 
                              />
                              <Typography variant="body2" color="text.secondary">
                                Average Rating: {getAverageRating(
                                  result.responses.filter(r => r.questionId === question._id)
                                )}
                              </Typography>
                            </Box>
                          ) : (
                            <Box>
                              {result.responses
                                .filter(r => r.questionId === question._id)
                                .map((response, idx) => (
                                  <Typography key={idx} variant="body2" color="text.secondary">
                                    • {response.answer}
                                  </Typography>
                                ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
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
      <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Evaluation Results
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width={50} />
              <TableCell>Form Title</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Average Rating</TableCell>
              <TableCell>Responses</TableCell>
              <TableCell>Evaluation Date</TableCell>
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

export default EvaluationResults;
