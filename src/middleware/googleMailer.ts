import nodemailer from "nodemailer";
import dotenv from "dotenv";
import {
  generateVerificationEmail,
  generatePasswordResetEmail,
} from "../utils/emailTemplates";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.EMAIL_PASSWORD, // Gmail App Password
  },
});

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

// ==============================
// ✅ Generic sendMail
// ==============================
type MailOptions = {
  to: string;
  subject: string;
  recipientName: string;
  messageHtml: string;
};

export async function sendMail({
  to,
  subject,
  recipientName,
  messageHtml,
}: MailOptions) {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>${subject}</title>
      <style>
        body {
          background: #f6f6f6;
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          background: #ffffff;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .header {
          background: #3498db;
          color: #ffffff;
          text-align: center;
          padding: 30px 20px;
        }
        .header img {
          max-width: 140px;
          margin-bottom: 10px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
        }
        .content {
          padding: 30px;
          color: #333333;
        }
        .content h2 {
          margin-top: 0;
          color: #2c3e50;
        }
        .content p {
          line-height: 1.6;
        }
        .button {
          display: inline-block;
          margin-top: 20px;
          background: #3498db;
          color: #ffffff !important;
          text-decoration: none;
          padding: 12px 20px;
          border-radius: 4px;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #999999;
          padding: 20px;
          background: #f0f0f0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="https://via.placeholder.com/140x40?text=Hotel+Book" alt="HotelBook Logo" />
          <h1>${subject}</h1>
        </div>
        <div class="content">
          <p>Hi ${recipientName},</p>
          ${messageHtml}
          <p>Thank you for choosing our Hotel Booking platform!</p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} HotelBook. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"HotelBook" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to} | ID: ${info.messageId}`);
    return true;
  } catch (err) {
    console.error(`❌ Email sending failed to ${to}:`, err);
    return false;
  }
}

// ==============================
// ✅ Verification Email
// ==============================
export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
) {
  const link = `${frontendUrl}/verify-email?code=${code}&email=${encodeURIComponent(
    to
  )}`;
  const html = generateVerificationEmail(name, link);
  return await sendMail({
    to,
    subject: "Verify Your Email",
    recipientName: name,
    messageHtml: html,
  });
}

// ==============================
// ✅ Password Reset Email
// ==============================
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  code: string
) {
  const link = `${frontendUrl}/reset-password?code=${code}&email=${encodeURIComponent(
    to
  )}`;
  const html = generatePasswordResetEmail(name, link);
  return await sendMail({
    to,
    subject: "Reset Your Password",
    recipientName: name,
    messageHtml: html,
  });
}

// ==============================
// ✅ Booking Confirmation Email — exact wording
// ==============================
export async function sendBookingConfirmationEmail(
  to: string,
  name: string,
  bookingDetails: {
    hotelName: string;
    roomType: string;
    checkInDate: string;
    checkOutDate: string;
    guests: number;
    totalAmount: number;
    specialRequests?: string;
    receiptUrl?: string;
  }
) {
  const {
    hotelName,
    roomType,
    checkInDate,
    checkOutDate,
    guests,
    totalAmount,
    specialRequests,
    receiptUrl,
  } = bookingDetails;

  const messageHtml = `
    <p>Thank you for your payment! We’re excited to have you stay with us.</p>

    <p>Here are your booking details:</p>
    <ul>
      <li><strong>Hotel:</strong> ${hotelName}</li>
      <li><strong>Room:</strong> ${roomType}</li>
      <li><strong>Check-in:</strong> ${checkInDate}</li>
      <li><strong>Check-out:</strong> ${checkOutDate}</li>
      <li><strong>Guests:</strong> ${guests}</li>
      <li><strong>Payment Amount:</strong> $${totalAmount.toFixed(2)}</li>
      ${
        specialRequests
          ? `<li><strong>Special Requests:</strong> ${specialRequests}</li>`
          : ""
      }
    </ul>

    ${
      receiptUrl
        ? `<p><a href="${receiptUrl}" class="button">View Your Receipt</a></p>`
        : ""
    }

    <p>If you have any questions or need to make changes to your booking, please contact us anytime at support@hotelbook.com.</p>

    <p>Safe travels and see you soon!</p>

    <p>Warm regards,<br/>The HotelBook Team</p>
  `;

  return await sendMail({
    to,
    subject: "Payment Confirmation — Thank You for Booking with HotelBook!",
    recipientName: name,
    messageHtml,
  });
}

// ==============================
// ✅ Booking Status Update Email
// ==============================
export async function sendBookingStatusUpdateEmail(
  to: string,
  name: string,
  bookingId: number,
  newStatus: string
) {
  const messageHtml = `
    <h2>Booking Status Updated</h2>
    <p>Your booking with ID <strong>${bookingId}</strong> has been updated to:</p>
    <h3 style="color: #3498db;">${newStatus}</h3>
    <p>If you have any questions, please contact us at support@hotelbook.com.</p>
  `;

  return await sendMail({
    to,
    subject: `Booking #${bookingId} Status Updated`,
    recipientName: name,
    messageHtml,
  });
}
