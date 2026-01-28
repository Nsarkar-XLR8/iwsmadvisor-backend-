import CaseStudy from './caseStudy.model.js';

const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;

const parsePagination = (page, limit) => {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 50) : 10;
  return { page: safePage, limit: safeLimit };
};

const mapFilePayload = (file) => {
  if (!file) return undefined;
  const source = Array.isArray(file) ? file[0] : file;
  if (!source) return undefined;
  return {
    filename: source.filename,
    originalName: source.originalname || source.originalName,
    mimeType: source.mimetype || source.mimeType,
    size: source.size,
    path: source.path,
  };
};

export const createCaseStudyService = async ({ title, description, image }) => {
  if (!isNonEmptyString(title) || !isNonEmptyString(description)) {
    const err = new Error('Title and description are required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const imagePayload = mapFilePayload(image);

  return CaseStudy.create({
    title: title.trim(),
    description: description.trim(),
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
  const allowed = ['title', 'description', 'image'];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (['title', 'description'].includes(field) && !isNonEmptyString(data[field])) {
        const err = new Error(`${field} cannot be empty`);
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      if (field === 'image') {
        const imagePayload = mapFilePayload(data[field]);
        if (imagePayload) {
          updates[field] = imagePayload;
        }
        continue;
      }

      updates[field] = data[field].trim();
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
