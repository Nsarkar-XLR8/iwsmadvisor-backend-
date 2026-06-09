import mongoose from "mongoose";

const titleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const ServicePageTitle = mongoose.model("ServicePageTitle", titleSchema);