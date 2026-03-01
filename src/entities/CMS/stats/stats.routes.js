import express from "express";
import { statsController } from "./stats.controller.js";
import { statsValidation } from "./stats.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all", statsController.getAllStats);
router.get("/:statsId", statsController.getStatsById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(statsValidation.createStatsSchema),
    statsController.createStats,
);

router.patch(
    "/:statsId",
    verifyToken,
    adminMiddleware,
    validateRequest(statsValidation.updateStatsSchema),
    statsController.updateStats,
);

router.delete(
    "/:statsId",
    verifyToken,
    adminMiddleware,
    statsController.deleteStats,
);

export const statsRoutes = router;