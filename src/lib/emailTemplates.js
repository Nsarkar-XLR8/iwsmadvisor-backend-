// ✅ ESM
export const commonStyles = `
  <style>
    .unsubscribe-btn:hover {
      background-color: #c0392b !important;
      transform: translateY(-1px);
    }
    .primary-btn:hover {
      background-color: #0d47a1 !important;
      transform: translateY(-1px);
    }
  </style>
`;

export const getUnsubscribeSection = (unsubscribeUrl) => {
  if (!unsubscribeUrl) return '';
  return `
    <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; margin-top: 20px;">
      <p style="color: #95a5a6; font-size: 12px; margin-bottom: 15px;">
        You are receiving this because you are part of IWMS Advisors community.
      </p>
      <a href="${unsubscribeUrl}" class="unsubscribe-btn" style="display: inline-block; padding: 12px 24px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; transition: all 0.3s ease; box-shadow: 0 2px 4px rgba(231, 76, 60, 0.2);">
        Unsubscribe from these emails
      </a>
    </div>
  `;
};

const verificationCodeTemplate = (code, unsubscribeUrl) => `
  ${commonStyles}
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 30px; border-radius: 12px; background-color: #f9f9f9; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    <h1 style="color: #1a237e; text-align: center; margin-bottom: 25px;">Verification Code</h1>
    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; text-align: center;">
      <p style="font-size: 16px; color: #555;">Hello,</p>
      <p style="font-size: 16px; color: #555;">Thank you for using our services. Your verification code is:</p>
      <p style="font-size: 32px; font-weight: bold; text-align: center; color: #1a237e; letter-spacing: 5px; margin: 20px 0;">${code}</p>
      <p style="font-size: 16px; color: #555;">Please enter this code within 5 minutes to verify your account.</p>
    </div>
    <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">If you did not request this code, please ignore this email.</p>
    
    ${getUnsubscribeSection(unsubscribeUrl)}

    <footer style="padding-top: 20px; margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
      &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
    </footer>
  </div>
`;

export default verificationCodeTemplate;

export const getPaymentSuccessTemplate = ({ name, eventId, slots, unsubscribeUrl }) => {
  const slotDetails = slots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #27ae60; margin-bottom: 10px;">✅ Booking Confirmed</h2>
        <div style="height: 3px; width: 60px; background-color: #2ecc71; margin: 0 auto; border-radius: 2px;"></div>
      </div>
      
      <p>Dear ${name},</p>
      <p>Your payment has been successfully received and your booking has been confirmed.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p style="margin-top: 0;"><strong>Event ID:</strong> ${eventId}</p>
        <p><strong>Slot(s) Booked:</strong></p>
        <ul style="margin-bottom: 0; padding-left: 20px;">
          ${slotDetails}
        </ul>
      </div>
      
      <p>Thank you for choosing our service. We look forward to seeing you at the event.</p>
      
      ${getUnsubscribeSection(unsubscribeUrl)}

      <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: #bdc3c7;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

// auto refunded template

export const getConflictAfterPaymentTemplate = ({
  name,
  email,
  phone,
  eventId,
  eventTitle,
  selectedDate,
  selectedSlots = [],
  sessionId,
  paymentIntentId,
  refundAmount,
  unsubscribeUrl
}) => {
  const slotDetails = selectedSlots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ffebee; padding: 30px; border-radius: 12px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #c62828; margin-bottom: 10px;">⚠️ Booking Conflict Detected</h2>
        <div style="height: 3px; width: 60px; background-color: #e53935; margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <div style="background-color: #fff5f5; border-left: 4px solid #e53935; padding: 15px; margin-bottom: 20px; color: #c62828;">
        <strong>Notice:</strong> Some of the selected slots were already booked by the time payment completed.
        The booking was not created, and the payment has been refunded.
      </div>

      <p><strong>Customer Details:</strong></p>
      <ul style="color: #555;">
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
      </ul>

      <p><strong>Event Details:</strong></p>
      <ul style="color: #555;">
        <li><strong>Event ID:</strong> ${eventId}</li>
        <li><strong>Event Title:</strong> ${eventTitle || 'N/A'}</li>
        <li><strong>Date:</strong> ${selectedDate}</li>
      </ul>

      <p><strong>Attempted Slot(s):</strong></p>
      <ul style="color: #555;">
        ${slotDetails}
      </ul>

      <p><strong>Stripe Info:</strong></p>
      <ul style="color: #555;">
        <li><strong>Session ID:</strong> ${sessionId}</li>
        <li><strong>Payment Intent ID:</strong> ${paymentIntentId}</li>
        ${
          refundAmount
            ? `<li><strong>Refund Amount:</strong> $${(refundAmount / 100).toFixed(2)}</li>`
            : ''
        }
        <li><strong>Refund Status:</strong> Refund automatically processed</li>
      </ul>

      <p style="font-size: 12px; color: #999; margin-top: 20px;">Time: ${new Date().toLocaleString()}</p>

      ${getUnsubscribeSection(unsubscribeUrl)}

      <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: #bdc3c7;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

export const getPaymentSuccessForAdminTemplate = ({
  name,
  email,
  phone,
  eventId,
  slots
}) => {
  const slotDetails = slots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #1a237e; border-bottom: 2px solid #1a237e; padding-bottom: 10px;">📥 New Booking Received</h2>
      <div style="background-color: #f1f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>User Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Event ID:</strong> ${eventId}</p>
      </div>
      
      <p><strong>Slot(s) Booked:</strong></p>
      <ul style="color: #333;">
        ${slotDetails}
      </ul>
      
      <p style="color: #27ae60; font-weight: bold; margin-top: 20px;">This booking has been paid and confirmed via Stripe.</p>
      <p>Please make necessary arrangements for the event.</p>
      
      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bbb; border-top: 1px solid #eee; padding-top: 20px;">
        &copy; ${new Date().getFullYear()} IWMS Advisors Admin Notification.
      </footer>
    </div>
  `;
};

export const getInsightNotificationTemplate = ({
  title,
  subTitle,
  unsubscribeUrl
}) => {
  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 15px rgba(0,0,0,0.08);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #2c3e50; margin-bottom: 5px;">New Insight Published</h2>
        <div style="height: 3px; width: 60px; background-color: #3498db; margin: 10px auto; border-radius: 2px;"></div>
      </div>
      
      <div style="padding: 25px; background-color: #f8f9fa; border-radius: 12px; border-left: 5px solid #3498db; margin-bottom: 30px;">
        <h3 style="color: #1a237e; margin: 0 0 15px 0; font-size: 22px;">${title}</h3>
        <p style="color: #444; line-height: 1.7; margin: 0; font-size: 16px;">${subTitle}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="color: #7f8c8d; font-size: 15px;">We hope you find this insight valuable for your business growth.</p>
        <a href="https://test.iwmsadvisors.com/insights" class="primary-btn" style="display: inline-block; padding: 14px 30px; background-color: #1a237e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; margin-top: 10px; box-shadow: 0 4px 6px rgba(26, 35, 126, 0.2);">
          View Full Insight
        </a>
      </div>

      ${getUnsubscribeSection(unsubscribeUrl)}
      
      <footer style="margin-top: 35px; text-align: center; font-size: 12px; color: #bdc3c7;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

export const getWelcomeEmailTemplate = ({ unsubscribeUrl }) => {
  return `
    ${commonStyles}
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 40px; border-radius: 20px; background-color: #ffffff; color: #333; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 35px;">
        <h1 style="color: #1a237e; margin-bottom: 15px; font-size: 32px;">Welcome to IWMS Advisors</h1>
        <div style="height: 5px; width: 80px; background: linear-gradient(to right, #1a237e, #3949ab); margin: 0 auto; border-radius: 3px;"></div>
      </div>

      <div style="font-size: 17px; line-height: 1.8; color: #444; margin-bottom: 35px;">
        <p>Hello,</p>
        <p>Thank you for subscribing to IWMS Advisors. We are thrilled to have you as part of our community.</p>
        <p>You will now receive exclusive insights, market updates, and expert analysis directly in your inbox. Our goal is to provide you with valuable information that helps you make informed decisions and stay ahead in the industry.</p>
        <p>In the meantime, feel free to explore our latest publications and resources on our website.</p>
      </div>

      <div style="text-align: center; margin-bottom: 40px;">
        <a href="https://test.iwmsadvisors.com/" class="primary-btn" style="display: inline-block; padding: 16px 40px; background-color: #1a237e; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 18px; transition: all 0.3s ease; box-shadow: 0 5px 15px rgba(26, 35, 126, 0.3);">
          Explore Our Website
        </a>
      </div>

      ${getUnsubscribeSection(unsubscribeUrl)}

      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bbb;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

export const getBlogNotificationTemplate = ({
  title,
  subTitle,
  unsubscribeUrl
}) => {
  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 35px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 6px 20px rgba(0,0,0,0.06);">
      <div style="text-align: center; margin-bottom: 25px;">
        <h2 style="color: #27ae60; margin-bottom: 5px;">New Blog Post Published</h2>
        <div style="height: 3px; width: 60px; background-color: #2ecc71; margin: 10px auto; border-radius: 2px;"></div>
      </div>
      
      <div style="padding: 25px; background-color: #f9fbf9; border-radius: 12px; border-left: 5px solid #2ecc71; margin-bottom: 30px;">
        <h3 style="color: #1a237e; margin: 0 0 15px 0; font-size: 22px;">${title}</h3>
        <p style="color: #444; line-height: 1.7; margin: 0; font-size: 16px;">${subTitle}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 35px;">
        <p style="color: #7f8c8d; font-size: 15px; margin-bottom: 20px;">Explore the full post on our website.</p>
        <a href="https://test.iwmsadvisors.com/insights" class="primary-btn" style="display: inline-block; padding: 14px 32px; background-color: #27ae60; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 10px rgba(39, 174, 96, 0.25);">
          Read the Blog
        </a>
      </div>

      ${getUnsubscribeSection(unsubscribeUrl)}
      
      <footer style="margin-top: 35px; text-align: center; font-size: 12px; color: #bdc3c7;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};
