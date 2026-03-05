import express from "express";
import { applicationController } from "./application.controller.js";
import { applicationValidation } from "./application.validation.js";
import { multerUpload } from "../../core/middlewares/multer.js";
import { adminMiddleware, verifyToken } from "../../core/middlewares/authMiddleware.js";
import validateRequest from "../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public — anyone can submit application
router.post(
    "/create",
    multerUpload([{ name: "resumeCV", maxCount: 1 }]),
    validateRequest(applicationValidation.createApplicationSchema),
    applicationController.createApplication,
);

// ✅ Admin only — view and manage applications
router.get(
    "/all",
    verifyToken,
    adminMiddleware,
    applicationController.getAllApplications,
);

router.get(
    "/:applicationId",
    verifyToken,
    adminMiddleware,
    applicationController.getApplicationById,
);

router.delete(
    "/:applicationId",
    verifyToken,
    adminMiddleware,
    applicationController.deleteApplication,
);

export const applicationRoutes = router;