import Joi from "joi";

export const createTitleValidation = Joi.object({
  title: Joi.string().trim().min(1).required().messages({
    "string.empty": "Title is required",
    "any.required": "Title is required",
  }),
});

export const updateTitleValidation = Joi.object({
  title: Joi.string().trim().min(1).optional().messages({
    "string.empty": "Title cannot be empty",
  }),
});