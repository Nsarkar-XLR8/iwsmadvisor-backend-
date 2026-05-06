import { serviceTitleService } from "./serviceTitle.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";


const createServiceTitle = catchAsync(async (req, res) => {

    const { title, subTitle } = req.body;

    const created = await serviceTitleService.createServiceTitleIntoDb({
        title, subTitle
    });

    return generateResponse(res, 201, true, "Service Title created successfully", created);
});

const getAllServiceTitles = catchAsync(async (req, res) => {
    const serviceTitles = await serviceTitleService.getAllServiceTitlesFromDb();
    return generateResponse(res, 200, true, "Service Titles fetched successfully", serviceTitles);
});

const getServiceTitleById = catchAsync(async (req, res) => {

    const serviceTitle = await serviceTitleService.getServiceTitleByIdFromDb(req.params.serviceTitleId);
    return generateResponse(res, 200, true, "Service Title fetched successfully", serviceTitle);
});

const updateServiceTitle = catchAsync(async (req, res) => {

    const { title, subTitle } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title;
    if (subTitle !== undefined) payload.subTitle = subTitle;

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await serviceTitleService.updateServiceTitleIntoDb(req.params.serviceTitleId, payload);
    return generateResponse(res, 200, true, "Service Title updated successfully", updated);
});

const deleteServiceTitle = catchAsync(async (req, res) => {

    await serviceTitleService.deleteServiceTitleFromDb(req.params.serviceTitleId);
    return generateResponse(res, 200, true, "Service Title deleted successfully", null);
});

export const serviceTitleController = {
    createServiceTitle,
    getAllServiceTitles,
    getServiceTitleById,
    updateServiceTitle,
    deleteServiceTitle,
};
