import mongoose from "mongoose";

const expertiseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        description1: { type: String, required: true, trim: true },
        description2: { type: String, required: true, trim: true },
        description3: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const Expertise = mongoose.model("Expertise", expertiseSchema);