import mongoose from "mongoose";

const strengthSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const Strength = mongoose.model("Strength", strengthSchema);