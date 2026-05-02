import express from "express";
import { subscriberTitleController } from "./subscriberTitle.controller.js";
import { subscriberTitleValidation } from "./subscriberTitle.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// Public
router.get("/all", subscriberTitleController.getAllSubscriberTitles);
router.get("/:subscriberTitleId", subscriberTitleController.getSubscriberTitleById);

// Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(subscriberTitleValidation.createSubscriberTitleSchema),
    subscriberTitleController.createSubscriberTitle
);

router.patch(
    "/:subscriberTitleId",
    verifyToken,
    adminMiddleware,
    validateRequest(subscriberTitleValidation.updateSubscriberTitleSchema),
    subscriberTitleController.updateSubscriberTitle
);

router.delete(
    "/:subscriberTitleId",
    verifyToken,
    adminMiddleware,
    subscriberTitleController.deleteSubscriberTitle
);

export const subscriberTitleRoutes = router;
