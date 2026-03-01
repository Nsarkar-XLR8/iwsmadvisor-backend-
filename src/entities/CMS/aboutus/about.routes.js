import express from "express";
import { aboutController } from "./about.controller.js";
import { aboutValidation } from "./about.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/get", aboutController.getAbout);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(aboutValidation.createAboutSchema),
    aboutController.createAbout,
);

router.patch(
    "/update/:aboutId",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(aboutValidation.updateAboutSchema),
    aboutController.updateAbout,
);

router.delete(
    "/delete/:aboutId",
    verifyToken,
    adminMiddleware,
    aboutController.deleteAbout,
);

export const aboutRoutes = router;