import { Transform } from "./transform.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createTransformIntoDb = async (payload) => {
    // ✅ Validate all required fields
    if (!payload.title?.trim()) {
        throw new AppError("Title is required", HttpStatusCode.BadRequest);
    }
    if (!payload.description?.trim()) {
        throw new AppError("Description is required", HttpStatusCode.BadRequest);
    }

    // ✅ All 3 images required on create
    if (!payload.image1) throw new AppError("Image 1 is required", HttpStatusCode.BadRequest);
    if (!payload.image2) throw new AppError("Image 2 is required", HttpStatusCode.BadRequest);
    if (!payload.image3) throw new AppError("Image 3 is required", HttpStatusCode.BadRequest);

    const transform = await Transform.create({
        title: payload.title.trim(),
        description: payload.description.trim(),
        image1: payload.image1,
        image2: payload.image2,
        image3: payload.image3,
    });

    return transform;
};

const getAllTransformsFromDb = async (query) => {
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

    const [totalDocs, transforms] = await Promise.all([
        Transform.countDocuments(),
        Transform.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: transforms,
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

const getTransformByIdFromDb = async (id) => {
    if (!id) throw new AppError("Transform ID is required", HttpStatusCode.BadRequest);

    const transform = await Transform.findById(id).lean();
    if (!transform) throw new AppError("Transform section not found", HttpStatusCode.NotFound);
    return transform;
};

const updateTransformIntoDb = async (id, payload) => {
    if (!id) throw new AppError("Transform ID is required", HttpStatusCode.BadRequest);

    const existingTransform = await Transform.findById(id);
    if (!existingTransform) throw new AppError("Transform section not found", HttpStatusCode.NotFound);

    // ✅ Reject empty string updates
    if (payload.title !== undefined && !payload.title?.trim()) {
        throw new AppError("Title cannot be empty", HttpStatusCode.BadRequest);
    }
    if (payload.description !== undefined && !payload.description?.trim()) {
        throw new AppError("Description cannot be empty", HttpStatusCode.BadRequest);
    }

    // ✅ At least one field must be provided
    if (Object.keys(payload).length === 0) {
        throw new AppError("At least one field must be provided to update", HttpStatusCode.BadRequest);
    }

    // ✅ Check all fields for changes
    const scalarFields = ["title", "description", "image1", "image2", "image3"];
    const isSame = scalarFields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingTransform[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Transform section is already up to date", HttpStatusCode.Conflict);

    // ✅ Merge with existing — preserve old images if no new ones provided
    const updatedPayload = {
        title: payload.title?.trim() ?? existingTransform.title,
        description: payload.description?.trim() ?? existingTransform.description,
        image1: payload.image1 ?? existingTransform.image1,
        image2: payload.image2 ?? existingTransform.image2,
        image3: payload.image3 ?? existingTransform.image3,
    };

    const updated = await Transform.findByIdAndUpdate(
        id,
        { $set: updatedPayload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteTransformFromDb = async (id) => {
    if (!id) throw new AppError("Transform ID is required", HttpStatusCode.BadRequest);

    const deleted = await Transform.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Transform section not found", HttpStatusCode.NotFound);
    return deleted;
};

export const transformService = {
    createTransformIntoDb,
    getAllTransformsFromDb,
    getTransformByIdFromDb,
    updateTransformIntoDb,
    deleteTransformFromDb,
};