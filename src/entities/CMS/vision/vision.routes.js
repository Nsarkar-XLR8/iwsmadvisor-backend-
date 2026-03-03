import express from "express";
import { visionController } from "./vision.controller.js";
import { visionValidation } from "./vision.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all",       visionController.getAllVisions);
router.get("/:visionId", visionController.getVisionById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(visionValidation.createVisionSchema),
    visionController.createVision,
);

router.patch(
    "/:visionId",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(visionValidation.updateVisionSchema),
    visionController.updateVision,
);

router.delete(
    "/:visionId",
    verifyToken,
    adminMiddleware,
    visionController.deleteVision,
);

export const visionRoutes = router;