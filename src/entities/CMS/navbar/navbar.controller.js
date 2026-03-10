import { navbarService } from "./navbar.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

// ✅ Helper — parse JSON string safely
const parseJSON = (value, fieldName, res) => {
    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            generateResponse(res, 400, false, `${fieldName} must be a valid JSON`, null);
            return null;
        }
    }
    return value;
};

const createNavbar = catchAsync(async (req, res) => {
    let { navLinks, ctaButton } = req.body;

    // ✅ Validate logo
    const logoFile = req.files?.logo?.[0];
    if (!logoFile) return generateResponse(res, 400, false, "Logo is required", null);

    // ✅ Validate logo file type
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
    if (!allowedMimeTypes.includes(logoFile.mimetype)) {
        return generateResponse(res, 400, false, "Logo must be a valid image (JPEG, PNG, WEBP, SVG)", null);
    }

    // ✅ Validate logo file size — max 2MB
    const maxSize = 2 * 1024 * 1024;
    if (logoFile.size > maxSize) {
        return generateResponse(res, 400, false, "Logo must not exceed 2MB", null);
    }

    // ✅ Parse navLinks if sent as JSON string from form-data
    navLinks = parseJSON(navLinks, "Nav links", res);
    if (navLinks === null) return;

    // ✅ Validate navLinks
    if (!navLinks) return generateResponse(res, 400, false, "Nav links are required", null);
    if (!Array.isArray(navLinks)) return generateResponse(res, 400, false, "Nav links must be an array", null);
    if (navLinks.length === 0) return generateResponse(res, 400, false, "At least one nav link is required", null);

    // ✅ Validate each navLink
    for (let i = 0; i < navLinks.length; i++) {
        const link = navLinks[i];
        if (link.order === undefined || link.order === null) {
            return generateResponse(res, 400, false, `Order is required for nav link at index ${i}`, null);
        }
        if (isNaN(link.order) || Number(link.order) < 1) {
            return generateResponse(res, 400, false, `Order must be at least 1 for nav link at index ${i}`, null);
        }
        if (!link.label?.trim()) {
            return generateResponse(res, 400, false, `Label is required for nav link at index ${i}`, null);
        }
        if (!link.href?.trim()) {
            return generateResponse(res, 400, false, `Href is required for nav link at index ${i}`, null);
        }
    }

    // ✅ Check duplicate orders in navLinks
    const orders = navLinks.map((link) => Number(link.order));
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        return generateResponse(res, 400, false, "Duplicate order values found. Each nav link must have a unique order", null);
    }

    // ✅ Parse ctaButton if sent as JSON string
    ctaButton = parseJSON(ctaButton, "CTA button", res);
    if (ctaButton === null) return;

    // ✅ Validate ctaButton
    if (!ctaButton) return generateResponse(res, 400, false, "CTA button is required", null);
    if (!ctaButton.label?.trim()) return generateResponse(res, 400, false, "CTA button label is required", null);
    if (!ctaButton.href?.trim())  return generateResponse(res, 400, false, "CTA button href is required", null);

    // ✅ Upload logo to cloudinary
    const cloudinaryResult = await cloudinaryUpload(logoFile.path, `navbar-logo-${Date.now()}`, "navbar");
    if (!cloudinaryResult?.secure_url) {
        return generateResponse(res, 500, false, "Logo upload failed. Please try again", null);
    }

    const created = await navbarService.createNavbarIntoDb({
        logo:      cloudinaryResult.secure_url,
        navLinks,
        ctaButton,
    });

    return generateResponse(res, 201, true, "Navbar created successfully", created);
});

const getNavbar = catchAsync(async (req, res) => {
    const navbar = await navbarService.getNavbarFromDb();
    return generateResponse(res, 200, true, "Navbar fetched successfully", navbar);
});

const updateNavbar = catchAsync(async (req, res) => {
    let { navLinks, ctaButton } = req.body;
    const payload = {};

    // ✅ Upload new logo if provided
    const logoFile = req.files?.logo?.[0];
    if (logoFile) {
        // ✅ Validate logo file type
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];
        if (!allowedMimeTypes.includes(logoFile.mimetype)) {
            return generateResponse(res, 400, false, "Logo must be a valid image (JPEG, PNG, WEBP, SVG)", null);
        }

        // ✅ Validate logo file size — max 2MB
        const maxSize = 2 * 1024 * 1024;
        if (logoFile.size > maxSize) {
            return generateResponse(res, 400, false, "Logo must not exceed 2MB", null);
        }

        const cloudinaryResult = await cloudinaryUpload(logoFile.path, `navbar-logo-${Date.now()}`, "navbar");
        if (!cloudinaryResult?.secure_url) {
            return generateResponse(res, 500, false, "Logo upload failed. Please try again", null);
        }
        payload.logo = cloudinaryResult.secure_url;
    }

    // ✅ Parse navLinks if sent as JSON string
    if (navLinks !== undefined) {
        navLinks = parseJSON(navLinks, "Nav links", res);
        if (navLinks === null) return;

        if (!Array.isArray(navLinks)) return generateResponse(res, 400, false, "Nav links must be an array", null);
        if (navLinks.length === 0)    return generateResponse(res, 400, false, "At least one nav link is required", null);

        // ✅ Validate each navLink
        for (let i = 0; i < navLinks.length; i++) {
            const link = navLinks[i];
            if (link.order === undefined || link.order === null) {
                return generateResponse(res, 400, false, `Order is required for nav link at index ${i}`, null);
            }
            if (isNaN(link.order) || Number(link.order) < 1) {
                return generateResponse(res, 400, false, `Order must be at least 1 for nav link at index ${i}`, null);
            }
            // ✅ On update — label and href optional but cannot be empty if provided
            if (link.label !== undefined && !link.label?.trim()) {
                return generateResponse(res, 400, false, `Label cannot be empty for nav link at index ${i}`, null);
            }
            if (link.href !== undefined && !link.href?.trim()) {
                return generateResponse(res, 400, false, `Href cannot be empty for nav link at index ${i}`, null);
            }
        }

        // ✅ Check duplicate orders
        const orders = navLinks.map((link) => Number(link.order));
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
            return generateResponse(res, 400, false, "Duplicate order values found. Each nav link must have a unique order", null);
        }

        payload.navLinks = navLinks;
    }

    // ✅ Parse ctaButton if sent as JSON string
    if (ctaButton !== undefined) {
        ctaButton = parseJSON(ctaButton, "CTA button", res);
        if (ctaButton === null) return;

        if (typeof ctaButton !== "object" || Array.isArray(ctaButton)) {
            return generateResponse(res, 400, false, "CTA button must be an object", null);
        }
        // ✅ On update — label and href optional but cannot be empty if provided
        if (ctaButton.label !== undefined && !ctaButton.label?.trim()) {
            return generateResponse(res, 400, false, "CTA button label cannot be empty", null);
        }
        if (ctaButton.href !== undefined && !ctaButton.href?.trim()) {
            return generateResponse(res, 400, false, "CTA button href cannot be empty", null);
        }

        payload.ctaButton = ctaButton;
    }

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await navbarService.updateNavbarIntoDb(payload);
    return generateResponse(res, 200, true, "Navbar updated successfully", updated);
});

const deleteNavbar = catchAsync(async (req, res) => {
    await navbarService.deleteNavbarFromDb();
    return generateResponse(res, 200, true, "Navbar deleted successfully", null);
});

export const navbarController = {
    createNavbar,
    getNavbar,
    updateNavbar,
    deleteNavbar,
};