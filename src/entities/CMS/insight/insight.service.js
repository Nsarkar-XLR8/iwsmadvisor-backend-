import { Insight } from "./insight.model.js";
import { HttpStatusCode } from "axios";
import { AppError } from "../../../errors/AppError.js";

const createInsightIntoDb = async (payload) => {
    // Check if identical insight already exists
    const existing = await Insight.findOne({
        title: payload.title?.trim(),
        subTitle: payload.subTitle?.trim(),
    });
    if (existing) throw new AppError("An insight with the same content already exists", HttpStatusCode.Conflict);

    const insight = await Insight.create(payload);
    return insight;
};

const getAllInsightsFromDb = async () => {
    const insights = await Insight.find().sort({ createdAt: -1 }).lean();
    return insights;
};

const getInsightByIdFromDb = async (id) => {
    const insight = await Insight.findById(id).lean();
    if (!insight) throw new AppError("Insight not found", HttpStatusCode.NotFound);
    return insight;
};

const updateInsightIntoDb = async (id, payload) => {
    const existingInsight = await Insight.findById(id);
    if (!existingInsight) throw new AppError("Insight not found", HttpStatusCode.NotFound);

    // Check no changes first
    const fields = ["title", "subTitle"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingInsight[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Insight is already up to date", HttpStatusCode.Conflict);

    // Check duplicate title + subTitle combination
    if (payload.title || payload.subTitle) {
        const duplicate = await Insight.findOne({
            _id: { $ne: id },
            title: payload.title?.trim() || existingInsight.title,
            subTitle: payload.subTitle?.trim() || existingInsight.subTitle,
        });
        if (duplicate) throw new AppError("Another insight with the same title and subtitle already exists", HttpStatusCode.Conflict);
    }

    const updated = await Insight.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteInsightFromDb = async (id) => {
    const deleted = await Insight.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Insight not found", HttpStatusCode.NotFound);
    return deleted;
};

export const insightService = {
    createInsightIntoDb,
    getAllInsightsFromDb,
    getInsightByIdFromDb,
    updateInsightIntoDb,
    deleteInsightFromDb,
};