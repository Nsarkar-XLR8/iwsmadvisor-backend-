import Joi from "joi";

/**
 * Consultant Validation Schemas
 * Optimized to ensure data integrity before reaching the controller.
 */

const createConsultantSchema = Joi.object({
    title: Joi.string()
        .trim()
        .required()
        .messages({
            "any.required": "Title is required",
            "string.empty": "Title cannot be empty"
        }),
    description: Joi.string()
        .trim()
        .required()
        .messages({
            "any.required": "Description is required",
            "string.empty": "Description cannot be empty"
        }),
    btnName: Joi.string()
        .trim()
        .required()
        .messages({
            "any.required": "Button name is required",
            "string.empty": "Button name cannot be empty"
        }),
});

const updateConsultantSchema = Joi.object({
    title: Joi.string().trim().optional(),
    description: Joi.string().trim().optional(),
    btnName: Joi.string().trim().optional(),
})
    .min(1) // Ensures at least one field is being updated
    .messages({
        "object.min": "At least one field must be provided to update"
    });

export const consultantValidation = {
    createConsultantSchema,
    updateConsultantSchema
};