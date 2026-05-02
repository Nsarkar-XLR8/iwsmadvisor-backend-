import mongoose from "mongoose";

const insightSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subTitle: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const Insight = mongoose.model("Insight", insightSchema);
