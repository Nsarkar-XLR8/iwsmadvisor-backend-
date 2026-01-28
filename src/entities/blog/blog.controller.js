import mongoose from 'mongoose';
import {
  createBlogService,
  getBlogsService,
  getBlogByIdService,
  updateBlogService,
  deleteBlogService,
} from './blog.service.js';

// Admin: create blog (multipart/form-data)
export const createBlog = async (req, res) => {
  try {
    const imageFile = req.files?.image?.[0];
    const blog = await createBlogService({ ...req.body, image: imageFile });
    return res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create blog error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list blogs
export const getBlogs = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getBlogsService({ page, limit, search });

    return res.status(200).json({
      success: true,
      message: 'Blogs fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get blogs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single blog
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }

    const blog = await getBlogByIdService(id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog fetched successfully',
      data: blog,
    });
  } catch (error) {
    console.error('Get blog error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }

    const imageFile = req.files?.image?.[0];
    const result = await updateBlogService(id, { ...req.body, ...(imageFile ? { image: imageFile } : {}) });

    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Blog updated successfully',
      data: result.blog,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update blog error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid blog id' });
    }

    const result = await deleteBlogService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    return res.status(200).json({ success: true, message: 'Blog deleted successfully' });
  } catch (error) {
    console.error('Delete blog error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
