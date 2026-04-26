import mongoose from 'mongoose';
import sendEmail from '../../lib/sendEmail.js';
import Career from '../career/career.model.js';
import { publicCareersBaseUrl } from '../../core/config/config.js';
import {
  createCareerApplicationService,
  getCareerApplicationsService,
  getCareerApplicationByIdService,
  deleteCareerApplicationService,
  updateCareerApplicationService
} from './careerApplication.service.js';

const firstAvailableFile = (files) => {
  if (!files) return undefined;
  if (Array.isArray(files)) return files[0];
  for (const key of Object.keys(files)) {
    if (files[key]?.[0]) return files[key][0];
  }
  return undefined;
};

const toCareerSlug = (value) => {
  if (!value) return '';
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, '')
    .replaceAll(/\s+/g, '-')
    .replaceAll(/-+/g, '-');
};

// Public: apply to a career
export const applyToCareer = async (req, res) => {
  try {
    const careerId = req.params.id || req.body.careerId;
    if (!careerId) {
      return res
        .status(400)
        .json({ success: false, message: 'Career id is required' });
    }
    const resumeFile = req.files?.resume?.[0] || firstAvailableFile(req.files);
    const application = await createCareerApplicationService({
      ...req.body,
      careerId,
      // userId: req.user?._id,
      resumeFile
    });
    const career = await Career.findById(careerId).select('title');

    const resumeUrl = application.resumeFile?.url || application.resumeLink;
    const resumeLabel =
      application.resumeFile?.originalName ||
      application.resumeFile?.filename ||
      'Resume file';
    const jobTitle = career?.title || 'N/A';
    const jobTitleSlug = toCareerSlug(career?.title);
    const jobPostUrl = jobTitleSlug
      ? `${publicCareersBaseUrl}/${jobTitleSlug}`
      : publicCareersBaseUrl;
    const dashboardUrl =
      process.env.CAREER_MANAGEMENT_DASHBOARD_URL ||
      'https://admin.iwmsadvisors.com/career-management';

    // Send email notification to careers team
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
        <h2 style="color: #333;">New Career Application Received</h2>
        <p style="font-size: 14px; color: #555;">A new application has been submitted for a career position.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 20px;">Applicant Details</h3>
        <p><strong>Name:</strong> ${application.name}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Phone:</strong> ${application.phone || 'N/A'}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 20px;">Application Details</h3>
        <p><strong>Job Position:</strong> ${jobTitle}</p>
        <p><strong>Job Post URL:</strong> <a href="${jobPostUrl}" target="_blank" rel="noopener noreferrer">${jobPostUrl}</a></p>
        <p><strong>Resume:</strong> ${resumeUrl ? `<a href="${resumeUrl}" target="_blank" rel="noopener noreferrer">${resumeLabel}</a>` : 'N/A'}</p>
        <p><strong>Portfolio:</strong> ${application.portfolioLink || 'N/A'}</p>
        <p><strong>Cover Letter:</strong> ${application.coverLetter || 'N/A'}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p><strong>Dashboard:</strong> <a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer">Open career management dashboard</a></p>
        <p style="font-size: 12px; color: #aaa; text-align: center;">This is an automated notification. Please review the application in the admin panel.</p>
      </div>
    `;

    await sendEmail({
      to: 'careers@iwmsadvisors.com',
      subject: `New Career Application - ${application.name}`,
      html: emailContent
    });

    return res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error('Apply career error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
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
      adminView
    });

    return res.status(200).json({
      success: true,
      message: 'Career applications fetched successfully',
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get career applications error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

// Admin: get single application
export const getCareerApplicationById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid application id' });
    }

    const adminView = req.user?.role === 'ADMIN';
    const application = await getCareerApplicationByIdService(id, {
      adminView
    });
    if (!application) {
      return res
        .status(404)
        .json({ success: false, message: 'Application not found' });
    }

    if (
      !adminView &&
      application.userId &&
      req.user?._id?.toString() !== application.userId.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    return res.status(200).json({
      success: true,
      message: 'Career application fetched successfully',
      data: application
    });
  } catch (error) {
    console.error('Get career application error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete application
export const deleteCareerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid application id' });
    }

    const result = await deleteCareerApplicationService(id);
    if (result?.notFound) {
      return res
        .status(404)
        .json({ success: false, message: 'Application not found' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    console.error('Delete career application error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update application (status)
export const updateCareerApplication = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid application id' });
    }

    const { status, notes, resumeLink, portfolioLink, coverLetter } = req.body;
    const result = await updateCareerApplicationService(id, {
      status,
      notes,
      resumeLink,
      portfolioLink,
      coverLetter
    });
    if (result?.notFound) {
      return res
        .status(404)
        .json({ success: false, message: 'Application not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Application updated successfully',
      data: result.updated
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update career application error:', error);
    return res
      .status(500)
      .json({ success: false, message: 'Internal server error' });
  }
};
