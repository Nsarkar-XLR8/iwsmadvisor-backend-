import mongoose from "mongoose";

const visionSchema = new mongoose.Schema(
    {
        image:       { type: String, default: "" },
        title:       { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const Vision = mongoose.model("Vision", visionSchema);