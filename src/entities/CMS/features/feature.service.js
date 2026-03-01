import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";
import { Features } from "./feature.model.js";

const createFeaturesIntoDb = async (payload) => {
    // ✅ Prevent duplicate title
    const existing = await Features.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Features section with this title already exists", HttpStatusCode.Conflict);

    const features = await Features.create(payload);
    return features;
};

const getAllFeaturesFromDb = async (query) => {
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

    const [totalDocs, features] = await Promise.all([
        Features.countDocuments(),
        Features.find()
            .sort(sort)
            .skip(skip)
            .limit(safeLimit)
            .lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: features,
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

const getFeaturesByIdFromDb = async (id) => {
    const features = await Features.findById(id).lean();
    if (!features) throw new AppError("Features section not found", HttpStatusCode.NotFound);
    return features;
};

const updateFeaturesIntoDb = async (id, payload) => {
    const existingFeatures = await Features.findById(id);
    if (!existingFeatures) throw new AppError("Features section not found", HttpStatusCode.NotFound);

    // ✅ Check if title is being updated to an already existing title
    if (payload.title) {
        const duplicate = await Features.findOne({
            title: payload.title.trim(),
            _id: { $ne: id },
        });
        if (duplicate) throw new AppError("Another features section with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check scalar fields for changes
    const scalarFields = ["title", "subtitle"];
    const isScalarSame = scalarFields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingFeatures[field]?.trim?.();
    });

    // ✅ Check items array for changes
    const isItemsSame = (() => {
        if (payload.items === undefined) return true;

        // ✅ Different length means something changed
        if (payload.items.length !== existingFeatures.items.length) return false;

        const incoming = JSON.stringify(payload.items);
        const existing = JSON.stringify(
            existingFeatures.items.map((item) => ({
                icon: item.icon,
                title: item.title,
                description: item.description,
            }))
        );
        return incoming === existing;
    })();

    if (isScalarSame && isItemsSame) {
        throw new AppError("No changes detected. Features section is already up to date", HttpStatusCode.Conflict);
    }

    // ✅ Validate items count — must have at least 1
    if (payload.items !== undefined && payload.items.length === 0) {
        throw new AppError("Features items cannot be empty", HttpStatusCode.BadRequest);
    }

    // ✅ Merge items by index — keep existing icon if no new icon provided
    if (payload.items !== undefined) {
        payload.items = payload.items.map((incomingItem, index) => {
            const existingItem = existingFeatures.items[index];
            if (!existingItem) {
                // ✅ New item being added — icon is required
                if (!incomingItem.icon) {
                    throw new AppError(`Icon is required for new feature item at index ${index}`, HttpStatusCode.BadRequest);
                }
                return incomingItem;
            }
            return {
                icon: incomingItem.icon || existingItem.icon,
                title: incomingItem.title || existingItem.title,
                description: incomingItem.description || existingItem.description,
            };
        });
    }

    const updated = await Features.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteFeaturesFromDb = async (id) => {
    const deleted = await Features.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Features section not found", HttpStatusCode.NotFound);
    return deleted;
};

export const featuresService = {
    createFeaturesIntoDb,
    getAllFeaturesFromDb,
    getFeaturesByIdFromDb,
    updateFeaturesIntoDb,
    deleteFeaturesFromDb,
};