import Joi from "joi";

const createApplicationSchema = Joi.object({
    fullName: Joi.string().trim().required().messages({
        "any.required": "Full name is required",
        "string.empty": "Full name cannot be empty",
    }),
    email: Joi.string().trim().email().required().messages({
        "any.required": "Email is required",
        "string.email": "Email must be valid",
        "string.empty": "Email cannot be empty",
    }),
    phone: Joi.string().trim().required().messages({
        "any.required": "Phone is required",
        "string.empty": "Phone cannot be empty",
    }),
    coverLetter: Joi.string().trim().optional().allow(""),
    portfolioUrl: Joi.string().trim().optional().allow(""),
    linkedinProfile: Joi.string().trim().optional().allow(""),
    isAgreed: Joi.boolean().valid(true).required().messages({
        "any.required": "You must agree to the terms and conditions",
        "any.only": "You must agree to the terms and conditions",
    }),
});

export const applicationValidation = {
    createApplicationSchema,
};