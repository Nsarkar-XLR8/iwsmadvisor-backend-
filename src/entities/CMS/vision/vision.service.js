import { Vision } from "./vision.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createVisionIntoDb = async (payload) => {
    // ✅ Check duplicate title
    const existing = await Vision.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Vision with this title already exists", HttpStatusCode.Conflict);

    const vision = await Vision.create(payload);
    return vision;
};

const getAllVisionsFromDb = async (query) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "title"];
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(Math.max(1, Number(limit)), 100);
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const sort = { [safeSortBy]: safeSortOrder };
    const skip = (safePage - 1) * safeLimit;

    const [totalDocs, visions] = await Promise.all([
        Vision.countDocuments(),
        Vision.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: visions,
        meta: {
            totalDocs,
            totalPages,
            currentPage: safePage,
            limit: safeLimit,
            hasNextPage: safePage < totalPages,
            hasPrevPage: safePage > 1,
        },
    };
};

const getVisionByIdFromDb = async (id) => {
    const vision = await Vision.findById(id).lean();
    if (!vision) throw new AppError("Vision not found", HttpStatusCode.NotFound);
    return vision;
};

const updateVisionIntoDb = async (id, payload) => {
    const existingVision = await Vision.findById(id);
    if (!existingVision) throw new AppError("Vision not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Vision.findOne({
            title: payload.title.trim(),
            _id: { $ne: id },
        });
        if (duplicate) throw new AppError("Another vision with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check all fields for changes
    const fields = ["title", "description", "image"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingVision[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Vision is already up to date", HttpStatusCode.Conflict);

    const updated = await Vision.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteVisionFromDb = async (id) => {
    const deleted = await Vision.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Vision not found", HttpStatusCode.NotFound);
    return deleted;
};

export const visionService = {
    createVisionIntoDb,
    getAllVisionsFromDb,
    getVisionByIdFromDb,
    updateVisionIntoDb,
    deleteVisionFromDb,
};