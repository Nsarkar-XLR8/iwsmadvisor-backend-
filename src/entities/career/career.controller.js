import mongoose from 'mongoose';
import {
  createCareerService,
  getCareersService,
  getCareerByIdService,
  updateCareerService,
  deleteCareerService,
} from './career.service.js';

// Admin: create career
export const createCareer = async (req, res) => {
  try {
    const career = await createCareerService(req.body);
    return res.status(201).json({
      success: true,
      message: 'Career created successfully',
      data: career,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create career error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list careers
export const getCareers = async (req, res) => {
  try {
    const { page, limit, search, type } = req.query;
    const result = await getCareersService({ page, limit, search, type });

    return res.status(200).json({
      success: true,
      message: 'Careers fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get careers error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single career
export const getCareerById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid career id' });
    }

    const career = await getCareerByIdService(id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Career fetched successfully',
      data: career,
    });
  } catch (error) {
    console.error('Get career error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update career
export const updateCareer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid career id' });
    }

    const result = await updateCareerService(id, req.body);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Career updated successfully',
      data: result.career,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update career error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete career
export const deleteCareer = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid career id' });
    }

    const result = await deleteCareerService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    return res.status(200).json({ success: true, message: 'Career deleted successfully' });
  } catch (error) {
    console.error('Delete career error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
