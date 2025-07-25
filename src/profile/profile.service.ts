// src/profile/profile.service.ts

import db from "../drizzle/db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { User } from "./profile.types"; // ✅ Import your shared User type

export const updateUserProfile = async (
  userId: number,
  data: {
    firstname?: string;
    lastname?: string;
    contactPhone?: string;
    address?: string;
    profileImageUrl?: string;
  }
): Promise<User> => {
  const [updatedUser] = await db
    .update(users)
    .set({
      firstname: data.firstname,
      lastname: data.lastname,
      contactPhone: data.contactPhone,
      address: data.address,
      profileImageUrl: data.profileImageUrl,
    })
    .where(eq(users.userId, userId))
    .returning(); // ✅ Make sure it returns the full row

  if (!updatedUser) {
    throw new Error("User not found or update failed.");
  }

  // ✅ Ensure it matches the `User` type
  return updatedUser as User;
};
