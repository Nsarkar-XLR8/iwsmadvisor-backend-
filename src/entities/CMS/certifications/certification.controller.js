import { certificationService } from "./certification.service.js";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

const createCertification = catchAsync(async (req, res) => {
    const { title, subtitle, description1, description2, description3 } = req.body;

    // ✅ Validate all required fields
    if (!title?.trim()) return generateResponse(res, 400, false, "Title is required", null);
    if (!subtitle?.trim()) return generateResponse(res, 400, false, "Subtitle is required", null);
    if (!description1?.trim()) return generateResponse(res, 400, false, "Description 1 is required", null);
    if (!description2?.trim()) return generateResponse(res, 400, false, "Description 2 is required", null);
    if (!description3?.trim()) return generateResponse(res, 400, false, "Description 3 is required", null);

    const created = await certificationService.createCertificationIntoDb({
        title: title.trim(),
        subtitle: subtitle.trim(),
        description1: description1.trim(),
        description2: description2.trim(),
        description3: description3.trim(),
    });

    return generateResponse(res, 201, true, "Certification created successfully", created);
});

const getAllCertifications = catchAsync(async (req, res) => {
    const result = await certificationService.getAllCertificationsFromDb(req.query);
    return generateResponse(res, 200, true, "Certifications fetched successfully", result.data, result.meta);
});

const getCertificationById = catchAsync(async (req, res) => {
    // ✅ Validate ID exists in params
    if (!req.params.certificationId) {
        return generateResponse(res, 400, false, "Certification ID is required", null);
    }

    const certification = await certificationService.getCertificationByIdFromDb(req.params.certificationId);
    return generateResponse(res, 200, true, "Certification fetched successfully", certification);
});

const updateCertification = catchAsync(async (req, res) => {
    // ✅ Validate ID exists in params
    if (!req.params.certificationId) {
        return generateResponse(res, 400, false, "Certification ID is required", null);
    }

    const { title, subtitle, description1, description2, description3 } = req.body;
    const payload = {};

    // ✅ Only add fields that are actually provided
    if (title !== undefined) payload.title = title.trim();
    if (subtitle !== undefined) payload.subtitle = subtitle.trim();
    if (description1 !== undefined) payload.description1 = description1.trim();
    if (description2 !== undefined) payload.description2 = description2.trim();
    if (description3 !== undefined) payload.description3 = description3.trim();

    // ✅ Validate empty string fields
    if (payload.title === "") return generateResponse(res, 400, false, "Title cannot be empty", null);
    if (payload.subtitle === "") return generateResponse(res, 400, false, "Subtitle cannot be empty", null);
    if (payload.description1 === "") return generateResponse(res, 400, false, "Description 1 cannot be empty", null);
    if (payload.description2 === "") return generateResponse(res, 400, false, "Description 2 cannot be empty", null);
    if (payload.description3 === "") return generateResponse(res, 400, false, "Description 3 cannot be empty", null);

    // ✅ Nothing to update
    if (Object.keys(payload).length === 0) {
        return generateResponse(res, 400, false, "At least one field must be provided to update", null);
    }

    const updated = await certificationService.updateCertificationIntoDb(req.params.certificationId, payload);
    return generateResponse(res, 200, true, "Certification updated successfully", updated);
});

const deleteCertification = catchAsync(async (req, res) => {
    // ✅ Validate ID exists in params
    if (!req.params.certificationId) {
        return generateResponse(res, 400, false, "Certification ID is required", null);
    }

    await certificationService.deleteCertificationFromDb(req.params.certificationId);
    return generateResponse(res, 200, true, "Certification deleted successfully", null);
});

export const certificationController = {
    createCertification,
    getAllCertifications,
    getCertificationById,
    updateCertification,
    deleteCertification,
};