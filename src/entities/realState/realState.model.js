import mongoose from 'mongoose';

const KeyCapabilitySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitles: [{ type: String, trim: true }],
  },
  { _id: false }
);

const RealStateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subTitle: { type: String, trim: true },
    subtitles: [{ type: String, trim: true }],
    overviewTitle: { type: String, trim: true },
    overview: { type: String, trim: true },
    order: { type: Number, default: 0 },
    keyCapabilities: [KeyCapabilitySchema],
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

const RealState = mongoose.models.RealState || mongoose.model('RealState', RealStateSchema);
export default RealState;

import mongoose from 'mongoose';

const KeyCapabilitySchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitles: [{ type: String, trim: true }],
  },
  { _id: false }
);

const RealStateSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitles: [{ type: String, trim: true }],
    overview: { type: String, trim: true },
    keyCapabilities: [KeyCapabilitySchema],
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

const RealState = mongoose.models.RealState || mongoose.model('RealState', RealStateSchema);
export default RealState;
