import { Hero } from "./hero.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createHeroIntoDb = async (payload) => {
    // ✅ Check duplicate title
    const existing = await Hero.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Hero section with this title already exists", HttpStatusCode.Conflict);

    const hero = await Hero.create(payload);
    return hero;
};

const getAllHeroesFromDb = async (query) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "title"];
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(Math.max(1, Number(limit)), 100);
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const sort = { [safeSortBy]: safeSortOrder };
    const skip = (safePage - 1) * safeLimit;

    const [totalDocs, heroes] = await Promise.all([
        Hero.countDocuments(),
        Hero.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: heroes,
        meta: {
            totalDocs,
            totalPages,
            currentPage: safePage,
            limit: safeLimit,
            hasNextPage: safePage < totalPages,
            hasPrevPage: safePage > 1,
        },
    };
};

const getHeroByIdFromDb = async (id) => {
    const hero = await Hero.findById(id).lean();
    if (!hero) throw new AppError("Hero section not found", HttpStatusCode.NotFound);
    return hero;
};

const updateHeroIntoDb = async (id, payload) => {
    const existingHero = await Hero.findById(id);
    if (!existingHero) throw new AppError("Hero section not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Hero.findOne({
            title: payload.title.trim(),
            _id: { $ne: id },
        });
        if (duplicate) throw new AppError("Another hero section with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check scalar fields for changes
    const scalarFields = ["title", "subtitle", "image"];
    const isSame = scalarFields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingHero[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Hero section is already up to date", HttpStatusCode.Conflict);

    const updated = await Hero.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteHeroFromDb = async (id) => {
    const deleted = await Hero.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Hero section not found", HttpStatusCode.NotFound);
    return deleted;
};

export const heroService = {
    createHeroIntoDb,
    getAllHeroesFromDb,
    getHeroByIdFromDb,
    updateHeroIntoDb,
    deleteHeroFromDb,
};