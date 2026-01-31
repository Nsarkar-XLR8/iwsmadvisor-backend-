import mongoose from 'mongoose';

const ContactSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '', trim: true },
    service: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    file: {
      filename: { type: String },
      originalName: { type: String },
      mimeType: { type: String },
      size: { type: Number },
      path: { type: String },
    },
  },
  { timestamps: true }
);

const Contact = mongoose.models.Contact || mongoose.model('Contact', ContactSchema);
export default Contact;
