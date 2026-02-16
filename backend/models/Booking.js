import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  packageId: { type: String, required: true },
  packageName: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'RWF' },
  name: { type: String, required: true },
  email: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  date: { type: String, required: true },
  time: { type: String, default: '' },
  notes: { type: String, default: '' },
}, { timestamps: true });

bookingSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('Booking', bookingSchema);
