import Joi from "joi";

const createExpertiseSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Title is required", "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().required().messages({ "any.required": "Subtitle is required", "string.empty": "Subtitle cannot be empty" }),
    description1: Joi.string().trim().required().messages({ "any.required": "Description 1 is required", "string.empty": "Description 1 cannot be empty" }),
    description2: Joi.string().trim().required().messages({ "any.required": "Description 2 is required", "string.empty": "Description 2 cannot be empty" }),
    description3: Joi.string().trim().required().messages({ "any.required": "Description 3 is required", "string.empty": "Description 3 cannot be empty" }),
});

const updateExpertiseSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle: Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
    description1: Joi.string().trim().optional().messages({ "string.empty": "Description 1 cannot be empty" }),
    description2: Joi.string().trim().optional().messages({ "string.empty": "Description 2 cannot be empty" }),
    description3: Joi.string().trim().optional().messages({ "string.empty": "Description 3 cannot be empty" }),
});

export const expertiseValidation = {
    createExpertiseSchema,
    updateExpertiseSchema,
};