import { Application } from "./application.model.js";
import { AppError } from "../../errors/AppError.js";
import { HttpStatusCode } from "../../lib/httpStatus.js";

const createApplicationIntoDb = async (payload) => {
    // ✅ Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(payload.email)) {
        throw new AppError("Invalid email format", HttpStatusCode.BadRequest);
    }

    // ✅ Block disposable/fake email domains
    const blockedDomains = [
        "mailinator.com",
        "tempmail.com",
        "guerrillamail.com",
        "throwaway.email",
        "fakeinbox.com",
        "trashmail.com",
        "yopmail.com",
        "sharklasers.com",
        "spam4.me",
        "dispostable.com",
    ];
    const emailDomain = payload.email.split("@")[1]?.toLowerCase();
    if (blockedDomains.includes(emailDomain)) {
        throw new AppError("Disposable email addresses are not allowed", HttpStatusCode.BadRequest);
    }

    // ✅ Validate isAgreed must be true
    if (!payload.isAgreed || payload.isAgreed === "false" || payload.isAgreed === false) {
        throw new AppError("You must agree to the terms and conditions", HttpStatusCode.BadRequest);
    }

    // ✅ Validate portfolioUrl format if provided
    if (payload.portfolioUrl && payload.portfolioUrl.trim() !== "") {
        const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/;
        if (!urlRegex.test(payload.portfolioUrl.trim())) {
            throw new AppError("Portfolio URL must be a valid URL", HttpStatusCode.BadRequest);
        }
    }

    // ✅ Validate linkedinProfile format if provided
    if (payload.linkedinProfile && payload.linkedinProfile.trim() !== "") {
        if (!payload.linkedinProfile.includes("linkedin.com")) {
            throw new AppError("LinkedIn profile must be a valid LinkedIn URL", HttpStatusCode.BadRequest);
        }
    }

    // ✅ Validate resumeCV is provided
    if (!payload.resumeCV) {
        throw new AppError("Resume CV is required", HttpStatusCode.BadRequest);
    }

    // ✅ Sanitize all fields
    const sanitized = {
        fullName: payload.fullName.trim(),
        email: payload.email.trim().toLowerCase(),
        phone: payload.phone.trim(),
        resumeCV: payload.resumeCV,
        coverLetter: payload.coverLetter?.trim() || "",
        portfolioUrl: payload.portfolioUrl?.trim() || "",
        linkedinProfile: payload.linkedinProfile?.trim() || "",
        isAgreed: true,
    };

    const application = await Application.create(sanitized);
    return application;
};

const getAllApplicationsFromDb = async (query) => {
    const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
    } = query;

    const ALLOWED_SORT_FIELDS = ["createdAt", "updatedAt", "fullName", "email"];
    const safePage = Math.max(1, Number(page));
    const safeLimit = Math.min(Math.max(1, Number(limit)), 100);
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? 1 : -1;

    if (isNaN(safePage) || isNaN(safeLimit)) {
        throw new AppError("Invalid pagination parameters", HttpStatusCode.BadRequest);
    }

    const sort = { [safeSortBy]: safeSortOrder };
    const skip = (safePage - 1) * safeLimit;

    const [totalDocs, applications] = await Promise.all([
        Application.countDocuments(),
        Application.find().sort(sort).skip(skip).limit(safeLimit).lean(),
    ]);

    const totalPages = Math.ceil(totalDocs / safeLimit);

    return {
        data: applications,
        meta: {
            totalDocs,
            totalPages,
            currentPage: safePage,
            limit: safeLimit,
            hasNextPage: safePage < totalPages,
            hasPrevPage: safePage > 1,
        },
    };
};

const getApplicationByIdFromDb = async (id) => {
    if (!id) throw new AppError("Application ID is required", HttpStatusCode.BadRequest);

    const application = await Application.findById(id).lean();
    if (!application) throw new AppError("Application not found", HttpStatusCode.NotFound);
    return application;
};

const deleteApplicationFromDb = async (id) => {
    if (!id) throw new AppError("Application ID is required", HttpStatusCode.BadRequest);

    const deleted = await Application.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Application not found", HttpStatusCode.NotFound);
    return deleted;
};

export const applicationService = {
    createApplicationIntoDb,
    getAllApplicationsFromDb,
    getApplicationByIdFromDb,
    deleteApplicationFromDb,
};