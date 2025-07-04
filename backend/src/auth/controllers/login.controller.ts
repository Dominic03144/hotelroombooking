import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { LoginValidator } from "../validators";

export const login = async (req: Request, res: Response) => {
  try {
    const parsed = LoginValidator.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }

    const { email, password } = parsed.data;
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      res.status(401).json({ error: "Incorrect password." });
      return;
    }

    if (!user.isVerified) {
      res.status(401).json({ error: "Email not verified." });
      return;
    }

    // Normalize role to lowercase
    const normalizedRole = user.role.toLowerCase();

    console.log("🛠️  Signing token for user:", {
      userId: user.userId,
      role: normalizedRole,
    });

    const token = jwt.sign(
      { userId: user.userId, role: normalizedRole },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        userId: user.userId,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        role: normalizedRole,
      },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ error: "Server error." });
  }
};
