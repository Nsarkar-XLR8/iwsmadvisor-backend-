import { Mission } from "./mission.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createMissionIntoDb = async (payload) => {
    // ✅ Check duplicate title
    const existing = await Mission.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Mission with this title already exists", HttpStatusCode.Conflict);

    const mission = await Mission.create(payload);
    return mission;
};

const getAllMissionsFromDb = async (query) => {
    const {
        page      = 1,
        limit     = 10,
        sortBy    = "createdAt",
        sortOrder = "desc",
    } = query;

    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "title"];
    const safePage      = Math.max(1, Number(page));
    const safeLimit     = Math.min(Math.max(1, Number(limit)), 100);
    const safeSortBy    = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    const sort = { [safeSortBy]: safeSortOrder };
    const skip = (safePage - 1) * safeLimit;

    const [totalDocs, missions] = await Promise.all([
        Mission.countDocuments(),
        Mission.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: missions,
        meta: {
            totalDocs,
            totalPages,
            currentPage: safePage,
            limit:       safeLimit,
            hasNextPage: safePage < totalPages,
            hasPrevPage: safePage > 1,
        },
    };
};

const getMissionByIdFromDb = async (id) => {
    const mission = await Mission.findById(id).lean();
    if (!mission) throw new AppError("Mission not found", HttpStatusCode.NotFound);
    return mission;
};

const updateMissionIntoDb = async (id, payload) => {
    const existingMission = await Mission.findById(id);
    if (!existingMission) throw new AppError("Mission not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Mission.findOne({
            title: payload.title.trim(),
            _id:   { $ne: id },
        });
        if (duplicate) throw new AppError("Another mission with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Check all fields for changes
    const fields = ["title", "description", "image"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingMission[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Mission is already up to date", HttpStatusCode.Conflict);

    const updated = await Mission.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteMissionFromDb = async (id) => {
    const deleted = await Mission.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Mission not found", HttpStatusCode.NotFound);
    return deleted;
};

export const missionService = {
    createMissionIntoDb,
    getAllMissionsFromDb,
    getMissionByIdFromDb,
    updateMissionIntoDb,
    deleteMissionFromDb,
};