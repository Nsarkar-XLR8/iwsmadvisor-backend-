import express from "express";
import { logoController } from "./logo.controller.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Public route
router.get("/get", logoController.getLogo);

// ✅ Admin only routes
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "logo", maxCount: 1 }]),
    logoController.createLogo
);

router.patch(
    "/update",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "logo", maxCount: 1 }]),
    logoController.updateLogo
);

router.delete(
    "/delete",
    verifyToken,
    adminMiddleware,
    logoController.deleteLogo
);

export const logoRoutes = router;