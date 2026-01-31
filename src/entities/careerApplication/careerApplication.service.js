import mongoose from 'mongoose';
import Career from '../career/career.model.js';
import CareerApplication from './careerApplication.model.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const ALLOWED_STATUSES = ['pending', 'shortlisted', 'rejected'];

const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;
const mapFilePayload = async (file) => {
  if (!file) return undefined;
  const source = Array.isArray(file) ? file[0] : file;
  if (!source) return undefined;
  const uploaded = await cloudinaryUpload(
    source.path,
    `${Date.now()}-${source.filename}`,
    'career-applications'
  );
  if (!uploaded || uploaded === 'file upload failed') {
    const err = new Error('Resume upload failed');
    err.code = 'UPLOAD_ERROR';
    throw err;
  }
  return {
    filename: source.filename,
    originalName: source.originalname || source.originalName,
    mimeType: source.mimetype || source.mimeType,
    size: source.size,
    url: uploaded.secure_url,
  };
};

const parsePagination = (page, limit) => {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 50) : 10;
  return { page: safePage, limit: safeLimit };
};

export const createCareerApplicationService = async ({
  careerId,
  userId,
  name,
  email,
  phone,
  resumeFile,
  resumeLink,
  portfolioLink,
  coverLetter,
  notes,
}) => {
  if (!mongoose.Types.ObjectId.isValid(careerId)) {
    const err = new Error('Invalid career id');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  if (!isNonEmptyString(name) || !isNonEmptyString(email)) {
    const err = new Error('Name and email are required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const careerExists = await Career.exists({ _id: careerId });
  if (!careerExists) {
    const err = new Error('Career not found');
    err.code = 'NOT_FOUND';
    throw err;
  }

  const filePayload = await mapFilePayload(resumeFile);

  return CareerApplication.create({
    careerId,
    ...(userId ? { userId } : {}),
    name: name.trim(),
    email: email.trim(),
    phone: isNonEmptyString(phone) ? phone.trim() : '',
    resumeFile: filePayload,
    resumeLink: isNonEmptyString(resumeLink) ? resumeLink.trim() : '',
    portfolioLink: isNonEmptyString(portfolioLink) ? portfolioLink.trim() : '',
    coverLetter: isNonEmptyString(coverLetter) ? coverLetter.trim() : '',
    notes: isNonEmptyString(notes) ? notes.trim() : '',
    status: 'pending',
  });
};

export const getCareerApplicationsService = async ({ page = 1, limit = 10, careerId, userId, search, adminView = false }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const filter = {};
  if (careerId && mongoose.Types.ObjectId.isValid(careerId)) {
    filter.careerId = careerId;
  }
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    filter.userId = userId;
  }

  if (isNonEmptyString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { name: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { phone: { $regex: safeSearch, $options: 'i' } },
      { notes: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const populateFields = [{ path: 'careerId' }];
  if (adminView) {
    populateFields.push({ path: 'userId', select: '-password -__v' });
  }

  const [total, items] = await Promise.all([
    CareerApplication.countDocuments(filter),
    CareerApplication.find(filter)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
  ]);

  return {
    data: items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
};

export const getCareerApplicationByIdService = async (id, { adminView = false } = {}) => {
  const populateFields = [{ path: 'careerId' }];
  if (adminView) {
    populateFields.push({ path: 'userId', select: '-password -__v' });
  }
  return CareerApplication.findById(id).populate(populateFields);
};

export const deleteCareerApplicationService = async (id) => {
  const result = await CareerApplication.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};

export const updateCareerApplicationService = async (id, { status, notes, resumeLink, portfolioLink, coverLetter }) => {
  const updates = {};

  if (status !== undefined) {
    const nextStatus = isNonEmptyString(status) ? status.trim().toLowerCase() : 'pending';
    if (!ALLOWED_STATUSES.includes(nextStatus)) {
      const err = new Error('Invalid status value');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    updates.status = nextStatus;
  }

  if (notes !== undefined) {
    updates.notes = isNonEmptyString(notes) ? notes.trim() : '';
  }

  if (resumeLink !== undefined) {
    updates.resumeLink = isNonEmptyString(resumeLink) ? resumeLink.trim() : '';
  }

  if (portfolioLink !== undefined) {
    updates.portfolioLink = isNonEmptyString(portfolioLink) ? portfolioLink.trim() : '';
  }

  if (coverLetter !== undefined) {
    updates.coverLetter = isNonEmptyString(coverLetter) ? coverLetter.trim() : '';
  }

  const updated = await CareerApplication.findByIdAndUpdate(
    id,
    updates,
    { new: true }
  );
  if (!updated) {
    return { notFound: true };
  }
  return { updated };
};
