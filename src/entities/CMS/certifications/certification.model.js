import mongoose from "mongoose";

const certificationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        description1: { type: String, required: true, trim: true },
        description2: { type: String, required: true, trim: true },
        description3: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const Certification = mongoose.model("Certification", certificationSchema);