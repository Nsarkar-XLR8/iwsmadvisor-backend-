import express from "express";
import { expertiseController } from "./expertise.controller.js";
import { expertiseValidation } from "./expertise.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all", expertiseController.getAllExpertises);
router.get("/:expertiseId", expertiseController.getExpertiseById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(expertiseValidation.createExpertiseSchema),
    expertiseController.createExpertise,
);

router.patch(
    "/:expertiseId",
    verifyToken,
    adminMiddleware,
    validateRequest(expertiseValidation.updateExpertiseSchema),
    expertiseController.updateExpertise,
);

router.delete(
    "/:expertiseId",
    verifyToken,
    adminMiddleware,
    expertiseController.deleteExpertise,
);

export const expertiseRoutes = router;