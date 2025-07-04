import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import db from "../../drizzle/db";
import { users } from "../../drizzle/schema";
import { AdminCreateUserValidator } from "../validators";

export const adminCreateUser = async (req: Request, res: Response) => {
  try {
    // ✅ Log incoming body
    console.log("📥 Incoming request body:", req.body);

    // ✅ Validate input
    const parsed = AdminCreateUserValidator.safeParse(req.body);
    if (!parsed.success) {
      const error = parsed.error.flatten();
      console.log("❌ Zod validation failed:", error);
      res.status(400).json({ error });
      return; // ✅ Return at the end of the block
    }

    const {
      firstname,
      lastname,
      email,
      password,
      contactPhone,
      address,
      profileImageUrl,
      role,
    } = parsed.data;

    // ✅ Check if user already exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existing) {
      res.status(409).json({ error: "Email already exists." });
      return;
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Enforce allowed roles
    const allowedRoles = ["admin", "user", "member", "owner", "driver", "customer"];
    const assignedRole = allowedRoles.includes(role ?? "") ? role : "user";

    // ✅ Create user
    await db.insert(users).values({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      contactPhone,
      address,
      profileImageUrl,
      role: assignedRole,
      isVerified: true,
    });

    res.status(201).json({ message: "✅ User created by admin." });
    return;
  } catch (err) {
    console.error("❌ Admin Create User Error:", err);
    res.status(500).json({ error: "Internal server error." });
    return;
  }
};
