import express from "express";
import { transformController } from "./transform.controller.js";
import { transformValidation } from "./transform.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all", transformController.getAllTransforms);
router.get("/:transformId", transformController.getTransformById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
    ]),
    validateRequest(transformValidation.createTransformSchema),
    transformController.createTransform,
);

router.patch(
    "/:transformId",
    verifyToken,
    adminMiddleware,
    multerUpload([
        { name: "image1", maxCount: 1 },
        { name: "image2", maxCount: 1 },
        { name: "image3", maxCount: 1 },
    ]),
    validateRequest(transformValidation.updateTransformSchema),
    transformController.updateTransform,
);

router.delete(
    "/:transformId",
    verifyToken,
    adminMiddleware,
    transformController.deleteTransform,
);

export const transformRoutes = router;