import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
  },
  { _id: false }
);

const ServicePageSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true },
    subtitles: [{ type: String, trim: true }],
    title: { type: String, trim: true },
    guideline: { type: String, trim: true },
    description: { type: String, trim: true },
    image: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String },
    },
    faq: [FaqSchema],
  },
  { timestamps: true }
);

const ServicePage = mongoose.models.ServicePage || mongoose.model('ServicePage', ServicePageSchema);
export default ServicePage;
