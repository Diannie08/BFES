import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Modal,
  Button,
  Grid
} from '@mui/material';
import { 
  EventNote as EventIcon, 
  AccessTime as TimeIcon,
  LocationOn as LocationIcon 
} from '@mui/icons-material';
import evaluationService from '../../services/evaluation.service';

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [evaluationResults, setEvaluationResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Custom date formatting to avoid locale issues
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchResultsByDate = async (date) => {
    setLoading(true);
    try {
      const results = await evaluationService.getEvaluationResultsByDate(date);
      console.log('Fetched results:', results); // Log the results
      setEvaluationResults(results);
    } catch (err) {
      setError('Failed to load evaluation results');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsByDate(selectedDate);
  }, [selectedDate]);

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const handleEventClick = (event) => {
    if (!event || !event.evaluationForm) {
      console.error('Invalid event data:', event);
      return;
    }

    console.log('Event:', event); // Debugging line to check the event structure
    const createdAt = new Date(event.evaluationForm.createdAt);
    const updatedAt = new Date(event.evaluationForm.updatedAt);

    // Check if the dates are valid
    const isValidCreatedAt = !isNaN(createdAt.getTime());
    const isValidUpdatedAt = !isNaN(updatedAt.getTime());

    setSelectedEvent({
      evaluationForm: event.evaluationForm,
      date: isValidCreatedAt && isValidUpdatedAt 
        ? createdAt.toLocaleDateString() + ' - ' + updatedAt.toLocaleDateString() 
        : 'Invalid Date', // Fallback for invalid dates
      status: event.evaluationForm.status,
      ratings: event.ratings || 'No ratings available',
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      bgcolor: '#F0F8FF', 
      minHeight: '100vh', 
      p: 4,
      gap: 4 
    }}>
      {/* Calendar Section */}
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          p: 3, 
          borderRadius: 3,
          width: '60%' 
        }}
      >
        <Typography 
          variant="h5" 
          sx={{ 
            color: '#1a237e', 
            mb: 3,
            fontWeight: 600 
          }}
        >
          Academic Calendar
        </Typography>
        
        <TextField
          label="Select Date"
          type="date"
          value={formatDate(selectedDate)}
          onChange={handleDateChange}
          InputLabelProps={{
            shrink: true,
          }}
          sx={{ width: '100%' }}
        />
      </Paper>

      {/* Events Section */}
      <Paper 
        elevation={0}
        sx={{ 
          bgcolor: 'white', 
          p: 3, 
          borderRadius: 3,
          width: '40%', 
          maxHeight: '1000px', 
          overflowY: 'auto' 
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
          Events on {formatDate(selectedDate)}
        </Typography>

        {loading && <p>Loading...</p>}
        {error && <p>{error}</p>}
        {evaluationResults.length > 0 ? (
          <List>
            {evaluationResults.map((event) => (
              event && event.evaluationForm ? (
                <React.Fragment key={event.id}>
                  <ListItem button onClick={() => handleEventClick(event)}>
                    <ListItemIcon>
                      <EventIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary={event.evaluationForm.title} 
                      secondary={event.startTime + ' - ' + event.endTime} 
                    />
                  </ListItem>
                  <Divider variant="inset" component="li" />
                </React.Fragment>
              ) : null
            ))}
          </List>
        ) : (
          <Typography 
            variant="body2" 
            color="textSecondary" 
            align="center"
          >
            No events scheduled for this date
          </Typography>
        )}
      </Paper>

      {/* Modal for Event Details */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={{ 
          p: 4, 
          bgcolor: 'white', 
          borderRadius: 2, 
          width: '400px', 
          margin: 'auto', 
          mt: '100px', 
          boxShadow: 3 
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Event Details</Typography>
          {selectedEvent && selectedEvent.evaluationForm && (
            <>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Title:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedEvent.evaluationForm.title}</Typography>
              
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Date:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedEvent.date}</Typography>
              
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Status:</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>{selectedEvent.status}</Typography>
              
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>Ratings:</Typography>
              <Typography variant="body2">{selectedEvent.ratings}</Typography>
            </>
          )}
          <Button 
            onClick={handleCloseModal}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Close
          </Button>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminCalendar;
