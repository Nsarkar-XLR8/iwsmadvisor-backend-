import { footerService } from "./footer.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const parseLinkArray = (value) => {
    if (value === undefined || value === null) return undefined;
    let parsed = value;

    if (typeof value === "string") {
        if (value.trim() === "") return undefined;
        try {
            parsed = JSON.parse(value);
        } catch (error) {
            return undefined;
        }
    }

    if (!Array.isArray(parsed)) return undefined;

    const normalized = parsed
        .filter(item => item && typeof item === "object")
        .map(item => ({
            label: typeof item.label === "string" ? item.label.trim() : item.label,
            url: typeof item.url === "string" ? item.url.trim() : item.url,
        }))
        .filter(item => item.label && item.url);

    return normalized.length ? normalized : [];
};

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
    const body = req.body;
    const payload = {};

    // Scalar fields
    ["description", "email", "phone", "copyright"].forEach(field => {
        if (body[field] !== undefined) payload[field] = body[field];
    });

    // Handle Complex Fields (Arrays/Objects) 
    // IMPORTANT: When using form-data, these might come as strings.
    const complexFields = ["quickLinks", "consultingLinks", "contactLinks", "socialLinks"];
    complexFields.forEach(field => {
        if (body[field] !== undefined) {
            if (["quickLinks", "consultingLinks", "contactLinks"].includes(field)) {
                const normalizedLinks = parseLinkArray(body[field]);
                if (normalizedLinks !== undefined) {
                    payload[field] = normalizedLinks;
                }
            } else {
                try {
                    payload[field] = typeof body[field] === 'string'
                        ? JSON.parse(body[field])
                        : body[field];
                } catch (e) {
                    payload[field] = body[field]; // Fallback
                }
            }
        }
    });

    // Logo Upload
    const logoFile = req.files?.logo?.[0];
    if (logoFile) {
        const cloudinaryResult = await cloudinaryUpload(logoFile.path, `logo-${Date.now()}`, "footer");
        if (cloudinaryResult?.url) {
            payload.logo = cloudinaryResult.url;
        }
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