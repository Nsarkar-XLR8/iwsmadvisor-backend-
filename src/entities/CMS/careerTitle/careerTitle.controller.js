import { careerTitleService } from "./careerTitle.service.js";
import { validationResult } from "express-validator";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

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

const createCareerTitle = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const { title, subTitle } = req.body;

    const created = await careerTitleService.createCareerTitleIntoDb({
        title, subTitle
    });

    return generateResponse(res, 201, true, "Career Title created successfully", created);
});

const getAllCareerTitles = catchAsync(async (req, res) => {
    const careerTitles = await careerTitleService.getAllCareerTitlesFromDb();
    return generateResponse(res, 200, true, "Career Titles fetched successfully", careerTitles);
});

const getCareerTitleById = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const careerTitle = await careerTitleService.getCareerTitleByIdFromDb(req.params.careerTitleId);
    return generateResponse(res, 200, true, "Career Title fetched successfully", careerTitle);
});

const updateCareerTitle = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const { title, subTitle } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title;
    if (subTitle !== undefined) payload.subTitle = subTitle;

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await careerTitleService.updateCareerTitleIntoDb(req.params.careerTitleId, payload);
    return generateResponse(res, 200, true, "Career Title updated successfully", updated);
});

const deleteCareerTitle = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    await careerTitleService.deleteCareerTitleFromDb(req.params.careerTitleId);
    return generateResponse(res, 200, true, "Career Title deleted successfully", null);
});

export const careerTitleController = {
    createCareerTitle,
    getAllCareerTitles,
    getCareerTitleById,
    updateCareerTitle,
    deleteCareerTitle,
};
