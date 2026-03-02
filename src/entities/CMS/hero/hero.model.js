import mongoose from "mongoose";

const heroSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        image: { type: String, required: true },
    },
    { timestamps: true }
);

export const Hero = mongoose.model("Hero", heroSchema);