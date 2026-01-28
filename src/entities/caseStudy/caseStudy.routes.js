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

// Admin: manage case studies — single file field `file` (same as blog/contact)
router.post('/', verifyToken, adminMiddleware, multerUpload([{ name: 'file', maxCount: 1 }]), createCaseStudy);
router.put('/:id', verifyToken, adminMiddleware, multerUpload([{ name: 'file', maxCount: 1 }]), updateCaseStudy);
router.delete('/:id', verifyToken, adminMiddleware, deleteCaseStudy);

export default router;
