import express from "express";
import { careerTitleController } from "./careerTitle.controller.js";
import { careerTitleValidation } from "./careerTitle.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// Public
router.get("/all", careerTitleController.getAllCareerTitles);
router.get("/:careerTitleId", careerTitleController.getCareerTitleById);

// Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(careerTitleValidation.createCareerTitleSchema),
    careerTitleController.createCareerTitle
);

router.patch(
    "/:careerTitleId",
    verifyToken,
    adminMiddleware,
    validateRequest(careerTitleValidation.updateCareerTitleSchema),
    careerTitleController.updateCareerTitle
);

router.delete(
    "/:careerTitleId",
    verifyToken,
    adminMiddleware,
    careerTitleController.deleteCareerTitle
);

export const careerTitleRoutes = router;
