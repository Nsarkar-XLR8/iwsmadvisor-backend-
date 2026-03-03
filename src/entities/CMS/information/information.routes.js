import express from "express";
import { informationController } from "./information.controller.js";
import { informationValidation } from "./information.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/get", informationController.getInformation);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(informationValidation.createInformationSchema),
    informationController.createInformation,
);

router.patch(
    "/update",
    verifyToken,
    adminMiddleware,
    validateRequest(informationValidation.updateInformationSchema),
    informationController.updateInformation,
);

router.delete(
    "/delete",
    verifyToken,
    adminMiddleware,
    informationController.deleteInformation,
);

export const informationRoutes = router;