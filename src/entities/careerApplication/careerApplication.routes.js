import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';
import {
  applyToCareer,
  getCareerApplications,
  getCareerApplicationById,
  deleteCareerApplication,
  updateCareerApplication,
} from './careerApplication.controller.js';

const router = express.Router();

// User: view own applications
router.get('/me', verifyToken, getCareerApplications);
router.get('/me/:id', verifyToken, getCareerApplicationById);

// Admin: manage applications
router.get('/', verifyToken, adminMiddleware, getCareerApplications);
router.get('/:id', verifyToken, adminMiddleware, getCareerApplicationById);
router.delete('/:id', verifyToken, adminMiddleware, deleteCareerApplication);
router.put('/:id', verifyToken, adminMiddleware, updateCareerApplication);

export default router;
