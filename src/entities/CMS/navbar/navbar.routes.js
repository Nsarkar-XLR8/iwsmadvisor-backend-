import express from "express";
import { navbarController } from "./navbar.controller.js";
// import { navbarValidation } from "./navbar.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
// import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/get", navbarController.getNavbar);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "logo", maxCount: 1 }]),
    // validateRequest(navbarValidation.createNavbarSchema),
    navbarController.createNavbar,
);

router.patch(
    "/update",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "logo", maxCount: 1 }]),
    // validateRequest(navbarValidation.updateNavbarSchema),
    navbarController.updateNavbar,
);

router.delete(
    "/delete",
    verifyToken,
    adminMiddleware,
    navbarController.deleteNavbar,
);

export const navbarRoutes = router;