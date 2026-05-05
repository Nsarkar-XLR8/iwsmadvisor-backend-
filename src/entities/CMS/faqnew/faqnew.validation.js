import Joi from "joi";

const createFAQNewSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Title is required" }),
    description: Joi.string().trim().required().messages({ "any.required": "Description is required" }),
});

const updateFAQNewSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    description: Joi.string().trim().optional().messages({ "string.empty": "Description cannot be empty" }),
});

export const faqNewValidation = {
    createFAQNewSchema,
    updateFAQNewSchema
};
