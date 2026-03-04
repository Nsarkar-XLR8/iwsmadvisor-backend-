import { aboutService } from "./about.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const createAbout = catchAsync(async (req, res) => {
    const imageFile = req.files?.image?.[0];
    if (!imageFile) {
        return generateResponse(res, 400, false, "About image is required", null);
    }

    const { title, subtitle, descriptionTitle, description, btnName } = req.body;

    const cloudinaryResult = await cloudinaryUpload(imageFile.path, `about-${Date.now()}`, "about");
    const created = await aboutService.createAboutIntoDb({
        title, subtitle, descriptionTitle, description, btnName,
        image: cloudinaryResult.url,
    });

    return generateResponse(res, 201, true, "About section created successfully", created);
});

const getAbout = catchAsync(async (req, res) => {
    const about = await aboutService.getAboutFromDb();
    return generateResponse(res, 200, true, "About section fetched successfully", about);
});

const updateAbout = catchAsync(async (req, res) => {
    const { title, subtitle, descriptionTitle, description, btnName } = req.body;
    const payload = {};

    if (title            !== undefined) payload.title            = title.trim();
    if (subtitle         !== undefined) payload.subtitle         = subtitle.trim();
    if (descriptionTitle !== undefined) payload.descriptionTitle = descriptionTitle.trim();
    if (description      !== undefined) payload.description      = description.trim();
    if (btnName          !== undefined) payload.btnName          = btnName.trim();

    // ✅ Upload new image only if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `about-${Date.now()}`, "about");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        payload.image = cloudinaryResult.url;
    }

    // ✅ Check AFTER image processing
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    // ✅ Pass req.params.aboutId to service
    const updated = await aboutService.updateAboutIntoDb(req.params.aboutId, payload);
    return generateResponse(res, 200, true, "About section updated successfully", updated);
});


const deleteAbout = catchAsync(async (req, res) => {
    await aboutService.deleteAboutFromDb();
    return generateResponse(res, 200, true, "About section deleted successfully", null);
});

export const aboutController = {
    createAbout,
    getAbout,
    updateAbout,
    deleteAbout,
};