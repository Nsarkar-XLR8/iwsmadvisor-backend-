// banner.validation.js — Joi version
import Joi from "joi";

const createBannerSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Title is required" }),
    subTitle: Joi.string().trim().required().messages({ "any.required": "Sub title is required" }),
    btn1: Joi.string().trim().required().messages({ "any.required": "Button 1 is required" }),
    btn2: Joi.string().trim().required().messages({ "any.required": "Button 2 is required" }),
});

const updateBannerSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subTitle: Joi.string().trim().optional().messages({ "string.empty": "SubTitle cannot be empty" }),
    btn1: Joi.string().trim().optional().messages({ "string.empty": "Button 1 cannot be empty" }),
    btn2: Joi.string().trim().optional().messages({ "string.empty": "Button 2 cannot be empty" }),
});


export const bannerValidation = {
    createBannerSchema,
    updateBannerSchema
};