import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';
import {
  createRealState,
  getRealStates,
  getRealStateById,
  updateRealState,
  deleteRealState,
} from './realState.controller.js';

const router = express.Router();

// Public: fetch real states
router.get('/', getRealStates);
router.get('/:id', getRealStateById);

// Admin: manage real states
router.post(
  '/',
  verifyToken,
  adminMiddleware,
  multerUpload([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  createRealState
);
router.put(
  '/:id',
  verifyToken,
  adminMiddleware,
  multerUpload([
    { name: 'file', maxCount: 1 },
    { name: 'image', maxCount: 1 },
  ]),
  updateRealState
);
router.delete('/:id', verifyToken, adminMiddleware, deleteRealState);

export default router;
