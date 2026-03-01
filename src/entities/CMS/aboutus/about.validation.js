import Joi from "joi";

const createAboutSchema = Joi.object({
    title:            Joi.string().trim().required().messages({ "any.required": "Title is required",            "string.empty": "Title cannot be empty" }),
    subtitle:         Joi.string().trim().required().messages({ "any.required": "Subtitle is required",         "string.empty": "Subtitle cannot be empty" }),
    descriptionTitle: Joi.string().trim().required().messages({ "any.required": "Description title is required","string.empty": "Description title cannot be empty" }),
    description:      Joi.string().trim().required().messages({ "any.required": "Description is required",      "string.empty": "Description cannot be empty" }),
    btnName:          Joi.string().trim().required().messages({ "any.required": "Button name is required",      "string.empty": "Button name cannot be empty" }),
});

const updateAboutSchema = Joi.object({
    title:            Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subtitle:         Joi.string().trim().optional().messages({ "string.empty": "Subtitle cannot be empty" }),
    descriptionTitle: Joi.string().trim().optional().messages({ "string.empty": "Description title cannot be empty" }),
    description:      Joi.string().trim().optional().messages({ "string.empty": "Description cannot be empty" }),
    btnName:          Joi.string().trim().optional().messages({ "string.empty": "Button name cannot be empty" }),
}).min(1).messages({ "object.min": "At least one field must be provided to update" });

export const aboutValidation = {
    createAboutSchema,
    updateAboutSchema,
};