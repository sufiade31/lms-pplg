import mongoose from 'mongoose';

const LmsDocSchema = new mongoose.Schema(
  {
    koleksi: { type: String, required: true },
    docId: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, minimize: false }
);
LmsDocSchema.index({ koleksi: 1, docId: 1 }, { unique: true });

export default mongoose.models.LmsDoc || mongoose.model('LmsDoc', LmsDocSchema);