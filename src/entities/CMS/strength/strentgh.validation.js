import Joi from "joi";

const createStrengthSchema = Joi.object({
    title:    Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    subtitle: Joi.string().trim().required().messages({
        "any.required": "Subtitle is required",
        "string.empty": "Subtitle cannot be empty",
    }),
});

const updateStrengthSchema = Joi.object({
    title:    Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
}).min(1).messages({ "object.min": "At least one field must be provided to update" });

export const strengthValidation = {
    createStrengthSchema,
    updateStrengthSchema,
};