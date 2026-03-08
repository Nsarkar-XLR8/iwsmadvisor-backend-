import express from "express";
import { informationController } from "./information.controller.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";



const router = express.Router();

// ✅ Public
router.get("/get", informationController.getInformation);
router.get("/all",  informationController.getAllInformations);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    informationController.createInformation,
);

router.patch(
    "/update",
    verifyToken,
    adminMiddleware,
    informationController.updateInformation,
);

router.delete(
    "/delete/:informationId",
    verifyToken,
    adminMiddleware,
    informationController.deleteInformation,
);

export const informationRoutes = router;