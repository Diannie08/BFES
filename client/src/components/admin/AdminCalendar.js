import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import axios from 'axios';
import {
  Box,
  Typography,
  Modal,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const GOOGLE_CALENDAR_API_KEY = 'AIzaSyAf5w8J0bVOBYKlUfvRCfnokOoCXpfPx6U';
const CALENDAR_ID = 'en.philippine#holiday@group.v.calendar.google.com';

const AdminCalendar = () => {
  const [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    start: new Date(),
    end: new Date(),
    type: 'other',
    location: '',
  });
  const [error, setError] = useState('');

  const eventStyleGetter = (event) => {
    const style = {
      backgroundColor: '#1976d2',
      borderRadius: '4px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block',
      padding: '4px 8px',
      fontSize: '14px',
      fontWeight: '500',
      marginTop: '2px',
      marginBottom: '2px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: 'pointer'
    };

    // Different colors for different event types
    if (event.type === 'holiday') {
      style.backgroundColor = '#e74c3c';
    } else if (event.type === 'evaluation') {
      style.backgroundColor = '#1976d2';
    }

    return { style };
  };

  const fetchGoogleCalendarHolidays = async () => {
    try {
      // Get dates for the entire year
      const now = new Date();
      const timeMin = new Date(now.getFullYear(), 0, 1).toISOString();
      const timeMax = new Date(now.getFullYear() + 1, 0, 0).toISOString();
      
      console.log('Fetching holidays between:', timeMin, 'and', timeMax);
      
      const response = await axios.get(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events`,
        {
          params: {
            key: GOOGLE_CALENDAR_API_KEY,
            timeMin,
            timeMax,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 100
          },
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GOOGLE_CALENDAR_API_KEY}`
          }
        }
      );

      console.log('Holiday response:', response.data);

      const holidays = response.data.items.map(event => ({
        id: event.id,
        title: `🎉 ${event.summary}`,
        description: event.description || 'Public Holiday',
        start: new Date(event.start.date || event.start.dateTime),
        end: new Date(event.end.date || event.end.dateTime),
        type: 'holiday',
        resource: 'holiday',
        allDay: Boolean(event.start.date)
      }));

      console.log('Processed holidays:', holidays);
      return holidays;
    } catch (err) {
      console.error('Error fetching holidays:', err.response?.data || err.message);
      return [];
    }
  };

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      // Fetch both evaluation events and holidays
      const [evaluationResponse, holidays] = await Promise.all([
        axios.get('/api/evaluation', config),
        fetchGoogleCalendarHolidays()
      ]);

      // Format evaluation events
      const evaluationEvents = evaluationResponse.data.map((evaluation, index) => {
        const startDate = new Date(2024, 11, 17 + (index * 2));
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);

        return {
          id: evaluation._id,
          title: evaluation.title,
          description: evaluation.description || 'No description provided',
          start: startDate,
          end: endDate,
          type: 'evaluation',
          resource: 'evaluation'
        };
      });

      // Combine both types of events
      const allEvents = [...evaluationEvents, ...holidays];
      console.log('All events:', allEvents);
      setEvents(allEvents);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSelectSlot = ({ start, end }) => {
    setNewEvent(prev => ({
      ...prev,
      start,
      end,
    }));
    setModalOpen(true);
  };

  const handleSelectEvent = (event) => {
    console.log('Selected event:', event);
  };

  const handleNewEventSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };

      const eventData = {
        ...newEvent,
        startDate: newEvent.start,
        endDate: newEvent.end,
      };
      await axios.post('/api/calendar', eventData, config);
      setModalOpen(false);
      setNewEvent({
        title: '',
        description: '',
        start: new Date(),
        end: new Date(),
        type: 'other',
        location: '',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
    }
  };

  return (
    <Box sx={{ height: '100vh', p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Calendar</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Add Event
        </Button>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box sx={{ height: 'calc(100vh - 150px)' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          selectable
          eventPropGetter={eventStyleGetter}
          views={['month', 'week', 'day']}
          defaultView="month"
          style={{ height: '100%' }}
          tooltipAccessor={event => `${event.title}\n${event.description}`}
          popup
          step={60}
          timeslots={1}
          components={{
            event: (props) => (
              <div title={`${props.title}\n${props.event.description}`}>
                <strong>{props.title}</strong>
              </div>
            )
          }}
        />
      </Box>

      {/* Add Event Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        aria-labelledby="add-event-modal"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Add New Event</Typography>
            <IconButton onClick={() => setModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <form onSubmit={handleNewEventSubmit}>
            <Stack spacing={2}>
              <TextField
                fullWidth
                label="Title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
              />
              <TextField
                fullWidth
                label="Location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={newEvent.type}
                  label="Type"
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value })}
                  required
                >
                  <MenuItem value="evaluation">Evaluation</MenuItem>
                  <MenuItem value="meeting">Meeting</MenuItem>
                  <MenuItem value="holiday">Holiday</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Start Date"
                type="datetime-local"
                value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewEvent({ ...newEvent, start: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <TextField
                fullWidth
                label="End Date"
                type="datetime-local"
                value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                onChange={(e) => setNewEvent({ ...newEvent, end: new Date(e.target.value) })}
                InputLabelProps={{ shrink: true }}
                required
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                fullWidth
              >
                Add Event
              </Button>
            </Stack>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default AdminCalendar;
