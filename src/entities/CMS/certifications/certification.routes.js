import express from "express";
import { certificationController } from "./certification.controller.js";
import { certificationValidation } from "./certification.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all", certificationController.getAllCertifications);
router.get("/:certificationId", certificationController.getCertificationById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(certificationValidation.createCertificationSchema),
    certificationController.createCertification,
);

router.patch(
    "/:certificationId",
    verifyToken,
    adminMiddleware,
    validateRequest(certificationValidation.updateCertificationSchema),
    certificationController.updateCertification,
);

router.delete(
    "/:certificationId",
    verifyToken,
    adminMiddleware,
    certificationController.deleteCertification,
);

export const certificationRoutes = router;