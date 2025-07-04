// ✅ File: src/routes/controllers/register.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { generate6DigitCode } from "../../utils/emailTemplates";
import { sendVerificationEmail } from "../../middleware/googleMailer";
import { RegisterValidator } from "../validators";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const parsed = RegisterValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { firstname, lastname, email, password, role } = parsed.data;

    // 🔍 Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
      res.status(409).json({ error: "Email already in use." });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = generate6DigitCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // ✅ Only allow specific roles
    const allowedRoles = ["admin", "user"];
    const safeRole = allowedRoles.includes(role ?? "") ? role : "user";

    // 🧾 Save user to DB
    await db.insert(users).values({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      role: safeRole,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpiresAt: expires,
    });

    // 📧 Send verification email
    await sendVerificationEmail(email, firstname, code);

    res.status(201).json({
      message: "User registered. Verification code sent to email.",
    });
  } catch (err) {
    console.error("❌ Register Error:", err);
    res.status(500).json({ error: "Server error." });
  }
};
