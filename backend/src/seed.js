import Event from './models/Event.js';
import Club from './models/Club.js';

export async function seedStarterData() {
  const dateKey = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  if (await Event.countDocuments() === 0) {
    const today = new Date();
    const dateAfter = (days) => { const d = new Date(today); d.setDate(d.getDate() + days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
    await Event.insertMany([
      { title: 'TechNova 2026', category: 'Event', date: dateAfter(4), time: '10:00 AM', location: 'Main Auditorium', description: 'A day of technology talks, demos and student showcases.', organizer: 'Tech Club' },
      { title: 'CodeSprint 2026', category: 'Hackathon', date: dateAfter(9), time: '9:00 AM', location: 'Innovation Lab', description: '24-hour coding challenge. Build. Solve. Win.', organizer: 'Coding Club' },
      { title: 'AI in Everyday Life', category: 'Workshop', date: dateAfter(14), time: '2:00 PM', location: 'Seminar Hall', description: 'Hands-on session exploring practical AI tools and trends.', organizer: 'AI Club' },
      { title: 'Photography Walk', category: 'Club Meet', date: dateAfter(20), time: '5:00 PM', location: 'Campus Garden', description: 'Capture campus stories and learn mobile photography techniques.', organizer: 'Photography Club' },
    ]);
    console.log('Inserted starter events into MongoDB.');
  }
  // Older versions seeded fixed dates, which eventually fell into the past.
  // Move only the four known demo events forward; leave user-created events untouched.
  const todayKey = dateKey(new Date());
  const demoOffsets = new Map([['TechNova 2026', 4], ['CodeSprint 2026', 9], ['AI in Everyday Life', 14], ['Photography Walk', 20]]);
  for (const [title, days] of demoOffsets) {
    const event = await Event.findOne({ title });
    if (event && String(event.date || '') < todayKey) {
      const next = new Date(); next.setDate(next.getDate() + days);
      event.date = dateKey(next);
      await event.save();
    }
  }
  if (await Club.countDocuments() === 0) {
    await Club.insertMany([
      { name: 'Coding Club', category: 'Technology', description: 'Programming, projects, competitive coding and developer meetups.', color: '#2563EB', members: 120 },
      { name: 'Photography Club', category: 'Arts', description: 'Photo walks, editing sessions and campus storytelling.', color: '#16A34A', members: 85 },
      { name: 'Literary Club', category: 'Literature', description: 'Poetry, writing circles, debates and book discussions.', color: '#4F46E5', members: 70 },
      { name: 'Entrepreneurship Cell', category: 'Business', description: 'Startup ideas, founder talks, pitching and innovation.', color: '#9333EA', members: 95 },
      { name: 'Music Club', category: 'Arts', description: 'Jam sessions, open mics and musical performances.', color: '#DB2777', members: 60 },
      { name: 'Drama Club', category: 'Arts', description: 'Theatre, acting workshops and stage productions.', color: '#EA580C', members: 40 },
    ]);
    console.log('Inserted starter clubs into MongoDB.');
  }
}
