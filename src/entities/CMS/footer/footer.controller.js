import { footerService } from "./footer.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const createFooter = catchAsync(async (req, res) => {
    const logoFile = req.files?.logo?.[0];
    if (!logoFile) {
        return generateResponse(res, 400, false, "Footer logo is required", null);
    }

    const {
        description,
        email,
        phone,
        copyright,
        quickLinks,
        consultingLinks,
        contactLinks,
        socialLinks,
    } = req.body;

    const cloudinaryResult = await cloudinaryUpload(logoFile.path, `footer-logo-${Date.now()}`, "footer");

    // ✅ No JSON.parse needed — validateRequest already parsed them
    const created = await footerService.createFooterIntoDb({
        logo: cloudinaryResult.url,
        description,
        email,
        phone,
        copyright,
        quickLinks: quickLinks || [],
        consultingLinks: consultingLinks || [],
        contactLinks: contactLinks || [],
        socialLinks: socialLinks || {},
    });

    return generateResponse(res, 201, true, "Footer created successfully", created);
});

const getFooter = catchAsync(async (req, res) => {
    const footer = await footerService.getFooterFromDb();
    return generateResponse(res, 200, true, "Footer fetched successfully", footer);
});

const updateFooter = catchAsync(async (req, res) => {
    const {
        description,
        email,
        phone,
        copyright,
        quickLinks,
        consultingLinks,
        contactLinks,
        socialLinks,
    } = req.body;

    const payload = {};

    if (description !== undefined) payload.description = description;
    if (email !== undefined) payload.email = email;
    if (phone !== undefined) payload.phone = phone;
    if (copyright !== undefined) payload.copyright = copyright;

    // ✅ already parsed by validateRequest — no JSON.parse needed
    if (quickLinks !== undefined) payload.quickLinks = quickLinks;
    if (consultingLinks !== undefined) payload.consultingLinks = consultingLinks;
    if (contactLinks !== undefined) payload.contactLinks = contactLinks;
    if (socialLinks !== undefined) payload.socialLinks = socialLinks;

    // ✅ Upload new logo only if provided
    const logoFile = req.files?.logo?.[0];
    if (logoFile) {
        const cloudinaryResult = await cloudinaryUpload(logoFile.path, `footer-logo-${Date.now()}`, "footer");
        payload.logo = cloudinaryResult.url;
    }

    const updated = await footerService.updateFooterIntoDb(payload);
    return generateResponse(res, 200, true, "Footer updated successfully", updated);
});

const deleteFooter = catchAsync(async (req, res) => {
    await footerService.deleteFooterFromDb();
    return generateResponse(res, 200, true, "Footer deleted successfully", null);
});

export const footerController = {
    createFooter,
    getFooter,
    updateFooter,
    deleteFooter,
};