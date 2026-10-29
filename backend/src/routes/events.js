import { Router } from 'express';
import mongoose from 'mongoose';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
const router = Router();
const validDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(`${value}T00:00:00`));
const validId = (id) => mongoose.isValidObjectId(id);

router.get('/', async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    if (req.query.search) filter.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { location: { $regex: req.query.search, $options: 'i' } },
    ];
    res.json(await Event.find(filter).sort({ date: 1 }));
  } catch (e) { next(e); }
});
router.get('/registrations', async (req, res, next) => {
  try { const email = String(req.query.email || '').trim().toLowerCase(); if (!email) return res.status(400).json({ message: 'Email is required.' }); res.json(await Registration.find({ participantEmail: email }).populate('eventId').sort({ createdAt: -1 })); } catch (e) { next(e); }
});
router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID.' });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (e) { next(e); }
});
router.post('/', async (req, res, next) => {
  try {
    const { title, category, date, time, location, description, organizer } = req.body;
    if (!title?.trim() || !validDate(date) || !location?.trim()) return res.status(400).json({ message: 'Title, date and location are required.' });
    res.status(201).json(await Event.create({ title, category, date, time, location, description, organizer }));
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID.' });
    const allowed = ['title', 'category', 'date', 'time', 'location', 'description', 'organizer'];
    const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
    if (updates.date !== undefined && !validDate(updates.date)) return res.status(400).json({ message: 'Date must be a valid YYYY-MM-DD date.' });
    const event = await Event.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    res.json(event);
  } catch (e) { next(e); }
});
router.delete('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID.' });
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    await Registration.deleteMany({ eventId: event._id });
    res.json({ message: 'Event deleted.' });
  } catch (e) { next(e); }
});
router.post('/:id/register', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID.' });
    const { participantName, participantEmail } = req.body;
    if (!participantName?.trim() || !participantEmail?.trim()) return res.status(400).json({ message: 'Name and email are required.' });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found.' });
    const registration = await Registration.create({ eventId: event._id, participantName, participantEmail });
    const attendeeCount = await Registration.countDocuments({ eventId: event._id });
    await Event.updateOne({ _id: event._id }, { $set: { attendees: attendeeCount } });
    res.status(201).json({ message: 'Registration successful.', registration });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ message: 'This email is already registered for this event.' });
    next(e);
  }
});
router.delete('/:id/register', async (req, res, next) => {
  try { if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid event ID.' }); const email = String(req.body.participantEmail || '').trim().toLowerCase(); if (!email) return res.status(400).json({ message: 'Email is required.' }); const removed = await Registration.findOneAndDelete({ eventId: req.params.id, participantEmail: email }); if (!removed) return res.status(404).json({ message: 'Registration not found.' }); await Event.updateOne({ _id: req.params.id }, { $set: { attendees: await Registration.countDocuments({ eventId: req.params.id }) } }); res.json({ message: 'Registration cancelled.' }); } catch (e) { next(e); }
});
export default router;
