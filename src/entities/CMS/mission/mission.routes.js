import express from "express";
import { missionController } from "./mission.controller.js";
import { missionValidation } from "./mission.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all",        missionController.getAllMissions);
router.get("/:missionId", missionController.getMissionById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(missionValidation.createMissionSchema),
    missionController.createMission,
);

router.patch(
    "/:missionId",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(missionValidation.updateMissionSchema),
    missionController.updateMission,
);

router.delete(
    "/:missionId",
    verifyToken,
    adminMiddleware,
    missionController.deleteMission,
);

export const missionRoutes = router;