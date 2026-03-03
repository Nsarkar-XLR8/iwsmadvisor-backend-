import { Strength } from "./strength.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createStrengthIntoDb = async (payload) => {
    // ✅ Check duplicate title
    const existing = await Strength.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Strength with this title already exists", HttpStatusCode.Conflict);

    const strength = await Strength.create(payload);
    return strength;
};

const getAllStrengthsFromDb = async (query) => {
    const {
        page      = 1,
        limit     = 10,
        sortBy    = "createdAt",
        sortOrder = "desc",
    } = query;

    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "title"];
    const safePage      = Math.max(1, Number(page));
    const safeLimit     = Math.min(Math.max(1, Number(limit)), 100);
    const safeSortBy    = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const sort = { [safeSortBy]: safeSortOrder };
    const skip = (safePage - 1) * safeLimit;

    const [totalDocs, strengths] = await Promise.all([
        Strength.countDocuments(),
        Strength.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: strengths,
        meta: {
            totalDocs,
            totalPages,
            currentPage: safePage,
            limit:       safeLimit,
            hasNextPage: safePage < totalPages,
            hasPrevPage: safePage > 1,
        },
    };
};

const getStrengthByIdFromDb = async (id) => {
    const strength = await Strength.findById(id).lean();
    if (!strength) throw new AppError("Strength not found", HttpStatusCode.NotFound);
    return strength;
};

const updateStrengthIntoDb = async (id, payload) => {
    const existingStrength = await Strength.findById(id);
    if (!existingStrength) throw new AppError("Strength not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Strength.findOne({
            title: payload.title.trim(),
            _id:   { $ne: id },
        });
        if (duplicate) throw new AppError("Another strength with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check all fields for changes
    const fields = ["title", "subtitle"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingStrength[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Strength is already up to date", HttpStatusCode.Conflict);

    const updated = await Strength.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteStrengthFromDb = async (id) => {
    const deleted = await Strength.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Strength not found", HttpStatusCode.NotFound);
    return deleted;
};

export const strengthService = {
    createStrengthIntoDb,
    getAllStrengthsFromDb,
    getStrengthByIdFromDb,
    updateStrengthIntoDb,
    deleteStrengthFromDb,
};