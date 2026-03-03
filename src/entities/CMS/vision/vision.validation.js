import Joi from "joi";

// ✅ Mission & Vision item schema
const missionVisionItemSchema = Joi.object({
    icon: Joi.string().optional().allow(""),
    title: Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    description: Joi.string().trim().required().messages({
        "any.required": "Description is required",
        "string.empty": "Description cannot be empty",
    }),
});

// ✅ Core Strength item schema
const coreStrengthItemSchema = Joi.object({
    icon: Joi.string().optional().allow(""),
    title: Joi.string().trim().required().messages({
        "any.required": "Core strength item title is required",
        "string.empty": "Core strength item title cannot be empty",
    }),
    description: Joi.string().trim().required().messages({
        "any.required": "Core strength item description is required",
        "string.empty": "Core strength item description cannot be empty",
    }),
});

// ✅ Core Strengths section schema
const coreStrengthsSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "any.required": "Core strengths title is required",
        "string.empty": "Core strengths title cannot be empty",
    }),
    subtitle: Joi.string().trim().required().messages({
        "any.required": "Core strengths subtitle is required",
        "string.empty": "Core strengths subtitle cannot be empty",
    }),
    items: Joi.array().items(coreStrengthItemSchema).min(1).required().messages({
        "any.required": "Core strengths items are required",
        "array.min": "At least one core strength item is required",
    }),
});

// ✅ Simple item schema — title only
const simpleItemSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "any.required": "Item title is required",
        "string.empty": "Item title cannot be empty",
    }),
});

// ✅ Certifications section schema
const certificationsSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "any.required": "Certifications title is required",
        "string.empty": "Certifications title cannot be empty",
    }),
    subtitle: Joi.string().trim().required().messages({
        "any.required": "Certifications subtitle is required",
        "string.empty": "Certifications subtitle cannot be empty",
    }),
    items: Joi.array().items(simpleItemSchema).min(1).required().messages({
        "any.required": "Certifications items are required",
        "array.min": "At least one certification item is required",
    }),
});

// ✅ Expertise section schema
const expertiseSchema = Joi.object({
    title: Joi.string().trim().required().messages({
        "any.required": "Expertise title is required",
        "string.empty": "Expertise title cannot be empty",
    }),
    subtitle: Joi.string().trim().required().messages({
        "any.required": "Expertise subtitle is required",
        "string.empty": "Expertise subtitle cannot be empty",
    }),
    items: Joi.array().items(simpleItemSchema).min(1).required().messages({
        "any.required": "Expertise items are required",
        "array.min": "At least one expertise item is required",
    }),
});

// ✅ Create Vision schema — all sections required
const createVisionSchema = Joi.object({
    mission: missionVisionItemSchema.required().messages({ "any.required": "Mission is required" }),
    vision: missionVisionItemSchema.required().messages({ "any.required": "Vision is required" }),
    coreStrengths: coreStrengthsSchema.required().messages({ "any.required": "Core strengths is required" }),
    certifications: certificationsSchema.required().messages({ "any.required": "Certifications is required" }),
    expertise: expertiseSchema.required().messages({ "any.required": "Expertise is required" }),
});

// ✅ Update Vision schema — all sections optional
const updateVisionSchema = Joi.object({
    mission: missionVisionItemSchema.optional(),
    vision: missionVisionItemSchema.optional(),
    coreStrengths: coreStrengthsSchema.optional(),
    certifications: certificationsSchema.optional(),
    expertise: expertiseSchema.optional(),
});

export const visionValidation = {
    createVisionSchema,
    updateVisionSchema,
};