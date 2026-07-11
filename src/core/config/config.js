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


export const msGraphTenantId = process.env.MS_GRAPH_TENANT_ID;
export const msGraphClientId = process.env.MS_GRAPH_CLIENT_ID;
export const msGraphClientSecret = process.env.MS_GRAPH_CLIENT_SECRET;
export const msGraphSenderEmail = process.env.MS_GRAPH_SENDER_EMAIL;
export const emailFrom = process.env.MS_GRAPH_SENDER_EMAIL;

export const emailHost = process.env.EMAIL_HOST;
export const emailPort = process.env.EMAIL_PORT;
export const emailAddress = process.env.EMAIL_ADDRESS;
export const emailPass = process.env.EMAIL_PASS;
export const emailFrom = process.env.EMAIL_FROM;

export const adminMail = process.env.ADMIN_EMAIL;
export const emailTo = process.env.EMAIL_TO;

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
