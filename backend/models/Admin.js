import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true, default: 'password' },
  value: { type: String, required: true },
}, { collection: 'admin' });

export default mongoose.model('Admin', adminSchema);
