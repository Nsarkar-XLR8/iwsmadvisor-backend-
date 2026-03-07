import { heroService } from "./hero.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../../lib/cloudinaryUpload.js";

const createHero = catchAsync(async (req, res) => {
    const { order, title, subtitle } = req.body;

    // ✅ Validate order
    if (!order || isNaN(order) || Number(order) < 1) {
        return generateResponse(res, 400, false, "Order is required and must be at least 1", null);
    }
    if (!title?.trim()) return generateResponse(res, 400, false, "Title is required", null);
    if (!subtitle?.trim()) return generateResponse(res, 400, false, "Subtitle is required", null);

    // ✅ Validate image
    const imageFile = req.files?.image?.[0];
    if (!imageFile) return generateResponse(res, 400, false, "Hero image is required", null);

    const cloudinaryResult = await cloudinaryUpload(imageFile.path, `hero-${Date.now()}`, "hero");
    if (!cloudinaryResult || !cloudinaryResult.url) {
        return generateResponse(res, 500, false, "Image upload failed", null);
    }

    const created = await heroService.createHeroIntoDb({
        order: Number(order),
        title: title.trim(),
        subtitle: subtitle.trim(),
        image: cloudinaryResult.url,
    });

    return generateResponse(res, 201, true, "Hero section created successfully", created);
});

const getAllHeroes = catchAsync(async (req, res) => {
    const result = await heroService.getAllHeroesFromDb(req.query);
    return generateResponse(res, 200, true, "Hero sections fetched successfully", result.data, result.meta);
});

const getHeroById = catchAsync(async (req, res) => {
    const hero = await heroService.getHeroByIdFromDb(req.params.heroId);
    return generateResponse(res, 200, true, "Hero section fetched successfully", hero);
});

const updateHero = catchAsync(async (req, res) => {
    const { order, title, subtitle } = req.body;
    const payload = {};

    if (order !== undefined) payload.order = Number(order);
    if (title !== undefined) payload.title = title.trim();
    if (subtitle !== undefined) payload.subtitle = subtitle.trim();

    // ✅ Upload new image only if provided
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
        const cloudinaryResult = await cloudinaryUpload(imageFile.path, `hero-${Date.now()}`, "hero");
        if (!cloudinaryResult || !cloudinaryResult.url) {
            return generateResponse(res, 500, false, "Image upload failed", null);
        }
        payload.image = cloudinaryResult.url;
    }

    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await heroService.updateHeroIntoDb(req.params.heroId, payload);
    return generateResponse(res, 200, true, "Hero section updated successfully", updated);
});

const swapHeroOrder = catchAsync(async (req, res) => {
    const { firstId, secondId } = req.body;

    if (!firstId) return generateResponse(res, 400, false, "First hero ID is required", null);
    if (!secondId) return generateResponse(res, 400, false, "Second hero ID is required", null);
    if (firstId === secondId) return generateResponse(res, 400, false, "Cannot swap a hero with itself", null);

    const result = await heroService.swapHeroOrderInDb(firstId, secondId);
    return generateResponse(res, 200, true, "Hero order swapped successfully", result);
});

const deleteHero = catchAsync(async (req, res) => {
    await heroService.deleteHeroFromDb(req.params.heroId);
    return generateResponse(res, 200, true, "Hero section deleted successfully", null);
});

export const heroController = {
    createHero,
    getAllHeroes,
    getHeroById,
    updateHero,
    swapHeroOrder,
    deleteHero,
};