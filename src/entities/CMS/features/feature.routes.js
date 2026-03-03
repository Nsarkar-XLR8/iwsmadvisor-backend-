import express from "express";
import { multerUploadAny } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";
import { featuresController } from "./feature.controller.js";
import { featuresValidation } from "./feature.validation.js";

const router = express.Router();

// ✅ Public
router.get("/all", featuresController.getAllFeatures);
router.get("/:featuresId", featuresController.getFeaturesById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUploadAny(),
    validateRequest(featuresValidation.createFeaturesSchema),
    featuresController.createFeatures,
);

router.patch(
    "/:featuresId",
    verifyToken,
    adminMiddleware,
    multerUploadAny(),
    validateRequest(featuresValidation.updateFeaturesSchema),
    featuresController.updateFeatures,
);

router.delete(
    "/:featuresId",
    verifyToken,
    adminMiddleware,
    featuresController.deleteFeatures,
);

export const featuresRoutes = router;