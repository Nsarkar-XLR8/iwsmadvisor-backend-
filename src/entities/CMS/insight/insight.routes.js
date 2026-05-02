import express from "express";
import { insightController } from "./insight.controller.js";
import { insightValidation } from "./insight.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// Public
router.get("/all", insightController.getAllInsights);
router.get("/:insightId", insightController.getInsightById);

// Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(insightValidation.createInsightSchema),
    insightController.createInsight
);

router.patch(
    "/:insightId",
    verifyToken,
    adminMiddleware,
    validateRequest(insightValidation.updateInsightSchema),
    insightController.updateInsight
);

router.delete(
    "/:insightId",
    verifyToken,
    adminMiddleware,
    insightController.deleteInsight
);

export const insightRoutes = router;