import { ServiceTitle } from "./serviceTitle.model.js";
import { HttpStatusCode } from "axios";
import { AppError } from "../../../errors/AppError.js";

const createServiceTitleIntoDb = async (payload) => {
    const existing = await ServiceTitle.findOne({
        title: payload.title?.trim(),
        subTitle: payload.subTitle?.trim(),
    });
    if (existing) throw new AppError("A service title with the same content already exists", HttpStatusCode.Conflict);

    const serviceTitle = await ServiceTitle.create(payload);
    return serviceTitle;
};

const getAllServiceTitlesFromDb = async () => {
    const serviceTitles = await ServiceTitle.find().sort({ createdAt: -1 }).lean();
    return serviceTitles;
};

const getServiceTitleByIdFromDb = async (id) => {
    const serviceTitle = await ServiceTitle.findById(id).lean();
    if (!serviceTitle) throw new AppError("Service Title not found", HttpStatusCode.NotFound);
    return serviceTitle;
};

const updateServiceTitleIntoDb = async (id, payload) => {
    const existingServiceTitle = await ServiceTitle.findById(id);
    if (!existingServiceTitle) throw new AppError("Service Title not found", HttpStatusCode.NotFound);

    const fields = ["title", "subTitle"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingServiceTitle[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Service Title is already up to date", HttpStatusCode.Conflict);

    if (payload.title || payload.subTitle) {
        const duplicate = await ServiceTitle.findOne({
            _id: { $ne: id },
            title: payload.title?.trim() || existingServiceTitle.title,
            subTitle: payload.subTitle?.trim() || existingServiceTitle.subTitle,
        });
        if (duplicate) throw new AppError("Another service title with the same title and subtitle already exists", HttpStatusCode.Conflict);
    }

    const updated = await ServiceTitle.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteServiceTitleFromDb = async (id) => {
    const deleted = await ServiceTitle.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Service Title not found", HttpStatusCode.NotFound);
    return deleted;
};

export const serviceTitleService = {
    createServiceTitleIntoDb,
    getAllServiceTitlesFromDb,
    getServiceTitleByIdFromDb,
    updateServiceTitleIntoDb,
    deleteServiceTitleFromDb,
};
