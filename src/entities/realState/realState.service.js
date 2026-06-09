import RealState from './realState.model.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const toTrimmedString = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};
const isNonEmptyString = (val) => toTrimmedString(val).length > 0;

const parseSubtitles = (val) => {
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
      // Fall through to string handling
    }

    const str = toTrimmedString(val);
    return str ? [str] : [];
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
      const title = toTrimmedString(item?.title ?? item?.Title ?? item?.name ?? item?.Name);
      const subtitles = parseSubtitles(item?.subtitles ?? item?.subtitle ?? item?.subTitles ?? item?.items);
      if (!title && subtitles.length === 0) return null;
      return {
        ...(title ? { title } : {}),
        subtitles,
      };
    })
    .filter(Boolean);
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
    url: uploaded.secure_url,
  };
};

export const createRealStateService = async ({ title, subTitle, overview, overviewTitle, keyCapabilities, image, order }) => {
  const titleStr = toTrimmedString(title);
  if (!isNonEmptyString(titleStr)) {
    const err = new Error('Title is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const keyCapabilitiesArr = normalizeKeyCapabilities(keyCapabilities);
  const imagePayload = await mapFilePayload(image);

  return RealState.create({
    title: titleStr,
    subTitle: toTrimmedString(subTitle),
    overview: toTrimmedString(overview),
    overviewTitle: toTrimmedString(overviewTitle),
    keyCapabilities: keyCapabilitiesArr,
    order: order !== undefined ? Number(order) : 0,
    ...(imagePayload ? { image: imagePayload } : {}),
  });
};

export const getRealStatesService = async ({ page = 1, limit = 10, search }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const filter = {};
  if (isNonEmptyString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { overview: { $regex: safeSearch, $options: 'i' } },
      { subtitles: { $elemMatch: { $regex: safeSearch, $options: 'i' } } },
    ];
  }

  const [total, items] = await Promise.all([
    RealState.countDocuments(filter),
    RealState.find(filter)
      .sort({ order: 1, createdAt: -1 })
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

export const getRealStateByIdService = async (id) => {
  return RealState.findById(id);
};

export const updateRealStateService = async (id, data) => {
  const allowed = ['title', 'subTitle', 'overview', 'overviewTitle', 'keyCapabilities', 'image', 'order'];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (field === 'title' && !isNonEmptyString(data[field])) {
        const err = new Error('title cannot be empty');
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      if (field === 'keyCapabilities') {
        updates.keyCapabilities = normalizeKeyCapabilities(data[field]);
        continue;
      }

      if (field === 'image') {
        const imagePayload = await mapFilePayload(data[field]);
        if (imagePayload) {
          updates.image = imagePayload;
        }
        continue;
      }

      if (field === 'order') {
        updates.order = Number(data[field]);
        continue;
      }

      updates[field] = toTrimmedString(data[field]);
    }
  }

  const updated = await RealState.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!updated) return { notFound: true };
  return { realState: updated };
};

export const deleteRealStateService = async (id) => {
  const result = await RealState.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
