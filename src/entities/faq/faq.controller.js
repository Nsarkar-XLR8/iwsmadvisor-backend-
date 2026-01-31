import mongoose from 'mongoose';
import {
  createFaqService,
  getFaqsService,
  getFaqByIdService,
  updateFaqService,
  deleteFaqService,
} from './faq.service.js';

const pickField = (body, keys) => {
  for (const key of keys) {
    if (body?.[key] !== undefined) return body[key];
  }
  return undefined;
};

// Admin: create FAQ
export const createFaq = async (req, res) => {
  try {
    const title = pickField(req.body, ['title', 'Title']);
    const subtitle = pickField(req.body, ['subtitle', 'subTitle', 'Subtitle']);
    const items = pickField(req.body, ['items', 'faq', 'FAQ', 'faqs']);

    const faq = await createFaqService({ title, subtitle, items });

    return res.status(201).json({
      success: true,
      message: 'FAQ created successfully',
      data: faq,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create FAQ error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list FAQs
export const getFaqs = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getFaqsService({ page, limit, search });

    return res.status(200).json({
      success: true,
      message: 'FAQs fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single FAQ
export const getFaqById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid FAQ id' });
    }

    const faq = await getFaqByIdService(id);
    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'FAQ fetched successfully',
      data: faq,
    });
  } catch (error) {
    console.error('Get FAQ error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update FAQ
export const updateFaq = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid FAQ id' });
    }

    const title = pickField(req.body, ['title', 'Title']);
    const subtitle = pickField(req.body, ['subtitle', 'subTitle', 'Subtitle']);
    const items = pickField(req.body, ['items', 'faq', 'FAQ', 'faqs']);

    const result = await updateFaqService(id, {
      ...(title !== undefined ? { title } : {}),
      ...(subtitle !== undefined ? { subtitle } : {}),
      ...(items !== undefined ? { items } : {}),
    });

    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'FAQ updated successfully',
      data: result.faq,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update FAQ error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete FAQ
export const deleteFaq = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid FAQ id' });
    }

    const result = await deleteFaqService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    return res.status(200).json({ success: true, message: 'FAQ deleted successfully' });
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
