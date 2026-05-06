import { transformService } from "./transform.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const createTransform = catchAsync(async (req, res) => {
    const { title, description } = req.body;

    // ✅ Validate required text fields
    if (!title?.trim()) return generateResponse(res, 400, false, "Title is required", null);
    if (!description?.trim()) return generateResponse(res, 400, false, "Description is required", null);

    // ✅ Validate all 3 images are provided
    const image1File = req.files?.image1?.[0];
    const image2File = req.files?.image2?.[0];
    const image3File = req.files?.image3?.[0];

    if (!image1File) return generateResponse(res, 400, false, "Image 1 is required", null);
    if (!image2File) return generateResponse(res, 400, false, "Image 2 is required", null);
    if (!image3File) return generateResponse(res, 400, false, "Image 3 is required", null);

    // ✅ Validate file types — images only
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimeTypes.includes(image1File.mimetype)) return generateResponse(res, 400, false, "Image 1 must be a valid image (JPEG, PNG, WEBP, GIF)", null);
    if (!allowedMimeTypes.includes(image2File.mimetype)) return generateResponse(res, 400, false, "Image 2 must be a valid image (JPEG, PNG, WEBP, GIF)", null);
    if (!allowedMimeTypes.includes(image3File.mimetype)) return generateResponse(res, 400, false, "Image 3 must be a valid image (JPEG, PNG, WEBP, GIF)", null);

    // ✅ Validate file sizes — max 5MB each
    const maxSize = 50 * 1024 * 1024;
    if (image1File.size > maxSize) return generateResponse(res, 400, false, "Image 1 must not exceed 50MB", null);
    if (image2File.size > maxSize) return generateResponse(res, 400, false, "Image 2 must not exceed 50MB", null);
    if (image3File.size > maxSize) return generateResponse(res, 400, false, "Image 3 must not exceed 50MB", null);

    // ✅ Upload all 3 images in parallel
    const [result1, result2, result3] = await Promise.all([
        cloudinaryUpload(image1File.path, `transform-image1-${Date.now()}`, "transform"),
        cloudinaryUpload(image2File.path, `transform-image2-${Date.now() + 1}`, "transform"),
        cloudinaryUpload(image3File.path, `transform-image3-${Date.now() + 2}`, "transform"),
    ]);

    if (!result1?.secure_url) return generateResponse(res, 500, false, "Image 1 upload failed. Please try again", null);
    if (!result2?.secure_url) return generateResponse(res, 500, false, "Image 2 upload failed. Please try again", null);
    if (!result3?.secure_url) return generateResponse(res, 500, false, "Image 3 upload failed. Please try again", null);

    const created = await transformService.createTransformIntoDb({
        title: title.trim(),
        description: description.trim(),
        image1: result1.secure_url,
        image2: result2.secure_url,
        image3: result3.secure_url,
    });

    return generateResponse(res, 201, true, "Transform section created successfully", created);
});

const getAllTransforms = catchAsync(async (req, res) => {
    const result = await transformService.getAllTransformsFromDb(req.query);
    return generateResponse(res, 200, true, "Transform sections fetched successfully", result.data, result.meta);
});

const getTransformById = catchAsync(async (req, res) => {
    if (!req.params.transformId) {
        return generateResponse(res, 400, false, "Transform ID is required", null);
    }

    const transform = await transformService.getTransformByIdFromDb(req.params.transformId);
    return generateResponse(res, 200, true, "Transform section fetched successfully", transform);
});

const updateTransform = catchAsync(async (req, res) => {
    if (!req.params.transformId) {
        return generateResponse(res, 400, false, "Transform ID is required", null);
    }

    const { title, description } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title.trim();
    if (description !== undefined) payload.description = description.trim();

    // ✅ Validate and upload images only if provided — each optional on update
    const image1File = req.files?.image1?.[0];
    const image2File = req.files?.image2?.[0];
    const image3File = req.files?.image3?.[0];

    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxSize = 50 * 1024 * 1024;

    // ✅ Validate each image if provided
    if (image1File) {
        if (!allowedMimeTypes.includes(image1File.mimetype)) return generateResponse(res, 400, false, "Image 1 must be a valid image (JPEG, PNG, WEBP, GIF)", null);
        if (image1File.size > maxSize) return generateResponse(res, 400, false, "Image 1 must not exceed 50MB", null);
    }
    if (image2File) {
        if (!allowedMimeTypes.includes(image2File.mimetype)) return generateResponse(res, 400, false, "Image 2 must be a valid image (JPEG, PNG, WEBP, GIF)", null);
        if (image2File.size > maxSize) return generateResponse(res, 400, false, "Image 2 must not exceed 50MB", null);
    }
    if (image3File) {
        if (!allowedMimeTypes.includes(image3File.mimetype)) return generateResponse(res, 400, false, "Image 3 must be a valid image (JPEG, PNG, WEBP, GIF)", null);
        if (image3File.size > maxSize) return generateResponse(res, 400, false, "Image 3 must not exceed 50MB", null);
    }

    // ✅ Upload only provided images in parallel
    const uploadTasks = [];
    if (image1File) uploadTasks.push(
        cloudinaryUpload(image1File.path, `transform-image1-${Date.now()}`, "transform")
            .then(r => { if (r?.secure_url) payload.image1 = r.secure_url; })
    );
    if (image2File) uploadTasks.push(
        cloudinaryUpload(image2File.path, `transform-image2-${Date.now() + 1}`, "transform")
            .then(r => { if (r?.secure_url) payload.image2 = r.secure_url; })
    );
    if (image3File) uploadTasks.push(
        cloudinaryUpload(image3File.path, `transform-image3-${Date.now() + 2}`, "transform")
            .then(r => { if (r?.secure_url) payload.image3 = r.secure_url; })
    );

    await Promise.all(uploadTasks);

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await transformService.updateTransformIntoDb(req.params.transformId, payload);
    return generateResponse(res, 200, true, "Transform section updated successfully", updated);
});

const deleteTransform = catchAsync(async (req, res) => {
    if (!req.params.transformId) {
        return generateResponse(res, 400, false, "Transform ID is required", null);
    }

    await transformService.deleteTransformFromDb(req.params.transformId);
    return generateResponse(res, 200, true, "Transform section deleted successfully", null);
});

export const transformController = {
    createTransform,
    getAllTransforms,
    getTransformById,
    updateTransform,
    deleteTransform,
};