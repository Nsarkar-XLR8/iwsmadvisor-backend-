import Joi from "joi";

const createItemsSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    subtitle: Joi.string().trim().required().messages({
        "any.required": "Subtitle is required",
        "string.empty": "Subtitle cannot be empty",
    }),
});

const updateItemsSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
});

export const itemsValidation = {
    createItemsSchema,
    updateItemsSchema,
};