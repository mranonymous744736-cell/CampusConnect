import mongoose from 'mongoose';
const registrationSchema = new mongoose.Schema({
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  participantName: { type: String, required: true, trim: true },
  participantEmail: { type: String, required: true, trim: true, lowercase: true },
}, { timestamps: true });
registrationSchema.index({ eventId: 1, participantEmail: 1 }, { unique: true });
export default mongoose.model('Registration', registrationSchema);
