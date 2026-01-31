import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import {
  createFaq,
  getFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
} from './faq.controller.js';

const router = express.Router();

// Public
router.get('/', getFaqs);
router.get('/:id', getFaqById);

// Admin
router.post('/', verifyToken, adminMiddleware, createFaq);
router.put('/:id', verifyToken, adminMiddleware, updateFaq);
router.delete('/:id', verifyToken, adminMiddleware, deleteFaq);

export default router;
