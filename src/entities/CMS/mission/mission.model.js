import mongoose from "mongoose";

const missionSchema = new mongoose.Schema(
    {
        image: { type: String, default: "" },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const Mission = mongoose.model("Mission", missionSchema);