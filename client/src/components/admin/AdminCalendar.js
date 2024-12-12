import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField
} from '@mui/material';
import { 
  EventNote as EventIcon, 
  AccessTime as TimeIcon,
  LocationOn as LocationIcon 
} from '@mui/icons-material';

const AdminCalendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([
    {
      id: 1,
      title: 'Faculty Meeting',
      date: new Date(2024, 0, 15),
      time: '10:00 AM',
      location: 'Conference Room A'
    },
    {
      id: 2,
      title: 'Student Evaluation Workshop',
      date: new Date(2024, 0, 20),
      time: '2:00 PM',
      location: 'Lecture Hall 3'
    },
    {
      id: 3,
      title: 'Department Review',
      date: new Date(2024, 0, 25),
      time: '9:30 AM',
      location: 'Admin Building'
    }
  ]);

  // Custom date formatting to avoid locale issues
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setSelectedDate(newDate);
  };

  const filteredEvents = events.filter(event => 
    event.date.toDateString() === selectedDate.toDateString()
  );

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
          width: '40%' 
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

        {filteredEvents.length > 0 ? (
          <List>
            {filteredEvents.map((event) => (
              <React.Fragment key={event.id}>
                <ListItem>
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={event.title}
                    secondary={
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TimeIcon fontSize="small" />
                          {event.time}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" />
                          {event.location}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
                <Divider variant="inset" component="li" />
              </React.Fragment>
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
    </Box>
  );
};

export default AdminCalendar;
