import Career, { CAREER_TYPE_OPTIONS } from './career.model.js';

const isNonEmptyString = (val) =>
  typeof val === 'string' && val.trim().length > 0;
const normalizeCareerType = (val) =>
  isNonEmptyString(val) ? val.trim().toLowerCase() : '';

const parseBooleanInput = (value, fieldName) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }

  const err = new Error(`${fieldName} must be true or false`);
  err.code = 'VALIDATION_ERROR';
  throw err;
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

const requiredStringFields = new Set([
  'title',
  'role',
  'department',
  'location'
]);
const textFields = new Set(['description', 'requirements', 'responsibilities']);
const booleanFields = new Set(['isActive', 'multiplePosition']);

const validateCareerType = (value) => {
  const normalizedType = normalizeCareerType(value);
  if (!CAREER_TYPE_OPTIONS.includes(normalizedType)) {
    const err = new Error(
      `Type must be one of: ${CAREER_TYPE_OPTIONS.join(', ')}`
    );
    err.code = 'VALIDATION_ERROR';
    throw err;
  }
  return normalizedType;
};

const buildCareerUpdateValue = (field, value) => {
  if (requiredStringFields.has(field)) {
    if (!isNonEmptyString(value)) {
      const err = new Error(`${field} cannot be empty`);
      err.code = 'VALIDATION_ERROR';
      throw err;
    }
    return value.trim();
  }

  if (field === 'type') return validateCareerType(value);
  if (booleanFields.has(field)) return parseBooleanInput(value, field);
  if (textFields.has(field)) return isNonEmptyString(value) ? value.trim() : '';

  return value;
};

export const createCareerService = async ({
  title,
  role,
  department,
  location,
  type,
  description,
  requirements,
  responsibilities,
  isActive,
  multiplePosition
}) => {
  if (
    !isNonEmptyString(title) ||
    !isNonEmptyString(role) ||
    !isNonEmptyString(department) ||
    !isNonEmptyString(location)
  ) {
    const err = new Error('Title, role, department, and location are required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const normalizedType = validateCareerType(type);

  const normalizedIsActive =
    isActive === undefined ? true : parseBooleanInput(isActive, 'isActive');
  const normalizedMultiplePosition =
    multiplePosition === undefined
      ? false
      : parseBooleanInput(multiplePosition, 'multiplePosition');

  return Career.create({
    title: title.trim(),
    role: role.trim(),
    department: department.trim(),
    location: location.trim(),
    type: normalizedType,
    description: isNonEmptyString(description) ? description.trim() : '',
    requirements: isNonEmptyString(requirements) ? requirements.trim() : '',
    responsibilities: isNonEmptyString(responsibilities)
      ? responsibilities.trim()
      : '',
    isActive: normalizedIsActive,
    multiplePosition: normalizedMultiplePosition
  });
};

export const getCareersService = async ({
  page = 1,
  limit = 10,
  search,
  type,
  isActive,
  multiplePosition
}) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const filter = {};

  if (isNonEmptyString(search)) {
    const safeSearch = search
      .trim()
      .replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { department: { $regex: safeSearch, $options: 'i' } },
      { location: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  if (isNonEmptyString(type)) {
    const normalizedType = normalizeCareerType(type);
    if (CAREER_TYPE_OPTIONS.includes(normalizedType)) {
      filter.type = normalizedType;
    }
  }

  if (isActive !== undefined) {
    filter.isActive = parseBooleanInput(isActive, 'isActive');
  }

  if (multiplePosition !== undefined) {
    filter.multiplePosition = parseBooleanInput(
      multiplePosition,
      'multiplePosition'
    );
  }

  const [total, items] = await Promise.all([
    Career.countDocuments(filter),
    Career.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
  ]);

  return {
    data: items,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  };
};

export const getCareerByIdService = async (id) => {
  return Career.findById(id);
};

export const updateCareerService = async (id, data) => {
  const allowed = [
    'title',
    'role',
    'department',
    'location',
    'type',
    'description',
    'requirements',
    'responsibilities',
    'isActive',
    'multiplePosition'
  ];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      updates[field] = buildCareerUpdateValue(field, data[field]);
    }
  }

  const updated = await Career.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  if (!updated) return { notFound: true };
  return { career: updated };
};

export const deleteCareerService = async (id) => {
  const result = await Career.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
