import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import eventsRouter from './routes/events.js';
import clubsRouter from './routes/clubs.js';
import healthRouter from './routes/health.js';
import { seedStarterData } from './seed.js';

const app = express();
const port = Number(process.env.PORT || 5000);
app.use(cors({ origin: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:5174').split(',').map(x => x.trim()) }));
app.use(express.json({ limit: '1mb' }));
app.get('/', (_req, res) => res.json({ name: 'CampusConnect API', docs: '/api/health' }));
app.use('/api/health', healthRouter);
app.use('/api/events', eventsRouter);
app.use('/api/clubs', clubsRouter);
app.use((req, res) => res.status(404).json({ message: `Route not found: ${req.method} ${req.path}` }));
app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'A record with those details already exists.' });
  res.status(500).json({ message: 'Server error. Check the backend terminal.' });
});

try {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campusconnect');
  console.log('MongoDB connected');
  await seedStarterData();
  app.listen(port, () => console.log(`CampusConnect API running at http://localhost:${port}`));
} catch (error) {
  console.error('Could not connect to MongoDB. Check MONGODB_URI and make sure MongoDB is running.');
  console.error(error.message);
  process.exit(1);
}
