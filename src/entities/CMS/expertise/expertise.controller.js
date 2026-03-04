import { expertiseService } from "./expertise.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

const createExpertise = catchAsync(async (req, res) => {
    const { title, subtitle, description1, description2, description3 } = req.body;

    if (!title?.trim()) return generateResponse(res, 400, false, "Title is required", null);
    if (!subtitle?.trim()) return generateResponse(res, 400, false, "Subtitle is required", null);
    if (!description1?.trim()) return generateResponse(res, 400, false, "Description 1 is required", null);
    if (!description2?.trim()) return generateResponse(res, 400, false, "Description 2 is required", null);
    if (!description3?.trim()) return generateResponse(res, 400, false, "Description 3 is required", null);

    const created = await expertiseService.createExpertiseIntoDb({
        title: title.trim(),
        subtitle: subtitle.trim(),
        description1: description1.trim(),
        description2: description2.trim(),
        description3: description3.trim(),
    });

    return generateResponse(res, 201, true, "Expertise created successfully", created);
});

const getAllExpertises = catchAsync(async (req, res) => {
    const result = await expertiseService.getAllExpertisesFromDb(req.query);
    return generateResponse(res, 200, true, "Expertises fetched successfully", result.data, result.meta);
});

const getExpertiseById = catchAsync(async (req, res) => {
    if (!req.params.expertiseId) {
        return generateResponse(res, 400, false, "Expertise ID is required", null);
    }
    const expertise = await expertiseService.getExpertiseByIdFromDb(req.params.expertiseId);
    return generateResponse(res, 200, true, "Expertise fetched successfully", expertise);
});

const updateExpertise = catchAsync(async (req, res) => {
    if (!req.params.expertiseId) {
        return generateResponse(res, 400, false, "Expertise ID is required", null);
    }

    const { title, subtitle, description1, description2, description3 } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title.trim();
    if (subtitle !== undefined) payload.subtitle = subtitle.trim();
    if (description1 !== undefined) payload.description1 = description1.trim();
    if (description2 !== undefined) payload.description2 = description2.trim();
    if (description3 !== undefined) payload.description3 = description3.trim();

    if (payload.title === "") return generateResponse(res, 400, false, "Title cannot be empty", null);
    if (payload.subtitle === "") return generateResponse(res, 400, false, "Subtitle cannot be empty", null);
    if (payload.description1 === "") return generateResponse(res, 400, false, "Description 1 cannot be empty", null);
    if (payload.description2 === "") return generateResponse(res, 400, false, "Description 2 cannot be empty", null);
    if (payload.description3 === "") return generateResponse(res, 400, false, "Description 3 cannot be empty", null);

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await expertiseService.updateExpertiseIntoDb(req.params.expertiseId, payload);
    return generateResponse(res, 200, true, "Expertise updated successfully", updated);
});

const deleteExpertise = catchAsync(async (req, res) => {
    if (!req.params.expertiseId) {
        return generateResponse(res, 400, false, "Expertise ID is required", null);
    }
    await expertiseService.deleteExpertiseFromDb(req.params.expertiseId);
    return generateResponse(res, 200, true, "Expertise deleted successfully", null);
});

export const expertiseController = {
    createExpertise,
    getAllExpertises,
    getExpertiseById,
    updateExpertise,
    deleteExpertise,
};