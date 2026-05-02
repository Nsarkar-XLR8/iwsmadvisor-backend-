import mongoose from "mongoose";

const subscriberTitleSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        subTitle: { type: String, required: true, trim: true },
    },
    { timestamps: true }
);

export const SubscriberTitle = mongoose.model("SubscriberTitle", subscriberTitleSchema);
