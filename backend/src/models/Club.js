import mongoose from 'mongoose';
const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  category: { type: String, default: 'General' },
  description: { type: String, default: '' },
  color: { type: String, default: '#5B4FE8' },
  members: { type: Number, default: 0, min: 0 },
  memberEmails: { type: [String], default: [] },
}, { timestamps: true });
export default mongoose.model('Club', clubSchema);
