// ✅ File: src/services/auth.service.ts
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function registerUser(data: {
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  contactPhone: string;
  address: string;
}) {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (existingUser) {
    throw new Error("Email already registered");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const [newUser] = await db
    .insert(users)
    .values({
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: hashedPassword,
      contactPhone: data.contactPhone,
      address: data.address,
      role: "user", // Default role
      isVerified: true, // ✅ You may set this during dev
    })
    .returning();

  const token = jwt.sign(
    {
      userId: newUser.userId,         // ✅ This must be number
      email: newUser.email,
      role: newUser.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { user: newUser, token };
}

export async function loginUser(data: { email: string; password: string }) {
  const user = await db.query.users.findFirst({
    where: eq(users.email, data.email),
  });

  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(data.password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      userId: user.userId,            // ✅ Must be a number to match `DecodedToken`
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { user, token };
}
