import CaseStudy from './caseStudy.model.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const toTrimmedString = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};
const isNonEmptyString = (val) => toTrimmedString(val).length > 0;
const toStringArray = (val) => {
  if (Array.isArray(val)) {
    return val.map(toTrimmedString).filter((item) => item.length > 0);
  }
  const str = toTrimmedString(val);
  if (!str) return [];
  return str
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const parsePagination = (page, limit) => {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 50) : 10;
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
    url: uploaded.secure_url,
  };
};

export const createCaseStudyService = async ({
  title,
  description,
  subtitle,
  client,
  duration,
  teamSize,
  challenge,
  solution,
  technologiesUsed,
  resultImpact,
  caseExperience,
  clientName,
  companyName,
  benefit,
  customer,
  image,
}) => {
  const titleStr = toTrimmedString(title);
  const descriptionStr = toTrimmedString(description);

  if (!isNonEmptyString(titleStr) || !isNonEmptyString(descriptionStr)) {
    const err = new Error('Title and description are required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const imagePayload = await mapFilePayload(image);
  const technologies = toStringArray(technologiesUsed);

  return CaseStudy.create({
    title: titleStr,
    description: descriptionStr,
    subtitle: toTrimmedString(subtitle),
    client: toTrimmedString(client),
    duration: toTrimmedString(duration),
    teamSize: toTrimmedString(teamSize),
    challenge: toTrimmedString(challenge),
    solution: toTrimmedString(solution),
    technologiesUsed: technologies,
    resultImpact: toTrimmedString(resultImpact),
    caseExperience: toTrimmedString(caseExperience),
    clientName: toTrimmedString(clientName),
    companyName: toTrimmedString(companyName),
    benefit: toTrimmedString(benefit),
    customer: toTrimmedString(customer),
    ...(imagePayload ? { image: imagePayload } : {}),
  });
};

export const getCaseStudiesService = async ({ page = 1, limit = 10, search }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const filter = {};
  if (isNonEmptyString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { description: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [total, items] = await Promise.all([
    CaseStudy.countDocuments(filter),
    CaseStudy.find(filter)
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

export const getCaseStudyByIdService = async (id) => {
  return CaseStudy.findById(id);
};

export const updateCaseStudyService = async (id, data) => {
  const allowed = [
    'title',
    'description',
    'subtitle',
    'client',
    'duration',
    'teamSize',
    'challenge',
    'solution',
    'technologiesUsed',
    'resultImpact',
    'caseExperience',
    'clientName',
    'companyName',
    'benefit',
    'customer',
    'image',
  ];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (['title', 'description'].includes(field) && !isNonEmptyString(data[field])) {
        const err = new Error(`${field} cannot be empty`);
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      if (field === 'image') {
        const imagePayload = await mapFilePayload(data[field]);
        if (imagePayload) {
          updates[field] = imagePayload;
        }
        continue;
      }

      if (field === 'technologiesUsed') {
        updates[field] = toStringArray(data[field]);
        continue;
      }

      updates[field] = toTrimmedString(data[field]);
    }
  }

  const updated = await CaseStudy.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!updated) return { notFound: true };
  return { caseStudy: updated };
};

export const deleteCaseStudyService = async (id) => {
  const result = await CaseStudy.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
