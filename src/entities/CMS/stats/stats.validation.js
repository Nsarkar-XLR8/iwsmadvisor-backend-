import Joi from "joi";

const statItemSchema = Joi.object({
    order: Joi.number().integer().min(1).required().messages({
        "any.required": "Order is required",
        "number.min": "Order must be at least 1",
        "number.base": "Order must be a number",
    }),
    value: Joi.string().trim().required().messages({
        "any.required": "Value is required",
        "string.empty": "Value cannot be empty",
    }),
    title: Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    description: Joi.string().trim().required().messages({
        "any.required": "Description is required",
        "string.empty": "Description cannot be empty",
    }),
});

const createStatsSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    subtitle: Joi.string().trim().required().messages({
        "any.required": "Subtitle is required",
        "string.empty": "Subtitle cannot be empty",
    }),
    items: Joi.array().items(statItemSchema).min(1).required().messages({
        "any.required": "Stats items are required",
        "array.min": "At least one stat item is required",
    }),
});

const updateStatsSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
    items: Joi.array().items(statItemSchema).min(1).optional().messages({
        "array.min": "At least one stat item is required",
    }),
}).min(1).messages({ "object.min": "At least one field must be provided to update" });

export const statsValidation = {
    createStatsSchema,
    updateStatsSchema,
};