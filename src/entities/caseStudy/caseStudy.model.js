import mongoose from 'mongoose';

const CaseStudySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    client: { type: String, trim: true },
    duration: { type: String, trim: true },
    teamSize: { type: String, trim: true },
    challenge: { type: String, trim: true },
    solution: { type: String, trim: true },
    technologiesUsed: [{ type: String, trim: true }],
    resultImpact: { type: String, trim: true },
    caseExperience: { type: String, trim: true },
    clientName: { type: String, trim: true },
    companyName: { type: String, trim: true },
    benefit: { type: String, trim: true },
    customer: { type: String, trim: true },
    image: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      url: { type: String },
    },
  },
  { timestamps: true }
);


const CaseStudy = mongoose.models.CaseStudy || mongoose.model('CaseStudy', CaseStudySchema);
export default CaseStudy;

