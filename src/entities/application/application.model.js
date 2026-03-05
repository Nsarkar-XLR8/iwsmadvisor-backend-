import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        resumeCV: { type: String, required: true },
        coverLetter: { type: String, default: "", trim: true },
        portfolioUrl: { type: String, default: "", trim: true },
        linkedinProfile: { type: String, default: "", trim: true },
        isAgreed: { type: Boolean, required: true },
    },
    { timestamps: true }
);

export const Application = mongoose.model("Application", applicationSchema);