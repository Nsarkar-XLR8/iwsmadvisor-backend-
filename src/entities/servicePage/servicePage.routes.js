import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';
import {
  createServicePage,
  getServicePages,
  getServicePageById,
  updateServicePage,
  deleteServicePage,
} from './servicePage.controller.js';

const router = express.Router();

// Public
router.get('/', getServicePages);
router.get('/:id', getServicePageById);

// Admin
router.post(
  '/',
  verifyToken,
  adminMiddleware,
  multerUpload([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  createServicePage
);
router.put(
  '/:id',
  verifyToken,
  adminMiddleware,
  multerUpload([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  updateServicePage
);
router.delete('/:id', verifyToken, adminMiddleware, deleteServicePage);

export default router;
