import { numberService } from "./number.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

const createNumber = catchAsync(async (req, res) => {
    const { items } = req.body;

    // ✅ Validate items exists
    if (!items) {
        return generateResponse(res, 400, false, "Items are required", null);
    }

    // ✅ Parse items if sent as JSON string from form-data
    let parsedItems = items;
    if (typeof items === "string") {
        try {
            parsedItems = JSON.parse(items);
        } catch {
            return generateResponse(res, 400, false, "Items must be a valid JSON array", null);
        }
    }

    // ✅ Validate items is array
    if (!Array.isArray(parsedItems)) {
        return generateResponse(res, 400, false, "Items must be an array", null);
    }

    // ✅ Validate items not empty
    if (parsedItems.length === 0) {
        return generateResponse(res, 400, false, "At least one item is required", null);
    }

    // ✅ Validate each item in controller before hitting service
    for (let i = 0; i < parsedItems.length; i++) {
        const item = parsedItems[i];

        if (item.order === undefined || item.order === null) {
            return generateResponse(res, 400, false, `Order is required for item at index ${i}`, null);
        }
        if (isNaN(item.order) || Number(item.order) < 1) {
            return generateResponse(res, 400, false, `Order must be at least 1 for item at index ${i}`, null);
        }
        if (!item.value?.trim()) {
            return generateResponse(res, 400, false, `Value is required for item at index ${i}`, null);
        }
        if (!item.label?.trim()) {
            return generateResponse(res, 400, false, `Label is required for item at index ${i}`, null);
        }
    }

    // ✅ Check duplicate orders in controller
    const orders = parsedItems.map((item) => Number(item.order));
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        return generateResponse(res, 400, false, "Duplicate order values found. Each item must have a unique order", null);
    }

    const created = await numberService.createNumberIntoDb({ items: parsedItems });
    return generateResponse(res, 201, true, "Number section created successfully", created);
});

const getNumber = catchAsync(async (req, res) => {
    const number = await numberService.getNumberFromDb();
    return generateResponse(res, 200, true, "Number section fetched successfully", number);
});

const updateNumber = catchAsync(async (req, res) => {
    const { items } = req.body;

    // ✅ Validate items exists
    if (!items) {
        return generateResponse(res, 400, false, "Items are required", null);
    }

    // ✅ Parse items if sent as JSON string from form-data
    let parsedItems = items;
    if (typeof items === "string") {
        try {
            parsedItems = JSON.parse(items);
        } catch {
            return generateResponse(res, 400, false, "Items must be a valid JSON array", null);
        }
    }

    // ✅ Validate items is array
    if (!Array.isArray(parsedItems)) {
        return generateResponse(res, 400, false, "Items must be an array", null);
    }

    // ✅ Validate items not empty
    if (parsedItems.length === 0) {
        return generateResponse(res, 400, false, "At least one item is required", null);
    }

    // ✅ Validate each item
    for (let i = 0; i < parsedItems.length; i++) {
        const item = parsedItems[i];

        if (item.order === undefined || item.order === null) {
            return generateResponse(res, 400, false, `Order is required for item at index ${i}`, null);
        }
        if (isNaN(item.order) || Number(item.order) < 1) {
            return generateResponse(res, 400, false, `Order must be at least 1 for item at index ${i}`, null);
        }
        // ✅ On update — value and label optional but cannot be empty if provided
        if (item.value !== undefined && !item.value?.trim()) {
            return generateResponse(res, 400, false, `Value cannot be empty for item at index ${i}`, null);
        }
        if (item.label !== undefined && !item.label?.trim()) {
            return generateResponse(res, 400, false, `Label cannot be empty for item at index ${i}`, null);
        }
    }

    // ✅ Check duplicate orders
    const orders = parsedItems.map((item) => Number(item.order));
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        return generateResponse(res, 400, false, "Duplicate order values found. Each item must have a unique order", null);
    }

    const updated = await numberService.updateNumberIntoDb({ items: parsedItems });
    return generateResponse(res, 200, true, "Number section updated successfully", updated);
});

const deleteNumber = catchAsync(async (req, res) => {
    await numberService.deleteNumberFromDb();
    return generateResponse(res, 200, true, "Number section deleted successfully", null);
});

export const numberController = {
    createNumber,
    getNumber,
    updateNumber,
    deleteNumber,
};