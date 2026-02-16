import 'dotenv/config';
import express from 'express';
import { connectDB, isMongoConnected } from './db.js';
import { ensureAdmin } from './lib/adminPassword.js';
import Package from './models/Package.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import packagesRouter from './routes/packages.js';
import bookingsRouter from './routes/bookings.js';
import uploadRouter from './routes/upload.js';
import galleryRouter from './routes/gallery.js';
import adminRouter from './routes/admin.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/packages', packagesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));

async function start() {
  if (process.env.MONGODB_URI) {
    await connectDB();
    const count = await Package.countDocuments();
    if (count === 0) {
      const { readFileSync } = await import('fs');
      const packagesPath = path.join(__dirname, 'data', 'packages.json');
      try {
        const data = readFileSync(packagesPath, 'utf8');
        const packages = JSON.parse(data);
        await Package.insertMany(packages);
        console.log('Packages seeded from data/packages.json');
      } catch (e) {
        console.warn('Could not seed packages:', e.message);
      }
    }
  }
  await ensureAdmin();

  const server = app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    if (!isMongoConnected()) console.log('Using JSON file storage (no MONGODB_URI)');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Stop the other process or set PORT in .env (e.g. PORT=5001).`);
    } else {
      console.error('Server error:', err.message);
    }
    process.exit(1);
  });
}

start().catch((err) => {
  console.error('Startup failed:', err);
  process.exit(1);
});
