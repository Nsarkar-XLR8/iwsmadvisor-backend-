import { informationService } from "./information.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

const createInformation = catchAsync(async (req, res) => {
    const { title, description, email, phone, address, mapUrl } = req.body;

    // ✅ Validate all required fields
    if (!title?.trim()) return generateResponse(res, 400, false, "Title is required", null);
    if (!description?.trim()) return generateResponse(res, 400, false, "Description is required", null);
    if (!email?.trim()) return generateResponse(res, 400, false, "Email is required", null);
    if (!phone?.trim()) return generateResponse(res, 400, false, "Phone is required", null);
    if (!address?.trim()) return generateResponse(res, 400, false, "Address is required", null);
    if (!mapUrl?.trim()) return generateResponse(res, 400, false, "Map URL is required", null);

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return generateResponse(res, 400, false, "Invalid email format", null);
    }

    // ✅ Validate mapUrl
    if (!mapUrl.includes("google.com/maps")) {
        return generateResponse(res, 400, false, "Map URL must be a valid Google Maps embed URL", null);
    }

    const created = await informationService.createInformationIntoDb({
        title: title.trim(),
        description: description.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        mapUrl: mapUrl.trim(),
    });

    return generateResponse(res, 201, true, "Contact information created successfully", created);
});

const getInformation = catchAsync(async (req, res) => {
    const information = await informationService.getInformationFromDb();
    return generateResponse(res, 200, true, "Contact information fetched successfully", information);
});

const updateInformation = catchAsync(async (req, res) => {
    const { title, description, email, phone, address, mapUrl } = req.body;
    const payload = {};

    // ✅ Only add fields that are actually provided
    if (title !== undefined) payload.title = title.trim();
    if (description !== undefined) payload.description = description.trim();
    if (phone !== undefined) payload.phone = phone.trim();
    if (address !== undefined) payload.address = address.trim();

    // ✅ Validate email if provided
    if (email !== undefined) {
        if (!email?.trim()) {
            return generateResponse(res, 400, false, "Email cannot be empty", null);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return generateResponse(res, 400, false, "Invalid email format", null);
        }
        payload.email = email.trim();
    }

    // ✅ Validate mapUrl if provided
    if (mapUrl !== undefined) {
        if (!mapUrl?.trim()) {
            return generateResponse(res, 400, false, "Map URL cannot be empty", null);
        }
        if (!mapUrl.includes("google.com/maps")) {
            return generateResponse(res, 400, false, "Map URL must be a valid Google Maps embed URL", null);
        }
        payload.mapUrl = mapUrl.trim();
    }

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await informationService.updateInformationIntoDb(payload);
    return generateResponse(res, 200, true, "Contact information updated successfully", updated);
});

const deleteInformation = catchAsync(async (req, res) => {
    await informationService.deleteInformationFromDb();
    return generateResponse(res, 200, true, "Contact information deleted successfully", null);
});

export const informationController = {
    createInformation,
    getInformation,
    updateInformation,
    deleteInformation,
};