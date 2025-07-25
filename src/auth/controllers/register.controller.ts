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
    // ✅ 1. Validate input
    const parsed = RegisterValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return
    }

    const {
      firstname,
      lastname,
      email = "",   // ✅ fallback
      password,
      address,
      contactPhone,
      role = "",    // ✅ fallback
    } = parsed.data;

    // ✅ 2. Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (existing) {
       res.status(409).json({ error: "Email already in use." });
       return
    }

    // ✅ 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // ✅ 4. Generate verification code & expiry
    const code = generate6DigitCode();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    // ✅ 5. Whitelist allowed roles (fallback to "user")
    const allowedRoles = ["admin", "user"];
    const safeRole = allowedRoles.includes(role.toLowerCase()) ? role.toLowerCase() : "user";

    // ✅ 6. Save new user
    await db.insert(users).values({
      firstname,
      lastname,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
      contactPhone,
      role: safeRole,
      isVerified: false,
      verificationCode: code,
      verificationCodeExpiresAt: expires,
    });

    // ✅ 7. Send verification email
    await sendVerificationEmail(email, `${firstname} ${lastname}`, code);

    // ✅ 8. Respond success
     res.status(201).json({
      message: "Account created. A verification code has been sent to your email.",
    });
    return

  } catch (err) {
    console.error("❌ Register Error:", err);
     res.status(500).json({ error: "Server error. Please try again." });
     return
  }
};
