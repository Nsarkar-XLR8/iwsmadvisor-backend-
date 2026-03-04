import { Certification } from "./certification.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createCertificationIntoDb = async (payload) => {
    // ✅ Check duplicate title
    const existing = await Certification.findOne({ title: payload.title?.trim() });
    if (existing) throw new AppError("Certification with this title already exists", HttpStatusCode.Conflict);

    // ✅ Sanitize all fields before saving
    const sanitized = {
        title: payload.title.trim(),
        subtitle: payload.subtitle.trim(),
        description1: payload.description1.trim(),
        description2: payload.description2.trim(),
        description3: payload.description3.trim(),
    };

    const certification = await Certification.create(sanitized);
    return certification;
};

const getAllCertificationsFromDb = async (query) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    // ✅ Sanitize pagination params
    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "title"];
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(Math.max(1, Number(limit)), 100);
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    // ✅ Guard against NaN
    if (isNaN(safePage) || isNaN(safeLimit)) {
        throw new AppError("Invalid pagination parameters", HttpStatusCode.BadRequest);
    }

    const sort = { [safeSortBy]: safeSortOrder };
    const skip = (safePage - 1) * safeLimit;

    // ✅ Parallel queries for performance
    const [totalDocs, certifications] = await Promise.all([
        Certification.countDocuments(),
        Certification.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: certifications,
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

const getCertificationByIdFromDb = async (id) => {
    // ✅ Validate id exists
    if (!id) throw new AppError("Certification ID is required", HttpStatusCode.BadRequest);

    const certification = await Certification.findById(id).lean();
    if (!certification) throw new AppError("Certification not found", HttpStatusCode.NotFound);
    return certification;
};

const updateCertificationIntoDb = async (id, payload) => {
    // ✅ Validate id exists
    if (!id) throw new AppError("Certification ID is required", HttpStatusCode.BadRequest);

    const existingCertification = await Certification.findById(id);
    if (!existingCertification) throw new AppError("Certification not found", HttpStatusCode.NotFound);

    // ✅ Check duplicate title on update
    if (payload.title) {
        const duplicate = await Certification.findOne({
            title: payload.title.trim(),
            _id: { $ne: id },
        });
        if (duplicate) throw new AppError("Another certification with this title already exists", HttpStatusCode.Conflict);
    }

    // ✅ Sanitize incoming payload fields
    const sanitizedPayload = {};
    const allowedFields = ["title", "subtitle", "description1", "description2", "description3"];

    allowedFields.forEach((field) => {
        if (payload[field] !== undefined) {
            sanitizedPayload[field] = payload[field].trim();
        }
    });

    // ✅ Reject if sanitized payload is empty
    if (Object.keys(sanitizedPayload).length === 0) {
        throw new AppError("At least one field must be provided to update", HttpStatusCode.BadRequest);
    }

    // ✅ Check all fields for changes
    const isSame = allowedFields.every((field) => {
        if (sanitizedPayload[field] === undefined) return true;
        return sanitizedPayload[field] === existingCertification[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. Certification is already up to date", HttpStatusCode.Conflict);

    const updated = await Certification.findByIdAndUpdate(
        id,
        { $set: sanitizedPayload },
        { new: true, runValidators: true }
    );

    // ✅ Guard against update failure
    if (!updated) throw new AppError("Failed to update certification. Please try again.", HttpStatusCode.InternalServerError);

    return updated;
};

const deleteCertificationFromDb = async (id) => {
    // ✅ Validate id exists
    if (!id) throw new AppError("Certification ID is required", HttpStatusCode.BadRequest);

    const deleted = await Certification.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Certification not found", HttpStatusCode.NotFound);
    return deleted;
};

export const certificationService = {
    createCertificationIntoDb,
    getAllCertificationsFromDb,
    getCertificationByIdFromDb,
    updateCertificationIntoDb,
    deleteCertificationFromDb,
};