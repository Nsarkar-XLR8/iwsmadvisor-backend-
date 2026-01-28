// src/modules/contact/contact.routes.js
import express from 'express';
import {
  createContact,
  getContacts,
  getContactById,
  updateContact,
  deleteContact,
} from './contact.controller.js';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';

const router = express.Router();

// Public: submit contact form
router.post('/', multerUpload([{ name: 'file', maxCount: 1 }]), createContact);

// Admin: manage contacts
router.get('/', verifyToken, adminMiddleware, getContacts);
router.get('/:id', verifyToken, adminMiddleware, getContactById);
router.put('/:id', verifyToken, adminMiddleware, multerUpload([{ name: 'file', maxCount: 1 }]), updateContact);
router.delete('/:id', verifyToken, adminMiddleware, deleteContact);

export default router;
