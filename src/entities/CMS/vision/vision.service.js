import { Vision } from "./vision.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

// ✅ Helper — check for duplicate titles within an array of items
const checkDuplicateTitles = (items, fieldName) => {
    const titles = items.map((item) => item.title?.trim().toLowerCase());
    const uniqueTitles = new Set(titles);
    if (uniqueTitles.size !== titles.length) {
        throw new AppError(`Duplicate titles found in ${fieldName}. Each item must have a unique title`, HttpStatusCode.BadRequest);
    }
};

// ✅ Helper — check scalar fields for changes
const isScalarSame = (payload, existing, fields) => {
    return fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existing[field]?.trim?.();
    });
};

// ✅ Helper — check array items for changes
const isArraySame = (incoming, existing) => {
    if (incoming === undefined) return true;
    if (incoming.length !== existing.length) return false;
    return JSON.stringify(incoming) === JSON.stringify(
        existing.map((item) => {
            const obj = {};
            Object.keys(item).forEach((key) => { if (key !== "_id") obj[key] = item[key]; });
            return obj;
        })
    );
};

const createVisionIntoDb = async (payload) => {
    // ✅ Singleton — only one vision document should exist
    const existing = await Vision.findOne();
    if (existing) throw new AppError("Vision section already exists. Use update instead.", HttpStatusCode.Conflict);

    // ✅ Check duplicate titles in coreStrengths items
    if (payload.coreStrengths?.items?.length) {
        checkDuplicateTitles(payload.coreStrengths.items, "core strengths");
    }

    // ✅ Check duplicate titles in certifications items
    if (payload.certifications?.items?.length) {
        checkDuplicateTitles(payload.certifications.items, "certifications");
    }

    // ✅ Check duplicate titles in expertise items
    if (payload.expertise?.items?.length) {
        checkDuplicateTitles(payload.expertise.items, "expertise");
    }

    const vision = await Vision.create(payload);
    return vision;
};

const getVisionFromDb = async () => {
    const vision = await Vision.findOne().lean();
    if (!vision) throw new AppError("Vision section not found", HttpStatusCode.NotFound);
    return vision;
};

const updateVisionIntoDb = async (payload) => {
    const existingVision = await Vision.findOne();
    if (!existingVision) throw new AppError("Vision section not found. Create one first.", HttpStatusCode.NotFound);

    // ✅ Check mission for changes
    const isMissionSame = !payload.mission || (
        isScalarSame(payload.mission, existingVision.mission, ["title", "description", "icon"])
    );

    // ✅ Check vision for changes
    const isVisionSame = !payload.vision || (
        isScalarSame(payload.vision, existingVision.vision, ["title", "description", "icon"])
    );

    // ✅ Check coreStrengths for changes
    const isCoreStrengthsSame = !payload.coreStrengths || (
        isScalarSame(payload.coreStrengths, existingVision.coreStrengths, ["title", "subtitle"]) &&
        isArraySame(payload.coreStrengths.items, existingVision.coreStrengths.items)
    );

    // ✅ Check certifications for changes
    const isCertificationsSame = !payload.certifications || (
        isScalarSame(payload.certifications, existingVision.certifications, ["title", "subtitle"]) &&
        isArraySame(payload.certifications.items, existingVision.certifications.items)
    );

    // ✅ Check expertise for changes
    const isExpertiseSame = !payload.expertise || (
        isScalarSame(payload.expertise, existingVision.expertise, ["title", "subtitle"]) &&
        isArraySame(payload.expertise.items, existingVision.expertise.items)
    );

    if (
        isMissionSame &&
        isVisionSame &&
        isCoreStrengthsSame &&
        isCertificationsSame &&
        isExpertiseSame
    ) {
        throw new AppError("No changes detected. Vision section is already up to date", HttpStatusCode.Conflict);
    }

    // ✅ Check duplicate titles in coreStrengths items
    if (payload.coreStrengths?.items?.length) {
        checkDuplicateTitles(payload.coreStrengths.items, "core strengths");
    }

    // ✅ Check duplicate titles in certifications items
    if (payload.certifications?.items?.length) {
        checkDuplicateTitles(payload.certifications.items, "certifications");
    }

    // ✅ Check duplicate titles in expertise items
    if (payload.expertise?.items?.length) {
        checkDuplicateTitles(payload.expertise.items, "expertise");
    }

    // ✅ Merge coreStrengths items — keep existing icons if no new ones provided
    if (payload.coreStrengths?.items) {
        payload.coreStrengths.items = payload.coreStrengths.items.map((item, index) => {
            const existingItem = existingVision.coreStrengths.items[index];
            return {
                icon: item.icon || existingItem?.icon || "",
                title: item.title,
                description: item.description,
            };
        });
    }

    // ✅ Merge mission icon — keep existing if no new one provided
    if (payload.mission) {
        payload.mission.icon = payload.mission.icon || existingVision.mission.icon || "";
    }

    // ✅ Merge vision icon — keep existing if no new one provided
    if (payload.vision) {
        payload.vision.icon = payload.vision.icon || existingVision.vision.icon || "";
    }

    const updated = await Vision.findByIdAndUpdate(
        existingVision._id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteVisionFromDb = async () => {
    const deleted = await Vision.findOneAndDelete();
    if (!deleted) throw new AppError("Vision section not found", HttpStatusCode.NotFound);
    return deleted;
};

export const visionService = {
    createVisionIntoDb,
    getVisionFromDb,
    updateVisionIntoDb,
    deleteVisionFromDb,
};