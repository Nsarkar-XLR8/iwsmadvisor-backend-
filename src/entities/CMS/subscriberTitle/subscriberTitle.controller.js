import { subscriberTitleService } from "./subscriberTitle.service.js";
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

const createSubscriberTitle = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const { title, subTitle } = req.body;

    const created = await subscriberTitleService.createSubscriberTitleIntoDb({
        title, subTitle
    });

    return generateResponse(res, 201, true, "Subscriber Title created successfully", created);
});

const getAllSubscriberTitles = catchAsync(async (req, res) => {
    const subscriberTitles = await subscriberTitleService.getAllSubscriberTitlesFromDb();
    return generateResponse(res, 200, true, "Subscriber Titles fetched successfully", subscriberTitles);
});

const getSubscriberTitleById = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const subscriberTitle = await subscriberTitleService.getSubscriberTitleByIdFromDb(req.params.subscriberTitleId);
    return generateResponse(res, 200, true, "Subscriber Title fetched successfully", subscriberTitle);
});

const updateSubscriberTitle = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    const { title, subTitle } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title;
    if (subTitle !== undefined) payload.subTitle = subTitle;

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await subscriberTitleService.updateSubscriberTitleIntoDb(req.params.subscriberTitleId, payload);
    return generateResponse(res, 200, true, "Subscriber Title updated successfully", updated);
});

const deleteSubscriberTitle = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    await subscriberTitleService.deleteSubscriberTitleFromDb(req.params.subscriberTitleId);
    return generateResponse(res, 200, true, "Subscriber Title deleted successfully", null);
});

export const subscriberTitleController = {
    createSubscriberTitle,
    getAllSubscriberTitles,
    getSubscriberTitleById,
    updateSubscriberTitle,
    deleteSubscriberTitle,
};
