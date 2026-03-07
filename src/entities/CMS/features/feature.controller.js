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

    // ✅ Debug — see what multer gives us
    console.log("files →", files.map(f => ({
        fieldname: f.fieldname,
        path: f.path,
        mimetype: f.mimetype,
        size: f.size,
    })));

    await Promise.all(
        files.map(async (file) => {
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
    // ✅ Debug — see exact file path being passed
    console.log("uploadIcon →", {
        fieldname: file.fieldname,
        path:      file.path,
        mimetype:  file.mimetype,
        size:      file.size,
    });

    const result = await cloudinaryUpload(
        file.path,
        `features-icon-order-${order}-${Date.now()}`,
        "features"
    );

    // ✅ Debug — see what cloudinary returns
    console.log("cloudinaryUpload result →", result);

    if (!result || result === "file upload failed" || !result.url) {
        throw new Error(`Icon upload failed for item order ${order}`);
    }
    return result.url;
};

const createFeatures = catchAsync(async (req, res) => {
    const { order, title, subtitle, items } = req.body;

    // ✅ Validate section order
    if (!order || isNaN(order) || order < 1) {
        return generateResponse(res, 400, false, "Order is required and must be at least 1", null);
    }

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

    const iconMap = await buildIconMap(req.files);

    const itemsWithIcons = items.map((item) => ({
        order: Number(item.order),
        icon: iconMap[item.order] || "",
        title: item.title.trim(),
        description: item.description.trim(),
    }));

    const created = await featuresService.createFeaturesIntoDb({
        order: Number(order),
        title,
        subtitle,
        items: itemsWithIcons,
    });

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
    const { order, title, subtitle, items } = req.body;
    const payload = {};

    if (order    !== undefined) payload.order    = Number(order);
    if (title    !== undefined) payload.title    = title;
    if (subtitle !== undefined) payload.subtitle = subtitle;

    // ✅ Build iconMap only ONCE
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
        // ✅ Icon-only update — iconMap already built above, no second call
        const existingFeatures = await featuresService.getFeaturesByIdFromDb(req.params.featuresId);
        payload.items = existingFeatures.items.map((item) => ({
            order:       item.order,
            icon:        iconMap[item.order] || item.icon || "",
            title:       item.title,
            description: item.description,
        }));
    }

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
