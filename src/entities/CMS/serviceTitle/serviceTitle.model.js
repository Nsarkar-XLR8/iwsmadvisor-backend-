import mongoose from "mongoose";

const serviceTitleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subTitle: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const ServiceTitle = mongoose.model("ServiceTitle", serviceTitleSchema);
