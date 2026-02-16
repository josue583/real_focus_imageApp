import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isMongoConnected } from '../db.js';
import Admin from '../models/Admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const adminPath = path.join(__dirname, '../data/admin.json');

function readFromFile() {
  try {
    const data = fs.readFileSync(adminPath, 'utf8');
    const obj = JSON.parse(data);
    return obj.password != null ? String(obj.password) : null;
  } catch {
    return null;
  }
}

/**
 * Get the current admin password (async when using MongoDB).
 * Uses MongoDB Admin collection if connected, else data/admin.json or process.env.ADMIN_PASSWORD.
 */
export async function getAdminPassword() {
  if (isMongoConnected()) {
    const doc = await Admin.findOne({ key: 'password' }).lean();
    if (doc && doc.value) return String(doc.value);
    return process.env.ADMIN_PASSWORD || null;
  }
  const fromFile = readFromFile();
  if (fromFile) return fromFile;
  return process.env.ADMIN_PASSWORD || null;
}

/**
 * Ensure admin password exists: create data/admin.json from .env when not using MongoDB,
 * or ensure one Admin doc in MongoDB when using MongoDB.
 */
export async function ensureAdmin() {
  if (isMongoConnected()) {
    const existing = await Admin.findOne({ key: 'password' });
    if (existing) return;
    const envPass = process.env.ADMIN_PASSWORD;
    if (envPass) await Admin.create({ key: 'password', value: envPass });
    return;
  }
  try {
    if (fs.existsSync(adminPath)) return;
    const envPass = process.env.ADMIN_PASSWORD;
    if (!envPass) return;
    const dir = path.dirname(adminPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(adminPath, JSON.stringify({ password: envPass }, null, 2));
  } catch (_) {}
}

/**
 * Update the admin password. Caller must have verified current password.
 */
export async function setAdminPassword(newPassword) {
  if (isMongoConnected()) {
    await Admin.findOneAndUpdate(
      { key: 'password' },
      { $set: { value: newPassword } },
      { upsert: true }
    );
    return;
  }
  const dir = path.dirname(adminPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(adminPath, JSON.stringify({ password: newPassword }, null, 2));
}
