import { missionService } from "./mission.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const createMission = catchAsync(async (req, res) => {
    const { title, description } = req.body;

    if (!title?.trim())       return generateResponse(res, 400, false, "Title is required", null);
    if (!description?.trim()) return generateResponse(res, 400, false, "Description is required", null);

    const imageFile = req.files?.image?.[0];
    let imageUrl = "";
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `mission-${Date.now()}`, "mission");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        imageUrl = cloudinaryResult.url;
    }

    const created = await missionService.createMissionIntoDb({
        title:       title.trim(),
        description: description.trim(),
        image:       imageUrl,
    });

    return generateResponse(res, 201, true, "Mission created successfully", created);
});

const getAllMissions = catchAsync(async (req, res) => {
    const result = await missionService.getAllMissionsFromDb(req.query);
    return generateResponse(res, 200, true, "Missions fetched successfully", result.data, result.meta);
});

const getMissionById = catchAsync(async (req, res) => {
    const mission = await missionService.getMissionByIdFromDb(req.params.missionId);
    return generateResponse(res, 200, true, "Mission fetched successfully", mission);
});

const updateMission = catchAsync(async (req, res) => {
    const { title, description } = req.body;
    const payload = {};

    if (title       !== undefined) payload.title       = title.trim();
    if (description !== undefined) payload.description = description.trim();

    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `mission-${Date.now()}`, "mission");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        payload.image = cloudinaryResult.url;
    }

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await missionService.updateMissionIntoDb(req.params.missionId, payload);
    return generateResponse(res, 200, true, "Mission updated successfully", updated);
});

const deleteMission = catchAsync(async (req, res) => {
    await missionService.deleteMissionFromDb(req.params.missionId);
    return generateResponse(res, 200, true, "Mission deleted successfully", null);
});

export const missionController = {
    createMission,
    getAllMissions,
    getMissionById,
    updateMission,
    deleteMission,
};