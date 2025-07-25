import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import  db  from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { generate6DigitCode } from "../../utils/emailTemplates";
import { sendPasswordResetEmail } from "../../middleware/googleMailer";
import { RequestResetValidator, ResetPasswordValidator } from "../validators";

// ===========================
// ✅ Request Password Reset
// ===========================
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const parsed = RequestResetValidator.safeParse(req.body);
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

    const code = generate6DigitCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    await db.update(users).set({
      resetPasswordCode: code,
      resetPasswordExpiresAt: expires,
    }).where(eq(users.userId, user.userId));

    await sendPasswordResetEmail(email, user.firstname, code);
    res.status(200).json({ message: "Reset code sent to email." });
    return;
  } catch (err) {
    console.error("❌ Request Reset Error:", err);
    res.status(500).json({ error: "Server error." });
    return;
  }
};

// ===========================
// ✅ Reset Password
// ===========================
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const parsed = ResetPasswordValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, code, newPassword } = parsed.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }
    if (user.resetPasswordCode !== code) {
      res.status(400).json({ error: "Invalid reset code." });
      return;
    }
    if (!user.resetPasswordExpiresAt || new Date() > user.resetPasswordExpiresAt) {
      res.status(400).json({ error: "Reset code expired." });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await db.update(users).set({
      password: hashed,
      resetPasswordCode: null,
      resetPasswordExpiresAt: null,
    }).where(eq(users.userId, user.userId));

    res.status(200).json({ message: "Password reset successfully." });
    return;
  } catch (err) {
    console.error("❌ Reset Password Error:", err);
    res.status(500).json({ error: "Server error." });
    return;
  }
};
