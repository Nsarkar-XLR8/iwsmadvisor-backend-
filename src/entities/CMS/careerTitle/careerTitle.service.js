import { CareerTitle } from "./careerTitle.model.js";
import { HttpStatusCode } from "axios";
import { AppError } from "../../../errors/AppError.js";

const createCareerTitleIntoDb = async (payload) => {
    const existing = await CareerTitle.findOne({
        title: payload.title?.trim(),
        subTitle: payload.subTitle?.trim(),
    });
    if (existing) throw new AppError("A career title with the same content already exists", HttpStatusCode.Conflict);

    const careerTitle = await CareerTitle.create(payload);
    return careerTitle;
};

const getAllCareerTitlesFromDb = async () => {
    const careerTitles = await CareerTitle.find().sort({ createdAt: -1 }).lean();
    return careerTitles;
};

const getCareerTitleByIdFromDb = async (id) => {
    const careerTitle = await CareerTitle.findById(id).lean();
    if (!careerTitle) throw new AppError("Career Title not found", HttpStatusCode.NotFound);
    return careerTitle;
};

const updateCareerTitleIntoDb = async (id, payload) => {
    const existingCareerTitle = await CareerTitle.findById(id);
    if (!existingCareerTitle) throw new AppError("Career Title not found", HttpStatusCode.NotFound);

    const fields = ["title", "subTitle"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingCareerTitle[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Career Title is already up to date", HttpStatusCode.Conflict);

    if (payload.title || payload.subTitle) {
        const duplicate = await CareerTitle.findOne({
            _id: { $ne: id },
            title: payload.title?.trim() || existingCareerTitle.title,
            subTitle: payload.subTitle?.trim() || existingCareerTitle.subTitle,
        });
        if (duplicate) throw new AppError("Another career title with the same title and subtitle already exists", HttpStatusCode.Conflict);
    }

    const updated = await CareerTitle.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteCareerTitleFromDb = async (id) => {
    const deleted = await CareerTitle.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Career Title not found", HttpStatusCode.NotFound);
    return deleted;
};

export const careerTitleService = {
    createCareerTitleIntoDb,
    getAllCareerTitlesFromDb,
    getCareerTitleByIdFromDb,
    updateCareerTitleIntoDb,
    deleteCareerTitleFromDb,
};
