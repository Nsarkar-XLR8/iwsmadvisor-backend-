import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subTitle: { type: String, required: true, trim: true },
        btn1: { type: String, required: true, trim: true },
        btn2: { type: String, required: true, trim: true },
        image: { type: String, required: true },
    },
    { timestamps: true }
);

export const Banner = mongoose.model("Banner", bannerSchema);