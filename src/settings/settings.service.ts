import { eq } from "drizzle-orm";
import db from "../drizzle/db";
import { users } from "../drizzle/schema";

export const updateUserEmail = async (
  userId: number,
  newEmail: string,
  verificationCode: string,
  verificationExpiresAt: Date
) => {
  await db
    .update(users)
    .set({
      email: newEmail,
      isVerified: false,
      verificationCode,
      verificationCodeExpiresAt: verificationExpiresAt,
    })
    .where(eq(users.userId, userId));
};

export const updateUserPassword = async (userId: number, hashedPassword: string) => {
  await db
    .update(users)
    .set({
      password: hashedPassword,
    })
    .where(eq(users.userId, userId));
};
