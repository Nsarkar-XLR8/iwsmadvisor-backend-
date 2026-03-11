import mongoose from "mongoose";

// Define the schema
const logoSchema = new mongoose.Schema(
    {
        logo: {
            publicId: {
                type: String,
                required: true,
                trim: true,
            },
            url: {
                type: String,
                required: true,
                trim: true,
            },
            secureUrl: {
                type: String,
                required: true,
                trim: true,
            },
        },
    },
    {
        timestamps: true,
    }
);

// Create and export the model
export const Logo = mongoose.model("Logo", logoSchema);