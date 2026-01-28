import mongoose from 'mongoose';

const CaseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String },
    },
  },
  { timestamps: true }
);

const CaseStudy = mongoose.models.CaseStudy || mongoose.model('CaseStudy', CaseStudySchema);
export default CaseStudy;
