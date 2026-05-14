// ✅ ESM
export const commonStyles = `
  <style>
    .unsubscribe-btn:hover {
      opacity: 0.8 !important;
      transform: translateY(-1px);
    }
    .primary-btn:hover {
      background-color: #000051 !important;
      transform: translateY(-1px);
    }
    .card:hover {
      box-shadow: 0 6px 12px rgba(0,0,0,0.1) !important;
    }
  </style>
`;

export const getUnsubscribeSection = (unsubscribeUrl) => {
  if (!unsubscribeUrl) return '';
  return `
    <div style="padding-top: 30px; text-align: center; margin-top: 20px;">
      <p style="color: #7f8c8d; font-size: 13px; margin-bottom: 15px;">
        You are receiving this because you are part of the IWMS Advisors community.
      </p>
      <a href="${unsubscribeUrl}" style="color: #7f8c8d; text-decoration: underline; font-size: 13px;">
        Unsubscribe
      </a>
    </div>
  `;
};

const verificationCodeTemplate = (code, unsubscribeUrl) => `
  ${commonStyles}
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
    <div style="text-align: center; margin-bottom: 30px;">
      <h2 style="color: #1a237e; margin-bottom: 10px;">Verification Code</h2>
      <div style="height: 3px; width: 50px; background-color: #1a237e; margin: 0 auto; border-radius: 2px;"></div>
    </div>
    
    <div style="background-color: #fcfcfc; padding: 30px; border-radius: 12px; text-align: center; border: 1px solid #f0f0f0;">
      <p style="font-size: 16px; color: #444; margin-bottom: 20px;">Hello,</p>
      <p style="font-size: 16px; color: #444; margin-bottom: 25px;">Thank you for using IWMS Advisors. Your verification code is:</p>
      <p style="font-size: 36px; font-weight: bold; text-align: center; color: #1a237e; letter-spacing: 8px; margin: 25px 0; font-family: monospace;">${code}</p>
      <p style="font-size: 14px; color: #7f8c8d;">Please enter this code within 5 minutes to verify your account.</p>
    </div>
    
    <p style="font-size: 13px; color: #bdc3c7; text-align: center; margin-top: 30px;">If you did not request this code, please ignore this email.</p>
    
    ${getUnsubscribeSection(unsubscribeUrl)}

    <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #f0f0f0; padding-top: 25px;">
      &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
    </footer>
  </div>
`;

export default verificationCodeTemplate;

export const getPaymentSuccessTemplate = ({ name, eventId, slots, unsubscribeUrl }) => {
  const slotDetails = slots
    .map(
      (slot, index) =>
        `<li style="margin-bottom: 8px;"><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a237e; margin-bottom: 10px;">Booking Confirmed</h2>
        <div style="height: 3px; width: 50px; background-color: #1a237e; margin: 0 auto; border-radius: 2px;"></div>
      </div>
      
      <div style="color: #444; line-height: 1.6;">
        <p>Dear ${name},</p>
        <p>Your payment has been successfully received and your booking with IWMS Advisors has been confirmed.</p>
        
        <div style="background-color: #fcfcfc; padding: 25px; border-radius: 12px; border: 1px solid #f0f0f0; margin: 25px 0;">
          <p style="margin-top: 0; color: #1a237e; font-weight: bold;">Booking Details:</p>
          <p><strong>Event ID:</strong> ${eventId}</p>
          <p style="margin-bottom: 8px;"><strong>Slot(s) Booked:</strong></p>
          <ul style="margin-bottom: 0; padding-left: 20px; color: #555;">
            ${slotDetails}
          </ul>
        </div>
        
        <p>Thank you for choosing IWMS Advisors. We look forward to seeing you at the event.</p>
      </div>
      
      ${getUnsubscribeSection(unsubscribeUrl)}

      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #f0f0f0; padding-top: 25px;">
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
        `<li style="margin-bottom: 8px;"><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a237e; margin-bottom: 10px;">Booking Update</h2>
        <div style="height: 3px; width: 50px; background-color: #1a237e; margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <div style="background-color: #fcfcfc; border-left: 4px solid #1a237e; padding: 20px; margin-bottom: 25px; color: #444; border: 1px solid #f0f0f0; border-left-width: 4px;">
        <strong style="color: #1a237e;">Notice:</strong> Some of the selected slots were already booked by the time payment completed.
        The booking was not created, and the payment has been automatically refunded.
      </div>

      <div style="color: #444; line-height: 1.6;">
        <p><strong>Customer Details:</strong></p>
        <ul style="color: #555; list-style: none; padding-left: 0;">
          <li><strong>Name:</strong> ${name}</li>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Phone:</strong> ${phone}</li>
        </ul>

        <p><strong>Event Details:</strong></p>
        <ul style="color: #555; list-style: none; padding-left: 0;">
          <li><strong>Event ID:</strong> ${eventId}</li>
          <li><strong>Event Title:</strong> ${eventTitle || 'N/A'}</li>
          <li><strong>Date:</strong> ${selectedDate}</li>
        </ul>

        <p><strong>Attempted Slot(s):</strong></p>
        <ul style="color: #555; padding-left: 20px;">
          ${slotDetails}
        </ul>

        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee;">
          <p style="margin-bottom: 5px;"><strong>Refund Information:</strong></p>
          <ul style="color: #7f8c8d; font-size: 13px; list-style: none; padding-left: 0;">
            <li><strong>Session ID:</strong> ${sessionId}</li>
            <li><strong>Payment Intent ID:</strong> ${paymentIntentId}</li>
            ${
              refundAmount
                ? `<li><strong>Refund Amount:</strong> $${(refundAmount / 100).toFixed(2)}</li>`
                : ''
            }
            <li><strong>Status:</strong> Automatically Processed</li>
          </ul>
        </div>
      </div>

      <p style="font-size: 12px; color: #bdc3c7; margin-top: 30px; text-align: center;">Time: ${new Date().toLocaleString()}</p>

      ${getUnsubscribeSection(unsubscribeUrl)}

      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #f0f0f0; padding-top: 25px;">
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
        `<li style="margin-bottom: 8px;"><strong>Slot ${index + 1}:</strong> ${slot.date} from ${slot.startTime} to ${slot.endTime}</li>`
    )
    .join('');

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a237e; margin-bottom: 10px;">New Booking Received</h2>
        <div style="height: 3px; width: 50px; background-color: #1a237e; margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <div style="background-color: #fcfcfc; padding: 25px; border-radius: 12px; border: 1px solid #f0f0f0; margin: 25px 0;">
        <p style="margin-top: 0; color: #1a237e; font-weight: bold;">User Details:</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Event ID:</strong> ${eventId}</p>
      </div>
      
      <div style="color: #444; line-height: 1.6;">
        <p style="font-weight: bold; color: #1a237e;">Slot(s) Booked:</p>
        <ul style="color: #555; padding-left: 20px;">
          ${slotDetails}
        </ul>
        
        <p style="color: #1a237e; font-weight: bold; margin-top: 25px; text-align: center;">This booking has been paid and confirmed via Stripe.</p>
      </div>
      
      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #f0f0f0; padding-top: 25px;">
        &copy; ${new Date().getFullYear()} IWMS Advisors Admin Notification.
      </footer>
    </div>
  `;
};

export const getInsightNotificationTemplate = ({
  title,
  subTitle,
  id,
  unsubscribeUrl
}) => {
  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #0D67A9; margin-bottom: 10px;">New Insight from IWMS Advisors</h2>
        <div style="height: 3px; width: 50px; background-color: #0D67A9; margin: 0 auto; border-radius: 2px;"></div>
        <p style="color: #7f8c8d; font-size: 16px; margin-top: 15px;">We’ve published a new insight that may be helpful to your team.</p>
      </div>
      
      <div class="card" style="padding: 30px; background-color: #fcfcfc; border-radius: 12px; border: 1px solid #f0f0f0; border-left: 5px solid #0D67A9; margin-bottom: 35px; transition: all 0.3s ease;">
        <h3 style="color: #0D67A9; margin: 0 0 15px 0; font-size: 22px; line-height: 1.4;">${title}</h3>
        <p style="color: #444; line-height: 1.7; margin: 0; font-size: 16px;">${subTitle}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://test.iwmsadvisors.com/insights/${id}"
        class="primary-btn" style="display: inline-block; padding: 16px 35px; background-color: #1a237e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);">
          Read the Full Insight
        </a>
      </div>

      ${getUnsubscribeSection(unsubscribeUrl)}
      
      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #f0f0f0; padding-top: 25px;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

export const getWelcomeEmailTemplate = ({ unsubscribeUrl }) => {
  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 35px;">
        <h2 style="color: #0D67A9; margin-bottom: 10px;">Welcome to IWMS Advisors</h2>
        <div style="height: 3px; width: 50px; background-color: #0D67A9; margin: 0 auto; border-radius: 2px;"></div>
      </div>

      <div style="font-size: 16px; line-height: 1.8; color: #444; margin-bottom: 35px;">
        <p>Hello,</p>
        <p>Thank you for subscribing to **IWMS Advisors**. We are thrilled to have you as part of our community.</p>
        <p>You will now receive exclusive insights, market updates, and expert analysis directly in your inbox. Our goal is to provide you with valuable information that helps you make informed decisions and stay ahead in the industry.</p>
        <p>In the meantime, feel free to explore our latest publications and resources on our website.</p>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://test.iwmsadvisors.com/" class="primary-btn" style="display: inline-block; padding: 16px 40px; background-color: #1a237e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);">
          Explore Our Website
        </a>
      </div>

      ${getUnsubscribeSection(unsubscribeUrl)}

      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #f0f0f0; padding-top: 25px;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};

export const getBlogNotificationTemplate = ({
  id,
  title,
  subTitle,
  unsubscribeUrl
}) => {
  return `
    ${commonStyles}
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 40px; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #1a237e; margin-bottom: 10px;">New Insight from IWMS Advisors</h2>
        <div style="height: 3px; width: 50px; background-color: #1a237e; margin: 0 auto; border-radius: 2px;"></div>
        <p style="color: #7f8c8d; font-size: 16px; margin-top: 15px;">We’ve published a new insight that may be helpful to your team.</p>
      </div>
      
      <div class="card" style="padding: 30px; background-color: #fcfcfc; border-radius: 12px; border: 1px solid #f0f0f0; border-left: 5px solid #1a237e; margin-bottom: 35px; transition: all 0.3s ease;">
        <h3 style="color: #1a237e; margin: 0 0 15px 0; font-size: 22px; line-height: 1.4;">${title}</h3>
        <p style="color: #444; line-height: 1.7; margin: 0; font-size: 16px;">${subTitle}</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 20px;">
        <a href="https://test.iwmsadvisors.com/insights/${id}" class="primary-btn" style="display: inline-block; padding: 16px 35px; background-color: #1a237e; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; transition: all 0.3s ease; box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);">
          Read the Full Insight
        </a>
      </div>

      ${getUnsubscribeSection(unsubscribeUrl)}
      
      <footer style="margin-top: 40px; text-align: center; font-size: 12px; color: #bdc3c7; border-top: 1px solid #f0f0f0; padding-top: 25px;">
        &copy; ${new Date().getFullYear()} IWMS Advisors. All rights reserved.
      </footer>
    </div>
  `;
};
