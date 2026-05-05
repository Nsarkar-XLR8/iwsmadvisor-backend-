import { FAQNew } from "./faqnew.model.js";
import { HttpStatusCode } from "axios";
import { AppError } from "../../../errors/AppError.js";

const createFAQNewIntoDb = async (payload) => {
    const existing = await FAQNew.findOne({
        title: payload.title?.trim(),
        description: payload.description?.trim(),
    });
    if (existing) throw new AppError("An FAQ with the same title and description already exists", HttpStatusCode.Conflict);

    const faqNew = await FAQNew.create(payload);
    return faqNew;
};

const getAllFAQNewsFromDb = async () => {
    const faqNews = await FAQNew.find().sort({ createdAt: -1 }).lean();
    return faqNews;
};

const getFAQNewByIdFromDb = async (id) => {
    const faqNew = await FAQNew.findById(id).lean();
    if (!faqNew) throw new AppError("FAQ not found", HttpStatusCode.NotFound);
    return faqNew;
};

const updateFAQNewIntoDb = async (id, payload) => {
    const existingFAQNew = await FAQNew.findById(id);
    if (!existingFAQNew) throw new AppError("FAQ not found", HttpStatusCode.NotFound);

    const fields = ["title", "description"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingFAQNew[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. FAQ is already up to date", HttpStatusCode.Conflict);

    if (payload.title || payload.description) {
        const duplicate = await FAQNew.findOne({
            _id: { $ne: id },
            title: payload.title?.trim() || existingFAQNew.title,
            description: payload.description?.trim() || existingFAQNew.description,
        });
        if (duplicate) throw new AppError("Another FAQ with the same title and description already exists", HttpStatusCode.Conflict);
    }

    const updated = await FAQNew.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteFAQNewFromDb = async (id) => {
    const deleted = await FAQNew.findByIdAndDelete(id);
    if (!deleted) throw new AppError("FAQ not found", HttpStatusCode.NotFound);
    return deleted;
};

export const faqNewService = {
    createFAQNewIntoDb,
    getAllFAQNewsFromDb,
    getFAQNewByIdFromDb,
    updateFAQNewIntoDb,
    deleteFAQNewFromDb,
};
