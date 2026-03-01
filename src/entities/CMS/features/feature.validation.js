import Joi from "joi";

const featureItemSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Feature title is required", "string.empty": "Feature title cannot be empty" }),
    description: Joi.string().trim().required().messages({ "any.required": "Feature description is required", "string.empty": "Feature description cannot be empty" }),
});

const createFeaturesSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Title is required", "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().required().messages({ "any.required": "Subtitle is required", "string.empty": "Subtitle cannot be empty" }),
    items: Joi.array().items(featureItemSchema).min(1).required().messages({
        "any.required": "Features items are required",
        "array.min": "At least one feature item is required",
    }),
});

const updateFeaturesSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
    items: Joi.array().items(featureItemSchema).min(1).optional().messages({
        "array.min": "At least one feature item is required",
    }),
}).min(1).messages({ "object.min": "At least one field must be provided to update" });

export const featuresValidation = {
    createFeaturesSchema,
    updateFeaturesSchema,
};