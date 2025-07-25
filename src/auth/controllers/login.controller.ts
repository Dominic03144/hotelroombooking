import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { LoginValidator } from "../validators";

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ 1. Validate input
    const parsed = LoginValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;

    // ✅ 2. Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    // ✅ 3. Verify password
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(401).json({ error: "Incorrect password." });
      return;
    }

    // ✅ 4. Ensure email is verified
    if (!user.isVerified) {
      res.status(401).json({ error: "Email not verified." });
      return;
    }

    // ✅ 5. Generate JWT with `email` and normalized role
    const normalizedRole = user.role.toLowerCase();
    const token = jwt.sign(
      {
        userId: user.userId,
        role: normalizedRole,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // ✅ 6. Set HttpOnly cookie & return token + user data
    res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({
        message: "Login successful.",
        token,
        user: {
          userId: user.userId,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          role: normalizedRole,
        },
      });

    return;
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error." });
    return;
  }
};
