import Joi from "joi";

const numberItemSchema = Joi.object({
    order: Joi.number().integer().min(1).required().messages({
        "any.required": "Order is required for each item",
        "number.min": "Order must be at least 1",
        "number.base": "Order must be a number",
    }),
    value: Joi.string().trim().required().messages({
        "any.required": "Value is required for each item",
        "string.empty": "Value cannot be empty",
    }),
    label: Joi.string().trim().required().messages({
        "any.required": "Label is required for each item",
        "string.empty": "Label cannot be empty",
    }),
});

const updateNumberItemSchema = Joi.object({
    order: Joi.number().integer().min(1).required().messages({
        "any.required": "Order is required for each item",
        "number.min": "Order must be at least 1",
        "number.base": "Order must be a number",
    }),
    value: Joi.string().trim().optional().messages({ "string.empty": "Value cannot be empty" }),
    label: Joi.string().trim().optional().messages({ "string.empty": "Label cannot be empty" }),
});

const createNumberSchema = Joi.object({
    items: Joi.array().items(numberItemSchema).min(1).required().messages({
        "any.required": "Items are required",
        "array.min": "At least one item is required",
    }),
});

const updateNumberSchema = Joi.object({
    items: Joi.array().items(updateNumberItemSchema).min(1).required().messages({
        "any.required": "Items are required",
        "array.min": "At least one item is required",
    }),
});

export const numberValidation = {
    createNumberSchema,
    updateNumberSchema,
};