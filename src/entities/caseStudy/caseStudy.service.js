import CaseStudy from './caseStudy.model.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const toTrimmedString = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};

const isNonEmptyString = (val) => toTrimmedString(val).length > 0;

const decodeHtmlEntities = (value) =>
  value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const toPlainText = (val) =>
  decodeHtmlEntities(toTrimmedString(val))
    .replace(/<span[^>]*class=["'][^"']*ql-ui[^"']*["'][^>]*><\/span>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6])>/gi, '\n')
    .replace(/<[^>]*>/g, ' ')
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');

const toStringArray = (val) => {
  if (Array.isArray(val)) {
    return val.map(toTrimmedString).filter((item) => item.length > 0);
  }

  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return parsed.map(toTrimmedString).filter((item) => item.length > 0);
      }
    } catch (_) {
      // Fall through to comma/plain string parsing.
    }

    return val
      .split(',')
      .map(toTrimmedString)
      .filter((item) => item.length > 0);
  }

  return [];
};

const hiddenResponseFields = [
  'technologiesUsed',
  'resultImpact',
  'caseExperience',
  'clientName',
  'companyName',
  'client',
  'duration',
  'teamSize'
];

const richTextFields = ['customer', 'challenge', 'solution', 'benefit'];

export const serializeCaseStudy = (caseStudy) => {
  if (!caseStudy) return caseStudy;

  const payload =
    typeof caseStudy.toObject === 'function'
      ? caseStudy.toObject()
      : { ...caseStudy };

  for (const field of hiddenResponseFields) {
    delete payload[field];
  }

  for (const field of richTextFields) {
    if (payload[field] !== undefined) {
      payload[field] = toPlainText(payload[field]);
    }
  }

  return payload;
};

const parsePagination = (page, limit) => {
  const safePage =
    Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit =
    Number.isFinite(Number(limit)) && Number(limit) > 0
      ? Math.min(Number(limit), 50)
      : 10;

  return { page: safePage, limit: safeLimit };
};

const mapFilePayload = async (file) => {
  if (!file) return undefined;

  const source = Array.isArray(file) ? file[0] : file;
  if (!source) return undefined;

  const uploaded = await cloudinaryUpload(
    source.path,
    `${Date.now()}-${source.filename}`,
    'case-studies'
  );

  if (!uploaded || uploaded === 'file upload failed') {
    const err = new Error('Image upload failed');
    err.code = 'UPLOAD_ERROR';
    throw err;
  }

  return {
    filename: source.filename,
    originalName: source.originalname || source.originalName,
    mimeType: source.mimetype || source.mimeType,
    size: source.size,
    url: uploaded.secure_url || uploaded.url
  };
};

const normalizeCaseStudyPayload = async (
  data,
  { requireBaseFields = false } = {}
) => {
  const updates = {};

  if (data.title !== undefined) {
    if (!isNonEmptyString(data.title)) {
      const err = new Error('title cannot be empty');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    updates.title = toTrimmedString(data.title);
  }

  if (data.description !== undefined) {
    if (!isNonEmptyString(data.description)) {
      const err = new Error('description cannot be empty');
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    updates.description = toTrimmedString(data.description);
  }

  if (requireBaseFields && (!updates.title || !updates.description)) {
    const err = new Error('Title and description are required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  for (const field of ['subtitle', 'client', 'duration', 'teamSize']) {
    if (data[field] !== undefined) {
      updates[field] = toTrimmedString(data[field]);
    }
  }

  for (const field of richTextFields) {
    if (data[field] !== undefined) {
      updates[field] = toPlainText(data[field]);
    }
  }

  if (data.technologiesUsed !== undefined) {
    updates.technologiesUsed = toStringArray(data.technologiesUsed);
  }

  for (const field of [
    'resultImpact',
    'caseExperience',
    'clientName',
    'companyName'
  ]) {
    if (data[field] !== undefined) {
      updates[field] = toTrimmedString(data[field]);
    }
  }

  if (data.image !== undefined) {
    const imagePayload = await mapFilePayload(data.image);
    if (imagePayload) {
      updates.image = imagePayload;
    }
  }

  return updates;
};

export const createCaseStudyService = async (data) => {
  const payload = await normalizeCaseStudyPayload(data, {
    requireBaseFields: true
  });

  const caseStudy = await CaseStudy.create(payload);
  return serializeCaseStudy(caseStudy);
};

export const getCaseStudiesService = async ({
  page = 1,
  limit = 10,
  search
}) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const filter = {};
  if (isNonEmptyString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  const [total, items] = await Promise.all([
    CaseStudy.countDocuments(filter),
    CaseStudy.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
  ]);

  return {
    data: items.map(serializeCaseStudy),
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  };
};

export const getCaseStudyByIdService = async (id) => {
  const caseStudy = await CaseStudy.findById(id);
  return serializeCaseStudy(caseStudy);
};

export const updateCaseStudyService = async (id, data) => {
  const updates = await normalizeCaseStudyPayload(data);

  const updated = await CaseStudy.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );

  if (!updated) return { notFound: true };
  return { caseStudy: serializeCaseStudy(updated) };
};

export const deleteCaseStudyService = async (id) => {
  const result = await CaseStudy.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
