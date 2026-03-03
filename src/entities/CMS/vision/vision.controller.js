import { visionService } from "./vision.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const createVision = catchAsync(async (req, res) => {
    const { title, description } = req.body;

    // ✅ Validate required fields
    if (!title?.trim()) return generateResponse(res, 400, false, "Title is required", null);
    if (!description?.trim()) return generateResponse(res, 400, false, "Description is required", null);

    // ✅ Upload image if provided
    const imageFile = req.files?.image?.[0];
    let imageUrl = "";
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `vision-${Date.now()}`, "vision");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        imageUrl = cloudinaryResult.url;
    }

    const created = await visionService.createVisionIntoDb({
        title: title.trim(),
        description: description.trim(),
        image: imageUrl,
    });

    return generateResponse(res, 201, true, "Vision created successfully", created);
});

const getAllVisions = catchAsync(async (req, res) => {
    const result = await visionService.getAllVisionsFromDb(req.query);
    return generateResponse(res, 200, true, "Visions fetched successfully", result.data, result.meta);
});

const getVisionById = catchAsync(async (req, res) => {
    const vision = await visionService.getVisionByIdFromDb(req.params.visionId);
    return generateResponse(res, 200, true, "Vision fetched successfully", vision);
});

const updateVision = catchAsync(async (req, res) => {
    const { title, description } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title.trim();
    if (description !== undefined) payload.description = description.trim();

    // ✅ Upload new image only if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `vision-${Date.now()}`, "vision");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        payload.image = cloudinaryResult.url;
    }

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await visionService.updateVisionIntoDb(req.params.visionId, payload);
    return generateResponse(res, 200, true, "Vision updated successfully", updated);
});

const deleteVision = catchAsync(async (req, res) => {
    await visionService.deleteVisionFromDb(req.params.visionId);
    return generateResponse(res, 200, true, "Vision deleted successfully", null);
});

export const visionController = {
    createVision,
    getAllVisions,
    getVisionById,
    updateVision,
    deleteVision,
};