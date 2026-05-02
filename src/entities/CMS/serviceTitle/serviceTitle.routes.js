import express from "express";
import { serviceTitleController } from "./serviceTitle.controller.js";
import { serviceTitleValidation } from "./serviceTitle.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// Public
router.get("/all", serviceTitleController.getAllServiceTitles);
router.get("/:serviceTitleId", serviceTitleController.getServiceTitleById);

// Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(serviceTitleValidation.createServiceTitleSchema),
    serviceTitleController.createServiceTitle
);

router.patch(
    "/:serviceTitleId",
    verifyToken,
    adminMiddleware,
    validateRequest(serviceTitleValidation.updateServiceTitleSchema),
    serviceTitleController.updateServiceTitle
);

router.delete(
    "/:serviceTitleId",
    verifyToken,
    adminMiddleware,
    serviceTitleController.deleteServiceTitle
);

export const serviceTitleRoutes = router;
