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
    // 1. Get the single footer instance
    const existingFooter = await Footer.findOne();
    if (!existingFooter) throw new AppError("Footer not found.", HttpStatusCode.NotFound);

    // 2. Deep Comparison for Arrays (Order-independent check)
    const isSameArray = (incoming, existing) => {
        if (incoming === undefined) return true;
        return JSON.stringify(incoming) === JSON.stringify(existing.toObject());
    };

    // 3. Scalar Comparison
    const scalarFields = ["description", "email", "phone", "copyright", "logo"];
    const isScalarSame = scalarFields.every(field => {
        if (payload[field] === undefined) return true;
        return String(payload[field]).trim() === String(existingFooter[field] || "").trim();
    });

    // 4. Social Links Comparison
    const isSocialSame = !payload.socialLinks || Object.keys(payload.socialLinks).every(key => {
        return payload.socialLinks[key]?.trim() === existingFooter.socialLinks?.[key]?.trim();
    });

    // 5. Array Fields Comparison
    const linkFields = ["quickLinks", "consultingLinks", "contactLinks"];
    const isLinksSame = linkFields.every(field => isSameArray(payload[field], existingFooter[field]));

    // 6. Final Conflict Check
    if (isScalarSame && isSocialSame && isLinksSame && !payload.logo) {
        throw new AppError("No changes detected.", HttpStatusCode.Conflict);
    }

    // 7. Atomic Update using $set
    // We use findOneAndUpdate to ensure we are updating the record we found
    const updated = await Footer.findOneAndUpdate(
        { _id: existingFooter._id },
        { $set: payload },
        { new: true, runValidators: true }
    ).lean();

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