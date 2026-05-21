import ServicePage from './servicePage.model.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const toTrimmedString = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};

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

const mapFilePayload = async (file) => {
  if (!file) return undefined;
  const source = Array.isArray(file) ? file[0] : file;
  if (!source) return undefined;
  const uploaded = await cloudinaryUpload(
    source.path,
    `${Date.now()}-${source.filename}`,
    'service-pages'
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

const normalizeFaq = (val) => {
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
      const question = toTrimmedString(item?.question ?? item?.Question ?? '');
      const answer = toTrimmedString(item?.answer ?? item?.Answer ?? '');
      if (!question && !answer) return null;
      return {
        ...(question ? { question } : {}),
        ...(answer ? { answer } : {}),
      };
    })
    .filter(Boolean);
};

const parsePagination = (page, limit) => {
  const safePage = Number.isFinite(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const safeLimit = Number.isFinite(Number(limit)) && Number(limit) > 0 ? Math.min(Number(limit), 50) : 10;
  return { page: safePage, limit: safeLimit };
};

export const createServicePageService = async ({
  heading,
  subtitles,
  title,
  guideline,
  description,
  faq,
  image,
  order,
}) => {
  const headingStr = toTrimmedString(heading);
  if (!headingStr) {
    const err = new Error('Heading is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const subtitlesArr = parseSubtitles(subtitles);
  const imagePayload = await mapFilePayload(image);
  const faqArr = normalizeFaq(faq);
  const orderNum = Number.isFinite(Number(order)) ? Number(order) : 0;

  return ServicePage.create({
    heading: headingStr,
    subtitles: subtitlesArr,
    title: toTrimmedString(title),
    guideline: toTrimmedString(guideline),
    description: toTrimmedString(description),
    ...(imagePayload ? { image: imagePayload } : {}),
    faq: faqArr,
    order: orderNum,
  });
};

export const getServicePagesService = async ({ page = 1, limit = 10, search }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);
  const filter = {};
  if (toTrimmedString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { heading: { $regex: safeSearch, $options: 'i' } },
      { title: { $regex: safeSearch, $options: 'i' } },
      { guideline: { $regex: safeSearch, $options: 'i' } },
      { subtitles: { $elemMatch: { $regex: safeSearch, $options: 'i' } } },
    ];
  }

  const [total, items] = await Promise.all([
    ServicePage.countDocuments(filter),
    ServicePage.find(filter)
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

export const getServicePageByIdService = async (id) => ServicePage.findById(id);

export const updateServicePageService = async (id, data) => {
  const allowed = ['heading', 'subtitles', 'title', 'guideline', 'description', 'faq', 'image', 'order'];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (field === 'heading' && !toTrimmedString(data[field])) {
        const err = new Error('heading cannot be empty');
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      if (field === 'subtitles') {
        updates.subtitles = parseSubtitles(data[field]);
        continue;
      }

      if (field === 'faq') {
        updates.faq = normalizeFaq(data[field]);
        continue;
      }

      if (field === 'image') {
        const imagePayload = await mapFilePayload(data[field]);
        if (imagePayload) updates.image = imagePayload;
        continue;
      }

      if (field === 'order') {
        updates.order = Number.isFinite(Number(data.order)) ? Number(data.order) : 0;
        continue;
      }

      updates[field] = toTrimmedString(data[field]);
    }
  }

  const updated = await ServicePage.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!updated) return { notFound: true };
  return { servicePage: updated };
};

export const deleteServicePageService = async (id) => {
  const result = await ServicePage.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
