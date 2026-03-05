import { applicationService } from "./application.service.js";
import catchAsync from "../../lib/catchAsync.js";
import { generateResponse } from "../../lib/responseFormate.js";
import { cloudinaryUpload } from "../../lib/cloudinaryUpload.js";

const createApplication = catchAsync(async (req, res) => {
    const {
        fullName,
        email,
        phone,
        coverLetter,
        portfolioUrl,
        linkedinProfile,
        isAgreed,
    } = req.body;

    // ✅ Validate required fields
    if (!fullName?.trim()) return generateResponse(res, 400, false, "Full name is required", null);
    if (!email?.trim()) return generateResponse(res, 400, false, "Email is required", null);
    if (!phone?.trim()) return generateResponse(res, 400, false, "Phone is required", null);

    // ✅ Validate isAgreed — handles boolean and string "true"/"false"
    const agreedValue = isAgreed === true || isAgreed === "true";
    if (!agreedValue) {
        return generateResponse(res, 400, false, "You must agree to the terms and conditions", null);
    }

    // ✅ Validate resumeCV file is provided
    const resumeFile = req.files?.resumeCV?.[0];
    if (!resumeFile) {
        return generateResponse(res, 400, false, "Resume CV is required", null);
    }

    // ✅ Validate file type — PDF, DOCX, TXT, JPG, PNG only
    const allowedMimeTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "image/jpeg",
        "image/png",
    ];
    if (!allowedMimeTypes.includes(resumeFile.mimetype)) {
        return generateResponse(res, 400, false, "Resume CV must be PDF, DOCX, TXT, JPG or PNG", null);
    }

    // ✅ Validate file size — max 20MB
    const maxSize = 20 * 1024 * 1024;
    if (resumeFile.size > maxSize) {
        return generateResponse(res, 400, false, "Resume CV must not exceed 20MB", null);
    }

    // ✅ Upload resume to cloudinary
    const cloudinaryResult = await cloudinaryUpload(
        resumeFile.path,
        `resume-${Date.now()}`,
        "applications"
    );
    if (!cloudinaryResult || !cloudinaryResult.url) {
        return generateResponse(res, 500, false, "Resume upload failed. Please try again", null);
    }

    // ✅ Validate portfolioUrl if provided
    if (portfolioUrl && portfolioUrl.trim() !== "") {
        const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/;
        if (!urlRegex.test(portfolioUrl.trim())) {
            return generateResponse(res, 400, false, "Portfolio URL must be a valid URL", null);
        }
    }

    // ✅ Validate linkedinProfile if provided
    if (linkedinProfile && linkedinProfile.trim() !== "") {
        if (!linkedinProfile.includes("linkedin.com")) {
            return generateResponse(res, 400, false, "LinkedIn profile must be a valid LinkedIn URL", null);
        }
    }

    const created = await applicationService.createApplicationIntoDb({
        fullName,
        email,
        phone,
        resumeCV: cloudinaryResult.url,
        coverLetter: coverLetter || "",
        portfolioUrl: portfolioUrl || "",
        linkedinProfile: linkedinProfile || "",
        isAgreed: agreedValue,
    });

    return generateResponse(res, 201, true, "Application submitted successfully", created);
});

const getAllApplications = catchAsync(async (req, res) => {
    const result = await applicationService.getAllApplicationsFromDb(req.query);
    return generateResponse(res, 200, true, "Applications fetched successfully", result.data, result.meta);
});

const getApplicationById = catchAsync(async (req, res) => {
    if (!req.params.applicationId) {
        return generateResponse(res, 400, false, "Application ID is required", null);
    }

    const application = await applicationService.getApplicationByIdFromDb(req.params.applicationId);
    return generateResponse(res, 200, true, "Application fetched successfully", application);
});

const deleteApplication = catchAsync(async (req, res) => {
    if (!req.params.applicationId) {
        return generateResponse(res, 400, false, "Application ID is required", null);
    }

    await applicationService.deleteApplicationFromDb(req.params.applicationId);
    return generateResponse(res, 200, true, "Application deleted successfully", null);
});

export const applicationController = {
    createApplication,
    getAllApplications,
    getApplicationById,
    deleteApplication,
};