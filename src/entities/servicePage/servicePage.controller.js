import mongoose from 'mongoose';
import {
  createServicePageService,
  getServicePagesService,
  getServicePageByIdService,
  updateServicePageService,
  deleteServicePageService,
} from './servicePage.service.js';

const firstAvailableFile = (files, excludeKeys = []) => {
  if (!files) return undefined;
  if (Array.isArray(files)) return files[0];
  for (const key of Object.keys(files)) {
    if (excludeKeys.includes(key)) continue;
    if (files[key]?.[0]) return files[key][0];
  }
  return undefined;
};

const pickField = (body, keys) => {
  for (const key of keys) {
    if (body?.[key] !== undefined) return body[key];
  }
  return undefined;
};

// Admin: create service page (multipart/form-data)
export const createServicePage = async (req, res) => {
  try {
    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files, ['icon']);
    const icon = req.files?.icon?.[0] || pickField(req.body, ['icon', 'Icon', 'iconName', 'iconClass']);
    const heading = pickField(req.body, ['heading', 'Heading', 'pageHeading', 'pageTitle']);
    const subtitles = pickField(req.body, ['subtitles', 'subtitle', 'subTitles', 'Subtitles']);
    const title = pickField(req.body, ['title', 'Title', 'serviceTitle']);
    const guideline = pickField(req.body, ['guideline', 'Guideline', 'guidance', 'Guidance']);
    const description = pickField(req.body, ['description', 'Description']);
    const faq = pickField(req.body, ['faq', 'FAQ', 'faqs']);
    const order = pickField(req.body, ['order', 'Order']);

    const servicePage = await createServicePageService({
      heading,
      subtitles,
      title,
      guideline,
      description,
      faq,
      image: imageFile,
      icon,
      order,
    });

    return res.status(201).json({
      success: true,
      message: 'Service page created successfully',
      data: servicePage,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create service page error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list service pages
export const getServicePages = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getServicePagesService({ page, limit, search });
    return res.status(200).json({
      success: true,
      message: 'Service pages fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get service pages error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single service page
export const getServicePageById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service page id' });
    }

    const servicePage = await getServicePageByIdService(id);
    if (!servicePage) {
      return res.status(404).json({ success: false, message: 'Service page not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Service page fetched successfully',
      data: servicePage,
    });
  } catch (error) {
    console.error('Get service page error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update service page
export const updateServicePage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service page id' });
    }

    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files, ['icon']);
    const icon = req.files?.icon?.[0] || pickField(req.body, ['icon', 'Icon', 'iconName', 'iconClass']);
    const heading = pickField(req.body, ['heading', 'Heading', 'pageHeading', 'pageTitle']);
    const subtitles = pickField(req.body, ['subtitles', 'subtitle', 'subTitles', 'Subtitles']);
    const title = pickField(req.body, ['title', 'Title', 'serviceTitle']);
    const guideline = pickField(req.body, ['guideline', 'Guideline', 'guidance', 'Guidance']);
    const description = pickField(req.body, ['description', 'Description']);
    const faq = pickField(req.body, ['faq', 'FAQ', 'faqs']);
    const order = pickField(req.body, ['order', 'Order']);

    const result = await updateServicePageService(id, {
      ...(heading !== undefined ? { heading } : {}),
      ...(subtitles !== undefined ? { subtitles } : {}),
      ...(title !== undefined ? { title } : {}),
      ...(guideline !== undefined ? { guideline } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(faq !== undefined ? { faq } : {}),
      ...(imageFile ? { image: imageFile } : {}),
      ...(icon !== undefined ? { icon } : {}),
      ...(order !== undefined ? { order } : {}),
    });

    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Service page not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Service page updated successfully',
      data: result.servicePage,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update service page error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete service page
export const deleteServicePage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid service page id' });
    }

    const result = await deleteServicePageService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Service page not found' });
    }

    return res.status(200).json({ success: true, message: 'Service page deleted successfully' });
  } catch (error) {
    console.error('Delete service page error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
