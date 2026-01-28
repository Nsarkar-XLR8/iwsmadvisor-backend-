// src/modules/contact/contact.service.js
import Contact, { CONTACT_SERVICE_OPTIONS } from './contact.model.js';

const isNonEmptyString = (val) => typeof val === 'string' && val.trim().length > 0;
const trimIfString = (val) => (typeof val === 'string' ? val.trim() : val);

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

export const createContactService = async ({
  firstName,
  lastName,
  email,
  phone,
  service,
  message,
  file,
}) => {
  if (
    !isNonEmptyString(firstName) ||
    !isNonEmptyString(lastName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(message) ||
    !isNonEmptyString(service)
  ) {
    const err = new Error('First name, last name, email, service, and message are required');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const normalizedService = service.trim();
  if (!CONTACT_SERVICE_OPTIONS.includes(normalizedService)) {
    const err = new Error('Service selection is invalid');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const filePayload = mapFilePayload(file);

  return Contact.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: isNonEmptyString(phone) ? phone.trim() : '',
    service: normalizedService,
    message: message.trim(),
    ...(filePayload ? { file: filePayload } : {}),
  });
};

export const getContactsService = async ({ page = 1, limit = 10, search }) => {
  const { page: safePage, limit: safeLimit } = parsePagination(page, limit);

  const filter = {};
  if (isNonEmptyString(search)) {
    const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { firstName: { $regex: safeSearch, $options: 'i' } },
      { lastName: { $regex: safeSearch, $options: 'i' } },
      { email: { $regex: safeSearch, $options: 'i' } },
      { phone: { $regex: safeSearch, $options: 'i' } },
      { message: { $regex: safeSearch, $options: 'i' } },
      { service: { $regex: safeSearch, $options: 'i' } },
    ];
  }

  const [total, contacts] = await Promise.all([
    Contact.countDocuments(filter),
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit),
  ]);

  return {
    data: contacts,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
};

export const getContactByIdService = async (id) => {
  return Contact.findById(id);
};

export const updateContactService = async (id, data) => {
  const allowed = ['firstName', 'lastName', 'email', 'phone', 'service', 'message', 'file'];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (['firstName', 'lastName', 'email', 'message'].includes(field) && !isNonEmptyString(data[field])) {
        const err = new Error(`${field} cannot be empty`);
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      if (field === 'service') {
        const normalizedService = String(data[field]).trim();
        if (!CONTACT_SERVICE_OPTIONS.includes(normalizedService)) {
          const err = new Error('Service selection is invalid');
          err.code = 'VALIDATION_ERROR';
          throw err;
        }
        updates[field] = normalizedService;
        continue;
      }

      if (field === 'file') {
        const filePayload = mapFilePayload(data[field]);
        if (filePayload) {
          updates[field] = filePayload;
        }
        continue;
      }

      updates[field] = trimIfString(data[field]);
    }
  }

  const updated = await Contact.findByIdAndUpdate(id, { $set: updates }, { new: true });
  if (!updated) return { notFound: true };
  return { contact: updated };
};

export const deleteContactService = async (id) => {
  const result = await Contact.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
