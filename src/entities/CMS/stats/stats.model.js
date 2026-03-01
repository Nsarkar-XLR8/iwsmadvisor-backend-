import mongoose from "mongoose";

const statItemSchema = new mongoose.Schema(
    {
        order: { type: Number, required: true },
        value: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const statsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        items: { type: [statItemSchema], default: [] },
    },
    { timestamps: true }
);

export const Stats = mongoose.model("Stats", statsSchema);