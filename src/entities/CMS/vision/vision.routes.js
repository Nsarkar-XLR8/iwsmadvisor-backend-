import express from "express";
import { visionController } from "./vision.controller.js";
import { visionValidation } from "./vision.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { parseFormData } from "../../../core/middlewares/parseFormData.js";

const router = express.Router();


// ✅ Public — fetch Vision section
router.get("/get", visionController.getVision);

// ✅ Create Vision (Singleton)
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([
        { name: "missionImage", maxCount: 1 },
        { name: "visionImage", maxCount: 1 },
        { name: "coreImages", maxCount: 10 }
    ]),
    parseFormData,
    validateRequest(visionValidation.createVisionSchema),
    visionController.createVision
);

// ✅ Update Vision (Singleton — no ID)
router.patch(
    "/update",
    verifyToken,
    adminMiddleware,
    validateRequest(visionValidation.updateVisionSchema),
    visionController.updateVision
);

// ✅ Delete Vision
router.delete(
    "/delete",
    verifyToken,
    adminMiddleware,
    visionController.deleteVision
);

export const visionRoutes = router;