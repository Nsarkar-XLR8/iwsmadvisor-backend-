import express from "express";
import { consultantController } from "./consultant.controller.js";
import { consultantValidation } from "./consultant.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public Routes
router.get("/all", consultantController.getAllConsultants);
router.get("/:consultantId", consultantController.getConsultantById);

// ✅ Admin Only Routes
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(consultantValidation.createConsultantSchema),
    consultantController.createConsultant
);

router.patch(
    "/:consultantId",
    verifyToken,
    adminMiddleware,
    validateRequest(consultantValidation.updateConsultantSchema),
    consultantController.updateConsultant
);

router.delete(
    "/:consultantId",
    verifyToken,
    adminMiddleware,
    consultantController.deleteConsultant
);

export const consultantRoutes = router;