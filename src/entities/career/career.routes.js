import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';
import {
  createCareer,
  getCareers,
  getCareerById,
  updateCareer,
  deleteCareer,
} from './career.controller.js';
import { applyToCareer } from '../careerApplication/careerApplication.controller.js';

const router = express.Router();

// Public: fetch careers
router.get('/', getCareers);
router.get('/:id', getCareerById);
router.post('/:id/apply', verifyToken, multerUpload([{ name: 'resume', maxCount: 1 }]), applyToCareer);

// Admin: manage careers
router.post('/', verifyToken, adminMiddleware, createCareer);
router.put('/:id', verifyToken, adminMiddleware, updateCareer);
router.delete('/:id', verifyToken, adminMiddleware, deleteCareer);

export default router;
