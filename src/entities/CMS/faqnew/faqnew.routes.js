import express from "express";
import { faqNewController } from "./faqnew.controller.js";
import { faqNewValidation } from "./faqnew.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// Public
router.get("/all", faqNewController.getAllFAQNews);
router.get("/:faqNewId", faqNewController.getFAQNewById);

// Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(faqNewValidation.createFAQNewSchema),
    faqNewController.createFAQNew
);

router.patch(
    "/:faqNewId",
    verifyToken,
    adminMiddleware,
    validateRequest(faqNewValidation.updateFAQNewSchema),
    faqNewController.updateFAQNew
);

router.delete(
    "/:faqNewId",
    verifyToken,
    adminMiddleware,
    faqNewController.deleteFAQNew
);

export const faqNewRoutes = router;
