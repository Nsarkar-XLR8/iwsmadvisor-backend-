import mongoose from 'mongoose';

const FaqItemSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true }
  },
);

// const FaqSchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true, trim: true },
//     subtitle: { type: String, trim: true },
//     items: [FaqItemSchema],
//   },
//   { timestamps: true }
// );

const Faq = mongoose.models.Faq || mongoose.model('Faq', FaqItemSchema);
export default Faq;
