import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema(
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

const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema);
export default Blog;
