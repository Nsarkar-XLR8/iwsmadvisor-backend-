import Joi from "joi";

const createTransformSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    description: Joi.string().trim().required().messages({
        "any.required": "Description is required",
        "string.empty": "Description cannot be empty",
    }),
});

const updateTransformSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    description: Joi.string().trim().optional().messages({ "string.empty": "Description cannot be empty" }),
});

export const transformValidation = {
    createTransformSchema,
    updateTransformSchema,
};