import Joi from "joi";

const createVisionSchema = Joi.object({
    title:       Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    description: Joi.string().trim().required().messages({
        "any.required": "Description is required",
        "string.empty": "Description cannot be empty",
    }),
});

const updateVisionSchema = Joi.object({
    title:       Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    description: Joi.string().trim().optional().messages({ "string.empty": "Description cannot be empty" }),
});

export const visionValidation = {
    createVisionSchema,
    updateVisionSchema,
};