import mongoose from 'mongoose';

export const CAREER_TYPE_OPTIONS = ['full time', 'part-time', 'contract'];

const CareerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    type: {
      type: [
        {
          type: String,
          enum: CAREER_TYPE_OPTIONS,
          trim: true
        }
      ],
      required: true,
      validate: {
        validator: (values) => Array.isArray(values) && values.length > 0,
        message: 'At least one career type is required'
      }
    },
    description: { type: String, trim: true },
    requirements: { type: String, trim: true },
    responsibilities: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    multiplePosition: { type: Boolean, default: false }
  },
  { timestamps: true }
);

const Career = mongoose.models.Career || mongoose.model('Career', CareerSchema);
export default Career;
