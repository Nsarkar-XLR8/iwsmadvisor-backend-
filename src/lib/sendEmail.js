import axios from 'axios';
import nodemailer from 'nodemailer';
import {
  emailFrom,
  msGraphTenantId,
  msGraphClientId,
  msGraphClientSecret,
  msGraphSenderEmail,
  smtpHost,
  smtpPass,
  smtpPort,
  smtpSecure,
  smtpUser
} from '../core/config/config.js';

const SCOPE = 'https://graph.microsoft.com/.default';
const TOKEN_BUFFER_MS = 5 * 60 * 1000;
const ATTACHMENT_TIMEOUT_MS = 30000;
const MAX_RETRY_AFTER_SECONDS = 120;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let cachedToken = null;
let tokenExpiresAt = 0;
let smtpTransporter = null;

const hasGraphConfig = () =>
  Boolean(
    msGraphTenantId &&
    msGraphClientId &&
    msGraphClientSecret &&
    msGraphSenderEmail
  );

const hasSmtpConfig = () => Boolean(smtpHost && smtpUser && smtpPass);

const getGraphTokenUrl = () =>
  `https://login.microsoftonline.com/${encodeURIComponent(
    msGraphTenantId
  )}/oauth2/v2.0/token`;

const getGraphSendMailUrl = () =>
  `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(
    msGraphSenderEmail
  )}/sendMail`;

const normalizeRecipients = (value) => {
  const recipients = Array.isArray(value)
    ? value
    : String(value || '')
        .split(',')
        .map((item) => item.trim());

  return recipients.filter(Boolean);
};

const validateEmailPayload = ({ to, subject, html }) => {
  const recipients = normalizeRecipients(to);

  if (recipients.length === 0) {
    throw new Error('Email recipient is required');
  }

  const invalidRecipients = recipients.filter(
    (recipient) => !EMAIL_REGEX.test(recipient)
  );
  if (invalidRecipients.length > 0) {
    throw new Error(`Invalid email recipient: ${invalidRecipients.join(', ')}`);
  }

  if (!subject || !String(subject).trim()) {
    throw new Error('Email subject is required');
  }

  if (!html || !String(html).trim()) {
    throw new Error('Email html content is required');
  }

  return recipients;
};

const formatProviderError = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;

  if (!status && !data) {
    return error.message;
  }

  const providerMessage =
    data?.error?.message ||
    data?.error_description ||
    data?.message ||
    JSON.stringify(data);

  return `HTTP ${status}: ${providerMessage}`;
};

const getAccessToken = async () => {
  if (!hasGraphConfig()) {
    throw new Error(
      'Microsoft Graph email config is incomplete. Set MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, and EMAIL_FROM or MS_GRAPH_SENDER_EMAIL.'
    );
  }

  if (cachedToken && Date.now() < tokenExpiresAt - TOKEN_BUFFER_MS) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    client_id: msGraphClientId,
    client_secret: msGraphClientSecret,
    scope: SCOPE,
    grant_type: 'client_credentials'
  });

  const response = await axios.post(getGraphTokenUrl(), params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  cachedToken = response.data.access_token;
  tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

  return cachedToken;
};

const toBase64Content = (content) =>
  Buffer.isBuffer(content)
    ? content.toString('base64')
    : Buffer.from(content).toString('base64');

const processGraphAttachments = async (attachments = []) => {
  const processed = [];

  for (const attachment of attachments) {
    if (!attachment?.path && !attachment?.content) {
      console.warn('Skipping attachment with no path or content:', attachment);
      continue;
    }

    try {
      if (attachment.path) {
        const response = await axios.get(attachment.path, {
          responseType: 'arraybuffer',
          timeout: ATTACHMENT_TIMEOUT_MS
        });
        processed.push({
          '@odata.type': '#microsoft.graph.fileAttachment',
          name: attachment.filename || 'file',
          contentBytes: Buffer.from(response.data).toString('base64')
        });
        continue;
      }

      processed.push({
        '@odata.type': '#microsoft.graph.fileAttachment',
        name: attachment.filename || 'file',
        contentBytes: toBase64Content(attachment.content)
      });
    } catch (error) {
      throw new Error(
        `Failed to process attachment "${attachment.filename || 'unknown'}": ${
          error.message
        }`
      );
    }
  }

  return processed;
};

const buildGraphMessage = (recipients, subject, html, graphAttachments) => {
  const message = {
    subject,
    body: { contentType: 'HTML', content: html },
    toRecipients: recipients.map((recipient) => ({
      emailAddress: { address: recipient }
    }))
  };

  if (graphAttachments.length > 0) {
    message.attachments = graphAttachments;
  }

  return message;
};

const postGraphSendMail = async (token, message) => {
  return axios.post(
    getGraphSendMailUrl(),
    { message, saveToSentItems: true },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );
};

const sendViaGraph = async ({ recipients, subject, html, attachments }) => {
  const token = await getAccessToken();
  const graphAttachments = await processGraphAttachments(attachments);
  const message = buildGraphMessage(
    recipients,
    subject,
    html,
    graphAttachments
  );

  await postGraphSendMail(token, message);
};

const getSmtpTransporter = () => {
  if (!hasSmtpConfig()) {
    throw new Error(
      'SMTP email config is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.'
    );
  }

  if (!smtpTransporter) {
    smtpTransporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
  }

  return smtpTransporter;
};

const sendViaSmtp = async ({ recipients, subject, html, attachments }) => {
  const transporter = getSmtpTransporter();

  await transporter.sendMail({
    from: emailFrom || smtpUser,
    to: recipients,
    subject,
    html,
    attachments
  });
};

const runGraphWithRetry = async (payload) => {
  try {
    await sendViaGraph(payload);
  } catch (error) {
    // 401 Unauthorized — token may have been revoked; clear cache and retry once
    if (error.response?.status === 401) {
      cachedToken = null;
      tokenExpiresAt = 0;
      await sendViaGraph(payload);
      return;
    }

    // 429 Too Many Requests — honour the retry-after header
    if (error.response?.status === 429) {
      const retryAfter = Math.min(
        parseInt(error.response.headers['retry-after'] || '30', 10),
        MAX_RETRY_AFTER_SECONDS
      );
      console.warn(`Graph API throttled. Retrying after ${retryAfter}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
      await sendViaGraph(payload);
      return;
    }

    throw error;
  }
};

const sendEmail = async ({
  to,
  subject,
  html,
  attachments = [],
  suppressErrors = false
}) => {
  try {
    const recipients = validateEmailPayload({ to, subject, html });
    const payload = { recipients, subject, html, attachments };

    if (hasGraphConfig()) {
      try {
        await runGraphWithRetry(payload);
        return { success: true, provider: 'microsoft-graph' };
      } catch (graphError) {
        if (!hasSmtpConfig()) {
          throw graphError;
        }

        console.error(
          'Microsoft Graph email send failed. Trying SMTP fallback:',
          formatProviderError(graphError)
        );
        await sendViaSmtp(payload);
        return {
          success: true,
          provider: 'smtp',
          fallbackFrom: 'microsoft-graph'
        };
      }
    }

    if (hasSmtpConfig()) {
      await sendViaSmtp(payload);
      return { success: true, provider: 'smtp' };
    }

    throw new Error(
      'No email provider is configured. Configure Microsoft Graph or SMTP environment variables.'
    );
  } catch (error) {
    const message = formatProviderError(error);
    console.error('Email send error:', message);

    if (suppressErrors) {
      return { success: false, error: message };
    }

    throw new Error(`Email send failed: ${message}`);
  }
};

export default sendEmail;