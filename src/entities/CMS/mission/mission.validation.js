import Joi from "joi";

const createMissionSchema = Joi.object({
    title:       Joi.string().trim().required().messages({
        "any.required": "Title is required",
        "string.empty": "Title cannot be empty",
    }),
    description: Joi.string().trim().required().messages({
        "any.required": "Description is required",
        "string.empty": "Description cannot be empty",
    }),
});

const updateMissionSchema = Joi.object({
    title:       Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    description: Joi.string().trim().optional().messages({ "string.empty": "Description cannot be empty" }),
});

export const missionValidation = {
    createMissionSchema,
    updateMissionSchema,
};