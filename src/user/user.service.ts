import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { NewUser, UpdateUserInput } from "./user.types";

// ✅ Get all users
export const getAllUsers = async () => {
  return await db.select().from(users);
};

// ✅ Get user by ID
export const getUserById = async (userId: number) => {
  return await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });
};

// ✅ Get user by email
export const getUserByEmail = async (email: string) => {
  return await db.query.users.findFirst({
    where: eq(users.email, email),
  });
};

// ✅ Create a new user
export const createUser = async (data: NewUser) => {
  const safeData = {
    ...data,
    lastname: data.lastname ?? "", // Fix: ensure lastname is a string (not undefined)
  };

  const [createdUser] = await db.insert(users).values(safeData).returning();
  return createdUser;
};

// ✅ Update user by ID
export const updateUser = async (userId: number, data: UpdateUserInput) => {
  const [updatedUser] = await db
    .update(users)
    .set(data)
    .where(eq(users.userId, userId))
    .returning();
  return updatedUser;
};

// ✅ Delete user by ID
export const deleteUser = async (userId: number) => {
  const [deletedUser] = await db
    .delete(users)
    .where(eq(users.userId, userId))
    .returning();
  return deletedUser;
};
