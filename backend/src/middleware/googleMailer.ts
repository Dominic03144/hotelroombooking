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
    pass: process.env.EMAIL_PASSWORD,
  },
});

type MailOptions = {
  to: string;
  subject: string;
  recipientName: string;
  messageHtml: string;
};

/**
 * ✅ General function to send styled emails
 */
export async function sendMail({
  to,
  subject,
  recipientName,
  messageHtml,
}: MailOptions) {
  try {
    const info = await transporter.sendMail({
      from: `"Hotel Booking App" <${process.env.EMAIL_SENDER}>`,
      to,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${subject}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f4f4f4;
              margin: 0;
              padding: 0;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 40px auto;
              background: #ffffff;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              color: #333333;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .header img {
              max-width: 160px;
            }
            h2 {
              color: #2c3e50;
            }
            .footer {
              font-size: 0.85em;
              color: #777777;
              text-align: center;
              margin-top: 30px;
            }
            ul {
              list-style-type: none;
              padding: 0;
            }
            ul li {
              margin-bottom: 8px;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="header">
              <img src="https://via.placeholder.com/160x50?text=Hotel+Booking" alt="Hotel Logo" />
            </div>
            <h2>${subject}</h2>
            <p>Dear ${recipientName},</p>
            ${messageHtml}
            <p style="margin-top: 20px;">Thank you for choosing our Hotel Booking platform.</p>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Hotel Booking App. All rights reserved.
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("✅ Email sent:", info.messageId);
  } catch (err) {
    console.error("❌ Failed to send email:", err);
    throw new Error("Email sending failed");
  }
}

/**
 * ✅ Send verification email with a 6-digit code
 */
export async function sendVerificationEmail(
  to: string,
  name: string,
  code: string
) {
  const html = generateVerificationEmail(name, code);
  await sendMail({
    to,
    subject: "Verify Your Email",
    recipientName: name,
    messageHtml: html,
  });
}

/**
 * ✅ Send password reset email with a 6-digit code
 */
export async function sendPasswordResetEmail(
  to: string,
  name: string,
  code: string
) {
  const html = generatePasswordResetEmail(name, code);
  await sendMail({
    to,
    subject: "Reset Your Password",
    recipientName: name,
    messageHtml: html,
  });
}

/**
 * ✅ Send booking confirmation email with booking details
 */
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
  } = bookingDetails;

  const messageHtml = `
    <p>Thank you for your booking at <strong>${hotelName}</strong>!</p>
    <ul>
      <li><strong>Room Type:</strong> ${roomType}</li>
      <li><strong>Check-In Date:</strong> ${checkInDate}</li>
      <li><strong>Check-Out Date:</strong> ${checkOutDate}</li>
      <li><strong>Guests:</strong> ${guests}</li>
      <li><strong>Total Amount:</strong> $${totalAmount.toFixed(2)}</li>
      <li><strong>Special Requests:</strong> ${
        specialRequests ?? "None"
      }</li>
    </ul>
    <p>We look forward to hosting you!</p>
  `;

  await sendMail({
    to,
    subject: "Your Booking Confirmation",
    recipientName: name,
    messageHtml,
  });
}

/**
 * ✅ Send booking status update email notifying user of new status
 */
export async function sendBookingStatusUpdateEmail(
  to: string,
  name: string,
  bookingId: number,
  newStatus: string
) {
  const messageHtml = `
    <p>Your booking with ID <strong>${bookingId}</strong> status has been updated to:</p>
    <h3 style="color: #2c3e50;">${newStatus}</h3>
    <p>If you have any questions or concerns, please contact our support team.</p>
  `;

  await sendMail({
    to,
    subject: `Booking #${bookingId} Status Updated`,
    recipientName: name,
    messageHtml,
  });
}
