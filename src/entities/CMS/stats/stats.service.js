import { Stats } from "./stats.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createStatsIntoDb = async (payload) => {
    // ✅ Check for duplicate title
    const existing = await Stats.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Stats section with this title already exists", HttpStatusCode.Conflict);

    // ✅ Check for duplicate order values
    const orders = payload.items.map((item) => item.order);
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        throw new AppError("Duplicate order values found. Each item must have a unique order", HttpStatusCode.BadRequest);
    }

    // ✅ Sort items by order before saving
    payload.items.sort((a, b) => a.order - b.order);

    const stats = await Stats.create(payload);
    return stats;
};

const getAllStatsFromDb = async (query) => {
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

    const [totalDocs, stats] = await Promise.all([
        Stats.countDocuments(),
        Stats.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: stats,
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

const getStatsByIdFromDb = async (id) => {
    const stats = await Stats.findById(id).lean();
    if (!stats) throw new AppError("Stats section not found", HttpStatusCode.NotFound);
    stats.items.sort((a, b) => a.order - b.order);
    return stats;
};

const updateStatsIntoDb = async (id, payload) => {
    const existingStats = await Stats.findById(id);
    if (!existingStats) throw new AppError("Stats section not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Stats.findOne({
            title: payload.title.trim(),
            _id: { $ne: id },
        });
        if (duplicate) throw new AppError("Another stats section with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check scalar fields for changes
    const scalarFields = ["title", "subtitle"];
    const isScalarSame = scalarFields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingStats[field]?.trim?.();
    });

    // ✅ Check items for changes
    const isItemsSame = (() => {
        if (payload.items === undefined) return true;
        if (payload.items.length !== existingStats.items.length) return false;
        const incoming = JSON.stringify([...payload.items].sort((a, b) => a.order - b.order));
        const existing = JSON.stringify(
            existingStats.items
                .map(({ order, value, title, description }) => ({ order, value, title, description }))
                .sort((a, b) => a.order - b.order)
        );
        return incoming === existing;
    })();

    if (isScalarSame && isItemsSame) {
        throw new AppError("No changes detected. Stats section is already up to date", HttpStatusCode.Conflict);
    }

    if (payload.items !== undefined) {
        // ✅ Check for duplicate order values
        const orders = payload.items.map((item) => item.order);
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
            throw new AppError("Duplicate order values found. Each item must have a unique order", HttpStatusCode.BadRequest);
        }

        // ✅ Check for duplicate titles within items
        const titles = payload.items.map((item) => item.title?.trim().toLowerCase());
        const uniqueTitles = new Set(titles);
        if (uniqueTitles.size !== titles.length) {
            throw new AppError("Duplicate titles found. Each item must have a unique title", HttpStatusCode.BadRequest);
        }

        // ✅ Sort items by order before saving
        payload.items.sort((a, b) => a.order - b.order);
    }

    const updated = await Stats.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    updated.items.sort((a, b) => a.order - b.order);
    return updated;
};

const deleteStatsFromDb = async (statsId) => {
    const deleted = await Stats.findByIdAndDelete(statsId);

    if (!deleted)
        throw new AppError("Stats section not found", HttpStatusCode.NotFound);

    return deleted;
};

export const statsService = {
    createStatsIntoDb,
    getAllStatsFromDb,
    getStatsByIdFromDb,
    updateStatsIntoDb,
    deleteStatsFromDb,
};