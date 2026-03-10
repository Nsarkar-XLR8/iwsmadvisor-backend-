import { Navbar } from "./navbar.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createNavbarIntoDb = async (payload) => {
    // ✅ Singleton — only one navbar should exist
    const existing = await Navbar.findOne();
    if (existing) throw new AppError("Navbar already exists. Use update instead.", HttpStatusCode.Conflict);

    // ✅ Validate logo
    if (!payload.logo) throw new AppError("Logo is required", HttpStatusCode.BadRequest);

    // ✅ Validate navLinks
    if (!payload.navLinks || !Array.isArray(payload.navLinks) || payload.navLinks.length === 0) {
        throw new AppError("At least one nav link is required", HttpStatusCode.BadRequest);
    }

    // ✅ Validate each navLink
    for (let i = 0; i < payload.navLinks.length; i++) {
        const link = payload.navLinks[i];
        if (!link.order || isNaN(link.order) || link.order < 1) {
            throw new AppError(`Order is required and must be at least 1 for nav link at index ${i}`, HttpStatusCode.BadRequest);
        }
        if (!link.label?.trim()) {
            throw new AppError(`Label is required for nav link at index ${i}`, HttpStatusCode.BadRequest);
        }
        if (!link.href?.trim()) {
            throw new AppError(`Href is required for nav link at index ${i}`, HttpStatusCode.BadRequest);
        }
    }

    // ✅ Check duplicate orders in navLinks
    const orders = payload.navLinks.map((link) => Number(link.order));
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        throw new AppError("Duplicate order values found in nav links. Each link must have a unique order", HttpStatusCode.BadRequest);
    }

    // ✅ Validate ctaButton
    if (!payload.ctaButton) {
        throw new AppError("CTA button is required", HttpStatusCode.BadRequest);
    }
    if (!payload.ctaButton.label?.trim()) {
        throw new AppError("CTA button label is required", HttpStatusCode.BadRequest);
    }
    if (!payload.ctaButton.href?.trim()) {
        throw new AppError("CTA button href is required", HttpStatusCode.BadRequest);
    }

    // ✅ Sort navLinks by order before saving
    const sortedNavLinks = [...payload.navLinks]
        .map((link) => ({
            order: Number(link.order),
            label: link.label.trim(),
            href: link.href.trim(),
        }))
        .sort((a, b) => a.order - b.order);

    const navbar = await Navbar.create({
        logo: payload.logo,
        navLinks: sortedNavLinks,
        ctaButton: {
            label: payload.ctaButton.label.trim(),
            href: payload.ctaButton.href.trim(),
        },
    });

    return navbar;
};

const getNavbarFromDb = async () => {
    const navbar = await Navbar.findOne().lean();
    if (!navbar) throw new AppError("Navbar not found", HttpStatusCode.NotFound);

    // ✅ Always return navLinks sorted by order
    navbar.navLinks.sort((a, b) => a.order - b.order);
    return navbar;
};

const updateNavbarIntoDb = async (payload) => {
    const existingNavbar = await Navbar.findOne();
    if (!existingNavbar) throw new AppError("Navbar not found. Create one first.", HttpStatusCode.NotFound);

    const updateData = {};

    // ✅ Update logo if provided
    if (payload.logo) {
        updateData.logo = payload.logo;
    }

    // ✅ Validate and process navLinks if provided
    if (payload.navLinks !== undefined) {
        if (!Array.isArray(payload.navLinks) || payload.navLinks.length === 0) {
            throw new AppError("At least one nav link is required", HttpStatusCode.BadRequest);
        }

        // ✅ Validate each navLink
        for (let i = 0; i < payload.navLinks.length; i++) {
            const link = payload.navLinks[i];
            if (!link.order || isNaN(link.order) || link.order < 1) {
                throw new AppError(`Order is required and must be at least 1 for nav link at index ${i}`, HttpStatusCode.BadRequest);
            }
            if (link.label !== undefined && !link.label?.trim()) {
                throw new AppError(`Label cannot be empty for nav link at index ${i}`, HttpStatusCode.BadRequest);
            }
            if (link.href !== undefined && !link.href?.trim()) {
                throw new AppError(`Href cannot be empty for nav link at index ${i}`, HttpStatusCode.BadRequest);
            }
        }

        // ✅ Check duplicate orders
        const orders = payload.navLinks.map((link) => Number(link.order));
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
            throw new AppError("Duplicate order values found in nav links. Each link must have a unique order", HttpStatusCode.BadRequest);
        }

        // ✅ Merge by order — preserve existing fields if not provided
        const mergedNavLinks = payload.navLinks.map((incomingLink) => {
            const existingLink = existingNavbar.navLinks.find(
                (link) => link.order === Number(incomingLink.order)
            );
            return {
                order: Number(incomingLink.order),
                label: incomingLink.label?.trim() ?? existingLink?.label ?? "",
                href: incomingLink.href?.trim() ?? existingLink?.href ?? "",
            };
        });

        // ✅ Sort by order before saving
        mergedNavLinks.sort((a, b) => a.order - b.order);
        updateData.navLinks = mergedNavLinks;
    }

    // ✅ Validate and process ctaButton if provided
    if (payload.ctaButton !== undefined) {
        if (payload.ctaButton.label !== undefined && !payload.ctaButton.label?.trim()) {
            throw new AppError("CTA button label cannot be empty", HttpStatusCode.BadRequest);
        }
        if (payload.ctaButton.href !== undefined && !payload.ctaButton.href?.trim()) {
            throw new AppError("CTA button href cannot be empty", HttpStatusCode.BadRequest);
        }

        // ✅ Merge with existing ctaButton
        updateData.ctaButton = {
            label: payload.ctaButton.label?.trim() ?? existingNavbar.ctaButton.label,
            href: payload.ctaButton.href?.trim() ?? existingNavbar.ctaButton.href,
        };
    }

    // ✅ Nothing to update
    if (Object.keys(updateData).length === 0) {
        throw new AppError("At least one field must be provided to update", HttpStatusCode.BadRequest);
    }

    // ✅ Check no changes
    const isLogoSame = !updateData.logo || updateData.logo === existingNavbar.logo;
    const isNavLinksSame = !updateData.navLinks || (() => {
        if (updateData.navLinks.length !== existingNavbar.navLinks.length) return false;
        return JSON.stringify(updateData.navLinks) === JSON.stringify(
            [...existingNavbar.navLinks]
                .map(({ order, label, href }) => ({ order, label, href }))
                .sort((a, b) => a.order - b.order)
        );
    })();
    const isCtaButtonSame = !updateData.ctaButton || (
        updateData.ctaButton.label === existingNavbar.ctaButton.label &&
        updateData.ctaButton.href === existingNavbar.ctaButton.href
    );

    if (isLogoSame && isNavLinksSame && isCtaButtonSame) {
        throw new AppError("No changes detected. Navbar is already up to date", HttpStatusCode.Conflict);
    }

    const updated = await Navbar.findByIdAndUpdate(
        existingNavbar._id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteNavbarFromDb = async () => {
    const deleted = await Navbar.findOneAndDelete();
    if (!deleted) throw new AppError("Navbar not found", HttpStatusCode.NotFound);
    return deleted;
};

export const navbarService = {
    createNavbarIntoDb,
    getNavbarFromDb,
    updateNavbarIntoDb,
    deleteNavbarFromDb,
};