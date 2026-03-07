import { Features } from "./feature.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createFeaturesIntoDb = async (payload) => {
    // ✅ Check duplicate title
    const existing = await Features.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Features section with this title already exists", HttpStatusCode.Conflict);

    // ✅ Check duplicate section order
    const existingOrder = await Features.findOne({ order: payload.order });
    if (existingOrder) throw new AppError(`Features section with order ${payload.order} already exists`, HttpStatusCode.Conflict);

    // ✅ Check duplicate item orders
    const orders = payload.items.map((item) => item.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        throw new AppError("Duplicate order values found in items. Each item must have a unique order", HttpStatusCode.BadRequest);
    }

    // ✅ Sort items by order before saving
    payload.items.sort((a, b) => a.order - b.order);

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
        Features.find().sort(sort).skip(skip).limit(safeLimit).lean(),
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
    // ✅ Always return items sorted by order
    features.items.sort((a, b) => a.order - b.order);
    return features;
};



const updateFeaturesIntoDb = async (id, payload) => {
    const existingFeatures = await Features.findById(id);
    if (!existingFeatures) throw new AppError("Features section not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Features.findOne({
            title: payload.title.trim(),
            _id:   { $ne: id },
        });
        if (duplicate) throw new AppError("Another features section with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check duplicate section order on update
    if (payload.order !== undefined) {
        const duplicateOrder = await Features.findOne({
            order: payload.order,
            _id:   { $ne: id },
        });
        if (duplicateOrder) throw new AppError(`Another features section with order ${payload.order} already exists`, HttpStatusCode.Conflict);
    }

    // ✅ Check scalar fields for changes including order
    const scalarFields = ["title", "subtitle", "order"];
    const isScalarSame = scalarFields.every((field) => {
        if (payload[field] === undefined) return true;
        return String(payload[field])?.trim?.() === String(existingFeatures[field])?.trim?.();
    });

    // ✅ Check items for changes
    const isItemsSame = (() => {
        if (payload.items === undefined) return true;
        if (payload.items.length !== existingFeatures.items.length) return false;
        const incoming = JSON.stringify([...payload.items].sort((a, b) => a.order - b.order));
        const existing = JSON.stringify(
            existingFeatures.items
                .map(({ order, icon, title, description }) => ({ order, icon, title, description }))
                .sort((a, b) => a.order - b.order)
        );
        return incoming === existing;
    })();

    if (isScalarSame && isItemsSame) {
        throw new AppError("No changes detected. Features section is already up to date", HttpStatusCode.Conflict);
    }

    if (payload.items !== undefined) {
        // ✅ Check duplicate item orders
        const orders = payload.items.map((item) => item.order);
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
            throw new AppError("Duplicate order values found in items. Each item must have a unique order", HttpStatusCode.BadRequest);
        }

        // ✅ Merge by order — keep existing icon if no new icon provided
        payload.items = payload.items.map((incomingItem) => {
            const existingItem = existingFeatures.items.find(
                (item) => item.order === incomingItem.order
            );
            return {
                order:       incomingItem.order,
                icon:        incomingItem.icon || existingItem?.icon || "",
                title:       incomingItem.title,
                description: incomingItem.description,
            };
        });

        // ✅ Sort items by order before saving
        payload.items.sort((a, b) => a.order - b.order);
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