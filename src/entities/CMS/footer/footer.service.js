import { Footer } from "./footer.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createFooterIntoDb = async (payload) => {
    // ✅ Singleton — only one footer should ever exist
    const existing = await Footer.findOne();
    if (existing) throw new AppError("Footer already exists. Use update instead.", HttpStatusCode.Conflict);

    const footer = await Footer.create(payload);
    return footer;
};

const getFooterFromDb = async () => {
    const footer = await Footer.findOne().lean();
    if (!footer) throw new AppError("Footer not found", HttpStatusCode.NotFound);
    return footer;
};

const updateFooterIntoDb = async (payload) => {
    const existingFooter = await Footer.findOne();
    if (!existingFooter) throw new AppError("Footer not found. Create one first.", HttpStatusCode.NotFound);

    // ✅ Check scalar fields for changes
    const scalarFields = ["description", "email", "phone", "copyright", "logo"];
    const isScalarSame = scalarFields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingFooter[field]?.trim?.();
    });

    // ✅ Check socialLinks for changes
    const isSocialSame = !payload.socialLinks || Object.keys(payload.socialLinks).every((key) => {
        return payload.socialLinks[key]?.trim() === existingFooter.socialLinks?.[key]?.trim();
    });

    // ✅ Check link arrays for changes
    const linkFields = ["quickLinks", "consultingLinks", "contactLinks"];
    const isLinksSame = linkFields.every((field) => {
        if (payload[field] === undefined) return true;
        const incoming = JSON.stringify(payload[field]);
        // ✅ Convert Mongoose array to plain object before stringify
        const existing = JSON.stringify(existingFooter[field].toObject?.() ?? existingFooter[field]);
        return incoming === existing;
    });

    if (isScalarSame && isSocialSame && isLinksSame) {
        throw new AppError("No changes detected. Footer is already up to date", HttpStatusCode.Conflict);
    }

    // ✅ Merge socialLinks — convert Mongoose subdoc to plain object first
    if (payload.socialLinks) {
        const existingSocial = existingFooter.socialLinks?.toObject?.() ?? existingFooter.socialLinks ?? {};
        payload.socialLinks = {
            ...existingSocial,
            ...payload.socialLinks,
        };
    }

    const updated = await Footer.findByIdAndUpdate(
        existingFooter._id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};


const deleteFooterFromDb = async () => {
    const deleted = await Footer.findOneAndDelete();
    if (!deleted) throw new AppError("Footer not found", HttpStatusCode.NotFound);
    return deleted;
};

export const footerService = {
    createFooterIntoDb,
    getFooterFromDb,
    updateFooterIntoDb,
    deleteFooterFromDb,
};