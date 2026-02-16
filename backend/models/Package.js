import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'RWF' },
  popular: { type: Boolean, default: false },
  features: [{ type: String }],
}, { _id: true });

export default mongoose.model('Package', packageSchema);
