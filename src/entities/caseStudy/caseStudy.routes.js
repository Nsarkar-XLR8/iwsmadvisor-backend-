import express from 'express';
import {
  createCaseStudy,
  getCaseStudies,
  getCaseStudyById,
  updateCaseStudy,
  deleteCaseStudy,
} from './caseStudy.controller.js';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';

const router = express.Router();

// Public: fetch case studies
router.get('/', getCaseStudies);
router.get('/:id', getCaseStudyById);

// Admin: manage case studies
router.post('/', verifyToken, adminMiddleware, multerUpload([{ name: 'image', maxCount: 1 }]), createCaseStudy);
router.put('/:id', verifyToken, adminMiddleware, multerUpload([{ name: 'image', maxCount: 1 }]), updateCaseStudy);
router.delete('/:id', verifyToken, adminMiddleware, deleteCaseStudy);

export default router;
