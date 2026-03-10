import mongoose from "mongoose";

const navLinkSchema = new mongoose.Schema(
    {
        order: { type: Number, required: true },
        label: { type: String, required: true, trim: true },
        href: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const navbarSchema = new mongoose.Schema(
    {
        logo: { type: String, required: true },
        navLinks: { type: [navLinkSchema], default: [] },
        ctaButton: {
            label: { type: String, required: true, trim: true },
            href: { type: String, required: true, trim: true },
        },
    },
    { timestamps: true }
);

export const Navbar = mongoose.model("Navbar", navbarSchema);