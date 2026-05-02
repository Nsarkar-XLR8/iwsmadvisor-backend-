import Joi from "joi";

const linkSchema = Joi.object({
    label: Joi.string().trim().required().messages({
        "any.required": "Link label is required",
        "string.empty": "Link label cannot be empty",
    }),
    url: Joi.string().trim().required().messages({
        "any.required": "Link url is required",
        "string.empty": "Link url cannot be empty",
    }),
});

const updateLinkSchema = Joi.object({
    label: Joi.string().trim().optional().allow("").messages({
        "string.empty": "Link label cannot be empty",
    }),
    url: Joi.string().trim().optional().allow("").messages({
        "string.empty": "Link url cannot be empty",
    }),
});

const createFooterSchema = Joi.object({
    description: Joi.string().trim().required().messages({ "any.required": "Description is required", "string.empty": "Description cannot be empty" }),
    email: Joi.string().trim().email().required().messages({ "any.required": "Email is required", "string.email": "Email must be valid", "string.empty": "Email cannot be empty" }),
    phone: Joi.string().trim().required().messages({ "any.required": "Phone is required", "string.empty": "Phone cannot be empty" }),
    quickLinks: Joi.array().items(linkSchema).optional(),
    consultingLinks: Joi.array().items(linkSchema).optional(),
    contactLinks: Joi.array().items(linkSchema).optional(),
    copyright: Joi.string().trim().required().messages({ "any.required": "Copyright is required", "string.empty": "Copyright cannot be empty" }),
    socialLinks: Joi.object({
        twitter: Joi.string().trim().optional().allow(""),
        facebook: Joi.string().trim().optional().allow(""),
        linkedin: Joi.string().trim().optional().allow(""),
    }).optional(),
});

const updateFooterSchema = Joi.object({
    description: Joi.string().trim().optional().messages({ "string.empty": "Description cannot be empty" }),
    email: Joi.string().trim().email().optional().messages({ "string.email": "Email must be valid", "string.empty": "Email cannot be empty" }),
    phone: Joi.string().trim().optional().messages({ "string.empty": "Phone cannot be empty" }),
    quickLinks: Joi.array().items(updateLinkSchema).optional(),
    consultingLinks: Joi.array().items(updateLinkSchema).optional(),
    contactLinks: Joi.array().items(updateLinkSchema).optional(),
    copyright: Joi.string().trim().optional().messages({ "string.empty": "Copyright cannot be empty" }),
    socialLinks: Joi.object({
        twitter: Joi.string().trim().optional().allow(""),
        facebook: Joi.string().trim().optional().allow(""),
        linkedin: Joi.string().trim().optional().allow(""),
    }).optional(),
}).min(1).messages({ "object.min": "At least one field must be provided to update" });

export const footerValidation = {
    createFooterSchema,
    updateFooterSchema,
};