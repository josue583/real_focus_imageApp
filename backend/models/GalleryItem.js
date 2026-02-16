import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  url: { type: String, required: true },
  title: { type: String, default: '' },
}, { timestamps: true });

galleryItemSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

export default mongoose.model('GalleryItem', galleryItemSchema);
