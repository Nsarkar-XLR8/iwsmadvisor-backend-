import mongoose from 'mongoose';

const CareerApplicationSchema = new mongoose.Schema(
  {
    careerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Career', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    resumeFile: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String },
    },
    resumeLink: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

const CareerApplication =
  mongoose.models.CareerApplication || mongoose.model('CareerApplication', CareerApplicationSchema);

export default CareerApplication;
