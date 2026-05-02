import mongoose from "mongoose";

const careerTitleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subTitle: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const CareerTitle = mongoose.model("CareerTitle", careerTitleSchema);
