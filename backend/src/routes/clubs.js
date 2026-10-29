import { Router } from 'express';
import Club from '../models/Club.js';
const router = Router();
router.get('/', async (req, res, next) => { try { const email = String(req.query.email || '').trim().toLowerCase(); const clubs = await Club.find().sort({ name: 1 }).lean(); res.json(clubs.map(club => ({ ...club, isMember: Boolean(email && (club.memberEmails || []).includes(email)) }))); } catch (e) { next(e); } });
router.post('/', async (req, res, next) => {
  try {
    const { name, category, description, color } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Club name is required.' });
    res.status(201).json(await Club.create({ name, category, description, color }));
  } catch (e) { next(e); }
});
router.put('/:id', async (req, res, next) => { try { const allowed = ['name', 'category', 'description', 'color']; const updates = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key))); const club = await Club.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true }); if (!club) return res.status(404).json({ message: 'Club not found.' }); res.json(club); } catch (e) { next(e); } });
router.delete('/:id', async (req, res, next) => { try { const club = await Club.findByIdAndDelete(req.params.id); if (!club) return res.status(404).json({ message: 'Club not found.' }); res.json({ message: 'Club deleted.' }); } catch (e) { next(e); } });
router.post('/:id/join', async (req, res, next) => {
  try {
    const studentEmail = String(req.body.studentEmail || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(studentEmail)) return res.status(400).json({ message: 'A valid student email is required.' });
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    const currentMembers = club.memberEmails || [];
    if (!currentMembers.includes(studentEmail)) {
      club.memberEmails = [...currentMembers, studentEmail];
      club.members = Math.max(0, club.members) + 1;
      await club.save();
    }
    res.json({ message: 'Club followed successfully.', club: { ...club.toObject(), isMember: true } });
  } catch (e) { next(e); }
});
router.delete('/:id/join', async (req, res, next) => {
  try {
    const studentEmail = String(req.body.studentEmail || '').trim().toLowerCase();
    if (!studentEmail) return res.status(400).json({ message: 'Student email is required.' });
    const club = await Club.findById(req.params.id);
    if (!club) return res.status(404).json({ message: 'Club not found.' });
    const currentMembers = club.memberEmails || [];
    if (currentMembers.includes(studentEmail)) {
      club.memberEmails = currentMembers.filter(email => email !== studentEmail);
      club.members = Math.max(0, club.members - 1);
      await club.save();
    }
    res.json({ message: 'Club unfollowed successfully.', club: { ...club.toObject(), isMember: false } });
  } catch (e) { next(e); }
});
export default router;
