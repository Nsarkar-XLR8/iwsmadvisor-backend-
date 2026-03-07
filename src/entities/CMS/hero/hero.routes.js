import express from "express";
import { heroController } from "./hero.controller.js";
import { heroValidation } from "./hero.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all", heroController.getAllHeroes);
router.get("/:heroId", heroController.getHeroById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(heroValidation.createHeroSchema),
    heroController.createHero,
);

router.patch(
    "/swap-order",
    verifyToken,
    adminMiddleware,
    heroController.swapHeroOrder,
);

router.patch(
    "/:heroId",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(heroValidation.updateHeroSchema),
    heroController.updateHero,
);

router.delete(
    "/:heroId",
    verifyToken,
    adminMiddleware,
    heroController.deleteHero,
);

export const heroRoutes = router;