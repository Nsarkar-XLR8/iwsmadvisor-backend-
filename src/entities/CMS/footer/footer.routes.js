import express from "express";
import { footerController } from "./footer.controller.js";
import { footerValidation } from "./footer.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/get", footerController.getFooter);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "logo", maxCount: 1 }]),
    validateRequest(footerValidation.createFooterSchema),
    footerController.createFooter,
);

router.patch(
    "/update/:footerId",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "logo", maxCount: 1 }]),
    validateRequest(footerValidation.updateFooterSchema),
    footerController.updateFooter,
);

router.delete(
    "/delete/:footerId",
    verifyToken,
    adminMiddleware,
    footerController.deleteFooter,
);

export const footerRoutes = router;