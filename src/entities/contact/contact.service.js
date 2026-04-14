// src/modules/contact/contact.service.js
import Contact from './contact.model.js';
import ServicePage from '../servicePage/servicePage.model.js';
import { ServicePageTitle } from '../CMS/servicePageTitle/servicePageTitle.model.js';
import sendEmail from '../../lib/sendEmail.js';
import { adminMail, emailTo } from '../../core/config/config.js';
import { cloudinaryUpload } from '../../lib/cloudinaryUpload.js';

const isNonEmptyString = (val) =>
  typeof val === 'string' && val.trim().length > 0;
const trimIfString = (val) => (typeof val === 'string' ? val.trim() : val);

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

  try {
    const uploaded = await cloudinaryUpload(
      source.path,
      `${Date.now()}-${source.filename}`,
      'contacts'
    );
    if (!uploaded || uploaded === 'file upload failed') {
      const err = new Error('File upload failed');
      err.code = 'UPLOAD_ERROR';
      throw err;
    }
    return {
      filename: source.filename,
      originalName: source.originalname || source.originalName,
      mimeType: source.mimetype || source.mimeType,
      size: source.size,
      url: uploaded.secure_url
    };
  } catch (err) {
    console.error('Contact file upload failed:', err);
    throw err;
  }
};

const getServiceOptions = async () => {
  const pageTitles = await ServicePage.distinct('title', {
    title: { $exists: true, $ne: '' }
  });
  const configTitles = await ServicePageTitle.distinct('title', {
    title: { $exists: true, $ne: '' }
  });
  const allTitles = [...pageTitles, ...configTitles]
    .map((t) => String(t).trim())
    .filter((t) => t.length > 0);
  return Array.from(new Set(allTitles));
};

const notifyAdmin = async (contact) => {
  const to = adminMail || emailTo;
  if (!to) return;

  const subject = `New Contact Message from ${contact.firstName} ${contact.lastName}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>New Contact Submission</h2>
      <p><strong>Name:</strong> ${contact.firstName} ${contact.lastName}</p>
      <p><strong>Email:</strong> ${contact.email}</p>
      <p><strong>Phone:</strong> ${contact.phone || 'N/A'}</p>
      <p><strong>Service:</strong> ${contact.service}</p>
      <p><strong>Message:</strong><br/>${contact.message}</p>
    </div>
  `;

  try {
    const attachments = [];
    if (contact.file?.url) {
      attachments.push({
        filename: contact.file.originalName || contact.file.filename || 'file',
        path: contact.file.url
      });
    }
    await sendEmail({ to, subject, html, attachments });
  } catch (err) {
    console.error('Admin notification email failed:', err);
  }
};

export const createContactService = async ({
  firstName,
  lastName,
  email,
  phone,
  service,
  message,
  file
}) => {
  if (
    !isNonEmptyString(firstName) ||
    !isNonEmptyString(lastName) ||
    !isNonEmptyString(email) ||
    !isNonEmptyString(message) ||
    !isNonEmptyString(service)
  ) {
    const err = new Error(
      'First name, last name, email, service, and message are required'
    );
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const normalizedService = service.trim();
  const validServices = await getServiceOptions();
  if (validServices.length > 0 && !validServices.includes(normalizedService)) {
    const err = new Error('Service selection is invalid');
    err.code = 'VALIDATION_ERROR';
    throw err;
  }

  const filePayload = await mapFilePayload(file);

  const created = await Contact.create({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    email: email.trim(),
    phone: isNonEmptyString(phone) ? phone.trim() : '',
    service: normalizedService,
    message: message.trim(),
    ...(filePayload ? { file: filePayload } : {})
  });

  notifyAdmin(created).catch((err) =>
    console.error('Async admin notify error:', err)
  );

  return created;
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
      { service: { $regex: safeSearch, $options: 'i' } }
    ];
  }

  const [total, contacts] = await Promise.all([
    Contact.countDocuments(filter),
    Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip((safePage - 1) * safeLimit)
      .limit(safeLimit)
  ]);

  return {
    data: contacts,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1
    }
  };
};

export const getContactByIdService = async (id) => {
  return Contact.findById(id);
};

export const updateContactService = async (id, data) => {
  const allowed = [
    'firstName',
    'lastName',
    'email',
    'phone',
    'service',
    'message',
    'file'
  ];
  const updates = {};

  for (const field of allowed) {
    if (data[field] !== undefined) {
      if (
        ['firstName', 'lastName', 'email', 'message'].includes(field) &&
        !isNonEmptyString(data[field])
      ) {
        const err = new Error(`${field} cannot be empty`);
        err.code = 'VALIDATION_ERROR';
        throw err;
      }

      if (field === 'service') {
        const normalizedService = String(data[field]).trim();
        const validServices = await getServiceOptions();
        if (
          validServices.length > 0 &&
          !validServices.includes(normalizedService)
        ) {
          const err = new Error('Service selection is invalid');
          err.code = 'VALIDATION_ERROR';
          throw err;
        }
        updates[field] = normalizedService;
        continue;
      }

      if (field === 'file') {
        const filePayload = await mapFilePayload(data[field]);
        if (filePayload) {
          updates[field] = filePayload;
        }
        continue;
      }

      updates[field] = trimIfString(data[field]);
    }
  }

  const updated = await Contact.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true }
  );
  if (!updated) return { notFound: true };
  return { contact: updated };
};

export const deleteContactService = async (id) => {
  const result = await Contact.findByIdAndDelete(id);
  if (!result) return { notFound: true };
  return { deleted: true };
};
