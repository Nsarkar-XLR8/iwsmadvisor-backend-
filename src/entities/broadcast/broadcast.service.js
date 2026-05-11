import { Subscribe, Brodcast } from "./broadcast.model.js";
import { createFilter, createPaginationInfo } from "../../lib/pagination.js";
import sendEmail from "../../lib/sendEmail.js";
import { 
  getInsightNotificationTemplate, 
  getWelcomeEmailTemplate, 
  getBlogNotificationTemplate,
  getUnsubscribeSection,
  commonStyles
} from "../../lib/emailTemplates.js";

/**
 * @desc    Create a new subscriber service
 */
export const createSubscriberService = async ({ email }) => {
  if (!email) {
    throw new Error("Email is required");
  }

  // Check if email already exists
  const existingSubscriber = await Subscribe.findOne({ email });
  if (existingSubscriber) {
    if (existingSubscriber.isSubscribed) {
      throw new Error("Email already subscribed");
    } else {
      // Re-subscribe if previously unsubscribed
      existingSubscriber.isSubscribed = true;
      await existingSubscriber.save();

      // Send welcome email
      try {
        const unsubscribeUrl = `https://api.iwmsadvisors.com/api/v1/broadcast/unsubscribe?email=${encodeURIComponent(email)}`;
        const html = getWelcomeEmailTemplate({ unsubscribeUrl });
        await sendEmail({
          to: email,
          subject: "Welcome to IWMS Advisors",
          html: html,
        });

        // Save to broadcast history
        await new Brodcast({
          email,
          subject: "Welcome to IWMS Advisors",
          html: html,
        }).save();
      } catch (error) {
        console.error("Failed to send welcome email:", error.message);
      }

      return existingSubscriber;
    }
  }

  const subscriber = new Subscribe({ email, isSubscribed: true });
  const savedSubscriber = await subscriber.save();

  // Send welcome email
  try {
    const unsubscribeUrl = `https://api.iwmsadvisors.com/api/v1/broadcast/unsubscribe?email=${encodeURIComponent(email)}`;
    const html = getWelcomeEmailTemplate({ unsubscribeUrl });
    await sendEmail({
      to: email,
      subject: "Welcome to IWMS Advisors",
      html: html,
    });

    // Save to broadcast history
    await new Brodcast({
      email,
      subject: "Welcome to IWMS Advisors",
      html: html,
    }).save();
  } catch (error) {
    console.error("Failed to send welcome email:", error.message);
  }

  return savedSubscriber;
};

/**
 * @desc    Get all subscribers with pagination and filters service
 */
export const getAllSubscribersService = async ({
  search,
  date,
  page = 1,
  limit = 4,
  sort = "-createdAt",
}) => {
  const query = createFilter(search, date, "email");
  const skip = (page - 1) * limit;

  const subscribers = await Subscribe.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Subscribe.countDocuments(query);
  const pagination = createPaginationInfo(parseInt(page), parseInt(limit), total);

  return { subscribers, pagination };
};

/**
 * @desc    Get single subscriber by ID service
 */
export const getSubscriberByIdService = async (id) => {
  const subscriber = await Subscribe.findById(id);
  if (!subscriber) {
    throw new Error("Subscriber not found");
  }
  return subscriber;
};

/**
 * @desc    Delete a subscriber service
 */
export const deleteSubscriberService = async (id) => {
  const subscriber = await Subscribe.findById(id);
  if (!subscriber) {
    throw new Error("Subscriber not found");
  }

  await Subscribe.findByIdAndDelete(id);
  return;
};

/**
 * @desc    Send broadcast email service
 */
export const sendBroadcastService = async ({ email, subject, html }) => {
  if (!email || !subject || !html) {
    throw new Error("Email, subject, and html content are required");
  }

  try {
    // Append unsubscribe link
    const unsubscribeUrl = `https://api.iwmsadvisors.com/api/v1/broadcast/unsubscribe?email=${encodeURIComponent(email)}`;
    const finalHtml = `${commonStyles} ${html} ${getUnsubscribeSection(unsubscribeUrl)}`;

    // Send email
    await sendEmail({
      to: email,
      subject: subject,
      html: finalHtml,
    });

    // Save broadcast record
    const broadcast = new Brodcast({
      email,
      subject,
      html: finalHtml,
    });

    const savedBroadcast = await broadcast.save();
    return savedBroadcast;
  } catch (emailError) {
    throw new Error(`Failed to send broadcast email: ${emailError.message}`);
  }
};

/**
 * @desc    Send broadcast to all subscribers service
 */
export const sendBroadcastToAllService = async ({ subject, html }) => {
  if (!subject || !html) {
    throw new Error("Subject and html content are required");
  }

  // Get all subscribers who are currently opted-in
  const subscribers = await Subscribe.find({ isSubscribed: true });
  
  if (subscribers.length === 0) {
    throw new Error("No subscribers found");
  }

  const results = {
    total: subscribers.length,
    sent: 0,
    failed: 0,
    errors: [],
  };

  // Send email to each subscriber
  for (const subscriber of subscribers) {
    try {
      // Append unsubscribe link
      const unsubscribeUrl = `https://api.iwmsadvisors.com/api/v1/broadcast/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
      const finalHtml = `${commonStyles} ${html} ${getUnsubscribeSection(unsubscribeUrl)}`;

      await sendEmail({
        to: subscriber.email,
        subject: subject,
        html: finalHtml,
      });

      // Save broadcast record
      await new Brodcast({
        email: subscriber.email,
        subject,
        html: finalHtml,
      }).save();

      results.sent++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: subscriber.email,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * @desc    Get all broadcasts with pagination service
 */
export const getAllBroadcastsService = async ({
  search,
  date,
  page = 1,
  limit = 10,
  sort = "-createdAt",
}) => {
  let query = {};
  
  if (date) {
    const _date = new Date(date);
    const startOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate());
    const endOfDay = new Date(_date.getFullYear(), _date.getMonth(), _date.getDate() + 1);
    query.createdAt = { $gte: startOfDay, $lt: endOfDay };
  }

  if (search) {
    query.$or = [
      { subject: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  const skip = (page - 1) * limit;

  const broadcasts = await Brodcast.find(query)
    .sort(sort)
    .skip(skip)
    .limit(parseInt(limit))
    .lean();

  const emails = [...new Set(broadcasts.map((b) => b.email))];
  const subscriptions = await Subscribe.find({ email: { $in: emails } });
  const subscriptionMap = subscriptions.reduce((acc, s) => {
    acc[s.email] = s.isSubscribed;
    return acc;
  }, {});

  const broadcastsWithStatus = broadcasts.map((b) => ({
    ...b,
    isSubscribe: subscriptionMap[b.email] ?? false,
  }));

  const total = await Brodcast.countDocuments(query);
  const pagination = createPaginationInfo(parseInt(page), parseInt(limit), total);

  return { broadcasts: broadcastsWithStatus, pagination };
};

/**
 * @desc    Get single broadcast by ID service
 */
export const getBroadcastByIdService = async (id) => {
  const broadcast = await Brodcast.findById(id);
  if (!broadcast) {
    throw new Error("Broadcast not found");
  }
  return broadcast;
};

/**
 * @desc    Delete a broadcast service
 */
export const deleteBroadcastService = async (id) => {
  const broadcast = await Brodcast.findById(id);
  if (!broadcast) {
    throw new Error("Broadcast not found");
  }

  await Brodcast.findByIdAndDelete(id);
  return;
};

/**
 * @desc    Unsubscribe a user by email service
 */
export const unsubscribeSubscriberService = async (email) => {
  if (!email) {
    throw new Error("Email is required");
  }

  const result = await Subscribe.findOneAndUpdate(
    { email },
    { isSubscribed: false },
    { new: true }
  );
  if (!result) {
    throw new Error("Subscriber not found");
  }
  return result;
};

/**
 * @desc    Notify all subscribers about a new insight
 */
export const notifySubscribersOfInsight = async (insight) => {
  if (!insight || !insight.title || !insight.subTitle) {
    console.error("Invalid insight data for notification");
    return;
  }

  const subscribers = await Subscribe.find({ isSubscribed: true });
  if (subscribers.length === 0) {
    return;
  }

  // Define base URL for unsubscribe link
  // The user provided https://api.iwmsadvisors.com/api/v1/broadcast/subscribe
  const baseUrl = "https://api.iwmsadvisors.com/api/v1/broadcast/unsubscribe";

  for (const subscriber of subscribers) {
    try {
      const unsubscribeUrl = `${baseUrl}?email=${encodeURIComponent(subscriber.email)}`;
      const html = getInsightNotificationTemplate({
        title: insight.title,
        subTitle: insight.subTitle,
        unsubscribeUrl
      });

      await sendEmail({
        to: subscriber.email,
        subject: "New Insight from IWM Advisors",
        html: html,
      });

      // Optionally save to Brodcast model
      await new Brodcast({
        email: subscriber.email,
        subject: `Insight: ${insight.title}`,
        html: html,
      }).save();
    } catch (error) {
      console.error(`Failed to notify subscriber ${subscriber.email}:`, error.message);
    }
  }
};

/**
 * @desc    Notify all subscribers about a new blog
 */
export const notifySubscribersOfBlog = async (blog) => {
  if (!blog || !blog.title) {
    console.error("Invalid blog data for notification");
    return;
  }

  const subscribers = await Subscribe.find({ isSubscribed: true });
  if (subscribers.length === 0) {
    return;
  }

  // Define base URL for unsubscribe link
  const baseUrl = "https://api.iwmsadvisors.com/api/v1/broadcast/unsubscribe";

  // Use subtitle if available, else a snippet of the description
  const subTitle = blog.subtitle 
    ? blog.subtitle 
    : (blog.description ? blog.description.substring(0, 100) + "..." : "Check out our latest blog post!");

  for (const subscriber of subscribers) {
    try {
      const unsubscribeUrl = `${baseUrl}?email=${encodeURIComponent(subscriber.email)}`;
      const html = getBlogNotificationTemplate({
        title: blog.title,
        subTitle: subTitle,
        unsubscribeUrl
      });

      await sendEmail({
        to: subscriber.email,
        subject: "New Blog Post from IWM Advisors",
        html: html,
      });

      // Save to Brodcast model history
      await new Brodcast({
        email: subscriber.email,
        subject: `Blog: ${blog.title}`,
        html: html,
      }).save();
    } catch (error) {
      console.error(`Failed to notify subscriber ${subscriber.email} of blog:`, error.message);
    }
  }
};