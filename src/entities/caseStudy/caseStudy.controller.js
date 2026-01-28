import mongoose from 'mongoose';
import {
  createCaseStudyService,
  getCaseStudiesService,
  getCaseStudyByIdService,
  updateCaseStudyService,
  deleteCaseStudyService,
} from './caseStudy.service.js';

// Admin: create case study (multipart/form-data)
export const createCaseStudy = async (req, res) => {
  try {
    const imageFile = req.files?.image?.[0];
    const caseStudy = await createCaseStudyService({ ...req.body, image: imageFile });
    return res.status(201).json({
      success: true,
      message: 'Case study created successfully',
      data: caseStudy,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list case studies
export const getCaseStudies = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getCaseStudiesService({ page, limit, search });

    return res.status(200).json({
      success: true,
      message: 'Case studies fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get case studies error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single case study
export const getCaseStudyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case study id' });
    }

    const caseStudy = await getCaseStudyByIdService(id);
    if (!caseStudy) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Case study fetched successfully',
      data: caseStudy,
    });
  } catch (error) {
    console.error('Get case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update case study
export const updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case study id' });
    }

    const imageFile = req.files?.image?.[0];
    const result = await updateCaseStudyService(id, { ...req.body, ...(imageFile ? { image: imageFile } : {}) });

    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Case study updated successfully',
      data: result.caseStudy,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete case study
export const deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case study id' });
    }

    const result = await deleteCaseStudyService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    return res.status(200).json({ success: true, message: 'Case study deleted successfully' });
  } catch (error) {
    console.error('Delete case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
