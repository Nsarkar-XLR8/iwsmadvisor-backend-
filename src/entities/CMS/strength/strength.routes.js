import express from "express";
import { strengthController } from "./strength.controller.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";
import { strengthValidation } from "./strentgh.validation.js";

const router = express.Router();

// ✅ Public
router.get("/all", strengthController.getAllStrengths);
router.get("/:strengthId", strengthController.getStrengthById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(strengthValidation.createStrengthSchema),
    strengthController.createStrength,
);

router.patch(
    "/:strengthId",
    verifyToken,
    adminMiddleware,
    validateRequest(strengthValidation.updateStrengthSchema),
    strengthController.updateStrength,
);

router.delete(
    "/:strengthId",
    verifyToken,
    adminMiddleware,
    strengthController.deleteStrength,
);

export const strengthRoutes = router;