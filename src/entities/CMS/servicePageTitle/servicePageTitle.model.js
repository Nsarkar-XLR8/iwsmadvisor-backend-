import mongoose from "mongoose";

const titleSchema = new mongoose.Schema(
  { title: { type: String, required: true, trim: true } },
  { timestamps: true }
);

export const ServicePageTitle = mongoose.model("ServicePageTitle", titleSchema);