import express from 'express';
import { getAdminPassword, setAdminPassword, ensureAdmin } from '../lib/adminPassword.js';

const router = express.Router();

router.post('/verify', async (req, res) => {
  try {
    await ensureAdmin();
    const expected = await getAdminPassword();
    if (!expected) {
      return res.status(503).json({ error: 'Admin not configured' });
    }
    const { password } = req.body || {};
    if (password === expected) {
      return res.json({ ok: true });
    }
    res.status(401).json({ error: 'Invalid password' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/change-password', async (req, res) => {
  try {
    await ensureAdmin();
    const current = await getAdminPassword();
    if (!current) {
      return res.status(503).json({ error: 'Admin not configured' });
    }
    const { currentPassword, newPassword } = req.body || {};
    if (currentPassword !== current) {
      return res.status(401).json({ error: 'Current password is wrong' });
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 4) {
      return res.status(400).json({ error: 'New password must be at least 4 characters' });
    }
    await setAdminPassword(newPassword);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Could not save new password' });
  }
});

export default router;
