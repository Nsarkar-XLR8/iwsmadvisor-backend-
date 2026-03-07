import Joi from "joi";

const createHeroSchema = Joi.object({
    order: Joi.number().integer().min(1).required().messages({
        "any.required": "Order is required",
        "number.min": "Order must be at least 1",
        "number.base": "Order must be a number",
    }),
    title: Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    subtitle: Joi.string().trim().required().messages({
        "any.required": "Subtitle is required",
        "string.empty": "Subtitle cannot be empty",
    }),
});

const updateHeroSchema = Joi.object({
    order: Joi.number().integer().min(1).optional().messages({
        "number.min": "Order must be at least 1",
        "number.base": "Order must be a number",
    }),
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
});

export const heroValidation = {
    createHeroSchema,
    updateHeroSchema,
};