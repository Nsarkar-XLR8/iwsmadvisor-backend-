import { faqNewService } from "./faqnew.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

const createFAQNew = catchAsync(async (req, res) => {
    const { title, description } = req.body;

    const created = await faqNewService.createFAQNewIntoDb({
        title,
        description
    });

    return generateResponse(res, 201, true, "FAQ created successfully", created);
});

const getAllFAQNews = catchAsync(async (req, res) => {
    const faqNews = await faqNewService.getAllFAQNewsFromDb();
    return generateResponse(res, 200, true, "FAQs fetched successfully", faqNews);
});

const getFAQNewById = catchAsync(async (req, res) => {
    const faqNew = await faqNewService.getFAQNewByIdFromDb(req.params.faqNewId);
    return generateResponse(res, 200, true, "FAQ fetched successfully", faqNew);
});

const updateFAQNew = catchAsync(async (req, res) => {
    const { title, description } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await faqNewService.updateFAQNewIntoDb(req.params.faqNewId, payload);
    return generateResponse(res, 200, true, "FAQ updated successfully", updated);
});

const deleteFAQNew = catchAsync(async (req, res) => {
    await faqNewService.deleteFAQNewFromDb(req.params.faqNewId);
    return generateResponse(res, 200, true, "FAQ deleted successfully", null);
});

export const faqNewController = {
    createFAQNew,
    getAllFAQNews,
    getFAQNewById,
    updateFAQNew,
    deleteFAQNew,
};
