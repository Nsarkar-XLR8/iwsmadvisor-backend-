import mongoose from "mongoose";

const numberItemSchema = new mongoose.Schema(
    {
        order: { type: Number, required: true },
        value: { type: String, required: true, trim: true },
        label: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const numberSchema = new mongoose.Schema(
    {
        items: { type: [numberItemSchema], default: [] },
    },
    { timestamps: true }
);

// ✅ Renamed to NumberSection to avoid conflict with JS built-in Number
export const NumberSection = mongoose.model("Number", numberSchema);