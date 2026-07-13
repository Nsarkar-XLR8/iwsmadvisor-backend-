import { applicationService } from './application.service.js';
import catchAsync from '../../lib/catchAsync.js';
import { generateResponse } from '../../lib/responseFormate.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';
import sendEmail from '../../lib/sendEmail.js';
import { careersEmail } from '../../core/config/config.js';

const sendApplicationNotification = async (application) => {
  const dashboardUrl =
    process.env.APPLICATION_MANAGEMENT_DASHBOARD_URL ||
    'https://admin.iwmsadvisors.com/applications';
  const recipientEmail = careersEmail;

  const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
                <h2 style="color: #333;">New General Application Received</h2>
                <p style="font-size: 14px; color: #555;">A new application has been submitted from the public application form.</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 20px;">Applicant Details</h3>
                <p><strong>Full Name:</strong> ${application.fullName}</p>
                <p><strong>Email:</strong> ${application.email}</p>
                <p><strong>Phone:</strong> ${application.phone}</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <h3 style="color: #333; margin-top: 20px;">Application Details</h3>
                <p><strong>Resume:</strong> ${application.resumeCV ? `<a href="${application.resumeCV}" target="_blank" rel="noopener noreferrer">View Resume CV</a>` : 'N/A'}</p>
                <p><strong>Portfolio URL:</strong> ${application.portfolioUrl || 'N/A'}</p>
                <p><strong>LinkedIn:</strong> ${application.linkedinProfile || 'N/A'}</p>
                <p><strong>Cover Letter:</strong> ${application.coverLetter || 'N/A'}</p>
                <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                <p><strong>Dashboard:</strong> <a href="${dashboardUrl}" target="_blank" rel="noopener noreferrer">Open application management dashboard</a></p>
                <p style="font-size: 12px; color: #aaa; text-align: center;">This is an automated notification. Please review the application in the admin panel.</p>
            </div>
        `;

  await sendEmail({
    to: recipientEmail,
    subject: `New Application - ${application.fullName}`,
    html: emailContent
  });
};

const isValidPortfolioUrl = (value) => {
  const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/;
  return urlRegex.test(value.trim());
};

const isValidLinkedinUrl = (value) => value.includes('linkedin.com');

const getOptionalLinkValidationError = ({ portfolioUrl, linkedinProfile }) => {
  if (
    portfolioUrl &&
    portfolioUrl.trim() !== '' &&
    !isValidPortfolioUrl(portfolioUrl)
  ) {
    return 'Portfolio URL must be a valid URL';
  }

  if (
    linkedinProfile &&
    linkedinProfile.trim() !== '' &&
    !isValidLinkedinUrl(linkedinProfile)
  ) {
    return 'LinkedIn profile must be a valid LinkedIn URL';
  }

  return null;
};

const createApplication = catchAsync(async (req, res) => {
  const {
    fullName,
    email,
    phone,
    coverLetter,
    portfolioUrl,
    linkedinProfile,
    isAgreed
  } = req.body;

  // ✅ Validate required fields
  if (!fullName?.trim())
    return generateResponse(res, 400, false, 'Full name is required', null);
  if (!email?.trim())
    return generateResponse(res, 400, false, 'Email is required', null);
  if (!phone?.trim())
    return generateResponse(res, 400, false, 'Phone is required', null);

  // ✅ Validate isAgreed — handles boolean and string "true"/"false"
  const agreedValue = isAgreed === true || isAgreed === 'true';
  if (!agreedValue) {
    return generateResponse(
      res,
      400,
      false,
      'You must agree to the terms and conditions',
      null
    );
  }

  // ✅ Validate resumeCV file is provided
  const resumeFile = req.files?.resumeCV?.[0];
  if (!resumeFile) {
    return generateResponse(res, 400, false, 'Resume CV is required', null);
  }

  // ✅ Validate file type — PDF, DOCX, TXT, JPG, PNG only
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png'
  ];
  if (!allowedMimeTypes.includes(resumeFile.mimetype)) {
    return generateResponse(
      res,
      400,
      false,
      'Resume CV must be PDF, DOCX, TXT, JPG or PNG',
      null
    );
  }

  // ✅ Validate file size — max 20MB
  const maxSize = 20 * 1024 * 1024;
  if (resumeFile.size > maxSize) {
    return generateResponse(
      res,
      400,
      false,
      'Resume CV must not exceed 20MB',
      null
    );
  }

  // ✅ Upload resume to cloudinary
  const cloudinaryResult = await cloudinaryUpload(
    resumeFile.path,
    `resume-${Date.now()}`,
    'applications'
  );
  if (!cloudinaryResult?.url) {
    return generateResponse(
      res,
      500,
      false,
      'Resume upload failed. Please try again',
      null
    );
  }

  const optionalLinkError = getOptionalLinkValidationError({
    portfolioUrl,
    linkedinProfile
  });
  if (optionalLinkError) {
    return generateResponse(res, 400, false, optionalLinkError, null);
  }

  const created = await applicationService.createApplicationIntoDb({
    fullName,
    email,
    phone,
    resumeCV: cloudinaryResult.url,
    coverLetter: coverLetter || '',
    portfolioUrl: portfolioUrl || '',
    linkedinProfile: linkedinProfile || '',
    isAgreed: agreedValue
  });
  await sendApplicationNotification(created);

  return generateResponse(
    res,
    201,
    true,
    'Application submitted successfully',
    created
  );
});

const getAllApplications = catchAsync(async (req, res) => {
  const result = await applicationService.getAllApplicationsFromDb(req.query);
  return generateResponse(
    res,
    200,
    true,
    'Applications fetched successfully',
    result.data,
    result.meta
  );
});

const getApplicationById = catchAsync(async (req, res) => {
  if (!req.params.applicationId) {
    return generateResponse(
      res,
      400,
      false,
      'Application ID is required',
      null
    );
  }

  const application = await applicationService.getApplicationByIdFromDb(
    req.params.applicationId
  );
  return generateResponse(
    res,
    200,
    true,
    'Application fetched successfully',
    application
  );
});

const deleteApplication = catchAsync(async (req, res) => {
  if (!req.params.applicationId) {
    return generateResponse(
      res,
      400,
      false,
      'Application ID is required',
      null
    );
  }

  await applicationService.deleteApplicationFromDb(req.params.applicationId);
  return generateResponse(
    res,
    200,
    true,
    'Application deleted successfully',
    null
  );
});

export const applicationController = {
  createApplication,
  getAllApplications,
  getApplicationById,
  deleteApplication
};
