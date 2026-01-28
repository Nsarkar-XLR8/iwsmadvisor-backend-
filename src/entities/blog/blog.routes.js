import express from 'express';
import { verifyToken, adminMiddleware } from '../../core/middlewares/authMiddleware.js';
import { multerUpload } from '../../core/middlewares/multer.js';
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from './blog.controller.js';

const router = express.Router();

// Public: fetch blogs
router.get('/', getBlogs);
router.get('/:id', getBlogById);

// Admin: manage blogs
router.post('/', verifyToken, adminMiddleware, multerUpload([{ name: 'image', maxCount: 1 }]), createBlog);
router.put('/:id', verifyToken, adminMiddleware, multerUpload([{ name: 'image', maxCount: 1 }]), updateBlog);
router.delete('/:id', verifyToken, adminMiddleware, deleteBlog);

export default router;
