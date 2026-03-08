import { statsService } from "./stats.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

const createStats = catchAsync(async (req, res) => {
    const { title, subtitle, items } = req.body;

    // ✅ items must exist and be an array
    if (!items || !Array.isArray(items) || items.length === 0) {
        return generateResponse(res, 400, false, "At least one stat item is required", null);
    }

    // ✅ Validate each item
    for (let i = 0; i < items.length; i++) {
        const item = items[i];

        if (!item.order || isNaN(item.order) || item.order < 1) {
            return generateResponse(res, 400, false, `Order is required and must be at least 1 for item at index ${i}`, null);
        }
        if (!item.value?.trim()) {
            return generateResponse(res, 400, false, `Value is required for item at index ${i}`, null);
        }
        if (!item.title?.trim()) {
            return generateResponse(res, 400, false, `Title is required for item at index ${i}`, null);
        }
        if (!item.description?.trim()) {
            return generateResponse(res, 400, false, `Description is required for item at index ${i}`, null);
        }
    }

    // ✅ Check for duplicate order values in controller before hitting service
    const orders = items.map((item) => Number(item.order));
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        return generateResponse(res, 400, false, "Duplicate order values found. Each item must have a unique order", null);
    }

    // ✅ Check for duplicate titles in controller before hitting service
    const titles = items.map((item) => item.title?.trim().toLowerCase());
    const uniqueTitles = new Set(titles);
    if (uniqueTitles.size !== titles.length) {
        return generateResponse(res, 400, false, "Duplicate titles found. Each item must have a unique title", null);
    }

    // ✅ Sanitize items
    const sanitizedItems = items.map((item) => ({
        order: Number(item.order),
        value: item.value.trim(),
        title: item.title.trim(),
        description: item.description.trim(),
    }));

    const created = await statsService.createStatsIntoDb({
        title: title.trim(),
        subtitle: subtitle.trim(),
        items: sanitizedItems,
    });

    return generateResponse(res, 201, true, "Stats section created successfully", created);
});

const getAllStats = catchAsync(async (req, res) => {
    // ✅ pass req.query so pagination works
    const result = await statsService.getAllStatsFromDb(req.query);
    return generateResponse(res, 200, true, "Stats sections fetched successfully", result.data, result.meta);
});

const getStatsById = catchAsync(async (req, res) => {
    const stats = await statsService.getStatsByIdFromDb(req.params.statsId);
    return generateResponse(res, 200, true, "Stats section fetched successfully", stats);
})

const updateStats = catchAsync(async (req, res) => {
    const { title, subtitle, items } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title.trim();
    if (subtitle !== undefined) payload.subtitle = subtitle.trim();

    if (items !== undefined) {
        // ✅ items must be a valid array if provided
        if (!Array.isArray(items) || items.length === 0) {
            return generateResponse(res, 400, false, "Stats items cannot be empty", null);
        }

        // ✅ Validate each item
        for (let i = 0; i < items.length; i++) {
            const item = items[i];

            if (!item.order || isNaN(item.order) || item.order < 1) {
                return generateResponse(res, 400, false, `Order is required and must be at least 1 for item at index ${i}`, null);
            }
            if (!item.value?.trim()) {
                return generateResponse(res, 400, false, `Value is required for item at index ${i}`, null);
            }
            if (!item.title?.trim()) {
                return generateResponse(res, 400, false, `Title is required for item at index ${i}`, null);
            }
            if (!item.description?.trim()) {
                return generateResponse(res, 400, false, `Description is required for item at index ${i}`, null);
            }
        }

        // ✅ Check for duplicate order values
        const orders = items.map((item) => Number(item.order));
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
            return generateResponse(res, 400, false, "Duplicate order values found. Each item must have a unique order", null);
        }

        // ✅ Check for duplicate titles
        const titles = items.map((item) => item.title?.trim().toLowerCase());
        const uniqueTitles = new Set(titles);
        if (uniqueTitles.size !== titles.length) {
            return generateResponse(res, 400, false, "Duplicate titles found. Each item must have a unique title", null);
        }

        // ✅ Sanitize items
        payload.items = items.map((item) => ({
            order: Number(item.order),
            value: item.value.trim(),
            title: item.title.trim(),
            description: item.description.trim(),
        }));
    }

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    // ✅ pass req.params.statsId as first argument
    const updated = await statsService.updateStatsIntoDb(req.params.statsId, payload);
    return generateResponse(res, 200, true, "Stats section updated successfully", updated);
});

const deleteStats = catchAsync(async (req, res) => {

    const { statsId } = req.params;

    await statsService.deleteStatsFromDb(statsId);

    return generateResponse(
        res,
        200,
        true,
        "Stats section deleted successfully",
        null
    );
});

export const statsController = {
    createStats,
    getStatsById,
    getAllStats,
    updateStats,
    deleteStats,
};