import { Items } from "./items.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createItemIntoDb = async (payload) => {
    // ✅ Check duplicate title
    const existing = await Items.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Item with this title already exists", HttpStatusCode.Conflict);

    const item = await Items.create(payload);
    return item;
};

const getAllItemsFromDb = async (query) => {
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

    const [totalDocs, items] = await Promise.all([
        Items.countDocuments(),
        Items.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: items,
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

const getItemByIdFromDb = async (id) => {
    const item = await Items.findById(id).lean();
    if (!item) throw new AppError("Item not found", HttpStatusCode.NotFound);
    return item;
};

const updateItemIntoDb = async (id, payload) => {
    const existingItem = await Items.findById(id);
    if (!existingItem) throw new AppError("Item not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Items.findOne({
            title: payload.title.trim(),
            _id: { $ne: id },
        });
        if (duplicate) throw new AppError("Another item with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check all fields for changes
    const fields = ["title", "subtitle", "image"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingItem[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Item is already up to date", HttpStatusCode.Conflict);

    const updated = await Items.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteItemFromDb = async (id) => {
    const deleted = await Items.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Item not found", HttpStatusCode.NotFound);
    return deleted;
};

export const itemsService = {
    createItemIntoDb,
    getAllItemsFromDb,
    getItemByIdFromDb,
    updateItemIntoDb,
    deleteItemFromDb,
};