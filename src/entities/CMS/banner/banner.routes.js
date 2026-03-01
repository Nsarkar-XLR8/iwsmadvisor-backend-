import express from "express";
import { bannerController } from "./banner.controller.js";
import { bannerValidation } from "./banner.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all", bannerController.getAllBanners);
router.get("/:bannerId", bannerController.getBannerById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(bannerValidation.createBannerSchema),
    bannerController.createBanner
);

router.patch(
    "/:bannerId",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(bannerValidation.updateBannerSchema),
    bannerController.updateBanner
);

router.delete(
    "/:bannerId",
    verifyToken,
    adminMiddleware,
    bannerController.deleteBanner
);

export const bannerRoutes = router;