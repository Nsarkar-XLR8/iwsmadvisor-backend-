import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";
import { featuresService } from "./feature.service.js";


// ✅ Helper — build iconMap from req.files using order-based field names
// Postman: icon_1, icon_2, icon_3 etc.
// ✅ upload.any() returns req.files as an ARRAY not an object
// Each file has a fieldname property like "icon_1", "icon_2"
const buildIconMap = async (files) => {
    const iconMap = {};
    if (!files || !Array.isArray(files)) return iconMap;

    await Promise.all(
        files.map(async (file) => {
            // ✅ Match field names like icon_1, icon_2, icon_3
            const match = file.fieldname.match(/^icon_(\d+)$/);
            if (match) {
                const order = Number(match[1]);
                iconMap[order] = await uploadIcon(file, order);
            }
        })
    );

    return iconMap;
};

// ✅ Helper — upload icon by order number
const uploadIcon = async (file, order) => {
    const result = await cloudinaryUpload(
        file.path,
        `features-icon-order-${order}-${Date.now()}`,
        "features"
    );
    if (!result || !result.url) throw new Error(`Icon upload failed for item order ${order}`);
    return result.url;
};

const createFeatures = catchAsync(async (req, res) => {
    const { title, subtitle, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return generateResponse(res, 400, false, "At least one feature item is required", null);
    }

    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (!item.order || isNaN(item.order) || item.order < 1) {
            return generateResponse(res, 400, false, `Order is required and must be at least 1 for item at index ${i}`, null);
        }
        if (!item.title?.trim()) {
            return generateResponse(res, 400, false, `Title is required for item at index ${i}`, null);
        }
        if (!item.description?.trim()) {
            return generateResponse(res, 400, false, `Description is required for item at index ${i}`, null);
        }
    }

    const orders = items.map((item) => Number(item.order));
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        return generateResponse(res, 400, false, "Duplicate order values found. Each item must have a unique order", null);
    }

    // ✅ Build icon map from field names like icon_1, icon_2
    const iconMap = await buildIconMap(req.files);

    const itemsWithIcons = items.map((item) => ({
        order: Number(item.order),
        icon: iconMap[item.order] || "",
        title: item.title.trim(),
        description: item.description.trim(),
    }));

    const created = await featuresService.createFeaturesIntoDb({ title, subtitle, items: itemsWithIcons });
    return generateResponse(res, 201, true, "Features section created successfully", created);
});

const getAllFeatures = catchAsync(async (req, res) => {
    const result = await featuresService.getAllFeaturesFromDb(req.query);
    return generateResponse(res, 200, true, "Features sections fetched successfully", result.data, result.meta);
});

const getFeaturesById = catchAsync(async (req, res) => {
    const features = await featuresService.getFeaturesByIdFromDb(req.params.featuresId);
    return generateResponse(res, 200, true, "Features section fetched successfully", features);
});

const updateFeatures = catchAsync(async (req, res) => {
    const { title, subtitle, items } = req.body;
    const payload = {};

    if (title    !== undefined) payload.title    = title;
    if (subtitle !== undefined) payload.subtitle = subtitle;

    // ✅ Build icon map first — works even without items in body
    const iconMap = await buildIconMap(req.files);

    if (items !== undefined) {
        if (!Array.isArray(items) || items.length === 0) {
            return generateResponse(res, 400, false, "Features items cannot be empty", null);
        }

        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (!item.order || isNaN(item.order) || item.order < 1) {
                return generateResponse(res, 400, false, `Order is required and must be at least 1 for item at index ${i}`, null);
            }
            if (!item.title?.trim()) {
                return generateResponse(res, 400, false, `Title is required for item at index ${i}`, null);
            }
            if (!item.description?.trim()) {
                return generateResponse(res, 400, false, `Description is required for item at index ${i}`, null);
            }
        }

        const orders = items.map((item) => Number(item.order));
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
            return generateResponse(res, 400, false, "Duplicate order values found. Each item must have a unique order", null);
        }

        payload.items = items.map((item) => ({
            order:       Number(item.order),
            icon:        iconMap[item.order] || item.icon || "",
            title:       item.title.trim(),
            description: item.description.trim(),
        }));

    } else if (Object.keys(iconMap).length > 0) {
        // ✅ Icon-only update — fetch existing items and merge icons by order
        const existingFeatures = await featuresService.getFeaturesByIdFromDb(req.params.featuresId);

        payload.items = existingFeatures.items.map((item) => ({
            order:       item.order,
            icon:        iconMap[item.order] || item.icon || "",
            title:       item.title,
            description: item.description,
        }));
    }

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await featuresService.updateFeaturesIntoDb(req.params.featuresId, payload);
    return generateResponse(res, 200, true, "Features section updated successfully", updated);
});

const deleteFeatures = catchAsync(async (req, res) => {
    await featuresService.deleteFeaturesFromDb(req.params.featuresId);
    return generateResponse(res, 200, true, "Features section deleted successfully", null);
});

export const featuresController = {
    createFeatures,
    getAllFeatures,
    getFeaturesById,
    updateFeatures,
    deleteFeatures,
};
