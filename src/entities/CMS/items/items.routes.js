import express from "express";
import { itemsController } from "./items.controller.js";
import { itemsValidation } from "./items.validation.js";
import { multerUpload } from "../../../core/middlewares/multer.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";

const router = express.Router();

// ✅ Public
router.get("/all", itemsController.getAllItems);
router.get("/:itemId", itemsController.getItemById);

// ✅ Admin only
router.post(
    "/create",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(itemsValidation.createItemsSchema),
    itemsController.createItem,
);

router.patch(
    "/:itemId",
    verifyToken,
    adminMiddleware,
    multerUpload([{ name: "image", maxCount: 1 }]),
    validateRequest(itemsValidation.updateItemsSchema),
    itemsController.updateItem,
);

router.delete(
    "/:itemId",
    verifyToken,
    adminMiddleware,
    itemsController.deleteItem,
);

export const itemsRoutes = router;