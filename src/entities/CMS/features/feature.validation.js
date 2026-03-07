import Joi from "joi";

const featureItemSchema = Joi.object({
    order: Joi.number().integer().min(1).required().messages({
        "any.required": "Order is required",
        "number.min": "Order must be at least 1",
        "number.base": "Order must be a number",
    }),
    icon: Joi.string().optional().allow(""),
    title: Joi.string().trim().required().messages({ "any.required": "Feature title is required", "string.empty": "Feature title cannot be empty" }),
    description: Joi.string().trim().required().messages({ "any.required": "Feature description is required", "string.empty": "Feature description cannot be empty" }),
});

const createFeaturesSchema = Joi.object({
    order:    Joi.number().integer().min(1).required().messages({
        "any.required": "Order is required",
        "number.min":   "Order must be at least 1",
        "number.base":  "Order must be a number",
    }),
    title:    Joi.string().trim().required().messages({ "any.required": "Title is required",    "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().required().messages({ "any.required": "Subtitle is required", "string.empty": "Subtitle cannot be empty" }),
    items:    Joi.array().items(featureItemSchema).min(1).required().messages({
        "any.required": "Features items are required",
        "array.min":    "At least one feature item is required",
    }),
});

const updateFeaturesSchema = Joi.object({
    order:    Joi.number().integer().min(1).optional().messages({
        "number.min":  "Order must be at least 1",
        "number.base": "Order must be a number",
    }),
    title:    Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
    items:    Joi.array().items(featureItemSchema).min(1).optional().messages({
        "array.min": "At least one feature item is required",
    }),
});

export const featuresValidation = {
    createFeaturesSchema,
    updateFeaturesSchema,
};