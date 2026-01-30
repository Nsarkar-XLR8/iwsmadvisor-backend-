import mongoose from 'mongoose';

export const CAREER_TYPE_OPTIONS = ['full time', 'part-time', 'freelance'];

const CareerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: { type: String, enum: CAREER_TYPE_OPTIONS, required: true, trim: true },
    description: { type: String, trim: true },
    requirements: { type: String, trim: true },
    responsibilities: { type: String, trim: true },
  },
  { timestamps: true }
);

const Career = mongoose.models.Career || mongoose.model('Career', CareerSchema);
export default Career;
