import Faq from './faq.model.js';

const toTrimmedString = (val) => {
  if (val === undefined || val === null) return '';
  return String(val).trim();
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

export const createFaqService = async ({ question, answer }) => {
  const questionStr = toTrimmedString(question);
  const answerStr = toTrimmedString(answer);

  if (!questionStr && !answerStr) {
    const err = new Error('Question or answer is required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  return Faq.create({
    ...(questionStr ? { question: questionStr } : {}),
    ...(answerStr ? { answer: answerStr } : {})
  });
};

export const getFaqsService = async ({ page = 1, limit = 10, search }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);
  const filter = {};

  if (toTrimmedString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { question: { $regex: safeSearch, $options: 'i' } },
      { answer: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  const [total, itemsResult] = await Promise.all([
    Faq.countDocuments(filter),
    Faq.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
  ]);

  return {
    data: itemsResult,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  };
};

export const getFaqByIdService = async (id) => Faq.findById(id);

export const updateFaqService = async (id, data) => {
  const allowed = ['question', 'answer'];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      const trimmed = toTrimmedString(data[field]);
      if (trimmed) {
        updates[field] = trimmed;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    const err = new Error('No valid fields to update');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const updated = await Faq.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  if (!updated) return { notFound: true };
  return { faq: updated };
};

export const deleteFaqService = async (id) => {
  const result = await Faq.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
