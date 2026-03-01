import { Banner } from "./banner.model.js";
import { HttpStatusCode } from "axios";
import { AppError } from "../../../errors/AppError.js";

const createBannerIntoDb = async (payload) => {
    // ✅ Check if identical banner already exists
    const existing = await Banner.findOne({
        title: payload.title?.trim(),
        subTitle: payload.subTitle?.trim(),
        btn1: payload.btn1?.trim(),
        btn2: payload.btn2?.trim(),
    });
    if (existing) throw new AppError("A banner with the same content already exists", HttpStatusCode.Conflict);

    const banner = await Banner.create(payload);
    return banner;
};

const getAllBannersFromDb = async () => {
    const banners = await Banner.find().sort({ createdAt: -1 }).lean();
    return banners;
};

const getBannerByIdFromDb = async (id) => {
    const banner = await Banner.findById(id).lean();
    if (!banner) throw new AppError("Banner not found", HttpStatusCode.NotFound);
    return banner;
};

const updateBannerIntoDb = async (id, payload) => {
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) throw new AppError("Banner not found", HttpStatusCode.NotFound);

    // ✅ Check if the incoming payload is identical to the current document
    const fields = ["title", "subTitle", "btn1", "btn2", "image"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true; // field not being updated — skip
        return payload[field]?.trim?.() === existingBanner[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Banner is already up to date", HttpStatusCode.Conflict);

    // ✅ Check if another banner already has the same title + subTitle combination
    if (payload.title || payload.subTitle) {
        const duplicate = await Banner.findOne({
            _id: { $ne: id },
            title: payload.title?.trim() || existingBanner.title,
            subTitle: payload.subTitle?.trim() || existingBanner.subTitle,
        });
        if (duplicate) throw new AppError("Another banner with the same title and sub title already exists", HttpStatusCode.Conflict);
    }

    const updated = await Banner.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteBannerFromDb = async (id) => {
    const deleted = await Banner.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Banner not found", HttpStatusCode.NotFound);
    return deleted;
};

export const bannerService = {
    createBannerIntoDb,
    getAllBannersFromDb,
    getBannerByIdFromDb,
    updateBannerIntoDb,
    deleteBannerFromDb,
};