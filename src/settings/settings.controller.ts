import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";

import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import * as settingsService from "../settings/settings.service";
import {
  updateEmailSchema,
  changePasswordSchema,
} from "../settings/settings.validator";

/* ✅ Setup your nodemailer transporter */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const updateEmail = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const parsed = updateEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid email format." });
    return;
  }

  const { newEmail } = parsed.data;

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, newEmail))
      .limit(1);

    if (existing.length > 0) {
      res.status(400).json({ message: "Email is already in use." });
      return;
    }

    const verificationCode = crypto.randomInt(100000, 999999).toString();
    const verificationExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await settingsService.updateUserEmail(
      userId,
      newEmail,
      verificationCode,
      verificationExpiresAt
    );

    res.status(200).json({
      message: "Email updated. Please verify your new email.",
    });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
    return;
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const userId = req.user!.userId;

  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ message: "Invalid input." });
    return;
  }

  const { oldPassword, newPassword } = parsed.data;

  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userId, userId))
      .limit(1);

    if (user.length === 0) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user[0].password);
    if (!isMatch) {
      res.status(400).json({ message: "Old password is incorrect." });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await settingsService.updateUserPassword(userId, hashedPassword);

    /* ✅ Send styled HTML email notification */
    const recipientEmail = user[0].email;
    const recipientName = user[0].firstname || "User";

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f9fafb;">
        <h2 style="color: #1a202c;">Password Changed Successfully</h2>
        <p>Hello ${recipientName},</p>
        <p>We wanted to let you know that your password was changed on <strong>${new Date().toLocaleString()}</strong>.</p>
        <p>If you did not make this change, please <a href="mailto:support@yourdomain.com" style="color: #3182ce;">contact support</a> immediately.</p>
        <p style="margin-top: 24px;">Thank you,<br>Your Hotel Booking Team</p>
      </div>
    `;

    try {
      await transporter.sendMail({
        from: `"Hotel Booking" <${process.env.SMTP_USER}>`,
        to: recipientEmail,
        subject: "Your password was changed",
        html: emailHtml,
      });
      console.log(`✅ Password change email sent to ${recipientEmail}`);
    } catch (emailError) {
      console.error("❌ Failed to send password change email:", emailError);
      // Optional: You can still return success since the password DID change.
    }

    res
      .status(200)
      .json({ message: "Password changed successfully. Notification sent." });
    return;
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
    return;
  }
};
