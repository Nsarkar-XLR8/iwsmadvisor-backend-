import RealState from './realState.model.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const toTrimmedString = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};

const isNonEmptyString = (val) => toTrimmedString(val).length > 0;

const parseStringArray = (val) => {
  if (val === undefined || val === null) return [];

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

  const fallback = toTrimmedString(val);
  return fallback ? [fallback] : [];
};

const normalizeKeyCapabilities = (val) => {
  let items = [];

  if (Array.isArray(val)) {
    items = val;
  } else if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        items = parsed;
      } else if (parsed && typeof parsed === 'object') {
        items = [parsed];
      }
    } catch (_) {
      items = [];
    }
  } else if (val && typeof val === 'object') {
    items = [val];
  }

  return items
    .map((item) => {
      const title = toTrimmedString(
        item?.title ?? item?.Title ?? item?.name ?? item?.Name
      );
      const subtitles = parseStringArray(
        item?.subtitles ?? item?.subtitle ?? item?.subTitles ?? item?.items
      );
      if (!title && subtitles.length === 0) return null;
      return {
        ...(title ? { title } : {}),
        subtitles
      };
    })
    .filter(Boolean);
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
    'real-state'
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

const normalizeRealStatePayload = async (
  data,
  { requireTitle = false } = {}
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

  if (requireTitle && !updates.title) {
    const err = new Error('Title is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  for (const field of ['subTitle', 'overview', 'overviewTitle']) {
    if (data[field] !== undefined) {
      updates[field] = toTrimmedString(data[field]);
    }
  }

  if (data.subtitles !== undefined) {
    updates.subtitles = parseStringArray(data.subtitles);
  }

  if (data.keyCapabilities !== undefined) {
    updates.keyCapabilities = normalizeKeyCapabilities(data.keyCapabilities);
  }

  if (data.order !== undefined) {
    updates.order = Number(data.order);
  }

  if (data.image !== undefined) {
    const imagePayload = await mapFilePayload(data.image);
    if (imagePayload) {
      updates.image = imagePayload;
    }
  }

  return updates;
};

export const createRealStateService = async (data) => {
  const payload = await normalizeRealStatePayload(data, { requireTitle: true });
  return RealState.create(payload);
};

export const getRealStatesService = async ({
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
      { overview: { $regex: safeSearch, $options: 'i' } },
      { subtitles: { $elemMatch: { $regex: safeSearch, $options: 'i' } } }
    ];
  }

  const [total, items] = await Promise.all([
    RealState.countDocuments(filter),
    RealState.find(filter)
      .sort({ order: 1, createdAt: -1 })
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

export const getRealStateByIdService = async (id) => {
  return RealState.findById(id);
};

export const updateRealStateService = async (id, data) => {
  const updates = await normalizeRealStatePayload(data);

  const updated = await RealState.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );

  if (!updated) return { notFound: true };
  return { realState: updated };
};

export const deleteRealStateService = async (id) => {
  const result = await RealState.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
