import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { requireAdmin } from '../middleware/adminAuth.js';
import { isMongoConnected } from '../db.js';
import GalleryItem from '../models/GalleryItem.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const uploadsDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, `adv-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /image\/(jpeg|jpg|png|gif|webp)/;
    if (allowed.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only images (jpeg, png, gif, webp) are allowed'));
  },
});

router.post('/', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/uploads/${req.file.filename}`;
    const title = req.body.title || '';

    if (isMongoConnected()) {
      const item = await GalleryItem.create({
        filename: req.file.filename,
        url,
        title,
      });
      const out = item.toJSON();
      return res.status(201).json(out);
    }

    const galleryPath = path.join(__dirname, '../data/gallery.json');
    let gallery = [];
    try {
      const data = fs.readFileSync(galleryPath, 'utf8');
      gallery = JSON.parse(data);
    } catch (_) {}
    const item = {
      id: Date.now().toString(),
      filename: req.file.filename,
      url,
      title,
      createdAt: new Date().toISOString(),
    };
    gallery.push(item);
    fs.writeFileSync(galleryPath, JSON.stringify(gallery, null, 2));
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Upload failed' });
  }
});

export default router;
