import mongoose from "mongoose";

const navLinkSchema = new mongoose.Schema(
    {
        order: { type: Number, required: true },
        label: { type: String, trim: true },
        href: { type: String, trim: true },
    },
    { _id: false }
);

const navbarSchema = new mongoose.Schema(
    {
        logo: { type: String, required: true },
        navLinks: { type: [navLinkSchema], default: [] },
        ctaButton: {
            label: { type: String, trim: true },
            href: { type: String, trim: true },
        },
    },
    { timestamps: true }
);

export const Navbar = mongoose.model("Navbar", navbarSchema);