import { consultantService } from "./consultant.service.js";
import { validationResult } from "express-validator";
import catchAsync from "../../../lib/catchAsync.js";
import { generateResponse } from "../../../lib/responseFormate.js";

/**
 * Handle express-validator errors
 */
const handleValidationErrors = (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        generateResponse(res, 422, false, "Validation failed", {
            errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
        });
        return true;
    }
    return false;
};

/**
 * Create Consultant Controller
 */
const createConsultant = catchAsync(async (req, res) => {
    // Check for validation errors from middleware
    if (handleValidationErrors(req, res)) return;

    const { title, description, btnName } = req.body;


    const created = await consultantService.createConsultantIntoDb({
        title,
        description,
        btnName,
    });

    return generateResponse(res, 201, true, "Consultant created successfully", created);
});

/**
 * Get All Consultants Controller
 */
const getAllConsultants = catchAsync(async (req, res) => {
    const consultants = await consultantService.getAllConsultantsFromDb();
    return generateResponse(res, 200, true, "Consultants fetched successfully", consultants);
});

/**
 * Get Consultant By ID Controller
 */
const getConsultantById = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    // Use consultantId because that is what you named it in your routes
    const { consultantId } = req.params;

    const consultant = await consultantService.getConsultantByIdFromDb(consultantId);

    return generateResponse(res, 200, true, "Consultant fetched successfully", consultant);
});

/**
 * Update Consultant Controller - Optimized & Fixed
 */
const updateConsultant = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    // 1. Get the ID from the correct param name defined in routes
    const { consultantId } = req.params;
    const { title, description, btnName } = req.body;

    const payload = {};

    // 2. Build payload (Clean & Optimized)
    if (title !== undefined) payload.title = title;
    if (description !== undefined) payload.description = description;
    if (btnName !== undefined) payload.btnName = btnName;

    // ❌ REMOVED: Image/Cloudinary logic as it's not needed

    // 3. Pass consultantId to the service
    const updated = await consultantService.updateConsultantIntoDb(consultantId, payload);

    return generateResponse(res, 200, true, "Consultant updated successfully", updated);
});

/**
 * Delete Consultant Controller
 */
const deleteConsultant = catchAsync(async (req, res) => {
    if (handleValidationErrors(req, res)) return;

    await consultantService.deleteConsultantFromDb(req.params.id);
    return generateResponse(res, 200, true, "Consultant deleted successfully", null);
});

export const consultantController = {
    createConsultant,
    getAllConsultants,
    getConsultantById,
    updateConsultant,
    deleteConsultant,
};