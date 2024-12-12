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
  Chip,
  Grid,
  Card,
  CardContent,
  Icon
} from '@mui/material';
import { 
  Event as EventIcon, 
  Today as TodayIcon, 
  Assignment as AssignmentIcon 
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const StudentCalendar = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    // Fetch events for the student
    const fetchEvents = async () => {
      try {
        // Placeholder for API call to fetch events
        // const response = await axios.get(`/api/student/events/${user.id}`);
        // setEvents(response.data);
        
        // Mock data for demonstration
        const allEvents = [
          {
            id: 1,
            title: 'Midterm Evaluation',
            course: 'Computer Science 101',
            date: '2024-01-15',
            type: 'Evaluation',
            status: 'Pending'
          },
          {
            id: 2,
            title: 'Final Exam',
            course: 'Mathematics 202',
            date: '2024-02-20',
            type: 'Exam',
            status: 'Upcoming'
          },
          {
            id: 3,
            title: 'Project Submission',
            course: 'Software Engineering',
            date: '2024-03-10',
            type: 'Assignment',
            status: 'Upcoming'
          }
        ];

        setEvents(allEvents);
        setUpcomingEvents(allEvents.filter(event => 
          event.status === 'Upcoming' || event.status === 'Pending'
        ));
      } catch (error) {
        console.error('Failed to fetch events', error);
      }
    };

    fetchEvents();
  }, [user]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'Pending': return 'warning';
      case 'Upcoming': return 'info';
      case 'Completed': return 'success';
      default: return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch(type) {
      case 'Evaluation': return <AssignmentIcon />;
      case 'Exam': return <TodayIcon />;
      case 'Assignment': return <EventIcon />;
      default: return <EventIcon />;
    }
  };

  return (
    <Box sx={{ 
      height: '100vh',
      width: '100%',
      bgcolor: '#F0F8FF',
      position: 'relative',
      p: 4
    }}>
      <Grid container spacing={3}>
        {/* Upcoming Events Section */}
        <Grid item xs={12} md={8}>
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: '#B0C4DE',
              borderRadius: '20px',
              p: 4
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#1a237e',
                mb: 4,
                fontWeight: 600,
                pl: 1
              }}
            >
              Calendar Events
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {['Event', 'Course', 'Date', 'Type', 'Status'].map((header) => (
                      <TableCell 
                        key={header}
                        sx={{ 
                          color: '#1a237e', 
                          fontWeight: 600 
                        }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {getEventIcon(event.type)}
                          {event.title}
                        </Box>
                      </TableCell>
                      <TableCell>{event.course}</TableCell>
                      <TableCell>{event.date}</TableCell>
                      <TableCell>{event.type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status} 
                          color={getStatusColor(event.status)} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Upcoming Events Highlights */}
        <Grid item xs={12} md={4}>
          <Paper 
            elevation={0}
            sx={{ 
              bgcolor: '#B0C4DE',
              borderRadius: '20px',
              p: 4,
              height: '100%'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#1a237e',
                mb: 3,
                fontWeight: 600
              }}
            >
              Upcoming Events
            </Typography>

            {upcomingEvents.map((event) => (
              <Card 
                key={event.id} 
                sx={{ 
                  mb: 2, 
                  bgcolor: '#F0F8FF',
                  borderRadius: '12px'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {getEventIcon(event.type)}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {event.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.course} | {event.date}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentCalendar;
