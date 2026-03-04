
import mongoose from "mongoose";

const itemsSchema = new mongoose.Schema(
    {
        title:    { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        image:    { type: String, default: "" },
    },
    { timestamps: true }
);

export const Items = mongoose.model("Items", itemsSchema);