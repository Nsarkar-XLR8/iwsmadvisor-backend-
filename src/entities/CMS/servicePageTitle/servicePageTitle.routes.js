import express from "express";
import {
  createTitleController,
  getAllTitlesController,
  getSingleTitleController,
  updateTitleController,
  deleteTitleController,
} from "./servicePageTitle.controller.js";
import validateRequest from "../../../core/middlewares/validateRequest.js";
import { verifyToken, adminMiddleware } from "../../../core/middlewares/authMiddleware.js";
import { createTitleValidation, updateTitleValidation } from "./servicePageTitle.validation.js";

const router = express.Router();

// ✅ Public routes
router.get("/", getAllTitlesController);
router.get("/:id", getSingleTitleController);

// ✅ Admin only routes
router.post(
  "/",
  verifyToken,
  adminMiddleware,
  validateRequest(createTitleValidation),
  createTitleController
);

router.patch(
  "/:id",
  verifyToken,
  adminMiddleware,
  validateRequest(updateTitleValidation),
  updateTitleController
);

router.delete(
  "/:id",
  verifyToken,
  adminMiddleware,
  deleteTitleController
);

export const servicePageTitleRoutes = router;