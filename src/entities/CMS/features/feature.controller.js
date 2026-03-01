import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";
import { featuresService } from "./feature.service.js";

// ✅ Helper — upload a single icon to cloudinary
const uploadIcon = async (file, index) => {
    const result = await cloudinaryUpload(
        file.path,
        `features-icon-${Date.now()}-${index}`,
        "features"
    );
    if (!result || !result.url) throw new Error(`Icon upload failed for item at index ${index}`);
    return result.url;
};




const createFeatures = catchAsync(async (req, res) => {
    const { title, subtitle, items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
        return generateResponse(res, 400, false, "At least one feature item is required", null);
    }

    // ✅ Validate each item has title and description
    for (let i = 0; i < items.length; i++) {
        if (!items[i].title?.trim()) {
            return generateResponse(res, 400, false, `Title is required for item at index ${i}`, null);
        }
        if (!items[i].description?.trim()) {
            return generateResponse(res, 400, false, `Description is required for item at index ${i}`, null);
        }
    }

    // ✅ Upload icons if provided — no longer required
    const iconFiles = req.files?.icons || [];
    const iconUrls = iconFiles.length > 0
        ? await Promise.all(iconFiles.map((file, index) => uploadIcon(file, index)))
        : [];

    // ✅ Merge icon urls into items — default to "" if no icon provided
    const itemsWithIcons = items.map((item, index) => ({
        icon: iconUrls[index] || "",
        title: item.title.trim(),
        description: item.description.trim(),
    }));

    const created = await featuresService.createFeaturesIntoDb({
        title,
        subtitle,
        items: itemsWithIcons,
    });

    return generateResponse(res, 201, true, "Features section created successfully", created);
});


const getAllFeatures = catchAsync(async (req, res) => {
    const result = await featuresService.getAllFeaturesFromDb(req.query);
    return generateResponse(res, 200, true, "Features sections fetched successfully", result.data, result.meta);
})


const getFeaturesById = catchAsync(async (req, res) => {
    const features = await featuresService.getFeaturesByIdFromDb(req.params.featuresId);
    return generateResponse(res, 200, true, "Features section fetched successfully", features);
});




const updateFeatures = catchAsync(async (req, res) => {
    const { title, subtitle, items } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title;
    if (subtitle !== undefined) payload.subtitle = subtitle;

    if (items !== undefined) {
        if (!Array.isArray(items) || items.length === 0) {
            return generateResponse(res, 400, false, "Features items cannot be empty", null);
        }

        for (let i = 0; i < items.length; i++) {
            if (!items[i].title?.trim()) {
                return generateResponse(res, 400, false, `Title is required for item at index ${i}`, null);
            }
            if (!items[i].description?.trim()) {
                return generateResponse(res, 400, false, `Description is required for item at index ${i}`, null);
            }
        }

        const iconFiles = req.files?.icons || [];

        // ✅ Upload new icons in parallel if provided
        const iconUrls = iconFiles.length > 0
            ? await Promise.all(iconFiles.map((file, index) => uploadIcon(file, index)))
            : [];

        // ✅ Merge — use new icon if uploaded, keep existing if not, default to ""
        payload.items = items.map((item, index) => ({
            icon: iconUrls[index] || item.icon || "",
            title: item.title.trim(),
            description: item.description.trim(),
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