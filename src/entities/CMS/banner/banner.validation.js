// banner.validation.js — Joi version
import Joi from "joi";

const createBannerSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Title is required" }),
    subTitle: Joi.string().trim().required().messages({ "any.required": "Sub title is required" }),
    btn1: Joi.string().trim().required().messages({ "any.required": "Button 1 is required" }),
    btn2: Joi.string().trim().required().messages({ "any.required": "Button 2 is required" }),
});

const updateBannerSchema = Joi.object({
    title: Joi.string().trim().optional(),
    subTitle: Joi.string().trim().optional(),
    btn1: Joi.string().trim().optional(),
    btn2: Joi.string().trim().optional(),
}).min(1).messages({ "object.min": "At least one field must be provided to update" });


export const bannerValidation = {
    createBannerSchema,
    updateBannerSchema
};