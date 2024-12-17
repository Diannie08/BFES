const express = require('express');
const router = express.Router();
const CalendarEvent = require('../models/calendar.model');
const { verifyToken } = require('../middleware/auth');

// Get all events
router.get('/', verifyToken, async (req, res) => {
  try {
    const events = await CalendarEvent.find()
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email')
      .sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Get events by date range
router.get('/range', verifyToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    const events = await CalendarEvent.find({
      startDate: { $gte: new Date(start) },
      endDate: { $lte: new Date(end) }
    })
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email')
    .sort({ startDate: 1 });
    res.json(events);
  } catch (error) {
    console.error('Error fetching events by range:', error);
    res.status(500).json({ message: 'Error fetching events', error: error.message });
  }
});

// Create new event
router.post('/', verifyToken, async (req, res) => {
  try {
    const event = new CalendarEvent({
      ...req.body,
      createdBy: req.user._id
    });
    const savedEvent = await event.save();
    const populatedEvent = await CalendarEvent.findById(savedEvent._id)
      .populate('createdBy', 'name email')
      .populate('attendees', 'name email');
    res.status(201).json(populatedEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ message: 'Error creating event', error: error.message });
  }
});

// Update event
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedEvent = await CalendarEvent.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: new Date() },
      { new: true }
    )
    .populate('createdBy', 'name email')
    .populate('attendees', 'name email');
    
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ message: 'Error updating event', error: error.message });
  }
});

// Delete event
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deletedEvent = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ message: 'Error deleting event', error: error.message });
  }
});

module.exports = router;
