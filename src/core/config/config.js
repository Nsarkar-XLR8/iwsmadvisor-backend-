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

// Email config
export const emailExpires = Number.parseInt(
  process.env.EMAIL_EXPIRES || 15 * 60 * 1000,
  10
);
export const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_ADDRESS;
export const adminMail = process.env.ADMIN_EMAIL;
export const emailTo = process.env.EMAIL_TO;
export const contactEmail = process.env.CONTACT_EMAIL;
export const careersEmail = process.env.CAREERS_EMAIL;
export const subscriptionNotificationEmail =
  process.env.SUBSCRIPTION_NOTIFICATION_EMAIL ||
  process.env.CONTACT_EMAIL;

// Microsoft Graph. Supports both the existing MS_* names and MS_GRAPH_* names.
export const msGraphTenantId =
  process.env.MS_TENANT_ID || process.env.MS_GRAPH_TENANT_ID;
export const msGraphClientId =
  process.env.MS_CLIENT_ID || process.env.MS_GRAPH_CLIENT_ID;
export const msGraphClientSecret =
  process.env.MS_CLIENT_SECRET || process.env.MS_GRAPH_CLIENT_SECRET;
export const msGraphSenderEmail =
  process.env.MS_GRAPH_SENDER_EMAIL || emailFrom;

// SMTP fallback. Supports both the existing EMAIL_* names and SMTP_* names.
export const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
export const smtpPort = Number.parseInt(
  process.env.SMTP_PORT || process.env.EMAIL_PORT || '587',
  10
);
export const smtpUser = process.env.SMTP_USER || process.env.EMAIL_ADDRESS;
export const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
export const smtpSecure =
  process.env.SMTP_SECURE === 'true' || process.env.EMAIL_SECURE === 'true';

// Cloudinary config
export const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME;
export const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
export const cloudinarySecret = process.env.CLOUDINARY_API_SECRET;

// Public URLs
export const publicCareersBaseUrl =
  process.env.PUBLIC_CAREERS_BASE_URL ||
  'https://test.iwmsadvisors.com/careers';
