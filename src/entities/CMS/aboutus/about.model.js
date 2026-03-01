import mongoose from "mongoose";

const aboutSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        descriptionTitle: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        btnName: { type: String, required: true, trim: true },
        image: { type: String, required: true },
    },
    { timestamps: true }
);

export const About = mongoose.model("About", aboutSchema);