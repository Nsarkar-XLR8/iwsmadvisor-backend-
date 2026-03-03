import Joi from "joi";

const createInformationSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Title is required", "string.empty": "Title cannot be empty" }),
    description: Joi.string().trim().required().messages({ "any.required": "Description is required", "string.empty": "Description cannot be empty" }),
    email: Joi.string().trim().email().required().messages({ "any.required": "Email is required", "string.email": "Email must be valid", "string.empty": "Email cannot be empty" }),
    phone: Joi.string().trim().required().messages({ "any.required": "Phone is required", "string.empty": "Phone cannot be empty" }),
    address: Joi.string().trim().required().messages({ "any.required": "Address is required", "string.empty": "Address cannot be empty" }),
    mapUrl: Joi.string().trim().uri().required().messages({ "any.required": "Map URL is required", "string.uri": "Map URL must be a valid URL", "string.empty": "Map URL cannot be empty" }),
});

const updateInformationSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    description: Joi.string().trim().optional().messages({ "string.empty": "Description cannot be empty" }),
    email: Joi.string().trim().email().optional().messages({ "string.email": "Email must be valid", "string.empty": "Email cannot be empty" }),
    phone: Joi.string().trim().optional().messages({ "string.empty": "Phone cannot be empty" }),
    address: Joi.string().trim().optional().messages({ "string.empty": "Address cannot be empty" }),
    mapUrl: Joi.string().trim().uri().optional().messages({ "string.uri": "Map URL must be a valid URL", "string.empty": "Map URL cannot be empty" }),
}).min(1).messages({ "object.min": "At least one field must be provided to update" });

export const informationValidation = {
    createInformationSchema,
    updateInformationSchema,
};