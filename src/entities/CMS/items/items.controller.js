import { itemsService } from "./items.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const createItem = catchAsync(async (req, res) => {
    const { title, subtitle } = req.body;

    if (!title?.trim()) return generateResponse(res, 400, false, "Title is required", null);
    if (!subtitle?.trim()) return generateResponse(res, 400, false, "Subtitle is required", null);

    // ✅ Upload image if provided
    const imageFile = req.files?.image?.[0];
    let imageUrl = "";
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `item-${Date.now()}`, "items");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        imageUrl = cloudinaryResult.url;
    }

    const created = await itemsService.createItemIntoDb({
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: imageUrl,
    });

    return generateResponse(res, 201, true, "Item created successfully", created);
});

const getAllItems = catchAsync(async (req, res) => {
    const result = await itemsService.getAllItemsFromDb(req.query);
    return generateResponse(res, 200, true, "Items fetched successfully", result.data, result.meta);
});

const getItemById = catchAsync(async (req, res) => {
    const item = await itemsService.getItemByIdFromDb(req.params.itemId);
    return generateResponse(res, 200, true, "Item fetched successfully", item);
});

const updateItem = catchAsync(async (req, res) => {
    const { title, subtitle } = req.body;
    const payload = {};

    if (title !== undefined) payload.title = title.trim();
    if (subtitle !== undefined) payload.subtitle = subtitle.trim();

    // ✅ Upload new image only if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `item-${Date.now()}`, "items");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        payload.image = cloudinaryResult.url;
    }

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await itemsService.updateItemIntoDb(req.params.itemId, payload);
    return generateResponse(res, 200, true, "Item updated successfully", updated);
});

const deleteItem = catchAsync(async (req, res) => {
    await itemsService.deleteItemFromDb(req.params.itemId);
    return generateResponse(res, 200, true, "Item deleted successfully", null);
});

export const itemsController = {
    createItem,
    getAllItems,
    getItemById,
    updateItem,
    deleteItem,
};