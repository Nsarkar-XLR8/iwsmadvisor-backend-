import express from "express";
import { numberController } from "./number.controller.js";
import { numberValidation } from "./number.validation.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/get", numberController.getNumber);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    validateRequest(numberValidation.createNumberSchema),
    numberController.createNumber,
);

router.patch(
    "/update",
    verifyToken,
    adminMiddleware,
    validateRequest(numberValidation.updateNumberSchema),
    numberController.updateNumber,
);

router.delete(
    "/delete",
    verifyToken,
    adminMiddleware,
    numberController.deleteNumber,
);

export const numberRoutes = router;