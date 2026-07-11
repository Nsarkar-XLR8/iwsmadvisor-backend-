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
      // fall through
    }
    const str = toTrimmedString(val);
    return str ? [str] : [];
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
  'teamSize',
];

export const serializeCaseStudy = (caseStudy) => {
  if (!caseStudy) return caseStudy;
  const payload =
    typeof caseStudy.toObject === 'function'
      ? caseStudy.toObject()
      : { ...caseStudy };

  for (const field of hiddenResponseFields) {
    delete payload[field];
  }

  for (const field of ['customer', 'challenge', 'solution', 'benefit']) {
    if (payload[field] !== undefined) {
      payload[field] = toPlainText(payload[field]);
    }
  }

  return payload;

const toStringArray = (val) => {
  if (Array.isArray(val)) {
    return val.map(toTrimmedString).filter((item) => item.length > 0);
  }

  for (const field of ['customer', 'challenge', 'solution', 'benefit']) {
    if (payload[field] !== undefined) {
      payload[field] = toPlainText(payload[field]);
    }
  }

  return payload;
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
  challenge,
  solution,
  client,
  duration,
  teamSize,
  challenge,
  solution,
  benefit,
  customer,
  client,
  duration,
  teamSize,
  technologiesUsed,
  resultImpact,
  caseExperience,
  clientName,
  companyName,
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

  const caseStudy = await CaseStudy.create({
    title: titleStr,
    description: descriptionStr,
    subtitle: toTrimmedString(subtitle),
    challenge: toPlainText(challenge || ''),
    solution: toPlainText(solution || ''),
    benefit: toPlainText(benefit || ''),
    customer: toPlainText(customer || ''),
    ...(client !== undefined ? { client: toTrimmedString(client) } : {}),
    ...(duration !== undefined ? { duration: toTrimmedString(duration) } : {}),
    ...(teamSize !== undefined ? { teamSize: toTrimmedString(teamSize) } : {}),
    ...(technologies.length > 0 ? { technologiesUsed: technologies } : {}),
    ...(resultImpact !== undefined ? { resultImpact: toTrimmedString(resultImpact) } : {}),
    ...(caseExperience !== undefined ? { caseExperience: toTrimmedString(caseExperience) } : {}),
    ...(clientName !== undefined ? { clientName: toTrimmedString(clientName) } : {}),
    ...(companyName !== undefined ? { companyName: toTrimmedString(companyName) } : {}),
    ...(imagePayload ? { image: imagePayload } : {}),
  });

  return serializeCaseStudy(caseStudy);

  const technologies = toStringArray(technologiesUsed);

  const caseStudy = await CaseStudy.create({
    title: titleStr,
    description: descriptionStr,
    subtitle: toTrimmedString(subtitle),
    challenge: toPlainText(challenge),
    solution: toPlainText(solution),
    benefit: toPlainText(benefit),
    customer: toPlainText(customer),
    ...(imagePayload ? { image: imagePayload } : {}),
  });

  return serializeCaseStudy(caseStudy);
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
    data: items.map(serializeCaseStudy),

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
  const caseStudy = await CaseStudy.findById(id);
  return serializeCaseStudy(caseStudy);
  return CaseStudy.findById(id);
};

export const updateCaseStudyService = async (id, data) => {
  const allowed = [
    'title',
    'description',
    'subtitle',
    'challenge',
    'solution',
    'client',
    'duration',
    'teamSize',
    'challenge',
    'solution',
    'benefit',
    'customer',
    'client',
    'duration',
    'teamSize',
    'technologiesUsed',
    'resultImpact',
    'caseExperience',
    'clientName',
    'companyName',
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

      updates[field] = ['customer', 'challenge', 'solution', 'benefit'].includes(field)
        ? toPlainText(data[field])
        : toTrimmedString(data[field]);
      if (field === 'technologiesUsed') {
        updates[field] = toStringArray(data[field]);
        continue;
      }

      updates[field] = toTrimmedString(data[field]);

    }
  }

  const updated = await CaseStudy.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!updated) return { notFound: true };
  return { caseStudy: serializeCaseStudy(updated) };
  return { caseStudy: updated };
};

export const deleteCaseStudyService = async (id) => {
  const result = await CaseStudy.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
