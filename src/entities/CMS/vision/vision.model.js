import mongoose from "mongoose";

// ✅ Mission & Vision card
const missionVisionSchema = new mongoose.Schema(
    {
        icon: { type: String, default: "" },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { _id: false }
);

// ✅ Core Strength item — icon, title, description
const coreStrengthItemSchema = new mongoose.Schema(
    {
        icon: { type: String, default: "" },
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
    },
    { _id: false }
);

// ✅ Core Strengths section
const coreStrengthsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        items: { type: [coreStrengthItemSchema], default: [] },
    },
    { _id: false }
);

// ✅ Simple item — title only (Certifications & Expertise)
const simpleItemSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, default: "" },
    },
    { _id: false }
);

// ✅ Certifications section
const certificationsSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        items: { type: [simpleItemSchema], default: [] },
    },
    { _id: false }
);

// ✅ Expertise section
const expertiseSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subtitle: { type: String, required: true, trim: true },
        items: { type: [simpleItemSchema], default: [] },
    },
    { _id: false }
);

// ✅ Main Vision schema — singleton
const visionSchema = new mongoose.Schema(
    {
        mission: { type: missionVisionSchema, required: true },
        vision: { type: missionVisionSchema, required: true },
        coreStrengths: { type: coreStrengthsSchema, required: true },
        certifications: { type: certificationsSchema, required: true },
        expertise: { type: expertiseSchema, required: true },
    },
    { timestamps: true }
);

export const Vision = mongoose.model("Vision", visionSchema);