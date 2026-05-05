import mongoose from "mongoose";

const faqNewSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const FAQNew = mongoose.model("FAQNew", faqNewSchema);
