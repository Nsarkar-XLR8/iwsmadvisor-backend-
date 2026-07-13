import dotenv from 'dotenv';
dotenv.config();

// Server config
export const port = process.env.PORT || 5000;
export const mongoURI = process.env.MONGO_URI;
export const env = process.env.NODE_ENV || 'development';

// JWT config
export const jwtSecret = process.env.JWT_SECRET;
export const jwtExpire = process.env.JWT_EXPIRE || '1h';
export const accessTokenSecrete = process.env.ACCESS_TOKEN_SECRET;
export const accessTokenExpires = process.env.ACCESS_TOKEN_EXPIRES || '7d';
export const refreshTokenExpires = process.env.REFRESH_TOKEN_EXPIRES || '10d';
export const refreshTokenSecrete = process.env.REFRESH_TOKEN_SECRET;
export const salt = process.env.SALT;

// EMAIL config
export const emailExpires = Number.parseInt(
  process.env.EMAIL_EXPIRES || 15 * 60 * 1000
);
export const emailFrom = process.env.EMAIL_FROM;
export const adminMail = process.env.ADMIN_EMAIL;
export const emailTo = process.env.EMAIL_TO;
export const contactEmail =
  process.env.CONTACT_EMAIL || process.env.EMAIL_TO || process.env.EMAIL_FROM;
export const careersEmail =
  process.env.CAREERS_EMAIL ||
  process.env.ADMIN_EMAIL ||
  process.env.EMAIL_FROM;

// SMTP fallback. Microsoft Graph is used when its config is complete; SMTP is
// available as a backup for deployments that use a traditional mail provider.
export const smtpHost = process.env.SMTP_HOST;
export const smtpPort = Number.parseInt(process.env.SMTP_PORT || '587', 10);
export const smtpUser = process.env.SMTP_USER;
export const smtpPass = process.env.SMTP_PASS;
export const smtpSecure = process.env.SMTP_SECURE === 'true';

// Microsoft Graph (OAuth2 client_credentials) — env var names match .env exactly
export const msGraphTenantId = process.env.MS_TENANT_ID;
export const msGraphClientId = process.env.MS_CLIENT_ID;
export const msGraphClientSecret = process.env.MS_CLIENT_SECRET;
// Sender email: use the dedicated MS_GRAPH_SENDER_EMAIL if set, otherwise fall back to EMAIL_FROM
export const msGraphSenderEmail =
  process.env.MS_GRAPH_SENDER_EMAIL || process.env.EMAIL_FROM;

// Cloudinary config
export const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
export const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

// Public URLs
export const publicCareersBaseUrl =
  process.env.PUBLIC_CAREERS_BASE_URL ||
  'https://test.iwmsadvisors.com/careers';
