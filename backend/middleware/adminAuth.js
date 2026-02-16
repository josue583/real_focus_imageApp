import { getAdminPassword } from '../lib/adminPassword.js';

/**
 * Protects routes so only the studio owner (admin) can upload or delete.
 * Client must send the admin password in header: X-Admin-Password
 */
export async function requireAdmin(req, res, next) {
  try {
    const password = await getAdminPassword();
    if (!password) {
      return res.status(503).json({ error: 'Admin not configured. Set ADMIN_PASSWORD in .env' });
    }
    const sent = req.headers['x-admin-password'];
    if (sent !== password) {
      return res.status(401).json({ error: 'Unauthorized. Studio owner access only.' });
    }
    next();
  } catch (err) {
    next(err);
  }
}
