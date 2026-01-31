import Faq from './faq.model.js';

const toTrimmedString = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
};

const normalizeItems = (val) => {
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

export const createFaqService = async ({ title, subtitle, items }) => {
  const titleStr = toTrimmedString(title);
  if (!titleStr) {
    const err = new Error('Title is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const faqItems = normalizeItems(items);

  return Faq.create({
    title: titleStr,
    subtitle: toTrimmedString(subtitle),
    items: faqItems,
  });
};

export const getFaqsService = async ({ page = 1, limit = 10, search }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);
  const filter = {};

  if (toTrimmedString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { title: { $regex: safeSearch, $options: 'i' } },
      { subtitle: { $regex: safeSearch, $options: 'i' } },
      { 'items.question': { $regex: safeSearch, $options: 'i' } },
      { 'items.answer': { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [total, itemsResult] = await Promise.all([
    Faq.countDocuments(filter),
    Faq.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
  ]);

  return {
    data: itemsResult,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
};

export const getFaqByIdService = async (id) => Faq.findById(id);

export const updateFaqService = async (id, data) => {
  const allowed = ['title', 'subtitle', 'items'];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (field === 'title') {
        const t = toTrimmedString(data[field]);
        if (!t) {
          const err = new Error('title cannot be empty');
          err.code = 'VALIDATION_ERROR';
          throw err;
        }
        updates.title = t;
        continue;
      }

      if (field === 'subtitle') {
        updates.subtitle = toTrimmedString(data[field]);
        continue;
      }

      if (field === 'items') {
        updates.items = normalizeItems(data[field]);
        continue;
      }
    }
  }

  const updated = await Faq.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!updated) return { notFound: true };
  return { faq: updated };
};

export const deleteFaqService = async (id) => {
  const result = await Faq.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
