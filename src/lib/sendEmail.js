import axios from "axios";
import {
  msGraphTenantId,
  msGraphClientId,
  msGraphClientSecret,
  msGraphSenderEmail,
} from "../core/config/config.js";

const TOKEN_URL = `https://login.microsoftonline.com/${msGraphTenantId}/oauth2/v2.0/token`;
const GRAPH_SEND_MAIL_URL = `https://graph.microsoft.com/v1.0/users/${msGraphSenderEmail}/sendMail`;
const SCOPE = "https://graph.microsoft.com/.default";
const TOKEN_BUFFER_MS = 5 * 60 * 1000;
const ATTACHMENT_TIMEOUT_MS = 30000;

let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
  if (cachedToken && Date.now() < tokenExpiresAt - TOKEN_BUFFER_MS) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    client_id: msGraphClientId,
    client_secret: msGraphClientSecret,
    scope: SCOPE,
    grant_type: "client_credentials",
  });

  const response = await axios.post(TOKEN_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  cachedToken = response.data.access_token;
  tokenExpiresAt = Date.now() + response.data.expires_in * 1000;

  return cachedToken;
};

const processAttachments = async (attachments = []) => {
  const processed = [];

  for (const attachment of attachments) {
    try {
      if (attachment.path) {
        const response = await axios.get(attachment.path, {
          responseType: "arraybuffer",
          timeout: ATTACHMENT_TIMEOUT_MS,
        });
        const contentBytes = Buffer.from(response.data).toString("base64");
        processed.push({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: attachment.filename || "file",
          contentBytes,
        });
      } else if (attachment.content) {
        const contentBytes = Buffer.isBuffer(attachment.content)
          ? attachment.content.toString("base64")
          : Buffer.from(attachment.content).toString("base64");
        processed.push({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: attachment.filename || "file",
          contentBytes,
        });
      } else {
        console.warn("Skipping attachment with no path or content:", attachment);
      }
    } catch (err) {
      console.error(
        `Failed to process attachment "${attachment.filename || "unknown"}":`,
        err.message
      );
    }
  }

  return processed;
};

const buildMessage = (to, subject, html, graphAttachments) => {
  const message = {
    subject,
    body: { contentType: "HTML", content: html },
    toRecipients: [{ emailAddress: { address: to } }],
  };

  if (graphAttachments.length > 0) {
    message.attachments = graphAttachments;
  }

  return message;
};

const postSendMail = async (token, message) => {
  return axios.post(
    GRAPH_SEND_MAIL_URL,
    { message, saveToSentItems: false },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",

  emailHost,
  emailPort,
  emailAddress,
  emailPass,
  emailFrom,
} from "../core/config/config.js"; 

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: emailPort,
      secure: false,
      auth: {
        user: emailAddress,
        pass: emailPass,
      },
    }
  );
};

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    const token = await getAccessToken();
    const graphAttachments = await processAttachments(attachments);
    const message = buildMessage(to, subject, html, graphAttachments);

    const mailOptions = {
      from: emailFrom,
      to,
      subject,
      html,
      attachments: Array.isArray(attachments) ? attachments : [],
    };

    await postSendMail(token, message);
    return { success: true };
  } catch (error) {
    // 401 Unauthorized — token may have been revoked; clear cache and retry once
    if (error.response?.status === 401) {
      try {
        cachedToken = null;
        tokenExpiresAt = 0;
        const token = await getAccessToken();
        const graphAttachments = await processAttachments(attachments);
        const message = buildMessage(to, subject, html, graphAttachments);

        await postSendMail(token, message);
        return { success: true };
      } catch (retryError) {
        console.error("Email send retry failed:", retryError.message);
        return { success: false, error: retryError.message };
      }
    }

    // 429 Too Many Requests — honour the retry-after header
    if (error.response?.status === 429) {
      const retryAfter = parseInt(
        error.response.headers["retry-after"] || "30",
        10
      );
      console.warn(`Graph API throttled. Retrying after ${retryAfter}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));

      try {
        const token = await getAccessToken();
        const graphAttachments = await processAttachments(attachments);
        const message = buildMessage(to, subject, html, graphAttachments);

        await postSendMail(token, message);
        return { success: true };
      } catch (retryError) {
        console.error("Email send after throttle failed:", retryError.message);
        return { success: false, error: retryError.message };
      }
    }

    console.error("Email send error:", error.message);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
