import Joi from "joi";

const createSubscriberTitleSchema = Joi.object({
    title: Joi.string().trim().required().messages({ "any.required": "Title is required" }),
    subTitle: Joi.string().trim().required().messages({ "any.required": "SubTitle is required" }),
});

const updateSubscriberTitleSchema = Joi.object({
    title: Joi.string().trim().optional().messages({ "string.empty": "Title cannot be empty" }),
    subTitle: Joi.string().trim().optional().messages({ "string.empty": "SubTitle cannot be empty" }),
});

export const subscriberTitleValidation = {
    createSubscriberTitleSchema,
    updateSubscriberTitleSchema
};
