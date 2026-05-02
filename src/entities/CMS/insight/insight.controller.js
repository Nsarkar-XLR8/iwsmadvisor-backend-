import { insightService } from "./insight.service.js";
import { validationResult } from "express-validator";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

// Handle express-validator errors
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        generateResponse(res, 422, false, "Validation failed", {
            errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
        });
        return true;
    }
    return false;
};

const createInsight = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const { title, subTitle } = req.body;

    const created = await insightService.createInsightIntoDb({
        title, subTitle
    });

    return generateResponse(res, 201, true, "Insight created successfully", created);
});

const getAllInsights = catchAsync(async (req, res) => {
    const insights = await insightService.getAllInsightsFromDb();
    return generateResponse(res, 200, true, "Insights fetched successfully", insights);
});

const getInsightById = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const insight = await insightService.getInsightByIdFromDb(req.params.insightId);
    return generateResponse(res, 200, true, "Insight fetched successfully", insight);
});

const updateInsight = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const { title, subTitle } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title;
    if (subTitle !== undefined) payload.subTitle = subTitle;

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await insightService.updateInsightIntoDb(req.params.insightId, payload);
    return generateResponse(res, 200, true, "Insight updated successfully", updated);
});

const deleteInsight = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    await insightService.deleteInsightFromDb(req.params.insightId);
    return generateResponse(res, 200, true, "Insight deleted successfully", null);
});

export const insightController = {
    createInsight,
    getAllInsights,
    getInsightById,
    updateInsight,
    deleteInsight,
};