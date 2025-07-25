import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import * as profileService from "./profile.service";
import { updateProfileSchema } from "./profile.validator";
import { User } from "./profile.types"; // ✅ Consistent import

// ✅ Load JWT secret safely
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("❌ JWT_SECRET is not set in environment variables.");
}

export const updateProfile = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({ message: "Unauthorized. No user ID found." });
    return; // ✅ explicit return
  }

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid input.",
      errors: parsed.error.flatten(),
    });
    return; // ✅ explicit return
  }

  const { firstname, lastname, contactPhone, address, profileImageUrl } = parsed.data;

  try {
    const updatedUser: User = await profileService.updateUserProfile(userId, {
      firstname,
      lastname,
      contactPhone,
      address,
      profileImageUrl,
    });

    const newToken = jwt.sign(
      {
        userId: updatedUser.userId,
        email: updatedUser.email,
        firstname: updatedUser.firstname,
        lastname: updatedUser.lastname,
        contactPhone: updatedUser.contactPhone,
        address: updatedUser.address,
        profileImageUrl: updatedUser.profileImageUrl,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Profile updated successfully.",
      token: newToken,
    });
    return; // ✅ explicit return
  } catch (err) {
    console.error("❌ Failed to update profile:", err);
    res.status(500).json({ message: "Server error." });
    return; // ✅ explicit return
  }
};
