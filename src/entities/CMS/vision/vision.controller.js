import { visionService } from "./vision.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

// ✅ Helper — upload a single icon to cloudinary
const uploadIcon = async (file, name) => {
    // Standardizing prefix for better organization in Cloudinary
    const result = await cloudinaryUpload(
        file.path,
        `vision-${name}-${Date.now()}`,
        "vision"
    );
    if (!result?.url) throw new Error(`Upload failed for: ${name}`);
    return result.url;
};

const createVision = catchAsync(async (req, res) => {
    // Destructure from parsed req.body (assuming parseFormData middleware is used)
    const { mission, vision, coreStrengths, certifications, expertise } = req.body;

    // 1. Handle Mission Icon (Field: missionImage)
    const missionFile = req.files?.missionImage?.[0];
    if (missionFile) {
        mission.icon = await uploadIcon(missionFile, "mission");
    }

    // 2. Handle Vision Icon (Field: visionImage)
    const visionFile = req.files?.visionImage?.[0];
    if (visionFile) {
        vision.icon = await uploadIcon(visionFile, "vision");
    }

    // 3. Handle Core Strength Icons (Field: coreImages)
    const coreFiles = req.files?.coreImages || [];
    if (coreFiles.length > 0) {
        if (coreFiles.length !== coreStrengths.items.length) {
            return generateResponse(res, 400, false, "Core icon count mismatch");
        }

        // Parallel upload for better performance
        const iconUrls = await Promise.all(
            coreFiles.map((file, idx) => uploadIcon(file, `core-${idx}`))
        );

        coreStrengths.items = coreStrengths.items.map((item, idx) => ({
            ...item,
            icon: iconUrls[idx]
        }));
    }

    const created = await visionService.createVisionIntoDb({
        mission, vision, coreStrengths, certifications, expertise
    });

    return generateResponse(res, 201, true, "Vision section created successfully", created);
});

const getVision = catchAsync(async (req, res) => {
    const vision = await visionService.getVisionFromDb();
    return generateResponse(res, 200, true, "Vision section fetched successfully", vision);
});

const updateVision = catchAsync(async (req, res) => {
    const payload = { ...req.body };

    // 1. Mission Update & Icon
    if (req.files?.missionImage?.[0]) {
        payload.mission = payload.mission || {};
        payload.mission.icon = await uploadIcon(req.files.missionImage[0], "mission");
    }

    // 2. Vision Update & Icon
    if (req.files?.visionImage?.[0]) {
        payload.vision = payload.vision || {};
        payload.vision.icon = await uploadIcon(req.files.visionImage[0], "vision");
    }

    // 3. Core Strength Icons
    if (req.files?.coreImages?.length > 0) {
        if (!payload.coreStrengths?.items) {
            return generateResponse(res, 400, false, "Items required to update icons");
        }

        const iconUrls = await Promise.all(
            req.files.coreImages.map((file, idx) => uploadIcon(file, `core-update-${idx}`))
        );

        payload.coreStrengths.items = payload.coreStrengths.items.map((item, idx) => ({
            ...item,
            icon: iconUrls[idx] || item.icon
        }));
    }

    const updated = await visionService.updateVisionIntoDb(payload);
    return generateResponse(res, 200, true, "Vision section updated successfully", updated);
});

const deleteVision = catchAsync(async (req, res) => {
    await visionService.deleteVisionFromDb();
    return generateResponse(res, 200, true, "Vision section deleted successfully", null);
});

export const visionController = {
    createVision,
    getVision,
    updateVision,
    deleteVision,
};