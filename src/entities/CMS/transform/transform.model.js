import mongoose from "mongoose";

const transformSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image1: { type: String, default: "" },
    image2: { type: String, default: "" },
    image3: { type: String, default: "" },

},
    { timestamps: true }
)

export const Transform = mongoose.model("Transform", transformSchema);