import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, enum: ['Event', 'Hackathon', 'Workshop', 'Club Meet', 'News'], default: 'Event' },
  date: { type: String, required: true, match: /^\d{4}-\d{2}-\d{2}$/ },
  time: { type: String, default: '' },
  location: { type: String, required: true, trim: true },
  description: { type: String, default: '', maxlength: 2000 },
  organizer: { type: String, default: 'CampusConnect' },
  attendees: { type: Number, default: 0, min: 0 },
}, { timestamps: true });
eventSchema.index({ date: 1, category: 1 });

export default mongoose.model('Event', eventSchema);
