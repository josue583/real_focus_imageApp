import express from 'express';
import { readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isMongoConnected } from '../db.js';
import Package from '../models/Package.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

async function seedPackagesIfNeeded() {
  if (!isMongoConnected()) return;
  const count = await Package.countDocuments();
  if (count > 0) return;
  const data = readFileSync(path.join(__dirname, '../data/packages.json'), 'utf8');
  const packages = JSON.parse(data);
  await Package.insertMany(packages);
}

function getPackagesFromFile() {
  const data = readFileSync(path.join(__dirname, '../data/packages.json'), 'utf8');
  return JSON.parse(data);
}

router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await seedPackagesIfNeeded();
      const packages = await Package.find().lean();
      res.json(packages);
    } else {
      res.json(getPackagesFromFile());
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load packages' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    if (isMongoConnected()) {
      await seedPackagesIfNeeded();
      const pkg = await Package.findOne({ id: req.params.id }).lean();
      if (!pkg) return res.status(404).json({ error: 'Package not found' });
      res.json(pkg);
    } else {
      const packages = getPackagesFromFile();
      const pkg = packages.find(p => p.id === req.params.id);
      if (!pkg) return res.status(404).json({ error: 'Package not found' });
      res.json(pkg);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load package' });
  }
});

export default router;
