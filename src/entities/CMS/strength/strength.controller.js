import { strengthService } from "./strength.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

const createStrength = catchAsync(async (req, res) => {
    const { title, subtitle } = req.body;

    if (!title?.trim())    return generateResponse(res, 400, false, "Title is required", null);
    if (!subtitle?.trim()) return generateResponse(res, 400, false, "Subtitle is required", null);

    const created = await strengthService.createStrengthIntoDb({
        title:    title.trim(),
        subtitle: subtitle.trim(),
    });

    return generateResponse(res, 201, true, "Strength created successfully", created);
});

const getAllStrengths = catchAsync(async (req, res) => {
    const result = await strengthService.getAllStrengthsFromDb(req.query);
    return generateResponse(res, 200, true, "Strengths fetched successfully", result.data, result.meta);
});

const getStrengthById = catchAsync(async (req, res) => {
    const strength = await strengthService.getStrengthByIdFromDb(req.params.strengthId);
    return generateResponse(res, 200, true, "Strength fetched successfully", strength);
});

const updateStrength = catchAsync(async (req, res) => {
    const { title, subtitle } = req.body;
    const payload = {};

    if (title    !== undefined) payload.title    = title.trim();
    if (subtitle !== undefined) payload.subtitle = subtitle.trim();

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await strengthService.updateStrengthIntoDb(req.params.strengthId, payload);
    return generateResponse(res, 200, true, "Strength updated successfully", updated);
});

const deleteStrength = catchAsync(async (req, res) => {
    await strengthService.deleteStrengthFromDb(req.params.strengthId);
    return generateResponse(res, 200, true, "Strength deleted successfully", null);
});

export const strengthController = {
    createStrength,
    getAllStrengths,
    getStrengthById,
    updateStrength,
    deleteStrength,
};