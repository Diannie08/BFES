import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Rating,
  Chip
} from '@mui/material';

const AdminRatings = () => {
  const [ratings, setRatings] = useState([
    {
      id: 1,
      instructor: 'John Doe',
      course: 'Computer Science 101',
      overallRating: 4.5,
      communicationRating: 4.2,
      knowledgeRating: 4.7,
      teachingStyleRating: 4.3,
      semester: 'Fall 2023'
    },
    {
      id: 2,
      instructor: 'Jane Smith',
      course: 'Data Structures',
      overallRating: 4.8,
      communicationRating: 4.9,
      knowledgeRating: 4.6,
      teachingStyleRating: 4.7,
      semester: 'Spring 2024'
    }
  ]);

  return (
    <Box sx={{ 
      bgcolor: '#F0F8FF', 
      minHeight: '100vh', 
      p: 4 
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#1a237e', 
          mb: 4,
          fontWeight: 600 
        }}
      >
        Instructor Ratings
      </Typography>

      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          p: 3, 
          borderRadius: 3 
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Instructor</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Overall Rating</TableCell>
                <TableCell>Communication</TableCell>
                <TableCell>Knowledge</TableCell>
                <TableCell>Teaching Style</TableCell>
                <TableCell>Semester</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ratings.map((rating) => (
                <TableRow key={rating.id}>
                  <TableCell>{rating.instructor}</TableCell>
                  <TableCell>{rating.course}</TableCell>
                  <TableCell>
                    <Chip 
                      label={rating.overallRating} 
                      color="primary" 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Rating 
                      value={rating.communicationRating} 
                      precision={0.1} 
                      readOnly 
                    />
                  </TableCell>
                  <TableCell>
                    <Rating 
                      value={rating.knowledgeRating} 
                      precision={0.1} 
                      readOnly 
                    />
                  </TableCell>
                  <TableCell>
                    <Rating 
                      value={rating.teachingStyleRating} 
                      precision={0.1} 
                      readOnly 
                    />
                  </TableCell>
                  <TableCell>{rating.semester}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminRatings;
