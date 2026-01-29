import mongoose from 'mongoose';
import {
  createCareerApplicationService,
  getCareerApplicationsService,
  getCareerApplicationByIdService,
  deleteCareerApplicationService,
} from './careerApplication.service.js';

const firstAvailableFile = (files) => {
  if (!files) return undefined;
  if (Array.isArray(files)) return files[0];
  for (const key of Object.keys(files)) {
    if (files[key]?.[0]) return files[key][0];
  }
  return undefined;
};

// Public: apply to a career
export const applyToCareer = async (req, res) => {
  try {
    const careerId = req.params.id || req.body.careerId;
    if (!careerId) {
      return res.status(400).json({ success: false, message: 'Career id is required' });
    }
    const resumeFile = req.files?.resume?.[0] || firstAvailableFile(req.files);
    const application = await createCareerApplicationService({
      ...req.body,
      careerId,
      userId: req.user?._id,
      resumeFile,
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error('Apply career error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: list applications
export const getCareerApplications = async (req, res) => {
  try {
    const { page, limit, careerId, search } = req.query;
    const adminView = req.user?.role === 'ADMIN';
    const result = await getCareerApplicationsService({
      page,
      limit,
      careerId,
      search,
      userId: adminView ? undefined : req.user?._id,
      adminView,
    });

    return res.status(200).json({
      success: true,
      message: 'Career applications fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get career applications error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: get single application
export const getCareerApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application id' });
    }

    const adminView = req.user?.role === 'ADMIN';
    const application = await getCareerApplicationByIdService(id, { adminView });
    if (!application) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    if (!adminView && application.userId && req.user?._id?.toString() !== application.userId.toString()) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.status(200).json({
      success: true,
      message: 'Career application fetched successfully',
      data: application,
    });
  } catch (error) {
    console.error('Get career application error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete application
export const deleteCareerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid application id' });
    }

    const result = await deleteCareerApplicationService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Application not found' });
    }

    return res.status(200).json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete career application error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
