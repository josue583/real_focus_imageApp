import express from 'express';
import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isMongoConnected } from '../db.js';
import Booking from '../models/Booking.js';
import Package from '../models/Package.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const bookingsPath = path.join(__dirname, '../data/bookings.json');
const packagesPath = path.join(__dirname, '../data/packages.json');

function getBookingsFromFile() {
  try {
    const data = readFileSync(bookingsPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function getPackagesFromFile() {
  const data = readFileSync(packagesPath, 'utf8');
  return JSON.parse(data);
}

function saveBookingsToFile(bookings) {
  writeFileSync(bookingsPath, JSON.stringify(bookings, null, 2));
}

router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const bookings = await Booking.find().sort({ createdAt: -1 }).lean();
      const withId = bookings.map(b => ({ ...b, id: b._id.toString() }));
      res.json(withId);
    } else {
      res.json(getBookingsFromFile());
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load bookings' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { packageId, name, email, whatsapp, date, time, notes } = req.body;
    if (!packageId || !name || !date) {
      return res.status(400).json({ error: 'Package, name and date are required' });
    }

    if (isMongoConnected()) {
      const pkg = await Package.findOne({ id: packageId }).lean();
      if (!pkg) return res.status(400).json({ error: 'Invalid package' });
      const booking = await Booking.create({
        packageId,
        packageName: pkg.name,
        price: pkg.price,
        currency: pkg.currency || 'RWF',
        name,
        email: email || '',
        whatsapp: whatsapp || '',
        date,
        time: time || '',
        notes: (notes || '').slice(0, 2000),
      });
      const out = booking.toJSON();
      res.status(201).json(out);
    } else {
      const packages = getPackagesFromFile();
      const pkg = packages.find(p => p.id === packageId);
      if (!pkg) return res.status(400).json({ error: 'Invalid package' });
      const bookings = getBookingsFromFile();
      const booking = {
        id: Date.now().toString(),
        packageId,
        packageName: pkg.name,
        price: pkg.price,
        currency: pkg.currency,
        name,
        email: email || '',
        whatsapp: whatsapp || '',
        date,
        time: time || '',
        notes: (notes || '').slice(0, 2000),
        createdAt: new Date().toISOString(),
      };
      bookings.push(booking);
      saveBookingsToFile(bookings);
      res.status(201).json(booking);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

export default router;
