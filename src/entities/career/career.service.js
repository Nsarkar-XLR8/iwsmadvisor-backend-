import Career, { CAREER_TYPE_OPTIONS } from './career.model.js';

const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;

const parsePagination = (page, limit) => {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 50) : 10;
  return { page: safePage, limit: safeLimit };
};

export const createCareerService = async ({ title, department, location, type }) => {
  if (!isNonEmptyString(title) || !isNonEmptyString(department) || !isNonEmptyString(location)) {
    const err = new Error('Title, department, and location are required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const normalizedType = isNonEmptyString(type) ? type.trim() : '';
  if (!CAREER_TYPE_OPTIONS.includes(normalizedType)) {
    const err = new Error(`Type must be one of: ${CAREER_TYPE_OPTIONS.join(', ')}`);
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  return Career.create({
    title: title.trim(),
    department: department.trim(),
    location: location.trim(),
    type: normalizedType,
  });
};

export const getCareersService = async ({ page = 1, limit = 10, search, type }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const filter = {};

  if (isNonEmptyString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { department: { $regex: safeSearch, $options: 'i' } },
      { location: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  if (isNonEmptyString(type)) {
    const normalizedType = type.trim();
    if (CAREER_TYPE_OPTIONS.includes(normalizedType)) {
      filter.type = normalizedType;
    }
  }

  const [total, items] = await Promise.all([
    Career.countDocuments(filter),
    Career.find(filter)
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

export const getCareerByIdService = async (id) => {
  return Career.findById(id);
};

export const updateCareerService = async (id, data) => {
  const allowed = ['title', 'department', 'location', 'type'];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (['title', 'department', 'location'].includes(field)) {
        if (!isNonEmptyString(data[field])) {
          const err = new Error(`${field} cannot be empty`);
          err.code = 'VALIDATION_ERROR';
          throw err;
        }
        updates[field] = data[field].trim();
        continue;
      }

      if (field === 'type') {
        const normalizedType = isNonEmptyString(data[field]) ? data[field].trim() : '';
        if (!CAREER_TYPE_OPTIONS.includes(normalizedType)) {
          const err = new Error(`Type must be one of: ${CAREER_TYPE_OPTIONS.join(', ')}`);
          err.code = 'VALIDATION_ERROR';
          throw err;
        }
        updates.type = normalizedType;
      }
    }
  }

  const updated = await Career.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!updated) return { notFound: true };
  return { career: updated };
};

export const deleteCareerService = async (id) => {
  const result = await Career.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
