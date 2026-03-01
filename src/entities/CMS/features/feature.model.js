import mongoose from "mongoose";

const featureItemSchema = new mongoose.Schema(
    {
        icon: { type: String, default: "" },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const featuresSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        items: { type: [featureItemSchema], default: [] },
    },
    { timestamps: true }
);

export const Features = mongoose.model("Features", featuresSchema);