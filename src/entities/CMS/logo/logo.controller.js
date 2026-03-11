import { logoService } from "./logo.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

/**
 * Create Logo
 * - Requires file in req.files.logo[0]
 * - Returns 201 with created logo
 */
const createLogo = catchAsync(async (req, res) => {
    const logoFile = req.files?.logo?.[0];
    if (!logoFile) {
        return generateResponse(res, 400, false, "Logo file is required", null);
    }

    const payload = { path: logoFile.path };
    const created = await logoService.createLogoIntoDb(payload);

    return generateResponse(res, 201, true, "Logo created successfully", created);
});

/**
 * Get Logo
 * - Returns the existing logo
 */
const getLogo = catchAsync(async (req, res) => {
    const logo = await logoService.getLogoFromDb();
    return generateResponse(res, 200, true, "Logo fetched successfully", logo);
});

/**
 * Update Logo
 * - Requires file in req.files.logo[0]
 * - Updates logo in Cloudinary and DB
 */
const updateLogo = catchAsync(async (req, res) => {
    const logoFile = req.files?.logo?.[0];
    if (!logoFile) {
        return generateResponse(res, 400, false, "Logo file is required to update", null);
    }

    const payload = { path: logoFile.path };
    const updated = await logoService.updateLogoIntoDb(payload);

    return generateResponse(res, 200, true, "Logo updated successfully", updated);
});

/**
 * Delete Logo
 * - Removes logo from DB and Cloudinary
 */
const deleteLogo = catchAsync(async (req, res) => {
    const deleted = await logoService.deleteLogoFromDb();
    return generateResponse(res, 200, true, "Logo deleted successfully", deleted);
});

export const logoController = {
    createLogo,
    getLogo,
    updateLogo,
    deleteLogo,
};