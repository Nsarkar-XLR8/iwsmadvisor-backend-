import { SubscriberTitle } from "./subscriberTitle.model.js";
import { HttpStatusCode } from "axios";
import { AppError } from "../../../errors/AppError.js";

const createSubscriberTitleIntoDb = async (payload) => {
    const existing = await SubscriberTitle.findOne({
        title: payload.title?.trim(),
        subTitle: payload.subTitle?.trim(),
    });
    if (existing) throw new AppError("A subscriber title with the same content already exists", HttpStatusCode.Conflict);

    const subscriberTitle = await SubscriberTitle.create(payload);
    return subscriberTitle;
};

const getAllSubscriberTitlesFromDb = async () => {
    const subscriberTitles = await SubscriberTitle.find().sort({ createdAt: -1 }).lean();
    return subscriberTitles;
};

const getSubscriberTitleByIdFromDb = async (id) => {
    const subscriberTitle = await SubscriberTitle.findById(id).lean();
    if (!subscriberTitle) throw new AppError("Subscriber Title not found", HttpStatusCode.NotFound);
    return subscriberTitle;
};

const updateSubscriberTitleIntoDb = async (id, payload) => {
    const existingSubscriberTitle = await SubscriberTitle.findById(id);
    if (!existingSubscriberTitle) throw new AppError("Subscriber Title not found", HttpStatusCode.NotFound);

    const fields = ["title", "subTitle"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingSubscriberTitle[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Subscriber Title is already up to date", HttpStatusCode.Conflict);

    if (payload.title || payload.subTitle) {
        const duplicate = await SubscriberTitle.findOne({
            _id: { $ne: id },
            title: payload.title?.trim() || existingSubscriberTitle.title,
            subTitle: payload.subTitle?.trim() || existingSubscriberTitle.subTitle,
        });
        if (duplicate) throw new AppError("Another subscriber title with the same title and subtitle already exists", HttpStatusCode.Conflict);
    }

    const updated = await SubscriberTitle.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteSubscriberTitleFromDb = async (id) => {
    const deleted = await SubscriberTitle.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Subscriber Title not found", HttpStatusCode.NotFound);
    return deleted;
};

export const subscriberTitleService = {
    createSubscriberTitleIntoDb,
    getAllSubscriberTitlesFromDb,
    getSubscriberTitleByIdFromDb,
    updateSubscriberTitleIntoDb,
    deleteSubscriberTitleFromDb,
};
