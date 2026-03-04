import { Information } from "./information.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createInformationIntoDb = async (payload) => {
    // ✅ Singleton — only one information document should exist
    const existing = await Information.findOne();
    if (existing) throw new AppError("Contact information already exists. Use update instead.", HttpStatusCode.Conflict);

    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
        throw new AppError("Invalid email format", HttpStatusCode.BadRequest);
    }

    // ✅ Validate mapUrl is a Google Maps embed URL
    if (!payload.mapUrl.includes("google.com/maps")) {
        throw new AppError("Map URL must be a valid Google Maps embed URL", HttpStatusCode.BadRequest);
    }

    const information = await Information.create(payload);
    return information;
};

const getInformationFromDb = async () => {
    const information = await Information.findOne().lean();
    if (!information) throw new AppError("Contact information not found", HttpStatusCode.NotFound);
    return information;
};

const updateInformationIntoDb = async (payload) => {
    const existingInformation = await Information.findOne();
    if (!existingInformation) throw new AppError("Contact information not found. Create one first.", HttpStatusCode.NotFound);

    // ✅ Validate email format if provided
    if (payload.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            throw new AppError("Invalid email format", HttpStatusCode.BadRequest);
        }
    }

    // ✅ Validate mapUrl if provided
    if (payload.mapUrl && !payload.mapUrl.includes("google.com/maps")) {
        throw new AppError("Map URL must be a valid Google Maps embed URL", HttpStatusCode.BadRequest);
    }

    // ✅ Check all fields for changes
    const fields = ["title", "description", "email", "phone", "address", "mapUrl"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingInformation[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Contact information is already up to date", HttpStatusCode.Conflict);

    const updated = await Information.findByIdAndUpdate(
        existingInformation._id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};

const deleteInformationFromDb = async (id) => {
    const deleted = await Information.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Contact information not found", HttpStatusCode.NotFound);
    return deleted;
};


const getAllInformationsFromDb = async (query) => {
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

    const [totalDocs, informations] = await Promise.all([
        Information.countDocuments(),
        Information.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: informations,
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

export const informationService = {
    createInformationIntoDb,
    getInformationFromDb,
    updateInformationIntoDb,
    deleteInformationFromDb,
    getAllInformationsFromDb

};