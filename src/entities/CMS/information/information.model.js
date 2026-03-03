import mongoose from "mongoose";

const informationSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        address: { type: String, required: true, trim: true },
        mapUrl: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const Information = mongoose.model("Information", informationSchema);