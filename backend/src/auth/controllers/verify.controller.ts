import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import  db  from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { generate6DigitCode } from "../../utils/emailTemplates";
import { sendVerificationEmail } from "../../middleware/googleMailer";
import { VerifyEmailValidator } from "../validators";

// ===========================
// ✅ Verify Email
// ===========================
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const parsed = VerifyEmailValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, code } = parsed.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Email already verified." });
      return;
    }

    if (user.verificationCode !== code) {
      res.status(400).json({ error: "Invalid code." });
      return;
    }

    if (!user.verificationCodeExpiresAt || new Date() > user.verificationCodeExpiresAt) {
      res.status(400).json({ error: "Verification code expired." });
      return;
    }

    await db.update(users).set({
      isVerified: true,
      verificationCode: null,
      verificationCodeExpiresAt: null,
    }).where(eq(users.userId, user.userId));

    res.status(200).json({ message: "Email verified successfully." });
    return;
  } catch (err) {
    console.error("❌ Verify Email Error:", err);
    res.status(500).json({ error: "Server error." });
    return;
  }
};

// ===========================
// ✅ Resend Verification Code
// ===========================
export const resendVerificationCode = async (req: Request, res: Response) => {
  try {
    const parsed = VerifyEmailValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email } = parsed.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    if (user.isVerified) {
      res.status(400).json({ error: "Email already verified." });
      return;
    }

    const newCode = generate6DigitCode();
    const newExpires = new Date(Date.now() + 15 * 60 * 1000);

    await db.update(users).set({
      verificationCode: newCode,
      verificationCodeExpiresAt: newExpires,
    }).where(eq(users.userId, user.userId));

    await sendVerificationEmail(user.email, user.firstname, newCode);

    res.status(200).json({ message: "Verification code resent." });
    return;
  } catch (err) {
    console.error("❌ Resend Code Error:", err);
    res.status(500).json({ error: "Server error." });
    return;
  }
};
