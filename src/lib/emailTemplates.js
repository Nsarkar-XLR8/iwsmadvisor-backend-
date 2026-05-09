// ✅ ESM
const verificationCodeTemplate = (code) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9f9f9;">
    <h1 style="color: #333; text-align: center;">Verification Code</h1>
    <p style="font-size: 16px; color: #555;">Hello,</p>
    <p style="font-size: 16px; color: #555;">Thank you for using our services. Your verification code is:</p>
    <p style="font-size: 24px; font-weight: bold; text-align: center; color: #007BFF;">${code}</p>
    <p style="font-size: 16px; color: #555;">Please enter this code within 5 minutes to verify your account.</p>
    <p style="font-size: 16px; color: #555;">If you did not request this code, please ignore this email.</p>
    <footer style="border-top: 1px solid #ddd; padding-top: 10px; margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
      &copy; 2023 Your Company Name. All rights reserved.
    </footer>
  </div>
`;

export default verificationCodeTemplate;


export const getPaymentSuccessTemplate = ({ name, eventId, slots }) => {
  const slotDetails = slots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>✅ Booking Confirmed</h2>
      <p>Dear ${name},</p>
      <p>Your payment has been successfully received and your booking has been confirmed.</p>
      <p><strong>Event ID:</strong> ${eventId}</p>
      <p><strong>Slot(s) Booked:</strong></p>
      <ul>
        ${slotDetails}
      </ul>
      <br />
      <p>Thank you for choosing our service.</p>
      <p>We look forward to seeing you at the event.</p>
      <br />
    
      
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
}) => {
  const slotDetails = selectedSlots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>⚠️ Booking Conflict Detected After Payment</h2>

      <p><strong>Customer Details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phone}</li>
      </ul>

      <p><strong>Event Details:</strong></p>
      <ul>
        <li><strong>Event ID:</strong> ${eventId}</li>
        <li><strong>Event Title:</strong> ${eventTitle || 'N/A'}</li>
        <li><strong>Date:</strong> ${selectedDate}</li>
      </ul>

      <p><strong>Attempted Slot(s):</strong></p>
      <ul>
        ${slotDetails}
      </ul>

      <p><strong>Stripe Info:</strong></p>
      <ul>
        <li><strong>Session ID:</strong> ${sessionId}</li>
        <li><strong>Payment Intent ID:</strong> ${paymentIntentId}</li>
        ${
          refundAmount
            ? `<li><strong>Refund Amount:</strong> $${(refundAmount / 100).toFixed(2)}</li>`
            : ''
        }
        <li><strong>Refund Status:</strong> Refund automatically processed</li>
      </ul>

      <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>

      <br />
      <p style="color: red;">
        ⚠️ Some of the selected slots were already booked by the time payment completed.<br/>
        The booking was not created, and the payment has been refunded.
      </p>
    </div>
  `;
};

export const getPaymentSuccessForAdminTemplate = ({ name, email, phone, eventId, slots }) => {
  const slotDetails = slots
    .map(
      (slot, index) =>
        `<li><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>📥 New Booking Received</h2>
      <p><strong>User Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone}</p>
      <p><strong>Event ID:</strong> ${eventId}</p>
      <p><strong>Slot(s) Booked:</strong></p>
      <ul>
        ${slotDetails}
      </ul>
      <br />
      <p>This booking has been paid and confirmed via Stripe.</p>
      <p>Please make necessary arrangements for the event.</p>
    </div>
  `;
};
export const getInsightNotificationTemplate = ({ title, subTitle, unsubscribeUrl }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #2c3e50; margin-bottom: 5px;">New Insight Published</h2>
        <div style="height: 2px; width: 50px; background-color: #3498db; margin: 10px auto;"></div>
      </div>
      
      <div style="padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #3498db; margin-bottom: 25px;">
        <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 20px;">${title}</h3>
        <p style="color: #555; line-height: 1.6; margin: 0; font-size: 16px;">${subTitle}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="color: #7f8c8d; font-size: 14px;">We hope you find this insight valuable for your business growth.</p>
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        <p style="color: #95a5a6; font-size: 12px; margin-bottom: 15px;">
          You are receiving this because you subscribed to IWM Advisors insights.
        </p>
        <a href="${unsubscribeUrl}" style="display: inline-block; padding: 10px 20px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 14px; transition: background-color 0.3s;">
          Unsubscribe from Insights
        </a>
      </div>
      
      <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: #bdc3c7;">
        &copy; ${new Date().getFullYear()} IWM Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

export const getWelcomeEmailTemplate = ({ unsubscribeUrl }) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; padding: 40px; border-radius: 16px; background-color: #ffffff; color: #333;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1a237e; margin-bottom: 10px; font-size: 28px;">Welcome to IWM Advisors</h1>
        <div style="height: 4px; width: 60px; background: linear-gradient(to right, #1a237e, #3949ab); margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <div style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 30px;">
        <p>Hello,</p>
        <p>Thank you for subscribing to IWM Advisors. We are thrilled to have you as part of our community.</p>
        <p>You will now receive exclusive insights, market updates, and expert analysis directly in your inbox. Our goal is to provide you with valuable information that helps you make informed decisions and stay ahead in the industry.</p>
        <p>In the meantime, feel free to explore our latest publications and resources on our website.</p>
      </div>

      <div style="text-align: center; margin-bottom: 40px;">
        <a href="https://test.iwmsadvisors.com/" style="display: inline-block; padding: 14px 30px; background-color: #1a237e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(26, 35, 126, 0.2);">
          Visit Our Website
        </a>
      </div>

      <div style="border-top: 1px solid #f0f0f0; padding-top: 25px; text-align: center;">
        <p style="color: #888; font-size: 13px; margin-bottom: 20px;">
          You are receiving this email because you subscribed to IWM Advisors updates.
        </p>
        <a href="${unsubscribeUrl}" style="color: #d32f2f; text-decoration: none; font-size: 13px; font-weight: 500;">
          Unsubscribe from these emails
        </a>
      </div>

      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bbb;">
        &copy; ${new Date().getFullYear()} IWM Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

export const getBlogNotificationTemplate = ({ title, subTitle, unsubscribeUrl }) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #27ae60; margin-bottom: 5px;">New Blog Post Published</h2>
        <div style="height: 2px; width: 50px; background-color: #2ecc71; margin: 10px auto;"></div>
      </div>
      
      <div style="padding: 20px; background-color: #f9fbf9; border-radius: 8px; border-left: 4px solid #2ecc71; margin-bottom: 25px;">
        <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 20px;">${title}</h3>
        <p style="color: #555; line-height: 1.6; margin: 0; font-size: 16px;">${subTitle}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <p style="color: #7f8c8d; font-size: 14px;">Explore the full post on our website.</p>
        <a href="https://test.iwmsadvisors.com/insights" style="display: inline-block; padding: 12px 24px; background-color: #27ae60; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 15px;">
          Read the Blog
        </a>
      </div>

      <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
        <p style="color: #95a5a6; font-size: 12px; margin-bottom: 15px;">
          You are receiving this because you subscribed to IWM Advisors updates.
        </p>
        <a href="${unsubscribeUrl}" style="display: inline-block; padding: 8px 16px; background-color: #e74c3c; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; transition: background-color 0.3s;">
          Unsubscribe from Updates
        </a>
      </div>
      
      <footer style="margin-top: 30px; text-align: center; font-size: 12px; color: #bdc3c7;">
        &copy; ${new Date().getFullYear()} IWM Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

