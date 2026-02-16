import express from 'express';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAdmin } from '../middleware/adminAuth.js';
import { isMongoConnected } from '../db.js';
import GalleryItem from '../models/GalleryItem.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const galleryPath = path.join(__dirname, '../data/gallery.json');
const uploadsDir = path.join(__dirname, '../uploads');

function getGalleryFromFile() {
  try {
    const data = readFileSync(galleryPath, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveGalleryToFile(items) {
  writeFileSync(galleryPath, JSON.stringify(items, null, 2));
}

router.get('/', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const items = await GalleryItem.find().sort({ createdAt: 1 }).lean();
      const withId = items.map(i => ({ ...i, id: i._id.toString(), createdAt: i.createdAt?.toISOString?.() || i.createdAt }));
      res.json(withId);
    } else {
      res.json(getGalleryFromFile());
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to load gallery' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { filename, url, title } = req.body;
    if (!filename || !url) {
      return res.status(400).json({ error: 'filename and url required' });
    }
    if (isMongoConnected()) {
      const item = await GalleryItem.create({ filename, url, title: title || '' });
      const out = item.toJSON();
      res.status(201).json(out);
    } else {
      const gallery = getGalleryFromFile();
      const item = {
        id: Date.now().toString(),
        filename,
        url,
        title: title || '',
        createdAt: new Date().toISOString(),
      };
      gallery.push(item);
      saveGalleryToFile(gallery);
      res.status(201).json(item);
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to add gallery item' });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const item = await GalleryItem.findById(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      if (item.filename && existsSync(path.join(uploadsDir, item.filename))) {
        try {
          unlinkSync(path.join(uploadsDir, item.filename));
        } catch (_) {}
      }
      await GalleryItem.findByIdAndDelete(req.params.id);
      return res.json({ deleted: req.params.id });
    }
    const gallery = getGalleryFromFile();
    const item = gallery.find(g => g.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (item.filename && existsSync(path.join(uploadsDir, item.filename))) {
      try {
        unlinkSync(path.join(uploadsDir, item.filename));
      } catch (_) {}
    }
    const updated = gallery.filter(g => g.id !== req.params.id);
    saveGalleryToFile(updated);
    res.json({ deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

export default router;
