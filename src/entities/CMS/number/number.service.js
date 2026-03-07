import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";
import { NumberSection } from "./number.model.js";


const createNumberIntoDb = async (payload) => {
    // ✅ Singleton — only one document should exist
    const existing = await NumberSection.findOne();
    if (existing) throw new AppError("Number section already exists. Use update instead.", HttpStatusCode.Conflict);

    // ✅ Validate items array
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
        throw new AppError("At least one item is required", HttpStatusCode.BadRequest);
    }

    // ✅ Validate each item
    for (let i = 0; i < payload.items.length; i++) {
        const item = payload.items[i];
        if (!item.order || isNaN(item.order) || item.order < 1) {
            throw new AppError(`Order is required and must be at least 1 for item at index ${i}`, HttpStatusCode.BadRequest);
        }
        if (!item.value?.trim()) {
            throw new AppError(`Value is required for item at index ${i}`, HttpStatusCode.BadRequest);
        }
        if (!item.label?.trim()) {
            throw new AppError(`Label is required for item at index ${i}`, HttpStatusCode.BadRequest);
        }
    }

    // ✅ Check duplicate orders
    const orders = payload.items.map((item) => Number(item.order));
    const uniqueOrders = new Set(orders);
    if (uniqueOrders.size !== orders.length) {
        throw new AppError("Duplicate order values found. Each item must have a unique order", HttpStatusCode.BadRequest);
    }

    // ✅ Sort items by order before saving
    const sortedItems = [...payload.items]
        .map((item) => ({
            order: Number(item.order),
            value: item.value.trim(),
            label: item.label.trim(),
        }))
        .sort((a, b) => a.order - b.order);

    const number = await NumberSection.create({ items: sortedItems });
    return number;
};

const getNumberFromDb = async () => {
    const number = await NumberSection.findOne().lean();
    if (!number) throw new AppError("Number section not found", HttpStatusCode.NotFound);

    // ✅ Always return items sorted by order
    number.items.sort((a, b) => a.order - b.order);
    return number;
};

const updateNumberIntoDb = async (payload) => {
    const existingNumber = await NumberSection.findOne();
    if (!existingNumber) throw new AppError("Number section not found. Create one first.", HttpStatusCode.NotFound);

    // ✅ Validate items array
    if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
        throw new AppError("At least one item is required", HttpStatusCode.BadRequest);
    }

    // ✅ Validate each item
    for (let i = 0; i < payload.items.length; i++) {
        const item = payload.items[i];
        if (!item.order || isNaN(item.order) || item.order < 1) {
            throw new AppError(`Order is required and must be at least 1 for item at index ${i}`, HttpStatusCode.BadRequest);
        }
        if (item.value !== undefined && !item.value?.trim()) {
            throw new AppError(`Value cannot be empty for item at index ${i}`, HttpStatusCode.BadRequest);
        }
        if (item.label !== undefined && !item.label?.trim()) {
            throw new AppError(`Label cannot be empty for item at index ${i}`, HttpStatusCode.BadRequest);
        }
    }

    // ✅ Check duplicate orders in incoming payload
    const incomingOrders = payload.items.map((item) => Number(item.order));
    const uniqueIncoming = new Set(incomingOrders);
    if (uniqueIncoming.size !== incomingOrders.length) {
        throw new AppError("Duplicate order values found. Each item must have a unique order", HttpStatusCode.BadRequest);
    }

    // ✅ Merge incoming items with existing — preserve fields not provided
    const mergedItems = payload.items.map((incomingItem) => {
        const existingItem = existingNumber.items.find(
            (item) => item.order === Number(incomingItem.order)
        );
        return {
            order: Number(incomingItem.order),
            value: incomingItem.value?.trim() ?? existingItem?.value ?? "",
            label: incomingItem.label?.trim() ?? existingItem?.label ?? "",
        };
    });

    // ✅ Check no changes
    const isSame = mergedItems.every((incomingItem) => {
        const existingItem = existingNumber.items.find(
            (item) => item.order === incomingItem.order
        );
        if (!existingItem) return false;
        return (
            incomingItem.value === existingItem.value &&
            incomingItem.label === existingItem.label
        );
    });
    if (isSame && mergedItems.length === existingNumber.items.length) {
        throw new AppError("No changes detected. Number section is already up to date", HttpStatusCode.Conflict);
    }

    // ✅ Sort merged items by order before saving
    mergedItems.sort((a, b) => a.order - b.order);

    const updated = await NumberSection.findByIdAndUpdate(
        existingNumber._id,
        { $set: { items: mergedItems } },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteNumberFromDb = async () => {
    const deleted = await NumberSection.findOneAndDelete();
    if (!deleted) throw new AppError("Number section not found", HttpStatusCode.NotFound);
    return deleted;
};

export const numberService = {
    createNumberIntoDb,
    getNumberFromDb,
    updateNumberIntoDb,
    deleteNumberFromDb,
};