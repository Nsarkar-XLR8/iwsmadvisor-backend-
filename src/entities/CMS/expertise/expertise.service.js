import { Expertise } from "./expertise.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createExpertiseIntoDb = async (payload) => {
    const existing = await Expertise.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Expertise with this title already exists", HttpStatusCode.Conflict);

    const sanitized = {
        title: payload.title.trim(),
        subtitle: payload.subtitle.trim(),
        description1: payload.description1.trim(),
        description2: payload.description2.trim(),
        description3: payload.description3.trim(),
    };

    const expertise = await Expertise.create(sanitized);
    return expertise;
};

const getAllExpertisesFromDb = async (query) => {
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

    if (isNaN(safePage) || isNaN(safeLimit)) {
        throw new AppError("Invalid pagination parameters", HttpStatusCode.BadRequest);
    }

    const sort = { [safeSortBy]: safeSortOrder };
    const skip = (safePage - 1) * safeLimit;

    const [totalDocs, expertises] = await Promise.all([
        Expertise.countDocuments(),
        Expertise.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: expertises,
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

const getExpertiseByIdFromDb = async (id) => {
    if (!id) throw new AppError("Expertise ID is required", HttpStatusCode.BadRequest);
    const expertise = await Expertise.findById(id).lean();
    if (!expertise) throw new AppError("Expertise not found", HttpStatusCode.NotFound);
    return expertise;
};

const updateExpertiseIntoDb = async (id, payload) => {
    if (!id) throw new AppError("Expertise ID is required", HttpStatusCode.BadRequest);

    const existingExpertise = await Expertise.findById(id);
    if (!existingExpertise) throw new AppError("Expertise not found", HttpStatusCode.NotFound);

    if (payload.title) {
        const duplicate = await Expertise.findOne({
            title: payload.title.trim(),
            _id: { $ne: id },
        });
        if (duplicate) throw new AppError("Another expertise with this title already exists", HttpStatusCode.Conflict);
    }

    const allowedFields = ["title", "subtitle", "description1", "description2", "description3"];
    const sanitizedPayload = {};

    allowedFields.forEach((field) => {
        if (payload[field] !== undefined) {
            sanitizedPayload[field] = payload[field].trim();
        }
    });

    if (Object.keys(sanitizedPayload).length === 0) {
        throw new AppError("At least one field must be provided to update", HttpStatusCode.BadRequest);
    }

    const isSame = allowedFields.every((field) => {
        if (sanitizedPayload[field] === undefined) return true;
        return sanitizedPayload[field] === existingExpertise[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Expertise is already up to date", HttpStatusCode.Conflict);

    const updated = await Expertise.findByIdAndUpdate(
        id,
        { $set: sanitizedPayload },
        { new: true, runValidators: true }
    );

    if (!updated) throw new AppError("Failed to update expertise. Please try again.", HttpStatusCode.InternalServerError);

    return updated;
};

const deleteExpertiseFromDb = async (id) => {
    if (!id) throw new AppError("Expertise ID is required", HttpStatusCode.BadRequest);
    const deleted = await Expertise.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Expertise not found", HttpStatusCode.NotFound);
    return deleted;
};

export const expertiseService = {
    createExpertiseIntoDb,
    getAllExpertisesFromDb,
    getExpertiseByIdFromDb,
    updateExpertiseIntoDb,
    deleteExpertiseFromDb,
};