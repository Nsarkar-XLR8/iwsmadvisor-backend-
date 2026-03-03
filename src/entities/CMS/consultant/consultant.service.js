import { Consultant } from "./consultant.model.js";
import { HttpStatusCode } from "axios";
import { AppError } from "../../../errors/AppError.js";

/**
 * Create a new Consultant
 * Includes check for identical content to prevent duplicates.
 */
const createConsultantIntoDb = async (payload) => {
    const existing = await Consultant.findOne({
        title: payload.title?.trim(),
        description: payload.description?.trim(),
        btnName: payload.btnName?.trim(),
    }).lean();

    if (existing) {
        throw new AppError("A consultant with the same content already exists", HttpStatusCode.Conflict);
    }

    return await Consultant.create(payload);
};

/**
 * Get all Consultants
 * Optimized with .lean() for faster execution and less memory overhead.
 */
const getAllConsultantsFromDb = async () => {
    return await Consultant.find()
        .sort({ createdAt: -1 })
        .lean();
};

/**
 * Get Single Consultant by ID
 */
const getConsultantByIdFromDb = async (id) => {
    const consultant = await Consultant.findById(id).lean();
    if (!consultant) {
        throw new AppError("Consultant not found", HttpStatusCode.NotFound);
    }
    return consultant;
};

/**
 * Update Consultant
 * Optimized to prevent redundant writes if no data has changed.
 */
const updateConsultantIntoDb = async (id, payload) => {
    const existing = await Consultant.findById(id);
    if (!existing) {
        throw new AppError("Consultant not found", HttpStatusCode.NotFound);
    }

    // ✅ Detect redundant updates (No changes check)
    const fields = ["title", "description", "btnName"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true; // skip fields not in payload
        return payload[field]?.trim?.() === existing[field]?.trim?.();
    });

    if (isSame) {
        throw new AppError("No changes detected. Consultant is already up to date", HttpStatusCode.Conflict);
    }

    // ✅ Prevent duplicate conflicts (same title/description combination elsewhere)
    if (payload.title || payload.description) {
        const duplicate = await Consultant.findOne({
            _id: { $ne: id },
            title: payload.title?.trim() || existing.title,
            description: payload.description?.trim() || existing.description,
        }).lean();

        if (duplicate) {
            throw new AppError("Another consultant with the same title and description already exists", HttpStatusCode.Conflict);
        }
    }

    const updated = await Consultant.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

/**
 * Delete Consultant
 */
const deleteConsultantFromDb = async (id) => {
    const deleted = await Consultant.findByIdAndDelete(id);
    if (!deleted) {
        throw new AppError("Consultant not found", HttpStatusCode.NotFound);
    }
    return deleted;
};

export const consultantService = {
    createConsultantIntoDb,
    getAllConsultantsFromDb,
    getConsultantByIdFromDb,
    updateConsultantIntoDb,
    deleteConsultantFromDb,
};