import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

// =============================
// Type Definitions
// =============================
export type NewUser = InferInsertModel<typeof users>; // Based on your Drizzle schema

// =============================
// Service Functions
// =============================

// ✅ Get all users
export const getAllUsers = async () => {
  return await db.select().from(users);
};

// ✅ Get user by ID
export const getUserById = async (userId: string | number) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.userId, Number(userId)));

  return result[0] || null;
};

// ✅ Get user by Email
export const getUserByEmail = async (email: string) => {
  const result = await db.select().from(users).where(eq(users.email, email));
  return result[0] || null;
};

// ✅ Create a new user
export const createUser = async (user: NewUser) => {
  const [createdUser] = await db.insert(users).values(user).returning();
  return createdUser;
};

// ✅ Update user by ID
export const updateUser = async (
  userId: string | number,
  updates: Partial<NewUser>
) => {
  const [updatedUser] = await db
    .update(users)
    .set(updates)
    .where(eq(users.userId, Number(userId)))
    .returning();

  return updatedUser || null;
};

// ✅ Delete user by ID
export const deleteUser = async (userId: string | number) => {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.userId, Number(userId)))
    .returning();

  return deletedUser || null;
};
