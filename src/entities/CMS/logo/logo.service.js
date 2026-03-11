import { Logo } from "./logo.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";
import cloudinary, { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";
import fs from "fs";

// ✅ Helper: safely delete temp file
const deleteTempFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.warn(`Could not delete temp file: ${filePath}`, err.message);
    }
};

/**
 * Create a new logo in the database.
 * - Ensures only one logo exists at a time.
 * - Validates payload.
 * - Uploads to Cloudinary safely.
 */
const createLogoIntoDb = async (payload) => {
    if (!payload || !payload.path) {
        throw new AppError("Logo file is required", HttpStatusCode.BadRequest);
    }

    const existing = await Logo.findOne();
    if (existing) {
        throw new AppError("Logo already exists. Use update instead.", HttpStatusCode.Conflict);
    }

    const uploadResult = await cloudinaryUpload(payload.path, `logo-${Date.now()}`, "logo");

    if (uploadResult === "file upload failed") {
        throw new AppError("Cloudinary upload failed", HttpStatusCode.InternalServerError);
    }

    const payloadData = {
        logo: {
            publicId: uploadResult.public_id,
            url: uploadResult.url,
            secureUrl: uploadResult.secure_url,
        },
    };

    const logo = await Logo.create(payloadData);
    return logo.toObject();
};

/**
 * Get the existing logo from DB
 */
const getLogoFromDb = async () => {
    const logo = await Logo.findOne().lean();
    if (!logo) {
        throw new AppError("Logo not found", HttpStatusCode.NotFound);
    }
    return logo;
};

/**
 * Update existing logo
 * - Uploads new file to Cloudinary
 * - Deletes old logo from Cloudinary
 */
const updateLogoIntoDb = async (payload) => {
    if (!payload || !payload.path) {
        throw new AppError("Logo file is required", HttpStatusCode.BadRequest);
    }

    const existingLogo = await Logo.findOne();
    if (!existingLogo) {
        throw new AppError("Logo not found. Create one first.", HttpStatusCode.NotFound);
    }

    const uploadResult = await cloudinaryUpload(payload.path, `logo-${Date.now()}`, "logo");

    if (uploadResult === "file upload failed") {
        throw new AppError("Cloudinary upload failed", HttpStatusCode.InternalServerError);
    }

    // Delete old logo from Cloudinary safely
    try {
        if (existingLogo.logo && existingLogo.logo.publicId) {
            await cloudinary.uploader.destroy(existingLogo.logo.publicId);
        }
    } catch (err) {
        console.warn("Failed to delete old logo from Cloudinary:", err.message);
    }

    existingLogo.logo = {
        publicId: uploadResult.public_id,
        url: uploadResult.url,
        secureUrl: uploadResult.secure_url,
    };

    await existingLogo.save();
    return existingLogo.toObject();
};

/**
 * Delete logo from DB and Cloudinary
 */
const deleteLogoFromDb = async () => {
    const existingLogo = await Logo.findOne();
    if (!existingLogo) {
        throw new AppError("Logo not found", HttpStatusCode.NotFound);
    }

    // Delete from Cloudinary safely
    try {
        if (existingLogo.logo && existingLogo.logo.publicId) {
            await cloudinary.uploader.destroy(existingLogo.logo.publicId);
        }
    } catch (err) {
        console.warn("Failed to delete logo from Cloudinary:", err.message);
    }

    await Logo.deleteOne({ _id: existingLogo._id });
    return existingLogo.toObject();
};

export const logoService = {
    createLogoIntoDb,
    getLogoFromDb,
    updateLogoIntoDb,
    deleteLogoFromDb,
    deleteTempFile,
};